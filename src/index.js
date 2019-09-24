const fs = require("fs");
const d3 = Object.assign({}, require("d3-dsv"));

// Local modules
const whichArea = require("../lib/whichArea");
const timeout = require("../lib/timeout");

// Data
const classifications = require("../data/electorate-classifications.json");

// Import Australian Electorates
const electorates = require("../data/federal-electorates-2019.geo.json")
  .features;

const main = async () => {
  // Read CSV file from disk
  const importedCSV = fs.readFileSync("./data/australian_postcodes.csv", {
    encoding: "utf-8"
  });
  // Parse file to JSON object
  const dataList = d3.csvParseRows(importedCSV, d => {
    return {
      postcode: d[0],
      locality: d[1],
      state: d[2],
      long: d[3],
      lat: d[4],
      id: d[5],
      dc: d[6],
      type: d[7],
      status: d[8]
    };
  });

  // Clear our output file
  fs.writeFileSync("output/out.csv", "");
  fs.appendFileSync(
    "output/out.csv",
    "postcode,locality,state,long,lat,id,dc,type,status,electorate,classification\n"
  );

  // Record limit for testing
  let limit = 170000;

  // Loop through our data
  for (let area of dataList) {
    if (limit === 0) break;

    const currentLongLat = [area.long, area.lat];
    // const currentLongLat = [149.13, -35.2809];

    const electorate = whichArea(currentLongLat, electorates)
      ? whichArea(currentLongLat, electorates).properties.name
      : "NULL";

    // Cross reference the geo classifications and set if found
    let classification;
    if (electorate === "NULL") {
      classification = "NULL";
    } else {
      for (let entry of classifications) {
        if (entry.division === electorate) {
          classification = entry.classification;
          break;
        }
      }
    }

    console.log(area);
    console.log(electorate);
    console.log(classification);

    const lineToWrite =
      area.postcode +
      "," +
      area.locality +
      "," +
      area.state +
      "," +
      area.long +
      "," +
      area.lat +
      "," +
      area.id +
      "," +
      area.dc +
      "," +
      area.type +
      "," +
      electorate +
      "," +
      classification +
      "\n";

    // Write line
    fs.appendFileSync("output/out.csv", lineToWrite);

    // Hold up a bit
    // await timeout(1);
    limit--;
  }
};

main();
