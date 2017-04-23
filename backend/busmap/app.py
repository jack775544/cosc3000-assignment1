from flask import Flask
from flask import jsonify
from records import Database

application = Flask(__name__)
DB_URI = "postgresql://cosc:password@localhost:5432/bus_data"


@application.route("/")
def hello():
    return jsonify({"api_name": "COSC_API", "version": 1})


@application.route("/points/all")
def all():
    # http://localhost:5000/points/all
    db = Database(DB_URI)
    response = db.query('SELECT stop_id, brd_count, ali_count, st_x(lat_long) lat, st_y(lat_long) long, st_x(coords) x, st_y(coords) y '
                        'FROM stops ')
    return jsonify(response.as_dict())


@application.route("/points/box/<xmin>/<ymin>/<xmax>/<ymax>/")
def points(xmin, ymin, xmax, ymax):
    # Test Url: http://localhost:5000/points/box/-27.7/153.2/-27.8/153.5/
    db = Database(DB_URI)
    xmin, ymin, xmax, ymax = map(float, (xmin, ymin, xmax, ymax))
    response = db.query('SELECT stop_id, brd_count, ali_count, st_x(lat_long) lat, st_y(lat_long) long, st_x(coords) x, st_y(coords) y '
                        'FROM stops '
                        'WHERE st_makebox2d(st_makepoint(:xmin, :ymin), st_makepoint(:xmax, :ymax)) ~ lat_long;',
                        xmin=xmin, ymin=ymin, xmax=xmax, ymax=ymax)
    return jsonify(response.as_dict())


@application.route("/points/id/<id>/")
def single_point(id):
    # Test Url: http://localhost:5000/points/id/1/
    db = Database(DB_URI)
    response = db.query('SELECT stop_id, brd_count, ali_count, st_x(lat_long) lat, st_y(lat_long) long, st_x(coords) x, st_y(coords) y '
                        'FROM stops '
                        'WHERE stop_id = :id',
                        id=id)
    return jsonify(response.as_dict())

@application.route("/cluster/box/<xmin>/<ymin>/<xmax>/<ymax>/")
def cluster_box(xmin, ymin, xmax, ymax):
    db = Database(DB_URI)
    xmin, ymin, xmax, ymax = map(float, (xmin, ymin, xmax, ymax))
    response = db.query('SELECT clu_id stop_id, brd_cnt brd_count, ali_cnt ali_count, st_x(clu_centroid) lat, st_y(clu_centroid) long, clu_pointcnt '
                        'FROM cluster_stops '
                        'WHERE st_makebox2d(st_makepoint(:xmin, :ymin), st_makepoint(:xmax, :ymax)) ~ clu_centroid;',
                        xmin=xmin, ymin=ymin, xmax=xmax, ymax=ymax)
    return jsonify(response.as_dict())

if __name__ == "__main__":
    application.run()
