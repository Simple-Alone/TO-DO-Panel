const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.join(__dirname, '..');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-panel-blur-check-'));
const env = { ...process.env, TODO_TEST_USER_DATA: profile };
delete env.ELECTRON_RUN_AS_NODE;

const result = spawnSync(require('electron'), ['tests/panel-blur-collapse.electron.js'], {
  cwd: root,
  env,
  stdio: 'inherit',
  timeout: 60000,
});
if (result.error) console.error(result.error);
if (result.status === 0) {
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
} else {
  console.error('Retained panel blur test profile:', profile);
}
process.exit(result.status ?? 1);
