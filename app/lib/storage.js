const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')
const storageConfig = require('../config/storage')

let serviceClient

if (storageConfig.useConnectionString) {
  console.log('Using connection string for Blob Client')
  serviceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionString, { allowInsecureConnection: true })
} else {
  console.log('Using DefaultAzureCredential for Blob Client')
  serviceClient = new BlobServiceClient(`https://${storageConfig.account}.blob.core.windows.net`, new DefaultAzureCredential())
}

const getClient = () => serviceClient

module.exports = {
  getClient
}
