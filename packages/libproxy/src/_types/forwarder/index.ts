export default abstract class Forwarder {
    abstract async forward(ctx): Promise<any>
}