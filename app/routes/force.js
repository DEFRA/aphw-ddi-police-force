const Joi = require('joi')
const { findForceByCoords, postcode } = require('../lib/geo')
const forceMap = require('../lib/force-map')

const getCoordsFromRequest = (request) => {
  if (request.query?.postcode) {
    const coords = postcode.findCoordsByPostcodeLocal(request.query.postcode)

    return coords
  }

  return { lat: request.query.lat, lon: request.query.lon }
}

module.exports = [{
  method: 'GET',
  path: '/force',
  options: {
    validate: {
      query: Joi.object({
        lat: Joi.number().when('postcode', { is: Joi.exist(), then: Joi.forbidden() }),
        lon: Joi.number().when('postcode', { is: Joi.exist(), then: Joi.forbidden() }),
        postcode: Joi.string().replace(' ', '').optional()
      }),
      failAction: (request, h, error) => {
        console.error(error)
        return h.response().code(400).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { lat, lon } = getCoordsFromRequest(request)

    const forces = findForceByCoords(lat, lon)

    if (forces.length === 0) {
      return h.response().code(204)
    }

    const forceId = forces[0]

    return h.response({ id: forceId, name: forceMap[forceId] }).code(200)
  }
}]
