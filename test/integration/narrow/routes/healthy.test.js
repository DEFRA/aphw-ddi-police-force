jest.mock('../../../../app/lib/geo/spatial-index', () => ({
  generateForceCoords: jest.fn().mockResolvedValue(undefined)
}))
jest.mock('../../../../app/lib/geo/postcode-index', () => ({
  generatePostcodeCoords: jest.fn().mockResolvedValue(undefined)
}))

describe('Healthy test', () => {
  const createServer = require('../../../../app/server')
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /healthy route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server?.stop()
  })
})
