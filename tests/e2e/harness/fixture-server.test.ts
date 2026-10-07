import { connect, Socket } from 'net';
import { FixtureServer } from './fixture-server';

test('fixture shutdown closes a speculative browser connection', async () => {
  const fixture = new FixtureServer({ port: 0 });
  let socket: Socket | undefined;
  try {
    const port = await fixture.start();
    socket = connect({ port, host: '127.0.0.1' });
    await new Promise<void>((resolve, reject) => {
      socket!.once('connect', resolve);
      socket!.once('error', reject);
    });
    // No HTTP request: this reproduces Chrome's speculative preconnection.
    const closed = new Promise<void>((resolve) => socket!.once('close', () => resolve()));
    await fixture.stop();
    await closed;
    await fixture.stop();
  } finally {
    socket?.destroy();
    await fixture.stop();
  }
}, 5000);
