from flask import Flask
from flask_cors import CORS


from api.azureopenai import openai_blueprint
from api.donationclassification import keras_blueprint

app = Flask(__name__)
CORS(app)
app.register_blueprint(openai_blueprint)
app.register_blueprint(keras_blueprint)

if __name__ == '__main__':
    app.run(host='localhost', port=5001)
