const fs = require('fs')
const path = require('path')
const { createLocalKVService } = require('./packages/proxy/bin/localkv')
const { ScopedKVService } = require('./packages/libproxy/lib/impl/storage')

async function init() {
    const rootKV = await createLocalKVService()
    await initCert(rootKV)
    await initHost(rootKV)
    rootKV.close()
    console.log('data initialization completed')
}

async function initCert(rootKV) {
    const storage = new ScopedKVService(rootKV, 'cert')
    const certDir = path.join(__dirname, 'certificate')
    const cert = fs.readFileSync(path.join(certDir, 'zproxy.crt.pem'), { encoding: 'utf-8' })
    const key = fs.readFileSync(path.join(certDir, 'zproxy.key.pem'), { encoding: 'utf-8' })
    await storage.set('$$ROOT_CERT$$', { cert, key })
    console.log('certification initialization completed')
}

async function initHost(rootKV) {
    const storage = new ScopedKVService(rootKV, 'host')
}

init()