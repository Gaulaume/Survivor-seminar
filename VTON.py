from gradio_client import Client, file

people = "valentin.png"
clothe = "tshirt.png"

client = Client("https://b25b-52-90-122-161.ngrok-free.app/")
result = client.predict(
    dict={"background": file(people), "layers": [], "composite": None},
    garm_img=file(clothe),
    garment_des="Hello!!",
    is_checked=True,
    is_checked_crop=False,
    denoise_steps=40,
    seed=42,
    api_name="/tryon"
)
print(result)



