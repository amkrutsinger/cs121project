from flask import Flask, render_template, request, jsonify
from app import app
from .config import GetLocations
import csv, io, requests, json, sys
import time
import re
import urllib.parse
import math

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp


# --- DEVELOPER MODE DATA --- #

# With 1 Canvasser
route1 = [[[-117.7083, 34.105748], [-117.71012, 34.10382], [-117.714692, 34.094769], [-117.705641, 34.104064], [-117.706716, 34.10235], [-117.7083, 34.105748]]]
time1 = [779]
share1 = ['google.com/maps/dir/34.105748,+-117.7083/34.10382,+-117.71012/34.094769,+-117.714692/34.104064,+-117.705641/34.10235,+-117.706716/34.105748,+-117.7083/']
route1address = ['340 E Foothill Blvd, Claremont CA', '931 Butte St, Claremont CA', '675 Scripps Dr, Claremont CA', '220 Radcliffe Dr, Claremont CA', '200 Carver Dr, Claremont CA', '300 E Foothill Blvd, Claremont CA', '831 Butte St, Claremont CA', '575 Scripps Dr, Claremont CA', '120 Radcliffe Dr, Claremont CA', '100 Carver Dr, Claremont CA', '1717 N Indian Hill Blvd, Claremont CA', '1217 N Indian Hill Blvd, Claremont CA', '240 E Foothill Blvd, Claremont CA', '731 Butte St, Claremont CA', '475 Scripps Dr, Claremont CA', '20 Radcliffe Dr, Claremont CA', '50 Carver Dr, Claremont CA', '100 E Foothill Blvd, Claremont CA', '631 Butte St, Claremont CA', '275 Scripps Dr, Claremont CA', '5 Radcliffe Dr, Claremont CA', '1 Carver Dr, Claremont CA', '1917 N Indian Hill Blvd, Claremont CA', '717 N Indian Hill Blvd, Claremont CA']
coord1 = [[-117.7103941, 34.1069287], [-117.7326799, 34.1029753], [-117.7258054, 34.1166113], [-117.7163543, 34.1183734], [-117.71376, 34.127773], [-117.7111516, 34.1069425], [-117.7301553, 34.1021421], [-117.724298, 34.116698], [-117.7153621, 34.1183494], [-117.71376, 34.127773], [-117.709978, 34.124954], [-117.709978, 34.124954], [-117.712313, 34.106128], [-117.732929, 34.103057], [-117.733133, 34.116757], [-117.718033, 34.118387], [-117.71376, 34.127773], [-117.706468, 34.107061], [-117.732929, 34.103057], [-117.733133, 34.116757], [-117.718033, 34.118387], [-117.71376, 34.127773], [-117.709978, 34.124954], [-117.709978, 34.124954]]
route1new = ["340 E Foothill Blvd, Claremont CA", "931 Butte St, Claremont CA", "675 Scripps Dr, Claremont CA", "220 Radcliffe Dr, Claremont CA", "200 Carver Dr, Claremont CA", "300 E Foothill Blvd, Claremont CA", "831 Butte St, Claremont CA", "575 Scripps Dr, Claremont CA", "120 Radcliffe Dr, Claremont CA", "100 Carver Dr, Claremont CA", "1717 N Indian Hill Blvd, Claremont CA", "1217 N Indian Hill Blvd, Claremont CA", "240 E Foothill Blvd, Claremont CA", "731 Butte St, Claremont CA", "475 Scripps Dr, Claremont CA", "20 Radcliffe Dr, Claremont CA", "50 Carver Dr, Claremont CA", "100 E Foothill Blvd, Claremont CA", "631 Butte St, Claremont CA", "275 Scripps Dr, Claremont CA", "5 Radcliffe Dr, Claremont CA", "1 Carver Dr, Claremont CA", "1917 N Indian Hill Blvd, Claremont CA", "717 N Indian Hill Blvd, Claremont CA", "681 Claremont Blvd, Claremont CA"]
updated = [[[-117.7083, 34.105748], [-117.71012, 34.10382], [-117.714692, 34.094769], [-117.705641, 34.104064], [-117.706716, 34.10235], [-117.7083, 34.105748], [-117.7083, 34.107748]]]

