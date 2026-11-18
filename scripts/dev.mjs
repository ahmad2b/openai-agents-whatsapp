import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

try { process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); }
catch { console.error('Run npm run setup from the repository root first.'); process.exit(1); }

const cli = fileURLToPath(new URL('../web/node_modules/next/dist/bin/next', import.meta.url));
if (!existsSync(cli)) { console.error('Run npm run web:install first.'); process.exit(1); }

// Loading .env here keeps keys server-side without passing --env-file to Next's workers.
const child = spawn(process.execPath, [cli, 'dev', '--hostname', '127.0.0.1', '--port', '3002'], {
  cwd: fileURLToPath(new URL('../web', import.meta.url)),
  env: process.env,
  stdio: 'inherit',
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.once('error', () => { console.error('Could not start the local Next.js server.'); process.exitCode = 1; });
child.once('exit', code => { process.exitCode = code ?? 0; });
