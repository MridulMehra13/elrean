from flask import Blueprint, request, jsonify
from .generator import generate_questions_gemini

question_gen_bp = Blueprint("question_gen_bp", __name__)

@question_gen_bp.route("/generate", methods=["POST"])
def generate_quiz_questions():
    data = request.get_json()
    course_content = data.get("course_content", "")

    if not course_content:
        return jsonify({"error": "Course content is required"}), 400

    raw_questions = generate_questions_gemini(course_content)
    
    formatted_questions = []
    for i, q in enumerate(raw_questions):
        # If Gemini returned a dict, extract and clean the "question"
        if isinstance(q, dict):
            question_text = q.get("question", "").replace('in English', '').strip()
            q["question"] = question_text
            if "type" not in q:
                q["type"] = "mcq" if i % 2 == 0 else "descriptive"
            if "options" not in q:
                q["options"] = [question_text, "Option B", "Option C", "Option D"] if q["type"] == "mcq" else []
            if "answer" not in q:
                q["answer"] = question_text
            formatted_questions.append(q)

        # If Gemini returned a plain string, wrap it into a question object
        elif isinstance(q, str):
            q_clean = q.replace('in English', '').strip()
            formatted_questions.append({
                "question": q_clean,
                "type": "mcq" if i % 2 == 0 else "descriptive",
                "options": [q_clean, "Option B", "Option C", "Option D"] if i % 2 == 0 else [],
                "answer": q_clean
            })

        else:
            print(f"Unexpected question format: {q}")  # Optional: log unexpected types

    return jsonify({"questions": formatted_questions})
