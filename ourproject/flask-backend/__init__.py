from flask import Flask

app = Flask(__name__, static_folder='../static', template_folder='../public')

from app import routes
