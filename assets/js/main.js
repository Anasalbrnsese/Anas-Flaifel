import { initNavigation } from './navigation.js';
import { initEngineeringLab } from './engineering-scene.js';

initNavigation();
const lab = document.querySelector('[data-engineering-lab]');
if (lab) initEngineeringLab(lab);
document.querySelector('#copyright-year').textContent = new Date().getFullYear();

