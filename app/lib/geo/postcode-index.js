const { getClient } = require('../storage')
const storageConfig = require('../../config/storage')
const DOMParser = require('@xmldom/xmldom').DOMParser

const postcodeIndex = new Map()

const generatePostcodeCoords = async () => {
  console.log('Generating postcode index', storageConfig.postcodeCoordsContainer)

  const serviceClient = getClient()

  const containerClient = serviceClient.getContainerClient(storageConfig.postcodeCoordsContainer)

  await containerClient.createIfNotExists()

  let i = 0
  for await (const blob of containerClient.listBlobsFlat()) {
    console.log(`Adding ${blob.name} to index`)

    const client = containerClient.getBlockBlobClient(blob.name)

    const file = (await client.downloadToBuffer()).toString('utf-8')

    const fileRows = file.split('\n')

    fileRows.forEach(r => {
      const rowElems = r.split(',')
      const postcode = rowElems[0]
      const lat = rowElems[42]
      const lng = rowElems[43]
      if (postcode && lat && lng) {
        const strippedPostcode = postcode.replaceAll('"', '')
        // console.log(`row postcode=${strippedPostcode} lat=${lat} lng=${lng}`)
        postcodeIndex.set(strippedPostcode, { lat, lng })
        i++
      }
    })
    console.log(`Done adding ${blob.name} to index`)

  }

  console.log('Finished building postcode index ' + i + ' entries')
}

module.exports = {
  generatePostcodeCoords,
  postcodeIndex
}
