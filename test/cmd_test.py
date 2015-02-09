from finder.finder import find_nearest, format_results

while True:
  address = raw_input('Find restaurants near:')
  distance = raw_input('Within (miles):')

  # find_nearest(address, int(distance))
  input_data, nearby_restaurants = find_nearest('Ft Lauderdale, FL 33324', 1)
  return format_results(input_data, nearby_restaurants)