# With 3 Canvassers
route3 = [[[-117.7083, 34.105748], [-117.71012, 34.10382], [-117.7083, 34.105748]], [[-117.7083, 34.105748], [-117.714692, 34.094769], [-117.7083, 34.105748]], [[-117.7083, 34.105748], [-117.706716, 34.10235], [-117.705641, 34.104064], [-117.7083, 34.105748]]]
time3 = [371, 569, 350]
share3 = ['google.com/maps/dir/34.105748,+-117.7083/34.10382,+-117.71012/34.105748,+-117.7083/', 'google.com/maps/dir/34.105748,+-117.7083/34.094769,+-117.714692/34.105748,+-117.7083/', 'google.com/maps/dir/34.105748,+-117.7083/34.10235,+-117.706716/34.104064,+-117.705641/34.105748,+-117.7083/']


# --- ROUTES --- #

# Set up the homepage with the routes, map, and errors
# This will be set to null initialize and change when input is given
@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")


# Read addresses from CSV file
@app.route('/getAddresses', methods = ['POST'])
def getAddresses():
    if request.method == 'POST':
        if request.form['develop'] == 'true':
            return jsonify({"placesList": route1address})
        else:
            GetLocations.placesList = getInput()
            places = GetLocations.placesList
            places = [string for string in places if string != ""]
            return jsonify({"placesList": places})
    return render_template("index.html")


# Parse user input, generate distance matrix, and print routes
@app.route('/findRoutes', methods = ['POST'])
def findRoutes():
    if request.method == 'POST':
        # For developer mode - only works if numPeople is 1, 3
        if request.form['develop'] == 'true':
            return testingGetRoutes(int(request.form['numPeople']))
        else:
            # Read in csv file and convert to array of places
            return getRoutes(int(request.form['numPeople']))
    return render_template("index.html")


# Update numPeople or placesList and generate new routes
@app.route('/applyChanges', methods = ['POST'])
def applyChanges():
    if request.method == 'POST':
        data = request.get_json()

        # For developer mode - only works if numPeople is 1, 3
        if data['develop']:
            return testNewRoute(int(data['canvassers']))

        GetLocations.placesList = list(data['data'])
        return getRoutes(int(data['canvassers']))
    return render_template("index.html")


# Check if an inputted address is valid within ~50 miles
@app.route('/checkAddress', methods = ['POST'])
def checkAddress():
    if request.method == 'POST':
        data = request.get_json()
        addressList = data['addressList']
        addr = formatAddress(data['addr'])
        GetLocations.coords = data['coordinates']
        addrCoord = addressToCoord(addr)
        GetLocations.coords += [addrCoord]
        focusPoint = getFocusPoint(GetLocations.coords)
        if checkAddress(addr, focusPoint, 100):
            isValid = 'valid'
        else:
            isValid = 'invalid'
        return jsonify({"addressList": addressList, "addr": addr, "valid": isValid})
    return render_template("index.html")


# --- TESTING FUNCTIONS --- #

# Output: a default list of routes
def testingGetRoutes(numPeople):
    if numPeople is 1:
        #return jsonify({"actual":[[route1]], "routeTimes": time1, "urls": [share1]})
        return jsonify({"actual":[[route1]], "routeTimes": time1, "urls": [share1], "coords": coord1})
    else:
        return jsonify({"actual":[[route3]], "routeTimes": time3, "urls": [share3],  "coords": coord1})

def testNewRoute(numPeople):
    if numPeople is 1:
        return jsonify({"actual":[[updated]], "routeTimes": time1, "urls": [share1], "coords": coord1})


# --- INTERFACE FUNCTIONS --- #

