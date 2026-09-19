export function initEngineeringLab(root) {
  const find = (selector) => root.querySelector(selector);
  const opening = find('#gate-opening');
  const angle = find('#gate-angle');
  const load = find('#load-3d');
  const status = find('#scene-status');
  const diagram = find('.scene-fallback');
  const host = find('.webgl-host');
  const cameras = find('.camera-controls');
  const label = find('#view-label');
  let scene = null;
  let busy = false;
  let showing3d = false;
  let reloadRequired = false;

  function update() {
    const value = Number(opening.value);
    find('#gate-value').textContent = value + '%';
    opening.setAttribute('aria-valuetext', value + ' percent open');
    find('#diagram-gate').setAttribute('transform', 'translate(0 ' + (-value * 2) + ')');
    find('#diagram-stem').setAttribute('d', 'M339 99V' + Math.max(99, 329 - value * 2));
    find('#gate-svg-description').textContent = 'An illustrative vertical gate, shown ' + value + ' percent open. No live equipment connection.';
    angle.setAttribute('aria-valuetext', angle.value + ' degrees');
    scene?.update(value, Number(angle.value));
  }
  function switchView(use3d) {
    showing3d = use3d;
    host.hidden = !use3d;
    diagram.hidden = use3d;
    cameras.hidden = !use3d;
    label.textContent = use3d ? '3D model · Use the view-angle slider' : 'Schematic view';
    load.textContent = use3d ? '3D model loaded' : 'Explore in 3D ↗';
    load.disabled = use3d;
    scene?.setActive(use3d);
    update();
  }
  function unavailable(message) {
    scene?.dispose();
    scene = null;
    switchView(false);
    status.textContent = message;
    load.textContent = 'Retry 3D';
    load.disabled = false;
  }
  find('.lab-controls').hidden = false;
  opening.addEventListener('input', update);
  angle.addEventListener('input', update);
  find('#reset-gate').addEventListener('click', () => {
    opening.value = '45';
    angle.value = '35';
    update();
    status.textContent = 'Reset to 45% open' + (showing3d ? ' and a 35-degree view.' : '.');
  });
  find('#show-diagram').addEventListener('click', () => {
    switchView(false);
    status.textContent = 'Schematic view. The gate controls remain available.';
    load.focus();
  });
  load.addEventListener('click', async () => {
    if (busy) return;
    if (reloadRequired) {
      window.location.reload();
      return;
    }
    if (scene) {
      switchView(true);
      status.textContent = '3D is ready. Adjust the gate opening and view angle below.';
      return;
    }
    busy = true;
    load.disabled = true;
    load.textContent = 'Loading 3D…';
    status.textContent = 'Loading the 3D viewer. The diagram remains usable.';
    let timer;
    try {
      const module = await Promise.race([
        import('./gate-model.js'),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 15000); })
      ]);
      clearTimeout(timer);
      // Network and WebGL failures both leave the locally available diagram usable.
      scene = module.createGateModel(host, find('#gate-viewport'), () => {
        unavailable('The 3D view was interrupted. Use the diagram or retry 3D.');
      });
      switchView(true);
      status.textContent = '3D is ready. Adjust the gate opening and view angle below.';
    } catch {
      unavailable('3D could not load on this device or connection. The interactive diagram is still available.');
      // Browsers cache failed module imports; a fresh page is needed after a network failure.
      reloadRequired = true;
      load.textContent = 'Reload to retry 3D';
    } finally {
      clearTimeout(timer);
      busy = false;
    }
  });
  update();
}
