const { findForceByCoords } = require('../lib/geo')

module.exports = [{
  method: 'GET',
  path: '/force',
  handler: async (request, h) => {
    const lat = request.query.lat
    const lon = request.query.lon

    const forces = findForceByCoords(lat, lon)

    if (forces.length === 0) {
      return h.response().code(204)
    }

    return h.response({ force: forces[0] }).code(200)
  }
}]
