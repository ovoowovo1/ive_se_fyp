import openai
import base64
import requests

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

image_path = "testimage.jpg"

# Getting the base64 string
base64_image = encode_image(image_path)

api_key ="YOUR_API_KEY_HERE"


headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}",
}

payload = {
    "model": "gpt-4-all",
    "messages": [
      {
        "role": "system",
        "content":"You must use English talk with me.Use English to describe image content.This is the description of the donation used as a donation platform."
      },
      {
        "role": "user",
        "content": "https://i.imgur.com/ntuU5qj.jpg"
      }
    ],
  "max_words": 100,
  "max_tokens": 100,
  "top_p":0.95,
  "frequency_penalty":0,
  "presence_penalty":0,
  "stop":None
}

response = requests.post("https://api.132999.xyz/v1/chat/completions", headers=headers, json=payload)

print(response.json())