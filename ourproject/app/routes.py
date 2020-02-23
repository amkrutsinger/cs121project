from flask import Flask, render_template, request
from app import app
import csv
import requests

input = []

# takes in .csv file
def getInput():
    if request.method == 'GET':
        # once debug is figured out below move code here and replace this line
        places = ''
        with open(places, newline='') as csvfile:
            locationsReader = csv.reader(csvfile, delimiter=' ', quotechar='|')
            for location in locationsReader:
                # this allows us to modify global variable
                global input
                input = location

# return a matrix of distances given an input of coordinates
# the output is a square matrix formatted as an array of a arrays
def distMatrix(body):
    # Authorization key and other information to allow request for matrix data to process
    headers = {
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
    'Authorization': '5b3ce3597851110001cf6248093639b34bd24267af2380b1d72d66d6',
    'Content-Type': 'application/json; charset=utf-8'
    }
    call = requests.post('https://api.openrouteservice.org/v2/matrix/driving-car', json=body, headers=headers)
    # Unwrap json to get a dictionary and access durations matrix
    return call.json()["durations"]

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

@app.route('/findRoutes', methods = ['POST'])
def findRoutes():
    # this code will go in getInput() it is here for debugging purposes
    # BUG: currently request.files is empty unclear why
    # posted to stack overflow, and awaiting response
    if request.method == 'POST':
        # print statements for debugging
        # working. gives 'POST'
        print(request.method)
        # working. gives file name
        print(request.args)
        # not working. Empty
        print(request.form)
        # not working. Empty
        print(request.files)
        # code should open and read csv once upload is working
        placesCSV = request.files["placesCSV"]
        places = placesCSV.read()
        with open(places, newline='') as csvfile:
            spamreader = csv.reader(csvfile, delimiter=' ', quotechar='|')
            # print first entry in csv so we know when it works
            print(spamreader[0])
    body = {"locations":[[9.70093,48.477473],[9.207916,49.153868],[37.573242,55.801281],[115.663757,38.106467]]}
    distMatrix(body)
    #getInput()
    return render_template("index.html", routes=routes(), map=mapArea(), errors=errors())
