from transformers import pipeline

# ✅ Load a pre-trained NLP model for answering questions
qa_pipeline = pipeline("text-generation", model="gpt2")  # Change model if needed

def get_chatbot_response(message):
    """Generate a response from the chatbot based on user input."""
    response = qa_pipeline(message, max_length=50, num_return_sequences=1)
    return response[0]['generated_text']
