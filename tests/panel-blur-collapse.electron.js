const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');
const platformPolicy = require('../platform');

const profile = process.env.TODO_TEST_USER_DATA
  || fs.mkdtempSync(path.join(os.tmpdir(), 'to-do-panel-blur-test-'));
app.setPath('userData', profile);
if (process.platform === 'darwin') app.commandLine.appendSwitch('use-mock-keychain');

const outputDirectory = path.join(__dirname, '..', 'dist.noindex', 'panel-blur-collapse');
const timeline = [];
let completed = false;

function diagnostic(message) {
  console.log(message);
  if (process.env.TODO_TEST_LOG) fs.appendFileSync(process.env.TODO_TEST_LOG, `${message}\n`);
}

function record(stage, window) {
  timeline.push({
    stage,
    at: Date.now(),
    bounds: window && !window.isDestroyed() ? window.getBounds() : null,
    focused: window && !window.isDestroyed() ? window.isFocused() : false,
    shadow: window && !window.isDestroyed() && typeof window.hasShadow === 'function'
      ? window.hasShadow()
      : null,
  });
}

async function waitFor(predicate, message, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(message);
}

async function rendererState(contents) {
  return contents.executeJavaScript(`(() => {
    const root = document.getElementById('app');
    return {
      className: root?.className || '',
      expanded: typeof isExpanded === 'boolean' ? isExpanded : null,
      busy: typeof modeBusy === 'boolean' ? modeBusy : null,
    };
  })()`);
}

async function saveDiagnostics(contents) {
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, 'timeline.json'), JSON.stringify(timeline, null, 2));
  if (contents && !contents.isDestroyed()) {
    const image = await contents.capturePage().catch(() => null);
    if (image && !image.isEmpty()) {
      fs.writeFileSync(path.join(outputDirectory, 'window.png'), image.toPNG());
    }
  }
}

const hardTimeout = setTimeout(() => {
  if (completed) return;
  console.error('Panel blur collapse test timed out', timeline);
  process.exit(1);
}, 30000);

async function runScenario(mainWindow) {
  const contents = mainWindow.webContents;
  let focusSink = null;
  try {
    await waitFor(async () => {
      try {
        const state = await rendererState(contents);
        return state.className.includes('collapsed') && state.busy === false;
      } catch (_) {
        return false;
      }
    }, 'main window did not reach its initial collapsed state');

    focusSink = new BrowserWindow({
      width: 180,
      height: 100,
      x: mainWindow.getBounds().x,
      y: mainWindow.getBounds().y + mainWindow.getBounds().height + 40,
      frame: false,
      show: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      focusable: true,
      backgroundColor: '#202124',
    });
    await focusSink.loadURL('data:text/html,<title>Focus sink</title>');
    focusSink.setAlwaysOnTop(true, 'screen-saver', 1);
    app.focus({ steal: true });
    mainWindow.show();
    mainWindow.focus();
    contents.focus();
    await waitFor(() => mainWindow.isFocused(), 'main window could not receive focus before expansion');
    record('collapsed', mainWindow);
    mainWindow.setSize(1240, 616, false);
    await contents.executeJavaScript("document.getElementById('notch').click()");
    await waitFor(async () => {
      const state = await rendererState(contents);
      return state.className.includes('expanded') && state.expanded === true && state.busy === false;
    }, 'main window did not expand');
    record('expanded', mainWindow);

    let blurred = false;
    mainWindow.once('blur', () => {
      blurred = true;
      record('blur', mainWindow);
      void contents.executeJavaScript('setMode(false)');
    });
    focusSink.show();
    focusSink.focus();

    await waitFor(() => focusSink.isFocused(), 'focus sink could not receive focus');
    await waitFor(() => blurred, 'focusing another window did not trigger a real main-window blur');
    await waitFor(async () => (await rendererState(contents)).className.includes('closing'),
      'real blur did not start the renderer collapse');
    record('closing', mainWindow);
    const closingHasNativeShadow = typeof mainWindow.hasShadow === 'function'
      ? mainWindow.hasShadow()
      : null;

    await waitFor(async () => {
      const state = await rendererState(contents);
      return state.className.includes('collapsed') && state.expanded === false && state.busy === false;
    }, 'main window did not finish collapsing');
    mainWindow.setSize(200, 38, false);
    record('collapsed-after-blur', mainWindow);

    assert.equal(
      closingHasNativeShadow,
      process.platform !== 'darwin',
      'transparent macOS window must not retain a native rectangular shadow during blur collapse'
    );
    assert.equal(mainWindow.getBounds().width, 200, 'blur collapse should restore the notch width');
    diagnostic('Panel blur collapse check passed');
    completed = true;
    clearTimeout(hardTimeout);
    focusSink.destroy();
    app.quit();
  } catch (error) {
    record('failure', mainWindow);
    await Promise.race([
      saveDiagnostics(contents).catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
    console.error('Panel blur collapse test failed', error, timeline);
    completed = true;
    clearTimeout(hardTimeout);
    if (focusSink && !focusSink.isDestroyed()) focusSink.destroy();
    app.exit(1);
  }
}

diagnostic('Panel blur collapse test: starting isolated renderer');
app.whenReady().then(async () => {
  const mainWindow = new BrowserWindow({
    width: 200,
    height: 38,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: platformPolicy.mainWindowHasShadow(process.platform),
    show: false,
    webPreferences: { backgroundThrottling: false },
  });
  await mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.show();
  diagnostic('Panel blur collapse test: renderer loaded');
  await runScenario(mainWindow);
});
