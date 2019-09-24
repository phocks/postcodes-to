const fs = require("fs");
const d3 = Object.assign({}, require("d3-dsv"));
const whichArea = require("../lib/whichArea");

// Import Australian Electorates
const electorates = require("../data/federal-electorates-2019.geo.json")
  .features;

const main = async () => {
  // Read CSV file from disk
  const importedCSV = fs.readFileSync(
    "./data/australian_postcodes.csv",
    "utf8"
  );
  // Parse file to JSON object
  const dataList = d3.csvParse(importedCSV);

  let limit = 1;

  // Loop through our data
  for (let area of dataList) {
    if (limit === 0) break;

    const result = whichArea([149.13, -35.2809], electorates);

    console.log(result.properties);

    limit--;
  }
};

main();