# Input: the number of canvassers/people
# Output: an appropiate number of routes of those people with the corresponding
#         times and urls
def getRoutes(numPeople):
    # Read in csv file and convert to array of places
    distances, coords, errors = parseInput(GetLocations.placesList)

    # Save this data
    GetLocations.distances = distances
    GetLocations.coords = coords
    GetLocations.errors = errors

    # algorithm assumes starting and ending at first location
    # routeTimes returned in seconds
    # Find solution to Vehicle Routing Problem
    maxRouteTime, actualRoutes, routeTimes = getOutput(distances, GetLocations.coords, numPeople, sys.maxsize)

    routeUrls = getSharingURLS(actualRoutes, GetLocations.coords, GetLocations.placesList)
    
    return jsonify({"actual":[[actualRoutes]], "routeTimes": routeTimes, "urls": [routeUrls], "address": GetLocations.placesList, "coord": GetLocations.locations})

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

# Input: a list of places (as strings)
# Output: the distance matrix for those places
def parseInput(placesList):
    coords, errors = addressesToCoordinates(placesList)
    distances = distMatrix(coords)
    return distances, coords, errors

# Input:  a list of distances and number of people
# Output: a route for each person such that all locations are visited in the
#         shortest amount of time
def getOutput(distances, placesList, numPeople, vehicleMaxDistance):
    data, manager, routing, solution = pathFinder(distances, numPeople, vehicleMaxDistance)
    maxRouteTime, routes, routeTimes = analyze_solution(data, manager, routing, solution)
    actualRoutes = [[placesList[location] for location in route] for route in routes]
    return maxRouteTime, actualRoutes, routeTimes


# Input: a list of routes, a list of coords, and a list of places (where coords[0] is the
#        coords of placesList[0])
# Output: a list of urls to the google maps with the corresponding route displayed
def getSharingURLS(routes, coords, places):
    urlStart = 'google.com/maps/dir/'  # this is the starting string for all urls to google maps

    routeUrls = []
    for route in routes:
        currUrl = urlStart
        for coord in route:
            # this converts the coords into the appropiate format for a url
            currUrl += str(coord[1]) + ',+' + str(coord[0]) + '/'
        routeUrls += [currUrl]
    return routeUrls


# --- OPEN ROUTE SERVICE FUNCTIONS --- #

# Authorization key and other information to allow request for matrix data to process
headers = {
'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
'Authorization': '5b3ce3597851110001cf6248093639b34bd24267af2380b1d72d66d6',
'Content-Type': 'application/json; charset=utf-8'
}

beginningOfUrl = 'https://api.openrouteservice.org/geocode/search?'
api_key = '5b3ce3597851110001cf62489a8d14cd2fb64acc883b512ff09bb6fc'

# additional_api_key = '5b3ce3597851110001cf6248aa99e3ffa6984f3390e3f886fc85a33c'


# return a matrix of distances given an input of coordinates
# the output is a square matrix formatted as an array of a arrays
def distMatrix(listOfCoords):
    body = {"locations": listOfCoords}

    call = requests.post('https://api.openrouteservice.org/v2/matrix/driving-car', json=body, headers=headers)

    # Unwrap json to get a dictionary and access durations matrix
    return call.json()["durations"]


# Input: a list of addresses
# Output: a list of [longitude, latitude] coordinates corresponding to those addresses
def addressesToCoordinates(list):
    errors = []
    coords = []

    for addr in list:
        result = addressToCoord(addr)
        if len(result) != 2:
            errors.append(result)
        else:
            coords.append(result)
    return coords, errors


# Input: an addresses
# Output: the [longitude, latitude] returned by searching for that address on
#         OpenRouteService
def addressToCoord(addr):
    # this gets a JSON formatted list of locations matching input from OpenRouteService
    call = requests.get(beginningOfUrl + 'api_key=' + api_key + '&text=' + addr, headers = headers)
    # Error with OpenRouteService
    if call.status_code != 200:
        return "Error: " + call.reason
    else:
        # get list of all returned locations
        call_dict = json.loads(call.text)
        features = call_dict["features"]

        if len(features) is 0:
            return "Error: No result found for " + addr
        else:
            # return the coordinates of the top search result
            return features[0]["geometry"]["coordinates"]


