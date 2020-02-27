from flask import Flask, render_template, request
from app import app
import csv, io
import requests

# Input: .csv file (passed through request)
# Output: list of items in .csv file
def getInput():
    # open .csv file
    placesFile = request.files['file']
    stream = io.StringIO(placesFile.stream.read().decode("UTF8"), newline=None)
    places_csv = csv.reader(stream)

    # Convert .csv file first to list of lists and then just list
    placesListOfLists = list(places_csv)
    placesList = [elt for lst in placesListOfLists for elt in lst]
    return placesList

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
    return "routes"
    # if input != "":
    #     return input + " route"
    # else:
    #     return ""

# return map of area
def mapArea():
    return "map"
    # if input != "":
    #     return input + " map"
    # else:
    #     return ""

# return errors
def errors():
    return "errors"
    # if input != "":
    #     return input + " errors"
    # else:
    #     return ""

# Set up the homepage
@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html", routes=routes(), map=mapArea(), errors=errors())

# Parse user input and return result
@app.route('/findRoutes', methods = ['POST'])
def findRoutes():
    if request.method == 'POST':
        placesList = getInput()
        body = {"locations":[[9.70093,48.477473],[9.207916,49.153868],[37.573242,55.801281],[115.663757,38.106467]]}
        distMatrix(body)
    return render_template("index.html", routes=routes(), map=mapArea(), errors=errors())
