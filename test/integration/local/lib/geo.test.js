const fs = require('fs')
const path = require('path')
const { generateForceCoords } = require('../../../../app/lib/geo/spatial-index')

describe('Geospatial integration tests', () => {
  const { getClient } = require('../../../../app/lib/storage')
  const geo = require('../../../../app/lib/geo')

  beforeAll(async () => {
    const container = getClient().getContainerClient('police-force-kml')

    await container.createIfNotExists()

    const mockSinglePoly = fs.readFileSync(path.resolve(__dirname, '../../../mocks/mock-force.kml'))
    const mockMultiPoly = fs.readFileSync(path.resolve(__dirname, '../../../mocks/mock-multi-poly-force.kml'))

    let blobClient = container.getBlockBlobClient('london.kml')
    await blobClient.uploadData(mockSinglePoly)

    blobClient = container.getBlockBlobClient('swindon.kml')
    await blobClient.uploadData(mockMultiPoly)

    await generateForceCoords()
  })

  test('Should return array containing correct force for a given point', async () => {
    const result = geo.findForceByCoords(51.5144, -0.1225)

    expect(result.length).toBe(1)
    expect(result).toContain('london')
  })

  test('Should return array containing correct multi poly force for a given point', async () => {
    const result = geo.findForceByCoords(51.55797, -1.78116)

    expect(result.length).toBe(1)
    expect(result).toContain('swindon')
  })

  test('Should return empty array for out of bounds coords', async () => {
    const result = geo.findForceByCoords(51.5144, -1.89983)

    expect(result.length).toBe(0)
  })

  afterAll(async () => {
    const container = getClient().getContainerClient('police-force-kml')

    await container.deleteIfExists()
  })
})
