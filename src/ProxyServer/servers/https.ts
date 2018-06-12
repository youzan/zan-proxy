import https from 'https';
import { createSecureContext } from 'tls';
import URL from 'url';
import { CertificateService, HttpHandler } from '../interfaces';

export class HttpsServer {
  public static async create(certService: CertificateService) {
    const httpsServer = new HttpsServer(certService);
    await httpsServer.init();
    return httpsServer;
  }

  private server: https.Server;
  constructor(
    private certService: CertificateService, // private connectHandler: ConnectHandler
  ) {}
  public setHttpHandler(httpHandler: HttpHandler) {
    this.server.on('request', (req, res) => {
      this.fillReqURL(req);
      // req.headers["x-forwarded-for"] = this.connectHandler.getIP(req.connection.remotePort);
      httpHandler.handle(req, res);
    });
  }

  public setUpgradeHandler(upgradeHandler) {
    this.server.on('upgrade', (req, socket, head) => {
      this.fillReqURL(req);
      upgradeHandler.handle(req, socket, head);
    });
  }

  public async listen(port) {
    this.server.listen(port, '0.0.0.0');
  }

  private async init() {
    const serverCrt = await this.certService.getCertificationForHost(
      'internal_https_server',
    );
    this.server = https.createServer({
      SNICallback: (servername, cb) => {
        this.certService.getCertificationForHost(servername).then(crt => {
          const ctx = createSecureContext({
            cert: crt.cert,
            key: crt.key,
          });
          cb(null, ctx);
        });
      },
      cert: serverCrt.cert,
      key: serverCrt.key,
    });
  }

  private fillReqURL(req) {
    const url = URL.parse(req.url);
    const host = req.headers.host;
    url.hostname = host;
    url.protocol = 'https';
    url.path = url.path;
    req.url = URL.format(url);
  }
}
