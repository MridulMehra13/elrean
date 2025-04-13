import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse.linalg import svds
from sklearn.feature_extraction.text import TfidfVectorizer
from recommendation.content_based import get_content_recommendations
from recommendation.collaborative import get_collaborative_recommendations


data_path = "data/recommendation_data_cleaned.csv"
data = pd.read_csv(data_path)


data.columns = data.columns.str.strip()
data.rename(columns=lambda x: x.strip(), inplace=True)


data.fillna("", inplace=True)

data["UserID"] = data["UserID"].astype(int)
data["CourseID"] = data["CourseID"].astype(int)

# 🔹 **Fix Duplicate Entries (UserID, CourseID)**
data = data.groupby(["UserID", "CourseID"], as_index=False).agg({"Rating": "mean", "Subject": "first", "Format": "first", "Difficulty": "first"})

print("✅ Dataset loaded successfully!")
print("Columns in dataset:", data.columns.tolist())


def compute_content_similarity():
    """Compute course similarities using TF-IDF."""
    
    
    required_columns = ["Subject", "Format", "Difficulty"]
    for col in required_columns:
        if col not in data.columns:
            raise KeyError(f"Missing required column: {col}")

    
    data["Metadata"] = data["Subject"].astype(str) + " " + data["Format"].astype(str) + " " + data["Difficulty"].astype(str)

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(data["Metadata"])

    similarity_matrix = cosine_similarity(tfidf_matrix)
    return similarity_matrix

content_similarity = compute_content_similarity()


user_item_matrix = data.pivot(index="UserID", columns="CourseID", values="Rating").fillna(0)
matrix = user_item_matrix.values


if matrix.shape[0] > 1 and matrix.shape[1] > 1:
    k_factors = min(100, min(matrix.shape) - 1)
    U, sigma, Vt = svds(matrix, k=k_factors)
    sigma = np.diag(sigma)
    predicted_matrix = np.dot(np.dot(U, sigma), Vt)
    predictions_df = pd.DataFrame(predicted_matrix, index=user_item_matrix.index, columns=user_item_matrix.columns)
    print("✅ Collaborative Filtering Model Trained Successfully!")
else:
    predictions_df = pd.DataFrame(index=user_item_matrix.index, columns=user_item_matrix.columns)
    print("⚠️ Insufficient data for Collaborative Filtering. Predictions may be limited.")


def get_hybrid_recommendations(user_id, top_n=5, alpha=0.6):
    """
    Combine Content-Based (CBF) & Collaborative Filtering (CF) recommendations.
    
    - alpha (0.0 to 1.0): Weight for CF (higher = more CF influence).
    - (1 - alpha): Weight for CBF.
    """
    if user_id not in predictions_df.index:
        return []  # No recommendations for new users

    # CF Recommendations (Matrix Factorization)
    cf_recommendations = get_collaborative_recommendations(user_id, top_n * 2)  # Get more for blending
    cf_courses = {item["CourseID"]: idx for idx, item in enumerate(cf_recommendations)}

    # CBF Recommendations (TF-IDF Similarity)
    cbf_recommendations = get_content_recommendations(user_id, top_n * 2)
    cbf_courses = {item["CourseID"]: idx for idx, item in enumerate(cbf_recommendations)}

    # Hybrid Score Calculation
    final_scores = {}
    for course in set(cf_courses.keys()).union(set(cbf_courses.keys())):
        cf_score = 1 / (cf_courses[course] + 1) if course in cf_courses else 0
        cbf_score = 1 / (cbf_courses[course] + 1) if course in cbf_courses else 0

        # Weighted Sum
        final_scores[course] = alpha * cf_score + (1 - alpha) * cbf_score

    # Sort by highest scores
    hybrid_recommendations = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

    return [{"CourseID": course, "Score": score} for course, score in hybrid_recommendations]

# 🔹 **Example Usage**
if __name__ == "__main__":
    test_user_id = data["UserID"].iloc[0]
    hybrid_recommended = get_hybrid_recommendations(test_user_id)
    print(f"🔹 Hybrid Recommendations for User {test_user_id}: {hybrid_recommended}")
