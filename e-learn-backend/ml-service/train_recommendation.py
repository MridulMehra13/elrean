import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

# Load dataset
data_path = "data/recommendation_data.csv"
data = pd.read_csv(data_path)

# Process text-based features for Content-Based Filtering
vectorizer = TfidfVectorizer(stop_words='english')
content_matrix = vectorizer.fit_transform(data['content_description'])

# Compute similarity scores
content_similarity = cosine_similarity(content_matrix)

# Collaborative Filtering (User-Item Matrix)
user_item_matrix = data.pivot_table(index='user_id', columns='content_id', values='interaction_score').fillna(0)

# Save processed data and models
pickle.dump(vectorizer, open("models/tfidf_vectorizer.pkl", "wb"))
pickle.dump(content_similarity, open("models/content_similarity.pkl", "wb"))
pickle.dump(user_item_matrix, open("models/user_item_matrix.pkl", "wb"))

print("✅ Recommendation Model Training Completed!")
