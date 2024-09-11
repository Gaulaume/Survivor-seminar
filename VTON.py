from gradio_client import Client, file

people = "people.png"
clothe = "clothe.jpeg"

client = Client("https://neat-spies-smile.loca.lt/")
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



