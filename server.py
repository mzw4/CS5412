from flask import Flask, render_template, jsonify, request
from finder.finder import find_nearest

app = Flask(__name__)

@app.route('/')
def hello():
    return render_template('restaurants.html')

@app.route('/find_restaurants', methods=['POST'])
def ajax_find_restaurants():
  if request.method == 'POST':
    location = request.form['input_location']
    print location

    input_data, results = find_nearest('Ft Lauderdale, FL 33324', 1)
    return jsonify({ 'input_data': input_data, 'results': results })
  else:
    return 'Error'

if __name__ == '__main__':
  app.debug = True
  app.run()