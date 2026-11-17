const walkLocations = {
  street: [54.40969, 22.016596],
  bakery: [54.411354, 22.016698],
  bridge: [54.410377, 22.016435],
  door: [54.411953, 22.016752]
};

const walkMapBounds = {
  south: 54.40913,
  west: 22.0139,
  north: 54.41252,
  east: 22.0192
};

const routeMapBounds = {
  south: 54.4066,
  west: 22.0088,
  north: 54.414,
  east: 22.0242
};

function projectWalkPoint([latitude, longitude], bounds, width, height) {
  const mercatorY = (value) => Math.log(Math.tan(Math.PI / 4 + value * Math.PI / 360));
  const north = mercatorY(bounds.north);
  const south = mercatorY(bounds.south);
  return {
    x: width * (longitude - bounds.west) / (bounds.east - bounds.west),
    y: height * (north - mercatorY(latitude)) / (north - south)
  };
}
