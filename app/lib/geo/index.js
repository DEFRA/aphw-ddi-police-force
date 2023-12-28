const { spatialIndex } = require('./spatial-index')

const findForceByCoords = (lat, lon) => {
  try {
    return spatialIndex.queryPoint(+lat, +lon)
  } catch (err) {
    console.error(err)

    throw err
  }
}

module.exports = {
  findForceByCoords
}
