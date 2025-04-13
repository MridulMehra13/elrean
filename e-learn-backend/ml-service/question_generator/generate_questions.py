from transformers import pipeline

# Load the T5 model pipeline
qa_pipeline = pipeline("text2text-generation", model="t5-small")

def generate_questions(course_content):
    """Generate quiz questions from given course content."""
    try:
        prompt = f"Generate questions from: {course_content}"
        response = qa_pipeline(prompt, max_length=100, num_return_sequences=3, num_beams=3)  # ✅ Add num_beams=3
        questions = [res["generated_text"] for res in response]
        return questions
    except Exception as e:
        print(f"❌ Error in question generation: {e}")
        return []
