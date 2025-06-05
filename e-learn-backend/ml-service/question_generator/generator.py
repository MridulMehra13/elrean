from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
import requests
from dotenv import load_dotenv
import os

load_dotenv()
# ---------- T5 Model Setup ----------
print("🚀 Loading T5 model...")
tokenizer = T5Tokenizer.from_pretrained("valhalla/t5-base-qg-hl")
model = T5ForConditionalGeneration.from_pretrained("valhalla/t5-base-qg-hl")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
print("✅ T5 model loaded")

# ---------- T5-Based Question Generation ----------
def generate_questions_t5(context):
    print("📘 Generating questions using T5 for content:", context)

    input_text = "generate questions: " + context
    encoding = tokenizer.encode_plus(
        input_text,
        return_tensors="pt",
        padding="max_length",
        truncation=True,
        max_length=512
    ).to(device)

    output = model.generate(
        input_ids=encoding['input_ids'],
        attention_mask=encoding['attention_mask'],
        max_length=64,
        num_return_sequences=5,
        do_sample=True,
        top_k=50,
        top_p=0.95
    )

    questions = [tokenizer.decode(q, skip_special_tokens=True) for q in output]
    print("🎯 T5 Raw questions:", questions)

    # Simple MCQ option generation (placeholder logic)
    def create_options(question):
        words = question.split()
        options = [question]
        for _ in range(3):
            shuffled = ' '.join(sorted(words, reverse=True))
            options.append(shuffled)
        return options

    result = []
    for i, q in enumerate(questions):
        result.append({
            "type": "mcq" if i % 2 == 0 else "descriptive",
            "question": q.strip(),
            "options": create_options(q) if i % 2 == 0 else [],
            "answer": q.strip() if i % 2 == 0 else None
        })
    return result

# ---------- Gemini-Based Question Generation ----------
def generate_questions_gemini(query: str):
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY environment variable not set")
        return []

    print("🌐 Calling Gemini API for question generation...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    headers = { "Content-Type": "application/json" }

    prompt = f"""Please generate a comprehensive step-by-step learning guide on {query}, formatted as an array of questions. 
Each question should be clear, relevant, and designed to build understanding progressively. 
The array should include approximately 50 questions. 
Each question must end with 'in English'. 
Format the response as a JSON array like: ["Question 1 in English", "Question 2 in English", ...]"""

    data = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        res_json = response.json()
        candidates = res_json.get("candidates", [])
        if not candidates:
            print("⚠️ No candidates returned from Gemini")
            return []

        parts = candidates[0].get("content", {}).get("parts", [])
        raw_text = " ".join(part.get("text", "") for part in parts).strip()

        # Clean and extract JSON-like array
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        raw_text = raw_text.strip("[]")
        questions = [q.strip().strip('"') for q in raw_text.split(",") if q.strip()]

        print(f"✅ Gemini generated {len(questions)} questions.")
        formatted = []
        for i, q in enumerate(questions[:10]):  # Limit to 10 for display
            formatted.append({
                "type": "mcq" if i % 2 == 0 else "descriptive",
                "question": q.replace("in English", "").strip(),
                "options": [q, "Option B", "Option C", "Option D"] if i % 2 == 0 else [],
                "answer": q if i % 2 == 0 else None
            })
        return formatted
    except Exception as e:
        print("❌ Error in Gemini API:", e)
        return []

# ---------- Unified Wrapper ----------
def generate_questions(context, use_gemini=False):
    """
    Generates structured questions.
    :param context: string, course content
    :param use_gemini: bool, if True uses Gemini, else T5
    :return: list of questions [{ type, question, options, answer }]
    """
    if use_gemini:
        return generate_questions_gemini(context)
    else:
        return generate_questions_t5(context)
