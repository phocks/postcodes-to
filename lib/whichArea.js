const inside = require("point-in-polygon");

const whichArea = (longLat, localAreas) => {
  // Define return value for later
  let found;

  // Loop through all Electorates
  localAreas.forEach(area => {
    let currentArea = area.geometry;

    if (currentArea && currentArea.type === "Polygon") {
      // Handle Polygon geometry types
      if (inside(longLat, currentArea.coordinates[0])) {
        found = area;
      }
    } else if (currentArea && currentArea.type === "MultiPolygon") {
      // Handle MultiPolygon geometry type
      currentArea.coordinates.forEach(polygon => {
        if (inside(longLat, polygon[0])) {
          found = area;
        }
      });
    }
  });

  return found;
};

module.exports = whichArea;
