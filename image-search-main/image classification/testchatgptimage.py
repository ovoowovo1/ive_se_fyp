import openai


openai.api_key = "YOUR_API_KEY_HERE"
openai.api_base = "https://api.132999.xyz/v1"

response = openai.ChatCompletion.create(
  model ='gpt-4-all',
messages = [
      {
        "role": "system",
        "content":"You must use English talk with me.Use English to describe image content.This is the description of the donation used as a donation platform."
      },
      {
        "role": "user",
        "content": "https://i.imgur.com/ntuU5qj.jpg"
      }
    ],
  temperature=0.7,
  max_tokens=100,
  top_p=0.95,
  frequency_penalty=0,
  presence_penalty=0,
  stop=None
  )


print(response['choices'][0]['message']['content'])