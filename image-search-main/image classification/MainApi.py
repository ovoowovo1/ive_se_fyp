from flask import Flask, request, jsonify
from keras.models import load_model  # TensorFlow is required for Keras to work
from PIL import Image, ImageOps  # Install pillow instead of PIL
import numpy as np
from flask_cors import CORS

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load the model
model = load_model("keras_model.h5", compile=False)

# Load the labels
class_names = open("labels.txt", "r").readlines()

# Create the Flask app
app = Flask(__name__)
CORS(app)

# Define the predict endpoint
@app.route('/predict', methods=['POST'])
def predict():
    # Get the image file from the request
    image_file = request.files['image']

    # Open the image file and convert to RGB
    image = Image.open(image_file).convert("RGB")

    # Resize the image to be at least 224x224 and then crop from the center
    size = (224, 224)
    image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)

    # Turn the image into a numpy array
    image_array = np.asarray(image)

    # Normalize the image
    normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1

    # Load the image into the array
    data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
    data[0] = normalized_image_array

    # Predict the model
    prediction = model.predict(data)
    index = np.argmax(prediction)
    class_name = class_names[index]
    confidence_score = prediction[0][index]

    # Print each class and its confidence score
    for i in range(len(class_names)):
        print("Class:", class_names[i].strip())  # .strip() removes leading/trailing whitespaces
        print("Confidence Score:", prediction[0][i])

    #Print the class with the highest confidence score
    print("Highest Class:", class_names[index].strip())
    print("Highest Confidence Score:", confidence_score)

    #put the class name into a string
    
    json_class_name = str(class_name)

    print("test :"+json_class_name)

    # Return the prediction and confidence score as JSON
    return jsonify({
        'class': json_class_name,
    })

# Print message to indicate that the localhost is starting
print("Starting localhost...")


    


# Run the app
if __name__ == '__main__':
    app.run(host='localhost', port=5001)
