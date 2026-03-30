from PIL import Image
import base64
import os
import io

folder_path = 'D:\\programme\\react-fyp\\server\\uploads'

# Iterate over all files in the folder
for filename in os.listdir(folder_path):
    # Construct the full path to the file
    file_path = os.path.join(folder_path, filename)

    # Check if the file is a regular file (not a subdirectory)
    if os.path.isfile(file_path):
        # Open the image file
        with open(file_path, 'rb') as image_file:
            # Read the image content
            image_content = image_file.read()
            # Encode the image content in base64
            encoded_image = base64.b64encode(image_content).decode('utf-8')

        # Display the image
        Image.open(io.BytesIO(base64.b64decode(encoded_image))).show()
