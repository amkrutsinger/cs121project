from flask import Flask, render_template, request
from app import app
from app import interface

# Set up the homepage with the routes, map, and errors
# This will be set to null initialize and change when input is given
@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html", routes=routes(), map=mapArea(), errors=errors())

@app.route('/findRoutes')
def findRoutes():
    getInput()
    return render_template("index.html", routes=routes(), map=mapArea(), errors=errors())
