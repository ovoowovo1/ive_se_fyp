#Note: The openai-python library support for Azure OpenAI is in preview.
'''
import openai
openai.api_type = "azure"
openai.api_base = "https://ovoowovofyp.openai.azure.com/"
openai.api_version = "2023-07-01-preview"
openai.api_key = "YOUR_AZURE_OPENAI_API_KEY"



user_string = "How can I contact the developers?"


response = openai.ChatCompletion.create(
  engine="test",
  messages = [{"role":"system","content":"You are a customer service representative for a second-hand baby items donation platform, whose primary goal is to assist users with issues they encounter on the platform. Your service style is friendly and concise, and you only provide factual answers relevant to the queries. You do not answer questions unrelated to the platform."},{"role":"user","content":"How can I contact the developers?"},{"role":"assistant","content":"Yes, you can contact the developer by sending an email to developer@babyitemdonationplatform.com."},{"role":"user","content":"Does it cost money to get items from this platform?"},{"role":"assistant","content":"It's free, all items are donated by people."},{"role":"user","content":"Is there any way to contact the developer?"},{"role":"assistant","content":"Yes, you can contact the developer by sending an email to developer@babyitemdonationplatform.com."},{"role":"user","content":"What is the purpose of this platform"},{"role":"assistant","content":"The purpose of this platform is to facilitate the donation and redistribution of second-hand baby items, helping individuals and families in need to access essential baby items at no cost."}
              ,{"role":"user","content":user_string}
              ],
  temperature=0.7,
  max_tokens=200,
  top_p=0.95,
  frequency_penalty=0,
  presence_penalty=0,
  stop=None)


print(response['choices'][0]['message']['content'])
'''

from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__)
CORS(app)

# Configure OpenAI
openai.api_type = "azure"
openai.api_base = "https://ovoowovofyp.openai.azure.com/"
openai.api_version = "2023-07-01-preview"
openai.api_key = "your-api-key"

@app.route('/contact_developers', methods=['POST'])
def contact_developers():
    # Get user input from the request
    data = request.json
    user_string = data.get('user_string', '')

    # Create the API request
    response = openai.ChatCompletion.create(
        engine="test",
        messages=[
            {"role": "system", "content": "You are a customer service representative for a second-hand baby items donation platform, whose primary goal is to assist users with issues they encounter on the platform. Your service style is friendly and concise, and you only provide factual answers relevant to the queries. You do not answer questions unrelated to the platform."},
            {"role": "user", "content": user_string}
        ],
        temperature=0.7,
        max_tokens=200,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None
    )

    # Return the response
    return jsonify({"response": response['choices'][0]['message']['content']})

if __name__ == '__main__':
    app.run(debug=True)
