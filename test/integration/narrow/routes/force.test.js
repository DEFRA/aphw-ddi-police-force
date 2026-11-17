jest.mock('../../../../app/lib/geo/spatial-index', () => ({
  generateForceCoords: jest.fn().mockResolvedValue(undefined)
}))
jest.mock('../../../../app/lib/geo/postcode-index', () => ({
  generatePostcodeCoords: jest.fn().mockResolvedValue(undefined)
}))

describe('Force endpoint test', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/lib/geo')
  const { findForceByCoords } = require('../../../../app/lib/geo')

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /force route with lat/lon returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/force?lat=51.5144&lon=-0.1225'
    }

    findForceByCoords.mockReturnValue(['metropolitan'])

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({ id: 'metropolitan', name: 'Metropolitan Police Service' })
    expect(findForceByCoords).toHaveBeenCalledWith(51.5144, -0.1225)
  })

  test('GET /force route with lat/lon returns 204 if empty array', async () => {
    const options = {
      method: 'GET',
      url: '/force?lat=51.5144&lon=-0.1225'
    }

    findForceByCoords.mockReturnValue([])

    const response = await server.inject(options)
    expect(response.statusCode).toBe(204)
    expect(findForceByCoords).toHaveBeenCalledWith(51.5144, -0.1225)
  })

  afterEach(async () => {
    await server?.stop()
    jest.clearAllMocks()
  })
})
