from DeepImageSearch import Load_Data, Search_Setup 
from flask import Blueprint, jsonify, request, render_template
from PIL import Image
import base64
import os
from io import BytesIO
import requests
import io

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

temp_folder = 'D:\\programme\\fyp-python\\tempimg\\uploaded_image.jpg'
folder_path = 'D:\\programme\\react-fyp\\server\\uploadDonateIMG'
save_path = 'D:\\programme\\fyp-python\\saveimg\\'

searchimage_blueprint = Blueprint('searchimage_api', __name__)
@searchimage_blueprint.route('/searchimage/<string:user_id>', methods=['POST'])

def searchimage(user_id):
    print(f"user_id: {user_id}\n\n")
    print("Request received for searchimage route." , end="\n\n")
    base64_image = request.form.get('image')
    image_data = base64.b64decode(base64_image)
    image = Image.open(BytesIO(image_data))
    image.save(temp_folder)
    print("Image saved to local directory.", end="\n\n")
    load_local_image()
    similar_image_dict = find_similar_image()
    url = f'http://localhost:8081/androiduserimagesearchitemdata/{user_id}'
    response = requests.post(url, data = similar_image_dict)
    print("Server response content:" , end="\n\n")
    print(response.content.decode('utf-8') , end="\n\n")
    print("Server response:" , end="\n\n")
    print(response.json(), end="\n\n")
    return response.json()

def load_local_image():
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            _, ext = os.path.splitext(filename)
            ext = ext[1:]  
            default_format = 'PNG'
            try:
                file_format = Image.EXTENSION[ext]
            except KeyError:
                file_format = default_format
            save_file_path = os.path.join(save_path, f"{filename}.{file_format.lower()}")
            if os.path.exists(save_file_path):
                print(f"Image already exists at: {save_file_path}")
            else:
                with open(file_path, 'rb') as image_file:
                    image_content = image_file.read()
                    encoded_image = base64.b64encode(image_content).decode('utf-8')
                image = Image.open(io.BytesIO(base64.b64decode(encoded_image)))
                image.save(save_file_path, format=file_format)

                print(f"Image saved to: {save_file_path}")


def find_similar_image():
    image_list = Load_Data().from_folder([save_path])
    st = Search_Setup(image_list=image_list, model_name='vgg19', pretrained=True, image_count=100)
    st.run_index()
    metadata = st.get_image_metadata_file()
    similar_images = st.get_similar_images_with_similarity(temp_folder, number_of_images=30)
    print("this is similar_images " ,end="\n")
    print(similar_images)
    metadata = st.get_image_metadata_file()
    return similar_images
