import sys
import openai
import os

# Set your OpenAI API key (ensure OPENAI_API_KEY is set in environment)
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_chatbot_response(message):
    """Generate a response from the chatbot using OpenAI API."""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # or "gpt-4" if available
            messages=[{"role": "user", "content": message}],
            max_tokens=50
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating chatbot response: {e}", file=sys.stderr)
        return "Sorry, I couldn't process your request."

if __name__ == "__main__":
    # Read the message from command-line arguments
    if len(sys.argv) > 1:
        user_message = sys.argv[1]
        print(f"Received message: {user_message}", file=sys.stderr)
        print(get_chatbot_response(user_message))
    else:
        print("Error: No message provided", file=sys.stderr)
