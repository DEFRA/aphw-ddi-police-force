describe('Geospatial unit tests', () => {
  jest.mock('../../../app/lib/geo/spatial-index')
  const { spatialIndex } = require('../../../app/lib/geo/spatial-index')

  const consoleErrorSpy = jest.spyOn(console, 'error')

  const { findForceByCoords } = require('../../../app/lib/geo')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return array containing correct force for a given point', () => {
    spatialIndex.queryPoint.mockReturnValue(['test-force'])

    const result = findForceByCoords(51.5144, -0.1225)

    expect(result.length).toBe(1)
    expect(result).toContain('test-force')
  })

  test('Should return empty array for out of bounds coords', () => {
    spatialIndex.queryPoint.mockReturnValue([])

    const result = findForceByCoords(51.5144, -1.89983)

    expect(result.length).toBe(0)
  })

  test('Should return undefined if queryPoint throws an error', () => {
    const mockError = new Error('test error')

    spatialIndex.queryPoint.mockImplementation(() => {
      throw mockError
    })

    expect(() => findForceByCoords(51.5144, -1.89983)).toThrow(mockError)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
  })
})
