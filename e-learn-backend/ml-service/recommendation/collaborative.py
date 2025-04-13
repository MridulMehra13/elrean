import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error
from scipy.sparse.linalg import svds


data = pd.read_csv("data/recommendation_data_cleaned.csv")


data['UserID'] = data['UserID'].astype(int)
data['CourseID'] = data['CourseID'].astype(int)


data = data.groupby(['UserID', 'CourseID'], as_index=False).agg({'Rating': 'mean'})

user_item_matrix = data.pivot(index="UserID", columns="CourseID", values="Rating").fillna(0)

matrix = user_item_matrix.values


min_val = np.min(matrix[matrix > 0])  # Ignore zero values
max_val = np.max(matrix)
matrix_scaled = (matrix - min_val) / (max_val - min_val)


optimal_k = min(100, min(matrix.shape) - 1)  # Increase k to capture more details
U, sigma, Vt = svds(matrix_scaled, k=optimal_k)
sigma = np.diag(sigma)


predicted_matrix = np.dot(np.dot(U, sigma), Vt)


predicted_matrix = predicted_matrix * (max_val - min_val) + min_val

predictions_df = pd.DataFrame(predicted_matrix, index=user_item_matrix.index, columns=user_item_matrix.columns)


actual_ratings = matrix[matrix > 0]
predicted_ratings = predicted_matrix[matrix > 0]
rmse = np.sqrt(mean_squared_error(actual_ratings, predicted_ratings))

print(f"✅ Model Evaluation (Optimized): RMSE = {rmse:.4f}")
print("✅ Pivot table created successfully!")

def get_collaborative_recommendations(user_id, top_n=5):
    """Get top N course recommendations for a user."""
    if user_id not in predictions_df.index:
        return []

    sorted_courses = predictions_df.loc[user_id].sort_values(ascending=False)
    recommended_courses = sorted_courses.head(top_n).index.tolist()
    
    return [{"CourseID": course} for course in recommended_courses]
