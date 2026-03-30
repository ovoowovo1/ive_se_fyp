from DeepImageSearch import Load_Data, Search_Setup
from flask import Blueprint, jsonify, request
from PIL import Image
import base64
import os
import io



# Get the image file from the request
#image_file = request.files['image']

# Load images from a folder
image_list = Load_Data().from_folder(['D:\\programme\\fyp-python\\saveimg'])

# Set up the search engine, You can load 'vit_base_patch16_224_in21k', 'resnet50' etc more then 500+ models 
st = Search_Setup(image_list=image_list, model_name='vgg19', pretrained=True, image_count=100)

# Index the images
st.run_index()

# Get metadata
metadata = st.get_image_metadata_file()

# Get similar images

similar_images = st.get_similar_images_with_similarity("./api/testimg.jpg", number_of_images=30)

print("this is similar_images " ,end="\n")
print(similar_images)


# Update metadata
metadata = st.get_image_metadata_file()