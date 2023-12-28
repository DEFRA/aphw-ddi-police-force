describe('Storage unit tests', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    jest.mock('@azure/identity')
    jest.mock('@azure/storage-blob')

    jest.mock('../../../app/config/storage', () => ({
      useConnectionString: true,
      connectionString: 'connectionString',
      account: 'account'
    }))
  })

  test('Should create service client fromConnectionString if using conn string', () => {
    const storageConfig = require('../../../app/config/storage')

    const { BlobServiceClient } = require('@azure/storage-blob')

    storageConfig.useConnectionString = true

    require('../../../app/lib/storage')

    expect(BlobServiceClient.fromConnectionString).toHaveBeenCalledTimes(1)
  })

  test('Should create service client from DefaultAzureCredential if not using conn string', () => {
    const storageConfig = require('../../../app/config/storage')

    const { BlobServiceClient } = require('@azure/storage-blob')
    const { DefaultAzureCredential } = require('@azure/identity')

    storageConfig.useConnectionString = false

    require('../../../app/lib/storage')

    expect(BlobServiceClient).toHaveBeenCalledTimes(1)
    expect(DefaultAzureCredential).toHaveBeenCalledTimes(1)
    expect(BlobServiceClient.fromConnectionString).not.toHaveBeenCalled()
  })
})
