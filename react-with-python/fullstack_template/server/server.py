from flask import Flask, render_template
import random
import overpy
import numpy as np

api = overpy.Overpass()

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/hello')
def hello():
    return get_hello()

@app.route('/openstreetmap')
def openstreet():
    street = get_address()
    r = api.query("""
        ( node["addr:street"=street];
          way["addr:street"=street];
          relation["addr:street"=street];
        );
    out center;
    """)

    coords  = []
    coords += [(float(node.lon), float(node.lat))
               for node in r.nodes]
    coords += [(float(way.center_lon), float(way.center_lat))
               for way in r.ways]
    coords += [(float(rel.center_lon), float(rel.center_lat))
               for rel in r.relations]
    X = np.array(coords)
    string = ""
    string += street + '\n'
    for i in range(len(X)):
        string += '(' + str(X[i, 0]) + ', ' + str(X[i, 1]) + ')' + '\n'
    return string

def get_hello():
    greeting_list = ['Ciao', 'Hei', 'Salut', 'Hola', 'Hallo', 'Hej']
    return random.choice(greeting_list)

def get_address():
    streets = ["Foothill Boulevard", "East Platt Street", "North Mills Avenue"]
    return random.choice(streets)

if __name__ == "__main__":
    app.run()
