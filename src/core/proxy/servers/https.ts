import http from 'http';
import https from 'https';
import path from 'path';
import { createSecureContext } from 'tls';
import { Inject, Service } from 'typedi';

import { AppInfoService, CertificateService } from '@core/services';
import { CertificateStorage } from '@core/storage';

import fillReqUrl from '../../utils/fillReqUrl';
import { HttpHandler, UpgradeHandler } from '../handler';

@Service()
export default class HttpsServer {
  @Inject() private appInfoService: AppInfoService;
  private server: https.Server;
  private certService: CertificateService;

  public setHttpHandler(httpHandler: HttpHandler) {
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
    const certStorage = new CertificateStorage(
      path.join(this.appInfoService.proxyDataDir, 'certificate'),
    );
    this.certService = new CertificateService(certStorage);

    const serverCrt = await this.certService.getCertificationForHost('internal_https_server');
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
}
