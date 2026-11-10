ARG PARENT_VERSION=3.2.4-node26.12.1
ARG PORT=3000
ARG PORT_DEBUG=9229

# Development
FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

ARG PORT
ARG PORT_DEBUG
ENV PORT ${PORT}
EXPOSE ${PORT} ${PORT_DEBUG}

COPY --chown=node:node package*.json ./
RUN npm_config_build_from_source=true npm ci \
    && node -e "require('./node_modules/boost-geospatial-index/build/Release/BoostSpatialIndex.node')"
COPY --chown=node:node . .
CMD [ "npm", "run", "start:watch" ]

FROM development AS production-dependencies
RUN npm_config_build_from_source=true npm ci --omit=dev \
    && node -e "require('./node_modules/boost-geospatial-index/build/Release/BoostSpatialIndex.node')"

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ARG PORT
ENV PORT ${PORT}
EXPOSE ${PORT}

COPY --from=development /home/node/app/ ./app/
COPY --from=development /home/node/package*.json ./
COPY --from=production-dependencies --chown=node:node /home/node/node_modules/ ./node_modules/
RUN node -e "require('boost-geospatial-index')"
CMD [ "node", "app" ]
