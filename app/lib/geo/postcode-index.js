const { getClient } = require('../storage')
const storageConfig = require('../../config/storage')

const postcodeIndex = new Map()

const generatePostcodeCoords = async () => {
  console.log('Generating postcode index')

  let count = 0

  const client = getClient()

  const containerClient = client.getContainerClient(storageConfig.postcodeCoordsContainer)
  await containerClient.createIfNotExists()

  const blobClient = containerClient.getBlockBlobClient(storageConfig.postcodeCoordsFile)
  const json = await blobClient.downloadToBuffer()

  const { postcodes } = JSON.parse(json.toString('utf-8'))

  for (const entry of postcodes) {
    const postcode = entry.postcode
    const lat = entry.lat
    const lon = entry.lon

    if (postcode && lat && lon) {
      const strippedPostcode = postcode.replaceAll('"', '')

      postcodeIndex.set(strippedPostcode, { lat: parseFloat(lat), lon: parseFloat(lon) })

      count++
    }
  }

  console.log(`Finished building postcode index ${count} entries`)
}

module.exports = {
  generatePostcodeCoords,
  postcodeIndex
}
