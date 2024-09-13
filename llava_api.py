from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from transformers import BitsAndBytesConfig, LlavaNextVideoForConditionalGeneration, LlavaNextVideoProcessor
import torch
import av
import numpy as np
from io import BytesIO
from pyngrok import ngrok

app = FastAPI()

# Quantization configuration for 4-bit quantization
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16
)

# Load the model and processor
processor = LlavaNextVideoProcessor.from_pretrained("llava-hf/LLaVA-NeXT-Video-7B-hf")
model = LlavaNextVideoForConditionalGeneration.from_pretrained(
   "llava-hf/LLaVA-NeXT-Video-7B-hf",
    quantization_config=quantization_config,
    device_map='auto'
)

def read_video_pyav(container, indices):
    frames = []
    container.seek(0)
    start_index = indices[0]
    end_index = indices[-1]
    for i, frame in enumerate(container.decode(video=0)):
        if i > end_index:
            break
        if i >= start_index and i in indices:
            frames.append(frame)
    return np.stack([x.to_ndarray(format="rgb24") for x in frames])

@app.post("/analyze_video/")
async def analyze_video(file: UploadFile = File(...)):
    try:
        # Read the uploaded video file
        video_bytes = await file.read()
        video_io = BytesIO(video_bytes)
        container = av.open(video_io)

        # Extract frames from the video
        total_frames = container.streams.video[0].frames
        nb_frames = 8
        indices = np.arange(0, total_frames, total_frames / nb_frames).astype(int)
        clip = read_video_pyav(container, indices)

        # Create separate prompts for each category
        facial_expression_prompt = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze only the facial expressions of the client in this \"simulation date\" video. Focus on emotions, engagement level, and reactions."},
                    {"type": "video"},
                ],
            },
        ]
        posture_prompt = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze only the posture of the client in this \"simulation date\" video. Provide insights into their body language and confidence."},
                    {"type": "video"},
                ],
            },
        ]
        interaction_dynamics_prompt = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze the interaction dynamics between the two clients in the \"simulation date\" video. Focus on engagement, interest, and social cues."},
                    {"type": "video"},
                ],
            },
        ]
        tips_prompt = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Based on the facial expressions, posture, and interaction dynamics, recommend personalized exercises or tips for the clients in the \"simulation date\" video."},
                    {"type": "video"},
                ],
            },
        ]

        # Process the input and generate output for each category
        prompts = [facial_expression_prompt, posture_prompt, interaction_dynamics_prompt, tips_prompt]
        results = {}
        for i, category_prompt in enumerate(prompts):
            prompt = processor.apply_chat_template(category_prompt, add_generation_prompt=True)
            inputs = processor([prompt], videos=[clip], padding=True, return_tensors="pt").to(model.device)

            generate_kwargs = {"max_new_tokens": 200, "do_sample": True, "top_p": 0.9}
            output = model.generate(**inputs, **generate_kwargs)
            generated_text = processor.batch_decode(output, skip_special_tokens=True)

            try:
                generated_text = generated_text[0].split("ASSISTANT: ")[1]
            except:
                try:
                    generated_text = generated_text[0].split("ASSISTANT:")[1]
                except:
                    pass

            # Assigning results based on iteration (order: facial_expressions, posture, interaction_dynamics, tips)
            if i == 0:
                results["facial_expressions"] = generated_text
            elif i == 1:
                results["posture"] = generated_text
            elif i == 2:
                results["interaction_dynamics"] = generated_text
            elif i == 3:
                results["tips"] = generated_text

        return JSONResponse(content=results)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    # Run the FastAPI app with Uvicorn
    import uvicorn
    # Start ngrok tunnel
    public_url = ngrok.connect(8000)
    print(f" * ngrok tunnel \"{public_url}\" -> \"http://127.0.0.1:8000\"")

    # Run the FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=8000)
