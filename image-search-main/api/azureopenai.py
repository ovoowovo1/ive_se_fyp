from flask import Blueprint, jsonify, request
import openai
import requests

openai_blueprint = Blueprint('openai_api', __name__)

@openai_blueprint.route('/contact_ai', methods=['POST'])
def contact_ai():
    # 设置您的Node.js服务器URL
    url = 'http://localhost:8081/getAIChat'

    # 发送GET请求
    response = requests.get(url)
    # 检查响应状态码
    if response.status_code == 200:
        # 转换JSON响应数据
        data = response.json()
    else:
        print('Failed to retrieve data:', response.status_code)
        return None
    
    messagesdata=[
              {"role":"system","content":"You are a customer service representative for a second-hand baby items donation platform, whose primary goal is to assist users with issues they encounter on the platform. Your service style is friendly and concise, and you only provide factual answers relevant to the queries. You do not answer questions unrelated to the platform."},{"role":"user","content":"How can I contact the developers?"}
              ]

    for i in data:
      # 假设 data 中的每个 i 都是一个字典，有 'AI_Message' 和 'User_Message' 键
      # 如果实际情况不是这样，请相应地调整键名称
      if 'AI_Message' in i and 'User_Message' in i:
          messagesdata.append({"role": "assistant", "content": i['AI_Message']})
          messagesdata.append({"role": "user", "content": i['User_Message']})
      else:
          print("Invalid entry in data:", i)
          # 这里你可以决定是否要终止循环，或者跳过这个条目
          # 例如，使用 continue 跳过这个条目
          continue




    # Configure OpenAI
    openai.api_type = "azure"
    openai.api_base = "https://ovoowovofyp.openai.azure.com/"
    openai.api_version = "2024-02-15-preview"
    openai.api_key = "YOUR_AZURE_OPENAI_API_KEY"

    # Get user input from the request
    data = request.json
    user_string = data.get('user_string', '')
    print("User say :" + str(user_string))
    messagesdata.append({"role": "user", "content": user_string})

    # Create the API request
    response = openai.ChatCompletion.create(
        
        engine="fypchatbot",
        # messages=[
           #{"role":"system","content":"You are a customer service representative for a second-hand baby items donation platform, whose primary goal is to assist users with issues they encounter on the platform. Your service style is friendly and concise, and you only provide factual answers relevant to the queries. You do not answer questions unrelated to the platform."},{"role":"user","content":"How can I contact the developers?"},
          # {"role":"assistant","content":"Yes, you can contact the developer by sending an email to developer@babyitemdonationplatform.com."},
          # {"role":"user","content":"Does it cost money to get items from this platform?"},
           #{"role":"assistant","content":"It's free, all items are donated by people."},
           #{"role":"user","content":"Is there any way to contact the developer?"},
           #{"role":"user","content":"What is the purpose of this platform"},
           #{"role":"assistant","content":"The purpose of this platform is to facilitate the donation and redistribution of second-hand baby items, helping individuals and families in need to access essential baby items at no cost."}
           
           # ,
            # {"role": "user", "content": user_string}
        # ],
        messages=messagesdata,
        temperature=0.7,
        max_tokens=200,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None
    )

    print()
    # Return the response
    return jsonify({"response": response['choices'][0]['message']['content']})