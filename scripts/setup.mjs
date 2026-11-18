import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const template = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
const content = template
  .replace('GENERATE_API_KEY', randomBytes(32).toString('hex'))
  .replace('GENERATE_WEBHOOK_TOKEN', randomBytes(32).toString('hex'));
try {
  await writeFile(new URL('../.env', import.meta.url), content, { flag: 'wx', mode: 0o600 });
  console.log('Created private .env. Echo mode is enabled; no OpenAI key needed.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('.env already exists; left it unchanged.');
}
