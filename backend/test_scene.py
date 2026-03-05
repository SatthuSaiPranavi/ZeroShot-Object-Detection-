from scene_infer import generate_caption

with open("test.jpg", "rb") as f:
    image_bytes = f.read()

caption = generate_caption(image_bytes)
print("Caption:", caption)
