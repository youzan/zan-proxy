import http from 'http';
import net from 'net';

export default abstract class ConnectHandler {
    abstract async handle(req: http.IncomingMessage, socket: net.Socket, head: Buffer);
}