from flask import Flask, request, jsonify
import pandas as pd
from recommendation.content_based import get_content_recommendations
from recommendation.collaborative import get_collaborative_recommendations
from recommendation.hybrid import get_hybrid_recommendations
from question_generator.generate_questions import generate_questions

# ✅ Import the NLP model for the chatbot
from chatbot.chatbot import get_chatbot_response  

app = Flask(__name__)

# Load dataset
data_path = "data/recommendation_data.csv"
data = pd.read_csv(data_path)

data.columns = data.columns.str.strip()  # Remove leading/trailing spaces
data.rename(columns=lambda x: x.strip(), inplace=True)

data.fillna("", inplace=True)

print("✅ Dataset loaded successfully!")
print("Columns in dataset:", data.columns.tolist())  # Debugging Output

# ✅ Chatbot Endpoint
@app.route("/chatbot", methods=["POST"])
def chatbot():
    """Chatbot API endpoint for responding to student queries."""
    data = request.get_json()
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    response = get_chatbot_response(message)  # Call chatbot function
    return jsonify({"response": response})

@app.route("/recommend/content", methods=["GET"])
def recommend_content_based():
    """API Endpoint for Content-Based Recommendations."""
    course_id = request.args.get("course_id")

    if not course_id:
        return jsonify({"error": "Missing 'course_id' parameter"}), 400

    recommendations = get_content_recommendations(course_id, top_n=5)

    if not recommendations:
        return jsonify({"error": "Course not found or no recommendations available"}), 404

    return jsonify({"course_id": course_id, "recommendations": recommendations})

@app.route("/recommend/collaborative", methods=["GET"])
def recommend_collaborative():
    """API Endpoint for Collaborative Filtering Recommendations."""
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "Missing 'user_id' parameter"}), 400

    try:
        user_id = int(user_id)  # Convert user_id to integer
    except ValueError:
        return jsonify({"error": "'user_id' must be an integer"}), 400

    recommendations = get_collaborative_recommendations(user_id, top_n=5)

    if not recommendations:
        return jsonify({"error": "User not found or no recommendations available"}), 404

    return jsonify({"user_id": user_id, "recommendations": recommendations})

@app.route("/recommend/hybrid", methods=["GET"])
def recommend_hybrid():
    """Hybrid recommendation endpoint."""
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

@app.route("/generate-questions", methods=["POST"])
def generate_quiz_questions():
    """API endpoint to generate quiz questions from course content."""
    data = request.json
    course_content = data.get("course_content", "")

    if not course_content:
        return jsonify({"error": "Course content is required"}), 400

    questions = generate_questions(course_content)
    return jsonify({"questions": questions})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
