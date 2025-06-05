from pickle import load
import os
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer # Needed if re-vectorizing new course inputs

# Correct path for models
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models') # Assuming 'models' is directly under ml-service
# If 'models' is at the root of e-learn-backend (one level up from ml-service) then:
# MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')


# --- Load Models Globally (once on service startup) ---
tfidf_vectorizer = None
content_similarity = None
content_course_map = None # Stores CourseID -> index and combined_features for CBF lookup (DataFrame or Series)

cf_predictions_df = None
cf_user_index = [] # This might not be directly used if cf_predictions_df is a DataFrame with user_ids as index
cf_course_columns = [] # This might not be directly used if cf_predictions_df is a DataFrame with course_ids as columns

def load_all_models():
    """Loads all pre-trained models into global variables."""
    global tfidf_vectorizer, content_similarity, content_course_map
    global cf_predictions_df, cf_user_index, cf_course_columns

    print(f"Attempting to load recommendation models from: {MODELS_DIR}")
    try:
        tfidf_vectorizer = load(open(os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"), "rb"))
        content_similarity = load(open(os.path.join(MODELS_DIR, "content_similarity.pkl"), "rb"))
        content_course_map = load(open(os.path.join(MODELS_DIR, "content_course_map.pkl"), "rb"))
        print("✅ Content-based prediction models loaded.")
    except FileNotFoundError as e:
        print(f"❌ Content-based models not found in {MODELS_DIR}. Run training first. Error: {e}")
    except Exception as e:
        print(f"❌ Error loading content-based models: {e}")

    try:
        cf_predictions_df = load(open(os.path.join(MODELS_DIR, "cf_predictions_df.pkl"), "rb"))
        # The user_index and course_columns might already be part of the DataFrame
        # if cf_predictions_df is a properly constructed Pandas DataFrame
        if isinstance(cf_predictions_df, pd.DataFrame):
            cf_user_index = cf_predictions_df.index.tolist()
            cf_course_columns = cf_predictions_df.columns.tolist()
        else:
            print("Warning: cf_predictions_df is not a DataFrame. cf_user_index and cf_course_columns might be incorrect.")
        print("✅ Collaborative filtering prediction models loaded.")
    except FileNotFoundError as e:
        print(f"❌ Collaborative filtering models not found in {MODELS_DIR}. Run training first. Error: {e}")
    except Exception as e:
        print(f"❌ Error loading collaborative filtering models: {e}")

load_all_models() # Call this when the predictor module is imported

# --- Recommendation Functions (using loaded models) ---

def get_collaborative_recommendations(user_id, top_n=5):
    """Get top N course recommendations for a user using CF."""
    if cf_predictions_df is None:
        print("CF model not loaded.")
        return []
        
    user_id_str = str(user_id) # Ensure user_id is string consistent with training
    if user_id_str not in cf_predictions_df.index:
        print(f"User {user_id_str} not found in CF prediction matrix.")
        return []

    # Get predicted ratings for the user, sort them
    sorted_courses_predictions = cf_predictions_df.loc[user_id_str].sort_values(ascending=False)
    
    # We will filter out already enrolled/completed courses in the hybrid function
    
    recommended_courses_ids = sorted_courses_predictions.head(top_n).index.tolist()
    
    # Return a list of dicts with CourseID
    return [{"CourseID": course_id} for course_id in recommended_courses_ids]


def get_content_recommendations(course_id, top_n=5):
    """
    Get top N similar courses based on content similarity for a given course_id.
    This is typically used if a user has interacted with a course and you want to
    recommend similar ones, or for new users/courses.
    """
    if content_similarity is None or content_course_map is None:
        print("CBF models not loaded.")
        return []

    course_id_str = str(course_id) # Ensure course_id is string

    if course_id_str not in content_course_map.index:
        print(f"CourseID '{course_id_str}' not found in content map.")
        return []

    # Get the internal index of the course
    try:
        idx = content_course_map.index.get_loc(course_id_str) # More robust way to get integer index
    except KeyError:
        print(f"Error: CourseID '{course_id_str}' not found in content_course_map index.")
        return []

    # Get similarity scores for this course with all other courses
    sim_scores = list(enumerate(content_similarity[idx]))

    # Sort courses by similarity score in descending order
    # [1:] to skip the course itself (which has similarity 1.0)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1 : top_n + 1]

    # Get the indices of the top similar courses
    course_indices = [i[0] for i in sim_scores]

    # Map back to CourseIDs and their features for response
    # Ensure content_course_map is a DataFrame with 'CourseID' as a column or index
    # If content_course_map is a Series where index is CourseID, then just use index
    # Assuming content_course_map is a DataFrame with 'CourseID' column
    recommended_courses_info = content_course_map.iloc[course_indices].reset_index()[['CourseID']].to_dict(orient="records")
    
    # Return list of dicts with CourseID
    return recommended_courses_info

# --- Hybrid Recommendation Function ---

def get_hybrid_recommendations(user_id, top_n=5, alpha=0.6, user_data=None): # CORRECTED: Changed `user_preferred_format` to `user_data`
    """
    Combines Content-Based (CBF) & Collaborative Filtering (CF) recommendations.
    
    Args:
        user_id (str): The ID of the user for whom to generate recommendations.
        top_n (int): The number of top recommendations to return.
        alpha (0.0 to 1.0): Weight for CF (higher = more CF influence).
        user_data (dict, optional): A dictionary containing comprehensive user data (e.g.,
                                     enrolled courses, completed content, learning style, etc.)
                                     sent from the Node.js backend.
    """
    if cf_predictions_df is None or content_similarity is None or content_course_map is None:
        print("Hybrid models not fully loaded. Cannot generate recommendations.")
        return {"error": "Recommendation models not initialized"}

    user_id_str = str(user_id)
    
    # Get user's completed/enrolled courses for filtering and CBF seed
    user_enrolled_or_completed_courses = []
    user_learning_style = 'unknown' # Default
    if user_data:
        # Assuming user_data['current_courses_enrolled'] or similar is a list of CourseIDs
        if 'enrolledCourses' in user_data and user_data['enrolledCourses']:
            user_enrolled_or_completed_courses.extend([str(c) for c in user_data['enrolledCourses']])
        
        # If progress is a map, extract course IDs from it
        if 'progress' in user_data and user_data['progress']:
            for course_progress_entry in user_data['progress']:
                # Assuming course_progress_entry is {'courseId': '...', 'watchedContent': [...]}
                if 'courseId' in course_progress_entry:
                    user_enrolled_or_completed_courses.append(str(course_progress_entry['courseId']))
        
        user_enrolled_or_completed_courses = list(set(user_enrolled_or_completed_courses)) # Remove duplicates

        if 'learningStyle' in user_data:
            user_learning_style = user_data['learningStyle']
    
    print(f"User {user_id_str} enrolled/completed courses: {user_enrolled_or_completed_courses}")
    print(f"User learning style: {user_learning_style}")

    # --- CF Recommendations ---
    cf_recs = []
    if user_id_str in cf_predictions_df.index:
        cf_recs = get_collaborative_recommendations(user_id_str, top_n * 5) # Get more for robust blending
        print(f"CF found {len(cf_recs)} recommendations.")
    else:
        print(f"User {user_id_str} not in CF matrix. CF will not contribute to recommendations.")

    cf_scores = {item["CourseID"]: (1 / (i + 1)) for i, item in enumerate(cf_recs)} # Rank-based score

    # --- CBF Recommendations ---
    cbf_recs_aggregated = {}
    
    # 1. CBF based on user's completed/enrolled courses
    if user_enrolled_or_completed_courses:
        for completed_course_id in user_enrolled_or_completed_courses:
            if str(completed_course_id) in content_course_map.index: # Ensure course exists in CBF map
                similar_courses = get_content_recommendations(completed_course_id, top_n * 3) # Get more per seed
                for i, item in enumerate(similar_courses):
                    course_id = item["CourseID"]
                    # Aggregate scores, giving more weight to higher-ranked similar items
                    cbf_recs_aggregated[course_id] = cbf_recs_aggregated.get(course_id, 0) + (1 / (i + 1))
            else:
                print(f"Warning: Completed course {completed_course_id} not in content map for CBF seed.")
        
        # Sort and take top N for CBF contribution
        cbf_sorted_items = sorted(cbf_recs_aggregated.items(), key=lambda x: x[1], reverse=True)[:top_n * 2]
        cbf_scores = {item[0]: item[1] for item in cbf_sorted_items}
        print(f"CBF (from user history) found {len(cbf_scores)} recommendations.")
    else:
        # Cold-start CBF: If no user history, fall back to popular courses or general recommendations
        # based on overall content characteristics.
        # This part requires an external function or data. For now, it will contribute 0 if no history.
        # You might implement: get_popular_courses_based_on_learning_style(user_learning_style, top_n)
        print("No user history for robust CBF. CBF will be limited or rely on CF.")
        cbf_scores = {}

    # --- Hybrid Score Calculation ---
    final_scores = {}
    all_course_ids = set(cf_scores.keys()).union(set(cbf_scores.keys()))

    for course_id in all_course_ids:
        cf_score = cf_scores.get(course_id, 0)
        cbf_score = cbf_scores.get(course_id, 0)

        # Weighted Sum
        final_scores[course_id] = alpha * cf_score + (1 - alpha) * cbf_score

    # Sort by highest scores
    hybrid_recommendations_sorted = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)

    # --- Filter out already enrolled/completed courses and take top_n ---
    filtered_recommendations = []
    for course_id, score in hybrid_recommendations_sorted:
        if course_id not in user_enrolled_or_completed_courses:
            filtered_recommendations.append((course_id, score))
        if len(filtered_recommendations) >= top_n:
            break
            
    # If after filtering, we don't have enough recommendations,
    # you might add popular general courses or fallback to a different strategy here.
    if len(filtered_recommendations) < top_n:
        print(f"Warning: Only {len(filtered_recommendations)} unique recommendations found after filtering.")
        # Optional: Add some highly rated general courses if fewer than top_n
        # This would require a function like `get_general_popular_courses()`

    # --- Attach Learning Mode and Prepare Final Output for Node.js Backend ---
    recommendations_for_node = []
    
    # We will now use content_course_map (if it contains format info)
    # or a rule based on user_learning_style
    
    for course_id, score in filtered_recommendations:
        recommended_mode = "Mixed" # Default learning mode
        
        # Try to get course format from content_course_map if available
        # This assumes your content_course_map has 'format' as a column/feature
        course_data_from_map = None
        if isinstance(content_course_map, pd.DataFrame) and course_id in content_course_map.index:
             course_data_from_map = content_course_map.loc[course_id]
             if 'format' in course_data_from_map:
                 recommended_mode = course_data_from_map['format']

        # Override/refine based on user's preferred learning style if available
        if user_learning_style != 'unknown':
            # Simple heuristic: If the course format is 'Mixed' or if the user
            # strongly prefers a format that the course also offers primarily.
            if user_learning_style == 'visual' and recommended_mode != 'Video Course':
                if recommended_mode == 'Mixed' or 'Video Course' in recommended_mode: # Assuming 'Mixed' could also be video
                    recommended_mode = 'Video Course'
            elif user_learning_style == 'auditory' and recommended_mode != 'Video Course':
                if recommended_mode == 'Mixed' or 'Video Course' in recommended_mode:
                    recommended_mode = 'Video Course' # Assuming audio usually goes with video
            elif user_learning_style == 'reading/writing' and recommended_mode not in ['Text-based Course', 'Quiz Series']:
                if recommended_mode == 'Mixed' or 'Text-based Course' in recommended_mode:
                    recommended_mode = 'Text-based Course'
            elif user_learning_style == 'kinesthetic' and recommended_mode != 'Live Session':
                if recommended_mode == 'Mixed' or 'Live Session' in recommended_mode:
                    recommended_mode = 'Live Session'
            
            # If the course's primary format *is* the user's preferred style, keep it.
            # Otherwise, if it's 'Mixed', try to align.
            # This logic can be as complex as needed.
            
            # Simple: if course format is 'Mixed' or 'Unknown' default,
            # try to set it to user's preferred style if it matches a known type
            if recommended_mode == 'Mixed' or recommended_mode == 'Unknown':
                 if user_learning_style == 'visual': recommended_mode = 'Video Course'
                 elif user_learning_style == 'auditory': recommended_mode = 'Video Course' # often video-based
                 elif user_learning_style == 'reading/writing': recommended_mode = 'Text-based Course'
                 elif user_learning_style == 'kinesthetic': recommended_mode = 'Live Session' # more interactive

        recommendations_for_node.append({
            "CourseID": course_id,
            "Score": round(score, 4), # Round score for cleaner output
            "RecommendedLearningMode": recommended_mode,
            # Do NOT include full course details here (Title, Difficulty, etc.)
            # These should be fetched by the Node.js backend for efficiency and separation of concerns.
        })
            
    return {"recommendations": recommendations_for_node}