const { findForceByCoords, findCoordsByPostcodeLocal } = require('../lib/geo')

module.exports = [{
  method: 'GET',
  path: '/force',
  handler: async (request, h) => {
    let lat = request.query?.lat
    let lng = request.query?.lon
    const postcode = request.query?.postcode

    if (postcode) {
      console.log('/force', postcode)
      const coords = await findCoordsByPostcodeLocal(postcode)
      console.log('coords', coords)
      if (!coords) {
        return h.response().code(204)
      }
      lat = coords.lat
      lng = coords.lng
    } else {
      if (!lat || !lng) {
        return h.response().code(400)
      }
    }

    const forces = findForceByCoords(lat, lng)

    if (forces.length === 0) {
      return h.response().code(204)
    }

    return h.response({ force: forces[0] }).code(200)
  }
}]
