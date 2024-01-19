describe('Force endpoint test', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/lib/geo/spatial-index')
  jest.mock('../../../../app/lib/geo/postcode-index')

  jest.mock('../../../../app/lib/geo')
  const { findForceByCoords } = require('../../../../app/lib/geo')

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /force route with lat/lon returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/force'
    }

    findForceByCoords.mockReturnValue(['cumbria'])

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.result).toMatchObject({ id: 'cumbria', name: 'Cumbria Constabulary' })
  })

  test('GET /force route with lat/lon returns 204 if empty array', async () => {
    const options = {
      method: 'GET',
      url: '/force'
    }

    findForceByCoords.mockReturnValue([])

    const response = await server.inject(options)
    expect(response.statusCode).toBe(204)
  })

  afterEach(async () => {
    await server.stop()
    jest.clearAllMocks()
  })
})
