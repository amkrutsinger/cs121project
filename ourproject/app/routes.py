from flask import Flask, render_template, request
from app import app
from .config import GetLocations
import csv, io, requests, json, sys
import time

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

# --- ROUTES --- #

# Set up the homepage with the routes, map, and errors
# This will be set to null initialize and change when input is given
@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

# Parse user input, generate distance matrix, and print routes
@app.route('/findRoutes', methods = ['POST'])
def findRoutes():
    if request.method == 'POST':
        numPeople = int(request.form['numPeople'])

        # Read in csv file and convert to array of places
        GetLocations.placesList = getInput()
        distances, coords, errors = parseInput(GetLocations.placesList)
        # Save this data
        GetLocations.distances = distances
        GetLocations.coords = coords
        GetLocations.errors = errors

        # algorithm assumes starting and ending at first location
        # routeTimes returned in seconds
        # Find solution to Vehicle Routing Problem

        maxRouteTime, actualRoutes, routeTimes = getOutput(distances, GetLocations.coords, numPeople, sys.maxsize)
        print(actualRoutes)
        print(routeTimes)
    return render_template("index.html")

@app.route('/numCanvassersChanged', methods = ['POST'])
def numCanvassersChanged():
    if request.method == 'POST':
        # get the new number of people from the input field
        numPeople = int(request.get_json()['numPeople'])
        print("")
        print(numPeople)
        print("")

        # use the saved locations
        # algorithm assumes starting and ending at first location
        # routeTimes returned in seconds
        # Find solution to Vehicle Routing Problem

        maxRouteTime, actualRoutes, routeTimes = getOutput(GetLocations.distances, GetLocations.coords, numPeople, sys.maxsize)
        print(actualRoutes)
        print(routeTimes)
    return render_template("index.html")


# --- INTERFACE FUNCTIONS --- #

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


# --- OPEN ROUTE SERVICE FUNCTIONS --- #

# Authorization key and other information to allow request for matrix data to process
headers = {
'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
'Authorization': '5b3ce3597851110001cf6248093639b34bd24267af2380b1d72d66d6',
'Content-Type': 'application/json; charset=utf-8'
}

beginningOfUrl = 'https://api.openrouteservice.org/geocode/search?'
api_key = '5b3ce3597851110001cf6248aa99e3ffa6984f3390e3f886fc85a33c'


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
    print(coords)
    print("")
    return coords, errors


# Input: an addresses
# Output: the [longitude, latitude] returned by searching for that address on
# OpenRouteService
def addressToCoord(addr):
    # this gets a JSON formatted list of locations matching input from OpenRouteService
    call = requests.get(beginningOfUrl + 'api_key=' + api_key + '&text=' + addr, headers=headers)

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
        #plan_output = 'Route for vehicle {}:\n'.format(vehicle_id)
        route_distance = 0
        vehicleRoute = []

        while not routing.IsEnd(index):
            #plan_output += ' {} -> '.format(manager.IndexToNode(index))
            vehicleRoute += [manager.IndexToNode(index)]
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)

        vehicleRoute += [manager.IndexToNode(index)]

        routes += [vehicleRoute]
        route_distances += [route_distance]

        # plan_output += 'Distance of the route: {}m\n'.format(route_distance)
        # print(plan_output)
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
