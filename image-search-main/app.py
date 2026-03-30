from flask import Flask
from flask_cors import CORS


from api.azureopenai import openai_blueprint
from api.donationclassification import keras_blueprint
from api.imageSearchApi import searchimage_blueprint   
from api.admintestaics import admin_blueprint   
from api.azureimage import image_violation_blueprint
from api.azuretext import text_violation_blueprint
from api.smartreply import smart_reply_blueprint    
from api.recommendation import recommendation_blueprint 

app = Flask(__name__)
CORS(app)
app.register_blueprint(openai_blueprint)
app.register_blueprint(keras_blueprint)
app.register_blueprint(searchimage_blueprint)
app.register_blueprint(admin_blueprint)
app.register_blueprint(image_violation_blueprint)
app.register_blueprint(text_violation_blueprint)
app.register_blueprint(smart_reply_blueprint)
app.register_blueprint(recommendation_blueprint)


if __name__ == '__main__':
    app.debug=True
    app.run(host='0.0.0.0', port=5001)
   
