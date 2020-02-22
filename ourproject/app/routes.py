from flask import Flask, render_template, request
from app import app

input = ""

# takes in .csv file
def getInput():
    if request.method == 'GET':
        place = request.args.get('place', None)
        if place:
            # this allows us to modify global variable
            global input
            input = place

# return routes
def routes():
    if input != "":
        return input + " route"
    else:
        return ""

# return map of area
def mapArea():
    if input != "":
        return input + " map"
    else:
        return ""

# return errors
def errors():
    if input != "":
        return input + " errors"
    else:
        return ""
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
