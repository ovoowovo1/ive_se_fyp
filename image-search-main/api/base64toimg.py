from PIL import Image
import base64
import os
import io

folder_path = 'D:\\programme\\react-fyp\\server\\uploads'

save_path = 'D:\\programme\\fyp-python\\saveimg\\'


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
        #Image.open(io.BytesIO(base64.b64decode(encoded_image))).show()
            



        # Decode and save the image
        image = Image.open(io.BytesIO(base64.b64decode(encoded_image)))

        # Get the file extension from the original filename
        _, ext = os.path.splitext(filename)
        ext = ext[1:]  # Remove the leading dot from the extension

        # Define a default format in case the extension is not recognized
        default_format = 'PNG'

        try:
            # Try to get the format based on the extension
            file_format = Image.EXTENSION[ext]
        except KeyError:
            # If the extension is not recognized, use the default format
            file_format = default_format

        # Specify the file format when saving the image
        save_file_path = os.path.join(save_path, f"{filename}.{file_format.lower()}")
        image.save(save_file_path, format=file_format)

        print(f"Image saved to: {save_file_path}")