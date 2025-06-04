import openai
import os

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_questions(course_content):
    """Generate quiz questions from given course content."""
    try:
        prompt = f"Generate three quiz questions from the following course content:\n\n{course_content}"
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        questions = response.choices[0].message.content.strip().split("\n")
        return questions
    except Exception as e:
        print(f"❌ Error in question generation: {e}")
        return []

