import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const major = Number(process.versions.node.split('.')[0]);
if (major < 18) {
  console.error(`Node ${process.version} cannot build this Vite app. Set NODE_VERSION=18.`);
  process.exit(1);
}

function run(args) {
  const result = spawnSync(args[0], args.slice(1), { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(['npm', '--prefix', 'FE', 'install']);
run(['npm', '--prefix', 'FE', 'run', 'build']);

const redirects = "/seed/*  /404  404!\n/*       /index.html  200\n";
const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; worker-src 'self' blob:;
`;

const feDist = join(root, 'FE', 'dist');
for (const name of ['dist', 'build']) {
  const out = join(root, name);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(feDist, out, { recursive: true });
  rmSync(join(out, 'seed'), { recursive: true, force: true });
  writeFileSync(join(out, '_redirects'), redirects);
  writeFileSync(join(out, '_headers'), headers);
}

console.log('Published frontend to dist/ and build/ (seed path removed).');
