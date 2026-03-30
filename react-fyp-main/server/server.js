import { createApp } from './src/app/createApp.js';
import { env } from './src/config/env.js';

const start = async () => {
  const app = await createApp();
  await new Promise((resolve, reject) => {
    const server = app.listen(env.app.port);

    server.once('listening', () => {
      console.log(`App is listening on port ${env.app.port}!`);
      resolve(server);
    });

    server.once('error', reject);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
