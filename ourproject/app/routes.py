from flask import Flask, render_template, url_for
from app import app

#url = url_for('static', filename='index.js')

@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")