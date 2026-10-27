export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SERVER_CONTROL_TOKEN) {
    const { startRelayWorker } = await import('./features/server/relay-worker');
    startRelayWorker();
  }
}
