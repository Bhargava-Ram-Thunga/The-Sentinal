# app.py

from flask import Flask
from flask_cors import CORS
from routes import auth_bp
from config import Config

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)