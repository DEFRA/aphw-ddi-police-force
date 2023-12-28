const Hapi = require('@hapi/hapi')
const config = require('./config')
const { generateForceCoords } = require('./lib/geo/spatial-index')

async function createServer () {
  const server = Hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register(require('./plugins/router'))

  await generateForceCoords()

  return server
}

module.exports = createServer