const surface = document.getElementById('notch-surface');

function applyState(state) {
  const expanded = state?.mode === 'expanded' || state?.mode === 'launcher';
  surface.dataset.expanded = String(expanded);
  surface.disabled = expanded;
  document.documentElement.dataset.theme = state?.theme === 'light' ? 'light' : 'dark';
}

surface.addEventListener('click', () => window.notchSurfaceAPI?.toggle?.());
window.notchSurfaceAPI?.onState?.(applyState);
