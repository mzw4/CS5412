import sys, requests, json, math

_mq_key = 'Fmjtd%7Cluu8216rll%2C8g%3Do5-942ngy' 
_mq_max_batch = 100

_dia_miles = 3963.191
_dia_km = 6378.137

url = 'http://www.cs.cornell.edu/Courses/CS5412/2015sp/_cuonly/restaurants_all.csv'

# print 'Downloading restaurant data files'
# response = requests.get(url, stream=True)
# total_length = int(response.headers.get('content-length'))

# if total_length is None: # no content length header
#   print response.content
# else:
#   dl = 0
#   db = ''
#   for data in response.iter_content(chunk_size=256):
#     dl += len(data)
#     db += data
#     # print db
#     percent = 100 * dl / total_length
#     bars = int(50 * percent/100)
#     sys.stdout.write("\r %s [%s%s]" % (percent, '=' * bars, ' ' * (50-bars)) )    
#     sys.stdout.flush()

db = open('restaurants_all.csv', 'r')

# find the nearest restaurants from the given address within the given distance in miles
def find_nearest(input_addr, distance_threshold):
  # Geocode input address if necessary
  print 'Finding specified location...'
  request_url = 'http://www.mapquestapi.com/geocoding/v1/address?key=' + _mq_key + '&location=' + input_addr
  response = requests.get(request_url)
  response_json = json.loads(response.content)
  
  results = response_json['results']
  input_zipcode = ''
  input_latlng = ''
  if results:
    loc = results[0]['providedLocation']['location']
    input_latlng = results[0]['locations'][0]['latLng']
    input_zipcode = results[0]['locations'][0]['postalCode']
  else:
    print 'No matching locations found'
    return

  print input_latlng

  # Prepare to batch geocode restaurant addresses
  rcount = 0
  orig_request_url = 'http://www.mapquestapi.com/geocoding/v1/batch?key=' + _mq_key + '&outFormat=json'
  request_url = orig_request_url

  # map of location -> restaurant data
  restaurant_loc_map = {}

  # map of location -> distance to input address
  distance_map = {}

  print 'Calculating restaurant distances...'
  # for line in db.splitlines():
  for line in db:
    restaurant = line.split(',')
    zipcode = restaurant[7]
    location = ', '.join(restaurant[4:8])

    restaurant_loc_map[location] = restaurant

    # only process restaurants with matching zip codes
    if zipcode == input_zipcode:
      rcount += 1
      request_url += '&location=' + location

    # check distances of processed addresses
    if rcount == _mq_max_batch:
      get_batch_restaurant_distances(request_url, distance_map, input_latlng)
      rcount = 0
      request_url = orig_request_url

  if rcount > 0:
    get_batch_restaurant_distances(request_url, distance_map, input_latlng)
  
  # reset db iterator to beginning
  db.seek(0)

  print 'Filtering results...'
  nearby_restaurants = {}
  for loc, (latlng, dist) in distance_map.items():
    if dist < distance_threshold:
      # print dist, restaurant_loc_map[loc][4:8], restaurant_loc_map[loc][3]
      name = restaurant_loc_map[loc][3]
      nearby_restaurants[name] = {'loc': loc, 'latlng': latlng, 'dist': dist}

  print nearby_restaurants
  return {input_addr: {'latlng': input_latlng}}, nearby_restaurants

# perform batch request
# returns 
def get_batch_restaurant_distances(request_url, distance_map, input_latlng):
  print 'Making batch geolocation request...'
  # print request_url
  response = requests.get(request_url)
  # print response
  response_json = json.loads(response.content)

  # record distances from each location to the input location
  for result in response_json['results']:
    loc = result['providedLocation']['location']
    latlng = result['locations'][0]['latLng']
    distance_map[loc] = latlng, get_distance(latlng, input_latlng)

# compute the distance given latitude and longitude coordinate positions
def get_distance(latlng1, latlng2):
  lat1 = math.radians(latlng1['lat'])
  lng1 = math.radians(latlng1['lng'])
  lat2 = math.radians(latlng2['lat'])
  lng2 = math.radians(latlng2['lng'])

  dist = math.acos(
    math.sin(lat1)*math.sin(lat2) + math.cos(lat1)*math.cos(lat2)*math.cos(lng1-lng2))
  return _dia_miles * dist
