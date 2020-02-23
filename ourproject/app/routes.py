from flask import Flask, render_template, request
from app import app
import csv

input = ""

# takes in .csv file
def getInput():
    if request.method == 'GET':
        # Create variable for uploaded file
        #placesCSV = request.args.get('placesCSV', None)
        #placesCSV = request.files['placesCSV']
        print(placesCSV)
        places = placesCSV.read()
        print(places)
        #place = request.args.get('placesCSV', None)
        with open(places, newline='') as csvfile:
            spamreader = csv.reader(csvfile, delimiter=' ', quotechar='|')
            print(spamreader[0])
        #if place:
        #    # this allows us to modify global variable
        #    global input
        #    input = place

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

@app.route('/findRoutes', methods = ['GET'])
def findRoutes():
    print(request.method)
    print(request.args)
    print(request.form)
    print(request.data)
    if request.method == 'GET':
        #placesCSV = request.args.get('placesCSV', None)
        print(request.files)
        placesCSV = request.files["placesCSV"]
        print(placesCSV)
        places = placesCSV.read()
        print(places)
        with open(places, newline='') as csvfile:
            spamreader = csv.reader(csvfile, delimiter=' ', quotechar='|')
            print(spamreader[0])
    #getInput()
    return render_template("index.html", routes=routes(), map=mapArea(), errors=errors())
