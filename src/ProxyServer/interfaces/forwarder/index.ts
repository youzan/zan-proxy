export interface Forwarder {
  forward(ctx): Promise<any>;
}
