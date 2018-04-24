import http from 'http';
export default abstract class HttpHandler {
    abstract async handle(req: http.IncomingMessage, res: http.ServerResponse);
}