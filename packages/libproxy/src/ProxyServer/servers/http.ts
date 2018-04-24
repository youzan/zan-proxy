import http from 'http'
import { Inject, Service } from 'typedi'
import { HttpHandler, ConnectHandler, HttpHandlerService, ConnectHandlerService } from './../../service/Handler';

@Service({
    global: true
})
export class HttpServer {
    @Inject(HttpHandlerService) httpHandler: HttpHandler
    @Inject(ConnectHandlerService) connectHandler: ConnectHandler
    server: http.Server
    constructor() {
        this.server = http.createServer()
        this.server.on('request', (req, res) => this.httpHandler.handle(req, res))
        this.server.on('connect', (req, socket, head) => this.connectHandler.handle(req, socket, head))
    }
    async listen(port) {
        this.server.listen(port, '0.0.0.0')
    }
}