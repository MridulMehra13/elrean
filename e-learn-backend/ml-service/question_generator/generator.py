from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch

print("🚀 Loading T5 model...")
tokenizer = T5Tokenizer.from_pretrained("valhalla/t5-base-qg-hl")
model = T5ForConditionalGeneration.from_pretrained("valhalla/t5-base-qg-hl")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
print("✅ T5 model loaded")

def generate_questions(context):
    print("📘 Generating questions for content:", context)
    
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
    print("🎯 Raw questions:", questions)

    # Simple heuristic to create MCQ options by shuffling words (for demo purposes)
    def create_options(question):
        words = question.split()
        options = [question]
        for _ in range(3):
            shuffled = ' '.join(sorted(words, reverse=True))
            options.append(shuffled)
        return options

    result = []
    for i, q in enumerate(questions):
        if i % 2 == 0:
            # MCQ type
            result.append({
                "type": "mcq",
                "question": q,
                "options": create_options(q),
                "answer": q
            })
        else:
            # Descriptive type
            result.append({
                "type": "descriptive",
                "question": q,
                "options": [],
                "answer": None
            })
    return result
