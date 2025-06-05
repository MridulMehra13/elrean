import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse.linalg import svds
from sklearn.feature_extraction.text import TfidfVectorizer
from recommendation.content_based import get_content_recommendations
from recommendation.collaborative import get_collaborative_recommendations
import pickle
import os

# Load models from files saved by training script
try:
    vectorizer = pickle.load(open("models/tfidf_vectorizer.pkl", "rb"))
    content_similarity = pickle.load(open("models/content_similarity.pkl", "rb"))
    content_course_map = pickle.load(open("models/content_course_map.pkl", "rb"))
    print("✅ Content-based models loaded.")
except Exception as e:
    print(f"❌ Error loading content-based models: {e}")
    vectorizer, content_similarity, content_course_map = None, None, None

try:
    predictions_df = pickle.load(open("models/cf_predictions_df.pkl", "rb"))
    print("✅ Collaborative filtering model loaded.")
except Exception as e:
    print(f"❌ Error loading collaborative filtering model: {e}")
    predictions_df = pd.DataFrame()

def get_hybrid_recommendations(user_id, top_n=5, alpha=0.6):
    if user_id not in predictions_df.index:
        return []  # No recommendations for new users

    cf_recommendations = get_collaborative_recommendations(user_id, top_n * 2)
    cf_courses = {item["CourseID"]: idx for idx, item in enumerate(cf_recommendations)}

    cbf_recommendations = get_content_recommendations(user_id, top_n * 2)
    if isinstance(cbf_recommendations, dict) and "error" in cbf_recommendations:
        cbf_recommendations = []
    cbf_courses = {item["CourseID"]: idx for idx, item in enumerate(cbf_recommendations)}

    final_scores = {}
    for course in set(cf_courses.keys()).union(set(cbf_courses.keys())):
        cf_score = 1 / (cf_courses[course] + 1) if course in cf_courses else 0
        cbf_score = 1 / (cbf_courses[course] + 1) if course in cbf_courses else 0
        final_scores[course] = alpha * cf_score + (1 - alpha) * cbf_score

    hybrid_recommendations = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

    # Load user preferences from content_course_map DataFrame
    if content_course_map is not None:
        user_prefs = content_course_map[content_course_map["CourseID"].isin(predictions_df.columns)]
    else:
        user_prefs = pd.DataFrame(columns=["CourseID", "Format"])

    preferred_formats = user_prefs["Format"].value_counts().to_dict() if not user_prefs.empty else {}

    preferred_mode = max(preferred_formats, key=preferred_formats.get) if preferred_formats else "video"

    recommendations_with_mode = []
    for course, score in hybrid_recommendations:
        if content_course_map is not None and not content_course_map[content_course_map["CourseID"] == course].empty:
            course_format = content_course_map[content_course_map["CourseID"] == course]["Format"].iloc[0]
        else:
            course_format = preferred_mode
        recommendations_with_mode.append({
            "CourseID": course,
            "Score": score,
            "RecommendedLearningMode": course_format or preferred_mode
        })

    return recommendations_with_mode
