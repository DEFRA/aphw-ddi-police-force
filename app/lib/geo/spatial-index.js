const { getClient } = require('../storage')
const storageConfig = require('../../config/storage')
const DOMParser = require('@xmldom/xmldom').DOMParser
const { kml } = require('@mapbox/togeojson')
const { memoryUsage } = require('node:process')

const BoostSpatialIndex = require('boost-geospatial-index')

const spatialIndex = new BoostSpatialIndex()

const parseSinglePolygon = geoJson => {
  const coords = geoJson.features[0].geometry.coordinates[0]

  return coords.map(([lat, lon]) => [lon, lat])
}

const parseMultiPolygon = geoJson => geoJson.features[0].geometry.geometries
  .filter(obj => obj.type === 'Polygon')
  .map(poly => poly.coordinates[0].map(([lat, lon]) => [lon, lat]))

const generateForceCoords = async () => {
  console.log('Generating spatial index')

  const serviceClient = getClient()

  const containerClient = serviceClient.getContainerClient(storageConfig.forceKmlContainer)

  await containerClient.createIfNotExists()

  for await (const blob of containerClient.listBlobsFlat()) {
    const client = containerClient.getBlockBlobClient(blob.name)

    const file = (await client.downloadToBuffer()).toString('utf-8')
    const force = blob.name.replace('.kml', '')
    const geo = kml(new DOMParser().parseFromString(file))

    console.log(`Adding ${force} to index`)

    console.log('mem', memoryUsage())
    const muNow = memoryUsage()['heapUsed'] / 1024 / 1024 / 1024
    console.log(`memoryUsage ${Math.round(muNow * 100) / 100} GB`)
  
    if (geo.features[0].geometry.geometries === undefined) {
      const sets = parseSinglePolygon(geo)

      spatialIndex.addPolygon(force, sets)
    } else {
      for (const set of parseMultiPolygon(geo)) {
        spatialIndex.addPolygon(force, set)
      }
    }
  }

  console.log('Finished building spatial index')
}

module.exports = {
  generateForceCoords,
  spatialIndex
}
