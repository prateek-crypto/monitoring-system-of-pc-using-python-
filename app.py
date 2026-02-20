from flask import Flask, jsonify, render_template
from monitor import PCMonitor

app = Flask(__name__)
monitor = PCMonitor()

@app.route('/')
def index():
    return render_template('index.html', static_info=monitor.info)

@app.route('/api/dynamic')
def dynamic():
    return jsonify(monitor.get_dynamic_info())

@app.route('/api/static/refresh')
def refresh_static():
    monitor.refresh_static_info()
    return jsonify(monitor.info)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
