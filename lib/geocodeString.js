const geocodeString = async searchString => {
  if (!searchString) return [];

  // GET data from the MapBox API to get LongLat of an address string
  const returnedData = await client
    .geocodeForward(searchString, { country: "au" })
    .catch(error => console.log("An error occurred with MapBox... ", error));

  // Handle some errors
  if (returnedData.entity.message === "Not Found") return [];

  if (returnedData && returnedData.entity.features.length === 0) {
    return [];
  }

  let relevanceFiltered = returnedData.entity.features.filter(feature => {
    return feature.relevance > ADDRESS_RELEVANCE_THRESHOLD;
  });

  return relevanceFiltered;
};

export default geocodeString;