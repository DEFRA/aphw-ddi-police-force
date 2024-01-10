const { spatialIndex } = require('./spatial-index')
const { postcodeIndex } = require('./postcode-index')

const findForceByCoords = (lat, lon) => {
  try {
    return spatialIndex.queryPoint(+lat, +lon)
  } catch (err) {
    console.error(err)

    throw err
  }
}

const findCoordsByPostcodeLocal = (postcode) => {
  try {
    return postcodeIndex.get(postcode)
  } catch (err) {
    console.error(err)

    throw err
  }
}

module.exports = {
  findForceByCoords,
  findCoordsByPostcodeLocal
}
