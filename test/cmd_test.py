from finder.finder import find_nearest

while True:
  address = raw_input('Find restaurants near:')
  distance = raw_input('Within (miles):')

  # find_nearest(address, int(distance))
  find_nearest('Ft Lauderdale, FL 33324', 1)