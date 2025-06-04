from flask import Blueprint, request, jsonify
from .generator import generate_questions  # Import the generator function

question_gen_bp = Blueprint("question_gen_bp", __name__)

@question_gen_bp.route("/generate", methods=["POST"])
def generate_quiz_questions():
    """API endpoint to generate quiz questions from course content."""
    data = request.get_json()
    course_content = data.get("course_content", "")

    if not course_content:
        return jsonify({"error": "Course content is required"}), 400

    questions = generate_questions(course_content)
    return jsonify({"questions": questions})
