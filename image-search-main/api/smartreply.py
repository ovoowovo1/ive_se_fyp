import requests
import json
from flask import Blueprint, jsonify, request



smart_reply_blueprint = Blueprint('smart_reply', __name__)

@smart_reply_blueprint.route('/smart_reply', methods=['POST'])
def get_openAI_smart_reply():
    message = request.json
    print(message)

    url = "https://api.openai.com/v1/chat/completions"
        
    # Headers for the API request
    headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer YOUR_OPENAI_API_KEY",
    }

    #Recipient Donor
    #chat = "[Recipient] hi"
    chatprompt = "Background is free second-hand items platform (Personal user to Personal user).The Generates three polite reply suggestions to the latest message in the conversation,responses should be concise and should be no longer than 10 words and reply should be different possibilities , Eg yes I can ,no cannot.Try to use I as the personal pronoun instead of we.Dont mention money. Here are the latest updates from the conversation:"
    
    '''
    您正在協助建立一個 C to C（消費者對消費者）二手貨捐贈平台，
    用戶可以在該平台上提供捐贈物品並進行溝通以安排取貨或送貨細節。
    針對對話中的最新訊息產生三個禮貌且有用的回覆建議，考慮到物品的狀況、
    物流以及接收者可能有的任何潛在問題。回覆建議應該看起來像人與人之間的正常對話。 
    回覆應簡潔、積極，並鼓勵捐贈過程順利進行，不應超過一句話。 以下是對話中的最新消息：
    '''

    #chat = chatprompt + " " + chat
    chat = chatprompt + " " + message

    prompt1 = "You are a helpful assistant that extracts data and returns it in JSON format."
    prompt2 = "The column name is 'suggestion_chat'"
    prompt = prompt1 + " " + prompt2 

    data = {
            "model": "gpt-3.5-turbo",
            "response_format": {"type": "json_object"},
            "messages": [
                {"role":"system","content":prompt},
                {"role": "user", "content": chat}
            ],
            "max_tokens": 200,
            "temperature": 0.2,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "top_p": 0.95,
            "stop": None,
            "seed": 1
    }
        

    # Sending the POST request
    response = requests.post(url, json=data, headers=headers)


    max_retries = 3
    attempts = 0

    while attempts < max_retries:
        response = requests.post(url, json=data, headers=headers)
        attempts += 1

        if response.status_code == 200:
            # Request successful
            response_json = response.json()
            print(response_json['usage']['total_tokens'])

            try:
                content_json_str = response_json['choices'][0]['message']['content']
                content_json = json.loads(content_json_str)
                suggestions = content_json['suggestion_chat']
                
                replydata = []
                for suggestion in suggestions:
                    print(suggestion)
                    replydata.append({"message": suggestion})
                
                return jsonify(replydata)

            except KeyError as e:
                print(f"Key error: {e}")
                break  # Break out of the loop because this is a parsing issue, not a request issue
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                break  # Same as above
            break  # The request is successful and the loop is broken out.
        else:
            print(f"Attempt {attempts}: Request failed with status code: {response.status_code}")
            if attempts == max_retries:
                print("Reached maximum retry attempts. Giving up.")
    return jsonify("Error: Failed to get response from OpenAI. Please try again later.")
