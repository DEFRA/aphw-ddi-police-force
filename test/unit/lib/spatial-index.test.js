const fs = require('fs')
const path = require('path')

jest.mock('../../../app/lib/storage', () => ({
  getClient: jest.fn()
}))
jest.mock('../../../app/config/storage', () => ({
  forceKmlContainer: 'police-force-kml'
}))

const { getClient } = require('../../../app/lib/storage')
const { generateForceCoords, spatialIndex } = require('../../../app/lib/geo/spatial-index')

describe('Native spatial index', () => {
  beforeAll(async () => {
    const files = {
      'london.kml': 'mock-force.kml',
      'swindon.kml': 'mock-multi-poly-force.kml'
    }
    const container = {
      createIfNotExists: jest.fn().mockResolvedValue(undefined),
      listBlobsFlat: async function * () {
        for (const name of Object.keys(files)) {
          yield { name }
        }
      },
      getBlockBlobClient: name => ({
        downloadToBuffer: async () => fs.readFileSync(path.resolve(__dirname, '../../mocks', files[name]))
      })
    }

    getClient.mockReturnValue({
      getContainerClient: jest.fn().mockReturnValue(container)
    })

    await generateForceCoords()
  })

  test('Should find a force using a single KML polygon', () => {
    expect(spatialIndex.queryPoint(51.5144, -0.1225)).toEqual(['london'])
  })

  test('Should find a force using multiple KML polygons', () => {
    expect(spatialIndex.queryPoint(51.55797, -1.78116)).toEqual(['swindon'])
  })

  test('Should return no forces outside the indexed polygons', () => {
    expect(spatialIndex.queryPoint(51.5144, -1.89983)).toEqual([])
  })
})
