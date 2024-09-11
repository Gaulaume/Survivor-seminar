import requests
from PIL import Image
import torch
from transformers import pipeline

path = '/home/valentin/Github/Survivor-seminar/valentin.peron@epitech.eu.jpg'

def get_image(path):
    try:
        return Image.open(path)
    except FileNotFoundError:
        print(f"File not found: {path}  ")
        return None

image = get_image(path)

# Set up the model for CPU usage
model_id = "llava-hf/llava-1.5-7b-hf"
pipe = pipeline("image-to-text", model=model_id, device=-1)  # device=-1 forces CPU usage

# Define the prompt
max_new_tokens = 200
prompt = (
    "USER: <image>\nAnalyze the facial expressions and posture of the client in this video from a 'simulation meeting.' "
    "Provide feedback on their emotional state and body language. Suggest personalized exercises or advice to help them "
    "improve their communication skills and confidence for future meetings.\nASSISTANT:"
)

# Generate outputs  using the model                                 
outputs = pipe(image, prompt=prompt, generate_kwargs={"max_new_tokens": 200})

# Print the generated text
print(outputs[0]["generated_text"])
