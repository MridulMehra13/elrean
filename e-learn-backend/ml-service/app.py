from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

from recommendation.content_based import get_content_recommendations
from recommendation.collaborative import get_collaborative_recommendations
from recommendation.hybrid import get_hybrid_recommendations
from question_generator.routes import question_gen_bp  # ✅ Blueprint import

app = Flask(__name__)
CORS(app)  # ✅ Allow CORS for Postman or frontend

# Register Smart Question Generator Blueprint
app.register_blueprint(question_gen_bp, url_prefix='/api/question-generator')

# Load dataset
data_path = "data/recommendation_data.csv"
data = pd.read_csv(data_path)
data.columns = data.columns.str.strip()
data.rename(columns=lambda x: x.strip(), inplace=True)
data.fillna("", inplace=True)

print("✅ Dataset loaded successfully!")
print("📊 Columns in dataset:", data.columns.tolist())

# ✅ Content-Based Recommendation
@app.route("/recommend/content", methods=["GET"])
def recommend_content_based():
    course_id = request.args.get("course_id")
    if not course_id:
        return jsonify({"error": "Missing 'course_id' parameter"}), 400
    recommendations = get_content_recommendations(course_id, top_n=5)
    if not recommendations:
        return jsonify({"error": "Course not found or no recommendations available"}), 404
    return jsonify({"course_id": course_id, "recommendations": recommendations})

# ✅ Collaborative Filtering
@app.route("/recommend/collaborative", methods=["GET"])
def recommend_collaborative():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing 'user_id' parameter"}), 400
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "'user_id' must be an integer"}), 400
    recommendations = get_collaborative_recommendations(user_id, top_n=5)
    if not recommendations:
        return jsonify({"error": "User not found or no recommendations available"}), 404
    return jsonify({"user_id": user_id, "recommendations": recommendations})

# ✅ Hybrid Recommendation
@app.route("/recommend/hybrid", methods=["GET"])
def recommend_hybrid():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing 'user_id' parameter"}), 400
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "'user_id' must be an integer"}), 400
    top_n = int(request.args.get("top_n", 5))
    recommendations = get_hybrid_recommendations(user_id, top_n)
    return jsonify(recommendations)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
