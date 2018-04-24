import URL from 'url';
import https from 'https';
import {
    createSecureContext
} from "tls";

import CertificateService from '../abstracts/service/Certificate';

export default class HttpsServer {
    constructor(
        private certService: CertificateService,
        private connectHandler: any,
        private upgradeHandler: any,
        private handler: any,
    ) {

    }

    async listen() {
        const serverCrt = await this.certService.getCertificationForHost('internal_https_server');
        const server = https.createServer({
            key: serverCrt.key,
            cert: serverCrt.cert,
            SNICallback: (servername, cb) => {
                this.certService.getCertificationForHost(servername)
                    .then(crt => {
                        const ctx = createSecureContext({
                            key: crt.key,
                            cert: crt.cert,
                        });
                        cb(null, ctx);
                    }).catch(e => console.error(servername, e));
            }
        });
        server.on('request', (req, res) => {
            let url = URL.parse(req.url);
            const host = req.headers.host
            url.hostname = host;
            url.protocol = 'https';
            url.path = url.path;
            req.url = URL.format(url);
            // req.headers['x-forwarded-for'] = this.connectHandler.getIP(req.connection.remotePort);
            this.handler(req, res)
        });
        server.on('upgrade', this.upgradeHandler.handle.bind(this.upgradeHandler))
        server.listen(this.connectHandler.httpsProxyPort, '0.0.0.0');
    }
}