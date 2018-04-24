export function registerCleanup(callback: () => any) {
  process.on('exit', callback)
  process.on('SIGINT', callback)
  process.on('SIGUSR1', callback)
  process.on('SIGUSR2', callback)
  process.on('uncaughtException', callback)
}
