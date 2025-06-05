import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse.linalg import svds
from sklearn.metrics import mean_squared_error # Added for RMSE calculation
import pickle
import os

# Import the new database utility functions
from database_utils import fetch_all_courses_for_content_based_training, fetch_user_ratings_and_enrollments

# --- Configuration ---
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# --- Data Loading and Preprocessing from DB ---
data_content = pd.DataFrame() # Initialize empty DataFrames
data_collaborative = pd.DataFrame()

try:
    # 1. Fetch data for Content-Based Filtering
    data_content = fetch_all_courses_for_content_based_training()
    print(f"✅ Loaded {len(data_content)} courses for content-based analysis.")

    # 2. Fetch data for Collaborative Filtering
    data_collaborative = fetch_user_ratings_and_enrollments()
    
    # Ensure IDs are string types for consistency in pandas operations
    data_collaborative['UserID'] = data_collaborative['UserID'].astype(str)
    data_collaborative['CourseID'] = data_collaborative['CourseID'].astype(str)
    
    print(f"✅ Loaded {len(data_collaborative)} user-course interactions for collaborative filtering.")

except Exception as e:
    print(f"❌ Error loading data from database: {e}")
    print("🚨 Exiting training due to database error. Please ensure MongoDB is running and data is present.")
    exit(1) # Exit if data loading fails

# --- Content-Based Filtering Training ---
vectorizer = None
content_similarity = None
content_course_map = None

if not data_content.empty and 'combined_features' in data_content.columns:
    print("\n--- Training Content-Based Filtering Model ---")
    vectorizer = TfidfVectorizer(stop_words='english')
    content_matrix = vectorizer.fit_transform(data_content['combined_features'])
    content_similarity = cosine_similarity(content_matrix)

    # Save content-based model components
    pickle.dump(vectorizer, open(os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"), "wb"))
    pickle.dump(content_similarity, open(os.path.join(MODELS_DIR, "content_similarity.pkl"), "wb"))
    # Save a mapping of CourseID to its internal index and combined features for lookup
    content_course_map = data_content[['CourseID', 'combined_features']].reset_index().set_index('CourseID')
    pickle.dump(content_course_map, open(os.path.join(MODELS_DIR, "content_course_map.pkl"), "wb"))
    
    print("✅ Content-Based Model Training Completed!")
else:
    print("⚠️ No valid course data with 'combined_features' for Content-Based Filtering. Skipping.")

# --- Collaborative Filtering Training ---
predictions_df = pd.DataFrame()
user_item_matrix = pd.DataFrame() # Initialize
cf_user_index = []
cf_course_columns = []

if not data_collaborative.empty and 'UserID' in data_collaborative.columns and 'CourseID' in data_collaborative.columns:
    print("\n--- Training Collaborative Filtering Model ---")
    
    # Ensure all courses seen in content data are also in collaborative matrix columns
    # and all users in collaborative data are in index
    all_course_ids = data_content['CourseID'].unique() if not data_content.empty else data_collaborative['CourseID'].unique()
    all_user_ids = data_collaborative['UserID'].unique()
    
    # Create the pivot table
    user_item_matrix = data_collaborative.pivot_table(index='UserID', columns='CourseID', values='Rating').fillna(0)
    
    # Fill any missing columns (courses) or rows (users) with zeros if necessary
    missing_courses_in_cf = set(all_course_ids) - set(user_item_matrix.columns)
    for mc in missing_courses_in_cf:
        user_item_matrix[mc] = 0
    user_item_matrix = user_item_matrix.reindex(columns=all_course_ids).fillna(0) # Ensure consistent column order

    matrix = user_item_matrix.values

    if matrix.shape[0] > 1 and matrix.shape[1] > 1:
        # Scale the matrix before SVD for better performance if ratings range widely
        # min_val and max_val logic from your previous collaborative code
        min_val = np.min(matrix[matrix > 0]) if np.any(matrix > 0) else 0
        max_val = np.max(matrix) if np.any(matrix > 0) else 1 # Avoid division by zero if all are zero
        
        # Avoid division by zero if min_val == max_val
        if max_val - min_val > 0:
            matrix_scaled = (matrix - min_val) / (max_val - min_val)
        else:
            matrix_scaled = np.zeros_like(matrix) # All values are the same, no scaling needed

        optimal_k = min(100, min(matrix.shape) - 1)
        
        try:
            U, sigma, Vt = svds(matrix_scaled, k=optimal_k)
            sigma = np.diag(sigma)
            predicted_matrix_scaled = np.dot(np.dot(U, sigma), Vt)
            
            # Rescale back to original rating range
            predicted_matrix = predicted_matrix_scaled * (max_val - min_val) + min_val
            
            predictions_df = pd.DataFrame(predicted_matrix, index=user_item_matrix.index, columns=user_item_matrix.columns)
            
            # Save collaborative filtering model components
            pickle.dump(predictions_df, open(os.path.join(MODELS_DIR, "cf_predictions_df.pkl"), "wb"))
            pickle.dump(user_item_matrix.columns.tolist(), open(os.path.join(MODELS_DIR, "cf_course_columns.pkl"), "wb"))
            pickle.dump(user_item_matrix.index.tolist(), open(os.path.join(MODELS_DIR, "cf_user_index.pkl"), "wb"))

            # Calculate RMSE
            actual_ratings = matrix[matrix > 0] # Only consider actual rated items
            predicted_ratings = predicted_matrix[matrix > 0]
            if len(actual_ratings) > 0:
                rmse = np.sqrt(mean_squared_error(actual_ratings, predicted_ratings))
                print(f"✅ Collaborative Filtering Model Trained Successfully! RMSE = {rmse:.4f}")
            else:
                print("✅ Collaborative Filtering Model Trained Successfully! No actual ratings for RMSE calculation.")

        except Exception as e:
            print(f"❌ Error during SVD for Collaborative Filtering: {e}")
            print("⚠️ Collaborative Filtering model could not be trained.")
            predictions_df = pd.DataFrame(index=user_item_matrix.index, columns=user_item_matrix.columns) # Empty if failed
    else:
        print(f"⚠️ Insufficient data for Collaborative Filtering SVD (matrix shape: {matrix.shape}). Skipping.")
else:
    print("⚠️ No valid user interaction data for Collaborative Filtering. Skipping.")

print("\n--- Recommendation Model Training Process Finished ---")