# Input: an addresses
# Output: a formatted string in the form [Street #][Street Name][, (?)][City][, (?)][State][, (?)][Zip Code (?)]
def formatAddress(address):
    # format address with space at the end
    if address[-1] != " ":
        string_length = len(address)+ 1
        address=address.ljust(string_length)
    
    # reg expression in format [Street #][Street Name][, (?)][City][, (?)][State][, (?)][Zip Code (?)]
    match = re.match(r'(\d*)\s+((?:[\w+\s*-])+)[\,]?\s+([a-zA-Z]+)[\,]?\s+([0-9a-zA-Z]+)?[\,]?\s+([0-9]*)?', address)
    matches = list(match.groups())
    streetAddress = matches[0] + " " + matches[1]
    locality = matches[2]
    region = matches[3]
    if len(matches) > 4: 
        postalcode = matches[4]
        formatted = streetAddress + " " + locality + ", " + region + " " + postalcode
    else:
        formatted = streetAddress + " " + locality + ", " + region
    return formatted


# Input: an coordinate list
# Output: a [lat, long] with the average lattitude and longitude as a central point for boundary circle
def getFocusPoint(coord):
    x = 0
    y = 0
    z = 0
    lat_sum = 0
    lon_sum = 0

    coords = [x for x in coord if len(x) == 2]
    total = len(coords)
    for i in range(len(coords)-1):
        lat_sum += coords[i][0]
        lon_sum += coords[i][1]
    
    ave_lat = lat_sum/total
    ave_lon = lon_sum/total
    return [ave_lat, ave_lon]


# Input: an addresses, a [lat, long] focal point and a radius for boundary circle in kilometers
# Output: boolean if address is within the given radius
def checkAddress(addr, focusPoint, radius):
    params = {
        'api_key': api_key,
        'text': addr,
        'boundary.circle.lon': focusPoint[0], 
        'boundary.circle.lat': focusPoint[1],
        'boundary.circle.radius': str(radius)
    }

    call = requests.get(beginningOfUrl + urllib.parse.urlencode(params), headers=headers)
    # Error with OpenRouteService
    if call.status_code != 200:
        print("Error: " + call.reason)
        return False
    else:
        # get list of all returned locations
        call_dict = json.loads(call.text)
        features = call_dict["features"]

        if len(features) is 0:
            print("Error: No result found for " + addr)
            return False
        else:
            # return the coordinates of the top search result
            return True

        return True


# --- SOLUTION TO VEHICLE ROUTING PROBLEM FROM GOOGLE --- #

# Input:  array of distances between locations (by time)
#         number of people to route
# Output: a data model for the problem
def create_data_model(distances, numPeople):
    data = {}
    data['distance_matrix'] = distances
    data['num_vehicles'] = numPeople
    data['depot'] = 0
    return data


# Given a solution, finds the individual routes
def analyze_solution(data, manager, routing, solution):
    max_route_distance = 0
    routes = []
    route_distances = []

    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        route_distance = 0
        vehicleRoute = []

        while not routing.IsEnd(index):
            vehicleRoute += [manager.IndexToNode(index)]
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)

        vehicleRoute += [manager.IndexToNode(index)]

        routes += [vehicleRoute]
        route_distances += [route_distance]

        max_route_distance = max(route_distance, max_route_distance)
    return max_route_distance, routes, route_distances


# Input:  array of distances between locations (by time)
#         number of people to route
# Output: solution to Vehicle Routing Problem with given inputs
def pathFinder(distances, numPeople, vehicleMaxDistance):
    # Create the data problem, routing index manager, and routing model
    data = create_data_model(distances, numPeople)
    manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']), data['num_vehicles'], data['depot'])
    routing = pywrapcp.RoutingModel(manager)

    # Create and register a transit callback.
    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        # Convert from routing variable Index to distance matrix NodeIndex.
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    # Define cost of each arc.
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    routing.AddDimension( transit_callback_index, 0, vehicleMaxDistance,  True, 'Distance')
    distance_dimension = routing.GetDimensionOrDie('Distance')
    distance_dimension.SetGlobalSpanCostCoefficient(100)

    # Setting first solution heuristic.
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

    # Solve the problem.
    solution = routing.SolveWithParameters(search_parameters)

    # Return solution
    return data, manager, routing, solution