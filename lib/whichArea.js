const inside = require("point-in-polygon");

const whichArea = (longLat, localAreas) => {
  // Define return value for later
  let found;

  // Loop through all Electorates
  // localAreas.forEach(area => {
  for (let area of localAreas) {
    let currentArea = area.geometry;

    if (currentArea && currentArea.type === "Polygon") {
      // Handle Polygon geometry types
      if (inside(longLat, currentArea.coordinates[0])) {
        found = area;
        break;
      }
    } else if (currentArea && currentArea.type === "MultiPolygon") {
      // Handle MultiPolygon geometry type
      currentArea.coordinates.forEach(polygon => {
        // for (let polygon of currentArea.coordinates) {
        if (inside(longLat, polygon[0])) {
          found = area;
        }
      });
      if (typeof found !== "undefined") break;
    }
  }

  return found;
};

module.exports = whichArea;
