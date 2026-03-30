import requests
import json

url = "https://api.openai.com/v1/chat/completions"
    
# Headers for the API request
headers = {
        "Content-Type": "application/json",
         "Authorization": "",
       #"api-key": "", # azure
}
    
chat = "Do you still have this item?"

chatprompt = "You are assisting in a C to C (consumer to consumer) used goods donation platform where users offer items for donation and communicate to arrange the pickup or delivery details. Generate three polite and helpful reply suggestions for the latest message in the conversation, taking into account the condition of the item, logistics, and any potential questions a receiver might have. The replies should be concise, positive, and encourage a smooth donation process. Here is the latest message in the conversation:"
'''
您正在協助建立一個 C to C（消費者對消費者）二手貨捐贈平台，
用戶可以在該平台上提供捐贈物品並進行溝通以安排取貨或送貨細節。 
考慮到物品的狀況、物流以及收件人可能存在的任何潛在問題，
針對對話中的最新消息產生三個禮貌且有用的回覆建議。 
回覆應該簡潔、積極，並鼓勵捐贈過程順利進行。 以下是對話中的最新消息：
'''

chat = chatprompt + " " + chat

prompt1 = "You are a helpful assistant that extracts data and returns it in JSON format."
#prompt2 = "Provide the 3 suggestions responses based on the conversation, the scene is when chatting between people."
prompt3 = "The column name is 'suggestion_chat'"

prompt = prompt1 + " " + prompt3
#prompt = prompt1 + " " + prompt2 + " " + prompt3

# Data payload for the API request, assuming you're sending the same data structure every time
data = {
        "model": "gpt-3.5-turbo",
        "response_format": {"type": "json_object"},
        "messages": [
            {"role":"system","content":prompt},
            {"role": "user", "content": chat}
        ],
        "max_tokens": 150,
        "temperature": 0.2,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "top_p": 0.95,
        "stop": None
}
    


# Sending the POST request
response = requests.post(url, json=data, headers=headers)

# Check if the request was successful
if response.status_code == 200:
    response_json = response.json()
    print(response_json)
    # Assuming the response JSON structure matches your expectations
    try:
        content_json_str = response_json['choices'][0]['message']['content']
        content_json = json.loads(content_json_str)
        suggestions = content_json['suggestion_chat']

        for suggestion in suggestions:
            print(suggestion)
    except KeyError as e:
        print(f"Key error: {e}")
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
else:
    print(f"Request failed with status code: {response.status_code}")



'''
response_json = response.json()

print(response_json)

# Extracting the content field from the response, which is in JSON format
content_json_str = response_json['choices'][0]['message']['content']

# Converting the string back to a JSON object/dictionary
content_json = json.loads(content_json_str)

# Accessing the 'suggestion_chat' field
suggestions = content_json['suggestion_chat']

for suggestion in suggestions:
    print(suggestion)
'''