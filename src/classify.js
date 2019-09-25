const fs = require("fs");
const d3 = Object.assign({}, require("d3-dsv"));

// Data
const classifications = require("../data/electorate-classifications.json");

const main = async () => {
  // Read CSV file from disk
  const importedCSV = fs.readFileSync("./data/electorates_postcodes_fed_2019.csv", {
    encoding: "utf-8"
  });
  // Parse file to JSON object
  const dataList = d3.csvParse(importedCSV);

  // Clear our output file
  fs.writeFileSync("output/out.csv", "");
  fs.appendFileSync(
    "output/out.csv",
    "state,electorate,postcode,population,total_postcode_proportion,proportion,classification\n"
  );

  // Record limit for testing
  let limit = 10;

  // Loop through our data
  for (let area of dataList) {
    if (limit === 0) break;

    // const currentLongLat = [area.long, area.lat];
    // const currentLongLat = [149.13, -35.2809];

    const electorate = area.electorate;

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
      area.state +
      "," +
      area.electorate +
      "," +
      area.postcode +
      "," +
      area.population +
      "," +
      area.total_postcode_proportion +
      "," +
      area.proportion +
      "," +
      classification +
      "\n";

    // Write line
    fs.appendFileSync("output/out.csv", lineToWrite);

    

    // limit--;
  }
};

main();
