import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load dataset
data_path = "data/recommendation_data.csv"

try:
    data = pd.read_csv(data_path, dtype={"CourseID": str})  # Ensure CourseID is string
    print("✅ Dataset loaded successfully!")
    print("Columns in dataset:", data.columns)

    # Ensure required columns exist
    required_columns = {"CourseID", "Subject", "Format", "Difficulty"}
    if not required_columns.issubset(data.columns):
        raise ValueError(f"Dataset must contain the columns: {required_columns}")

    # Create a combined feature for similarity
    data["combined_features"] = data["Subject"] + " " + data["Format"] + " " + data["Difficulty"]

    # TF-IDF Vectorization
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(data["combined_features"])

    # Compute Cosine Similarity
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    data = None
    cosine_sim = None  # Prevent further errors

# Function to get content-based recommendations
def get_content_recommendations(course_id, top_n=5):
    if data is None or cosine_sim is None:
        return {"error": "Dataset not loaded properly"}

    if course_id not in data["CourseID"].values:
        return {"error": f"CourseID '{course_id}' not found"}

    idx = data.index[data["CourseID"] == course_id].tolist()[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1 : top_n + 1]
    course_indices = [i[0] for i in sim_scores]

    return data[["CourseID", "Subject", "Format", "Difficulty"]].iloc[course_indices].to_dict(orient="records")
