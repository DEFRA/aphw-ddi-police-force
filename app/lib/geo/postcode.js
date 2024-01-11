const config = require('../../config')
const wreck = require('@hapi/wreck')
const { postcodeIndex } = require('./postcode-index')

const baseUrl = config.osPlacesApi.baseUrl
const postcodeEndpoint = 'postcode'

const options = {
  headers: {
    key: config.osPlacesApi.token
  },
  json: true
}

const getPostcodeLongLatApi = async (postcode) => {
  try {
    const { payload } = await wreck.get(`${baseUrl}/${postcodeEndpoint}?postcode=${postcode}&output_srs=WGS84`, options)

    // Only grab first result, even if many
    return payload.results && payload.results.length > 0
      ? { lng: payload.results[0].DPA.LNG, lat: payload.results[0].DPA.LAT }
      : null
  } catch (e) {
    console.log(`Error calling OS Places API: ${e}`)
    return null
  }
}

const findCoordsByPostcodeLocal = (postcode) => {
  const coords = postcodeIndex.get(postcode)

  if (!coords) {
    throw new Error(`Postcode (${postcode}) not found in index.`)
  }

  return coords
}

module.exports = {
  getPostcodeLongLatApi,
  findCoordsByPostcodeLocal
}
