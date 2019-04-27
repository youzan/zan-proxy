import { AppInfoService, CertificateService } from '@core/services';
import http from 'http';
import https from 'https';
import { createSecureContext } from 'tls';
import { Inject, Service } from 'typedi';

import { fillReqUrl } from '../../utils';
import { RequestHandler, UpgradeHandler } from '../handler';

@Service()
export default class HttpsServer {
  @Inject() private appInfoService: AppInfoService;
  @Inject() private certService: CertificateService;

  private server: https.Server;

  public setHttpHandler(httpHandler: RequestHandler) {
    this.server.on('request', (req: http.IncomingMessage, res: http.ServerResponse) => {
      fillReqUrl(req, 'https');
      // req.headers["x-forwarded-for"] = this.connectHandler.getIP(req.connection.remotePort);
      httpHandler.handle(req, res);
    });
  }

  /**
   * https upgrade to wss handler
   */
  public setUpgradeHandler(upgradeHandler: UpgradeHandler) {
    this.server.on('upgrade', (req, socket, head) => {
      fillReqUrl(req, 'wss');
      upgradeHandler.handle(req, socket, head);
    });
  }

  public async listen(port: number = this.appInfoService.appInfo.httpsProxyPort) {
    this.server.listen(port, '0.0.0.0');
  }

  public async init() {
    const serverCrt = await this.certService.getCertificationForHost('internal_https_server');
    this.server = https.createServer({
      SNICallback: (servername, cb) => {
        this.certService.getCertificationForHost(servername).then(crt => {
          const ctx = createSecureContext({
            cert: crt && crt.cert,
            key: crt && crt.key,
          });
          cb(null, ctx);
        });
      },
      cert: serverCrt && serverCrt.cert,
      key: serverCrt && serverCrt.key,
    });
  }
}
