import URL from 'url'
import https from 'https'
import tls from 'tls'
import { Inject, Service } from 'typedi'
import { ICertificateServiceId, ICertificateService, HttpHandler, HttpHandlerService } from '../../service'

@Service({
  global: true
})
export class HttpsServer {
  @Inject(ICertificateServiceId) certificateService: ICertificateService
  @Inject(HttpHandlerService) httpHandler: HttpHandler
  server: https.Server

  async init() {
    const serverCrt = await this.certificateService.getCertificationForHost(
      'internal_https_server'
    )
    this.server = https.createServer({
      key: serverCrt.key,
      cert: serverCrt.cert,
      SNICallback: async (servername, cb) => {
        try {
          const cert = await this.certificateService.getCertificationForHost(
            servername
          )
          const ctx = tls.createSecureContext(cert)
          cb(null, ctx)
        } catch (error) {
          console.error(servername, error)
        }
      }
    })
    this.server.on('request', (req, res) => {
      let url = URL.parse(req.url);
      const host = req.headers.host
      url.hostname = host;
      url.protocol = 'https';
      req.url = URL.format(url);
      return this.httpHandler.handle(req, res)
    })
  }

  async listen(port) {
    await this.init()
    this.server.listen(port, '0.0.0.0')
  }
}
