export interface UpgradeHandler {
  handle(req, socket, head);
}
