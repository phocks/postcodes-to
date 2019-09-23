const MapboxClient = require("mapbox");
const inside = require("point-in-polygon");
const atob = require("atob");
const fs = require("fs");

// Configuration
const config = {
  mapbox_token:
    "cGsuZXlKMUlqb2libVYzY3kxdmJqRnBibVVpTENKaElqb2lZMnBqYXpFM09UbDNNRFV5ZVRKM2NHbDJOV1J4Y0RocE55SjkuS3c0bGhBYkxVazlJUGF6dXRCZTI4dw=="
};

// Constants
const MAPBOX_TOKEN = atob(config.mapbox_token);
const ADDRESS_RELEVANCE_THRESHOLD = 0.5;

// Initialise Mapbox
const client = new MapboxClient(MAPBOX_TOKEN);

// Import GEOJSON and other data
const electorateMap = require("./federal-electorates-2019.geo.json").features;
const areas = require("./unique-postcodes.json");
const divisions = require("./electorate-classifications.json");

// console.log(electorateMap.features);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const geocodeString = async searchString => {
  if (!searchString) return [];

  // GET data from the MapBox API to get LongLat of an address string
  const returnedData = await client
    .geocodeForward(searchString, { country: "au" })
    .catch(error => console.log("An error occurred with MapBox... ", error));

  // Handle some errors
  if (returnedData.entity.message === "Not Found") return [];

  if (returnedData && returnedData.entity.features.length === 0) {
    // TODO: alert the user maybe
    return [];
  }

  let relevanceFiltered = returnedData.entity.features.filter(feature => {
    return feature.relevance > ADDRESS_RELEVANCE_THRESHOLD;
  });

  return relevanceFiltered;
};

const addressToElectorate = async (possibleLatLongs, localAreas) => {
  if (!possibleLatLongs) return [];

  let foundLGAs = [];

  possibleLatLongs.forEach(lga => {
    let searchLongLat = lga.center;

    let foundLGA;

    // Loop through all Local Government Areas
    localAreas.forEach(LGA => {
      let currentLGA = LGA.geometry;

      if (currentLGA && currentLGA.type === "Polygon") {
        // Handle Polygon geometry types
        if (inside(searchLongLat, currentLGA.coordinates[0])) {
          foundLGA = LGA;
        }
      } else if (currentLGA && currentLGA.type === "MultiPolygon") {
        // Handle MultiPolygon geometry type
        currentLGA.coordinates.forEach(polygon => {
          if (inside(searchLongLat, polygon[0])) {
            foundLGA = LGA;
          }
        });
      }
    });

    foundLGAs.push(foundLGA);
  });

  return foundLGAs;
};

const main = async () => {
  const postcodes = areas.map(area => area.postcode);

  const newFile = [];

  for (let postcode of postcodes) {
    let newEntry = {};

    const searchString = postcode < 1000 ? "0" + postcode : postcode.toString();

    newEntry.postcode = searchString;

    let possibleLatLongs = await geocodeString(searchString);
    // console.log(possibleLatLongs[0]);
    newEntry.center = possibleLatLongs[0] ? possibleLatLongs[0].center : "NULL";
    newEntry.placeName = possibleLatLongs[0]
      ? possibleLatLongs[0].place_name
      : "NULL";

    const result = await addressToElectorate(possibleLatLongs, electorateMap);
    newEntry.electorate = result[0] ? result[0].properties.name : "NULL";

    if (newEntry.electorate !== "NULL") {
      for (let entry of divisions) {
        if (entry.division === newEntry.electorate) {
          newEntry.classification = entry.classification;
          break;
        } else newEntry.classification = "NULL";
      }
    }

    console.log(newEntry);
    newFile.push(newEntry);
    await timeout(125);
  }
  fs.writeFileSync("./outfile.json", JSON.stringify(newFile));
};

main();
