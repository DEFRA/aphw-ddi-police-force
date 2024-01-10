const Hapi = require('@hapi/hapi')
const config = require('./config')
const { generateForceCoords } = require('./lib/geo/spatial-index')
const { generatePostcodeCoords } = require('./lib/geo/postcode-index')
const { memoryUsage } = require('node:process')

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

  let muNow = memoryUsage()['heapUsed'] / 1024 / 1024 / 1024
  console.log(`memoryUsage ${Math.round(muNow * 100) / 100} GB`)

  await generatePostcodeCoords()

  muNow = memoryUsage()['heapUsed'] / 1024 / 1024 / 1024
  console.log(`memoryUsage ${Math.round(muNow * 100) / 100} GB`)

  await generateForceCoords()

  muNow = memoryUsage()['heapUsed'] / 1024 / 1024 / 1024
  console.log(`memoryUsage ${Math.round(muNow * 100) / 100} GB`)

  return server
}

module.exports = createServer
