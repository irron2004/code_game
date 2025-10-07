// main.js
import { Grid, Cell } from './grid.js';
import { Renderer } from './renderer.js';
import { Simulator, Player } from './simulator.js';
import { SAMPLE_LEVELS, randomWalls } from './levels.js';
import { exportLevel, gridFromJson, validateLevelJson } from './level_io.js';
import { analyzeNoPath, tryWhatIf } from './no_path_advice.js';
import { TUTORIAL_STEPS } from './tutorial.js';
import { createStore } from './store.js';

const el = (sel) => document.querySelector(sel);
const els = (sel) => Array.from(document.querySelectorAll(sel));
const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container){
  if (!container) return [];
  return Array.from(container.querySelectorAll(focusableSelector)).filter((node) => {
    if (node.closest('[hidden]')) return false;
    if (node.getAttribute('aria-hidden') === 'true') return false;
    const style = typeof getComputedStyle === 'function' ? getComputedStyle(node) : null;
    if (!style) return true;
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

function focusElement(node){
  if (node && typeof node.focus === 'function'){
    node.focus();
    return true;
  }
  return false;
}

function captureActiveElement(){
  const active = document.activeElement;
  return active && typeof active.focus === 'function' ? active : null;
}

let activeFocusTrap = null;

function activateFocusTrap(container){
  if (!container) return;
  activeFocusTrap?.dispose?.();
  const handler = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(container);
    if (!focusable.length){
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (!container.contains(active)){
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey){
      if (active === first){
        event.preventDefault();
        last.focus();
      }
    } else if (active === last){
      event.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', handler);
  activeFocusTrap = {
    container,
    dispose(){
      container.removeEventListener('keydown', handler);
      if (activeFocusTrap?.container === container){
        activeFocusTrap = null;
      }
    },
  };
}

function deactivateFocusTrap(container){
  if (activeFocusTrap?.container === container){
    activeFocusTrap.dispose();
  }
}

const canvas = el('#game');
const algoSelect = el('#algoSelect');
const allowDiagonal = el('#allowDiagonal');
const useWeights = el('#useWeights');
const rowsInput = el('#rows');
const colsInput = el('#cols');
const resizeBtn = el('#resizeBtn');

const playBtn = el('#playBtn');
const pauseBtn = el('#pauseBtn');
const stepBtn = el('#stepBtn');
const resetBtn = el('#resetBtn');
const speedRange = el('#speed');
const speedVal = el('#speedVal');

const showVisited = el('#showVisited');
const showFrontier = el('#showFrontier');
const showPath = el('#showPath');
const showGridLines = el('#showGridLines');

const randomMapBtn = el('#randomMapBtn');
const clearMapBtn = el('#clearMapBtn');
const sampleLevelSel = el('#sampleLevel');
const loadLevelBtn = el('#loadLevelBtn');
const exportLevelBtn = el('#exportLevelBtn');
const copyLevelBtn = el('#copyLevelBtn');
const importLevelInput = el('#importLevelInput');
const levelJsonInput = el('#levelJsonInput');
const applyLevelJsonBtn = el('#applyLevelJsonBtn');
const clearJsonInputBtn = el('#clearJsonInputBtn');

const stCurrent = el('#statusCurrent');
const stVisited = el('#statusVisited');
const stFrontier = el('#statusFrontier');
const stPath = el('#statusPath');
const stMsg = el('#statusMsg');
const ioMsg = el('#ioMsg');
const noPathToast = el('#noPathToast');
const noPathToastTitle = el('#noPathToastTitle');
const noPathToastMsg = el('#noPathToastMsg');
const noPathToastActions = el('#noPathToastActions');
const noPathToastClose = el('#noPathToastClose');
const noPathHelpBtn = el('#noPathHelpBtn');
if (noPathHelpBtn) noPathHelpBtn.disabled = true;
if (noPathToast) noPathToast.dataset.autoshow = '0';
const tutorialModal = el('#tutorialModal');
const tutorialTitle = el('#tutorialTitle');
const tutorialBody = el('#tutorialBody');
const tutorialBulletList = el('#tutorialBulletList');
const tutorialProgress = el('#tutorialProgress');
const tutorialPrev = el('#tutorialPrev');
const tutorialNext = el('#tutorialNext');
const tutorialClose = el('#tutorialClose');
const tutorialStartBtn = el('#startTutorialBtn');
const onboardingOverlay = el('#onboardingOverlay');
const onboardingClose = el('#onboardingClose');
const onboardingSkip = el('#onboardingSkip');

let grid = new Grid(+colsInput.value, +rowsInput.value);
let renderer = new Renderer(canvas, grid);
renderer.resizeToFit();
const store = createStore({
  rules: {
    algorithm: algoSelect.value,
    allowDiagonal: allowDiagonal.checked,
    useWeights: useWeights.checked,
  },
  sim: {
    fps: +speedRange.value,
    running: false,
  },
});

let rules = store.get().rules;
let sim = new Simulator(grid, rules);
let player = new Player(sim, onUpdate);
player.setFPS(store.get().sim.fps);
let cursor = createCursor();
let painting = false;
let currentBrush = 'WALL';
const brushRadios = els('input[name="brush"]');
const brushOrder = ['WALL','EMPTY','START','GOAL','FOREST','SAND'];
let noPathOverlay = null;
let whatIfResults = [];
let latestNoPathSignature = null;
let displayedNoPathSignature = null;
let dismissedNoPathSignature = null;
let tutorialState = { active: false, index: 0, saved: null };
const NO_PATH_TOAST_TIMEOUT = 6500;
let noPathToastTimer = null;
let lastAppliedSuggestion = null;
let tutorialPreviouslyFocused = null;
let onboardingPreviouslyFocused = null;

populateSamples();

function draw(){
  renderer.gridLines = showGridLines.checked;
  renderer.draw(sim.state || null, {
    showVisited: showVisited.checked,
    showFrontier: showFrontier.checked,
    showPath: showPath.checked,
    showGridLines: showGridLines.checked,
    cursor,
    boundaryWalls: noPathOverlay?.boundary,
    unreachable: noPathOverlay?.unreachable,
  });
}

function onUpdate(state){
  updateNoPathHints(state);
  draw();
  updateStatus(state);
}

function updateNoPathHints(state){
  if (!state){
    clearNoPathUi();
    return;
  }
  if (!sim.done){
    noPathOverlay = null;
    whatIfResults = [];
    hideNoPathToast();
    latestNoPathSignature = null;
    displayedNoPathSignature = null;
    if (noPathHelpBtn) noPathHelpBtn.disabled = true;
    return;
  }
  if (state.reached){
    clearNoPathUi();
    return;
  }
  noPathOverlay = analyzeNoPath(grid, rules);
  whatIfResults = tryWhatIf(grid, rules);
  if (noPathHelpBtn) noPathHelpBtn.disabled = false;
  const signature = makeNoPathSignature();
  if (signature !== latestNoPathSignature){
    dismissedNoPathSignature = null;
  }
  latestNoPathSignature = signature;
  renderNoPathToast(whatIfResults);
  if (signature !== displayedNoPathSignature && signature !== dismissedNoPathSignature){
    showNoPathToast(true);
    displayedNoPathSignature = signature;
  }
}

function updateStatus(state){
  if (!state){
    stCurrent.textContent = '-';
    stVisited.textContent = '0';
    stFrontier.textContent = '0';
    stPath.textContent = '-';
    stMsg.textContent = '준비됨';
    return;
  }
  stCurrent.textContent = state.current ? `${state.current.x},${state.current.y}` : '-';
  stVisited.textContent = state.visited?.size ?? 0;
  stFrontier.textContent = state.frontier?.size ?? 0;
  stPath.textContent = state.path ? state.path.length : '-';
  if (sim.done){
    stMsg.textContent = state.reached ? '성공! 목표에 도달했습니다.' : '실패… 목표에 도달할 수 없습니다.';
  } else {
    stMsg.textContent = '시뮬레이션 중…';
  }
}

function ensureStartGoal(){
  // 시작/목표가 벽에 덮이지 않도록 보정
  grid.set(grid.start.x, grid.start.y, Cell.START);
  grid.set(grid.goal.x, grid.goal.y, Cell.GOAL);
}

function brushToCell(brush){
  switch(brush){
    case 'EMPTY': return Cell.EMPTY;
    case 'WALL': return Cell.WALL;
    case 'START': return Cell.START;
    case 'GOAL': return Cell.GOAL;
    case 'FOREST': return Cell.FOREST;
    case 'SAND': return Cell.SAND;
    default: return null;
  }
}

function applyBrush(pos, brush, options={}){
  if (!grid.inBounds(pos.x,pos.y)) return;
  const { toggle=false } = options;
  const current = grid.get(pos.x,pos.y);
  const targetCell = brushToCell(brush);

  if (toggle && targetCell !== null && targetCell !== Cell.START && targetCell !== Cell.GOAL && targetCell !== Cell.EMPTY && current === targetCell){
    grid.set(pos.x,pos.y, Cell.EMPTY);
    ensureStartGoal();
    player.reset();
    updateSim({ running: false });
    draw();
    return;
  }

  if (toggle && brush === 'EMPTY' && current === Cell.EMPTY){
    return;
  }
  // 시작·목표 칸은 덮으면 역할을 재배치
  switch(brush){
    case 'WALL': grid.set(pos.x,pos.y, Cell.WALL); break;
    case 'EMPTY': grid.set(pos.x,pos.y, Cell.EMPTY); break;
    case 'START': grid.set(pos.x,pos.y, Cell.START); break;
    case 'GOAL': grid.set(pos.x,pos.y, Cell.GOAL); break;
    case 'FOREST': grid.set(pos.x,pos.y, Cell.FOREST); break;
    case 'SAND': grid.set(pos.x,pos.y, Cell.SAND); break;
  }
  ensureStartGoal();
  player.reset();
  updateSim({ running: false });
  draw();
}

function togglePlay(){
  if (player.isPlaying()){
    player.pause();
    updateSim({ running: false });
  } else {
    player.play();
    updateSim({ running: true });
  }
}

function moveCursor(dx, dy){
  const nx = cursor.x + dx;
  const ny = cursor.y + dy;
  if (!grid.inBounds(nx, ny)) return;
  cursor = { x: nx, y: ny };
  draw();
}

function handleKeyDown(e){
  const activeTag = (document.activeElement?.tagName || '').toLowerCase();
  if (['input', 'select', 'textarea'].includes(activeTag)) return;
  const key = e.key;
  if (tutorialState.active){
    if (key === 'Escape'){
      e.preventDefault();
      closeTutorialModal(true);
    }
    return;
  }
  if (onboardingOverlay && !onboardingOverlay.hidden){
    if (key === 'Escape'){
      e.preventDefault();
      closeOnboarding();
    }
    return;
  }
  const lower = key.length === 1 ? key.toLowerCase() : key;
  switch(lower){
    case 'ArrowUp':
      e.preventDefault();
      moveCursor(0, -1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      moveCursor(0, 1);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      moveCursor(-1, 0);
      break;
    case 'ArrowRight':
      e.preventDefault();
      moveCursor(1, 0);
      break;
    case ' ':
    case 'Spacebar':
      e.preventDefault();
      applyBrush(cursor, currentBrush, { toggle: true });
      break;
    case 'Enter':
    case 'p':
      e.preventDefault();
      togglePlay();
      break;
    case 'n':
      e.preventDefault();
      player.step();
      updateSim({ running: false });
      break;
    case 'r':
      e.preventDefault();
      player.reset();
      updateSim({ running: false });
      cursor = createCursor();
      draw();
      break;
    case '1': case '2': case '3': case '4': case '5': case '6':
      e.preventDefault();
      setBrushByIndex(Number(lower) - 1);
      break;
  }
}

function createCursor(){
  return { x: grid.start.x, y: grid.start.y };
}

function resetForNewGrid(newGrid){
  clearNoPathUi();
  grid = newGrid;
  renderer = new Renderer(canvas, grid);
  renderer.resizeToFit();
  sim = new Simulator(grid, rules);
  player?.pause?.();
  player = new Player(sim, onUpdate);
  player.setFPS(store.get().sim.fps);
  player.reset();
  updateSim({ running: false });
  cursor = createCursor();
  draw();
}

function setIoMessage(text, isError=false){
  if (!ioMsg) return;
  ioMsg.textContent = text;
  ioMsg.style.color = isError ? '#e74c3c' : '#6b7a90';
  ioMsg.setAttribute('data-state', isError ? 'error' : 'info');
}

function updateSim(partial){
  const current = store.get().sim;
  const next = { ...current, ...partial };
  store.set({ sim: next });
  if (partial.fps !== undefined){
    player?.setFPS?.(next.fps);
  }
}

function rebuildSimulation(nextRules = rules){
  rules = nextRules;
  const fps = store.get().sim.fps;
  sim = new Simulator(grid, nextRules);
  player?.pause?.();
  player = new Player(sim, onUpdate);
  player.setFPS(fps);
  player.reset();
  updateSim({ running: false });
  cursor = createCursor();
  draw();
}

function updateRules(patch){
  const next = { ...store.get().rules, ...patch };
  store.set({ rules: next });
  rebuildSimulation(next);
  if (lastAppliedSuggestion && !rulesMatchPatch(next, lastAppliedSuggestion)){
    lastAppliedSuggestion = null;
  }
}

function showNoPathToast(autoShow=false){
  if (!noPathToast) return;
  noPathToast.hidden = false;
  noPathToast.classList.add('visible');
  noPathToast.dataset.autoshow = autoShow ? '1' : '0';
  clearNoPathToastTimer();
  if (autoShow) startNoPathToastTimer();
}

function hideNoPathToast(){
  if (!noPathToast) return;
  noPathToast.classList.remove('visible');
  noPathToast.hidden = true;
  clearNoPathToastTimer();
  noPathToast.dataset.autoshow = '0';
}

function startNoPathToastTimer(){
  clearNoPathToastTimer();
  noPathToastTimer = window.setTimeout(() => {
    hideNoPathToast();
  }, NO_PATH_TOAST_TIMEOUT);
}

function clearNoPathToastTimer(){
  if (noPathToastTimer){
    clearTimeout(noPathToastTimer);
    noPathToastTimer = null;
  }
}

function rulesMatchPatch(rulesState, patch){
  if (!patch) return false;
  return Object.keys(patch).every(key => rulesState[key] === patch[key]);
}

function patchesEqual(a, b){
  if (!a || !b) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys){
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function renderNoPathToast(results){
  if (!noPathToast || !noPathToastTitle || !noPathToastMsg || !noPathToastActions) return;
  const hasSuccess = results.some(r => r.success);
  noPathToast.classList.toggle('toast--success', hasSuccess);
  noPathToast.classList.toggle('toast--warn', !hasSuccess);
  noPathToastTitle.textContent = hasSuccess ? '길이 막혔어요.' : '아직 막혀 있어요.';
  noPathToastMsg.textContent = hasSuccess ? '아래 중 하나를 바꾸면 도달할 수 있어요!' : '벽을 조금 지우거나, 시작/목표 위치를 바꿔 보세요.';
  noPathToastActions.innerHTML = '';
  const currentRules = store.get().rules;
  results.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast__action';
    if (opt.success) btn.classList.add('toast__action--success');
    const isActive = rulesMatchPatch(currentRules, opt.patch);
    const isLastApplied = lastAppliedSuggestion && patchesEqual(lastAppliedSuggestion, opt.patch);
    if (!opt.changed){
      btn.disabled = true;
      btn.classList.add('toast__action--disabled');
    }
    if (isActive){
      btn.classList.add('toast__action--applied');
    }
    if (isLastApplied){
      btn.dataset.lastApplied = 'true';
    }
    if (isActive){
      btn.textContent = `${opt.label} (적용됨)`;
    } else if (!opt.changed){
      btn.textContent = `${opt.label} (현재)`;
    } else {
      btn.textContent = opt.label;
    }
    btn.dataset.index = String(index);
    btn.addEventListener('click', () => applyNoPathSuggestion(opt));
    noPathToastActions.appendChild(btn);
  });
}

function applyNoPathSuggestion(option){
  if (!option || !option.patch) return;
  hideNoPathToast();
  dismissedNoPathSignature = null;
  displayedNoPathSignature = null;
  const patch = option.patch;
  if (Object.prototype.hasOwnProperty.call(patch, 'allowDiagonal')){
    allowDiagonal.checked = patch.allowDiagonal;
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'useWeights')){
    useWeights.checked = patch.useWeights;
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'algorithm')){
    algoSelect.value = patch.algorithm;
  }
  updateRules(patch);
  lastAppliedSuggestion = { ...patch };
  player.play();
  updateSim({ running: true });
}

function makeNoPathSignature(){
  return [
    grid.cols,
    grid.rows,
    grid.cells.join(','),
    grid.start.x, grid.start.y,
    grid.goal.x, grid.goal.y,
    rules.algorithm,
    rules.allowDiagonal ? '1' : '0',
    rules.useWeights ? '1' : '0',
  ].join('|');
}

function clearNoPathUi(){
  noPathOverlay = null;
  whatIfResults = [];
  latestNoPathSignature = null;
  displayedNoPathSignature = null;
  dismissedNoPathSignature = null;
  lastAppliedSuggestion = null;
  hideNoPathToast();
  if (noPathHelpBtn) noPathHelpBtn.disabled = true;
}

function snapshotCurrentSetup(){
  const base = { version: 1, ...grid.toJSON() };
  base.cells = base.cells.slice();
  return {
    grid: base,
    rules: {
      algorithm: rules.algorithm,
      allowDiagonal: !!rules.allowDiagonal,
      useWeights: !!rules.useWeights,
    },
  };
}

function applyRulesConfig(config){
  if (!config) return;
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(config, 'algorithm')){
    algoSelect.value = config.algorithm;
    patch.algorithm = config.algorithm;
  }
  if (Object.prototype.hasOwnProperty.call(config, 'allowDiagonal')){
    allowDiagonal.checked = config.allowDiagonal;
    patch.allowDiagonal = config.allowDiagonal;
  }
  if (Object.prototype.hasOwnProperty.call(config, 'useWeights')){
    useWeights.checked = config.useWeights;
    patch.useWeights = config.useWeights;
  }
  if (Object.keys(patch).length){
    updateRules(patch);
  }
}

function updateTutorialUi(step){
  if (!step) return;
  if (tutorialTitle) tutorialTitle.textContent = step.title;
  if (tutorialBody) tutorialBody.textContent = step.description;
  if (tutorialBulletList){
    tutorialBulletList.innerHTML = '';
    step.bullets?.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      tutorialBulletList.appendChild(li);
    });
  }
  if (tutorialProgress){
    tutorialProgress.textContent = `${tutorialState.index + 1} / ${TUTORIAL_STEPS.length}`;
  }
  if (tutorialPrev) tutorialPrev.disabled = tutorialState.index === 0;
  if (tutorialNext){
    tutorialNext.textContent = tutorialState.index === TUTORIAL_STEPS.length - 1 ? '완료' : '다음 단계';
  }
}

function loadTutorialStep(index){
  const step = TUTORIAL_STEPS[index];
  if (!step) return;
  tutorialState.index = index;
  const newGrid = gridFromJson(step.level);
  resetForNewGrid(newGrid);
  applyRulesConfig(step.rules);
  updateTutorialUi(step);
}

function openTutorialModal(){
  if (!tutorialModal) return;
  tutorialPreviouslyFocused = captureActiveElement();
  tutorialModal.hidden = false;
  tutorialModal.classList.add('open');
  if (!focusElement(tutorialNext) && !focusElement(tutorialPrev)){
    if (!focusElement(tutorialClose)){
      const [firstFocusable] = getFocusableElements(tutorialModal);
      focusElement(firstFocusable);
    }
  }
  activateFocusTrap(tutorialModal);
}

function closeTutorialModal(restore = true){
  if (!tutorialModal) return;
  tutorialModal.classList.remove('open');
  tutorialModal.hidden = true;
  deactivateFocusTrap(tutorialModal);
  if (restore && tutorialState.saved){
    const restoredGrid = gridFromJson(tutorialState.saved.grid);
    resetForNewGrid(restoredGrid);
    applyRulesConfig(tutorialState.saved.rules);
  }
  tutorialState = { active: false, index: 0, saved: null };
  if (tutorialPreviouslyFocused && document.contains(tutorialPreviouslyFocused)){
    focusElement(tutorialPreviouslyFocused);
  }
  tutorialPreviouslyFocused = null;
}

function startTutorial(){
  if (!tutorialModal) return;
  tutorialState = { active: true, index: 0, saved: snapshotCurrentSetup() };
  loadTutorialStep(0);
  openTutorialModal();
}

function tutorialNextStep(){
  if (!tutorialState.active) return;
  if (tutorialState.index >= TUTORIAL_STEPS.length - 1){
    closeTutorialModal(true);
    return;
  }
  loadTutorialStep(tutorialState.index + 1);
}

function tutorialPrevStep(){
  if (!tutorialState.active) return;
  if (tutorialState.index === 0) return;
  loadTutorialStep(tutorialState.index - 1);
}

function initOnboarding(){
  if (!onboardingOverlay) return;
  const dismissed = localStorage.getItem('onboardingDismissed') === 'true';
  if (dismissed) return;
  onboardingPreviouslyFocused = captureActiveElement();
  onboardingOverlay.hidden = false;
  onboardingOverlay.classList.add('visible');
  if (!focusElement(onboardingClose)){
    const [firstFocusable] = getFocusableElements(onboardingOverlay);
    focusElement(firstFocusable);
  }
  activateFocusTrap(onboardingOverlay);
}

function closeOnboarding(){
  if (!onboardingOverlay) return;
  if (onboardingSkip?.checked){
    try {
      localStorage.setItem('onboardingDismissed', 'true');
    } catch (err){
      console.warn('Failed to persist onboarding dismissal', err);
    }
  }
  onboardingOverlay.classList.remove('visible');
  onboardingOverlay.hidden = true;
  deactivateFocusTrap(onboardingOverlay);
  if (onboardingPreviouslyFocused && document.contains(onboardingPreviouslyFocused)){
    focusElement(onboardingPreviouslyFocused);
  }
  onboardingPreviouslyFocused = null;
}

function downloadLevelJson(){
  const { url, filename, revoke, json } = exportLevel(grid);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => revoke(), 0);
  if (levelJsonInput){
    levelJsonInput.value = json;
  }
  setIoMessage('레벨을 저장했어요.');
}

async function copyLevelJson(){
  const { json } = exportLevel(grid);
  if (navigator.clipboard?.writeText){
    try {
      await navigator.clipboard.writeText(json);
      setIoMessage('클립보드에 JSON을 복사했어요.');
    } catch (err){
      setIoMessage('복사에 실패했어요: ' + err.message, true);
    }
  } else if (levelJsonInput){
    levelJsonInput.value = json;
    setIoMessage('복사 기능이 없어 텍스트 영역에 넣어뒀어요.');
  }
  if (levelJsonInput && !levelJsonInput.value){
    levelJsonInput.value = json;
  }
}

function importLevelObject(obj){
  const { ok, errors, warnings } = validateLevelJson(obj);
  if (!ok){
    setIoMessage(errors.join(' / '), true);
    return;
  }
  try {
    const newGrid = gridFromJson(obj);
    resetForNewGrid(newGrid);
    if (warnings.length){
      setIoMessage('불러왔지만 주의: ' + warnings.join(' / '));
    } else {
      setIoMessage('레벨을 불러왔어요.');
    }
  } catch (err){
    setIoMessage('레벨을 불러오지 못했어요: ' + err.message, true);
  }
}

function importLevelFromText(text){
  if (!text){
    setIoMessage('불러올 JSON 텍스트가 없어요.', true);
    return;
  }
  let obj;
  try {
    obj = JSON.parse(text);
  } catch (err){
    setIoMessage('JSON 파싱 오류: ' + err.message, true);
    return;
  }
  importLevelObject(obj);
}

function setBrushByIndex(idx){
  if (idx < 0 || idx >= brushOrder.length) return;
  setCurrentBrush(brushOrder[idx]);
}

function setCurrentBrush(value){
  currentBrush = value;
  brushRadios.forEach(radio => {
    radio.checked = radio.value === value;
  });
}

// 캔버스 편집(드래그 페인트)
canvas.addEventListener('mousedown', e => { painting = true; handlePaint(e); });
canvas.addEventListener('mousemove', e => { if (painting) handlePaint(e); });
window.addEventListener('mouseup', ()=> painting=false);
function handlePaint(e){
  const pos = renderer.pickCell(e.clientX, e.clientY);
  applyBrush(pos, currentBrush);
}

// UI 바인딩
algoSelect.addEventListener('change', e => updateRules({ algorithm: e.target.value }));
allowDiagonal.addEventListener('change', e => updateRules({ allowDiagonal: e.target.checked }));
useWeights.addEventListener('change', e => updateRules({ useWeights: e.target.checked }));

playBtn.addEventListener('click', ()=>{
  player.play();
  updateSim({ running: true });
});
pauseBtn.addEventListener('click', ()=>{
  player.pause();
  updateSim({ running: false });
});
stepBtn.addEventListener('click', ()=>{
  player.step();
  updateSim({ running: false });
});
resetBtn.addEventListener('click', ()=> {
  player.reset();
  updateSim({ running: false });
  cursor = createCursor();
  draw();
});

speedRange.addEventListener('input', e => {
  const v = +e.target.value;
  speedVal.textContent = v;
  updateSim({ fps: v });
});

showVisited.addEventListener('change', draw);
showFrontier.addEventListener('change', draw);
showPath.addEventListener('change', draw);
showGridLines.addEventListener('change', draw);

// 브러시 라디오
brushRadios.forEach(r => {
  r.addEventListener('change', e => setCurrentBrush(e.target.value));
});

setCurrentBrush(currentBrush);

// 그리드 크기 변경
resizeBtn.addEventListener('click', ()=>{
  const cols = +colsInput.value|0;
  const rows = +rowsInput.value|0;
  resetForNewGrid(new Grid(cols, rows));
});

// 샘플 레벨
function populateSamples(){
  SAMPLE_LEVELS.forEach(lvl=>{
    const opt = document.createElement('option');
    opt.value = lvl.id; opt.textContent = lvl.name;
    sampleLevelSel.appendChild(opt);
  });
}

loadLevelBtn.addEventListener('click', ()=>{
  const id = sampleLevelSel.value;
  const entry = SAMPLE_LEVELS.find(l => l.id===id);
  if (!entry){ stMsg.textContent='샘플을 선택하세요.'; return; }
  grid = entry.build();
  resetForNewGrid(grid);
});

// 랜덤/클리어
randomMapBtn.addEventListener('click', ()=>{
  // 먼저 비우고 벽 무작위
  for (let y=0;y<grid.rows;y++){
    for (let x=0;x<grid.cols;x++){
      grid.set(x,y, Cell.EMPTY);
    }
  }
  ensureStartGoal();
  randomWalls(grid, 0.28);
  ensureStartGoal();
  player.reset();
  updateSim({ running: false });
  cursor = createCursor();
  draw();
});

clearMapBtn.addEventListener('click', ()=>{
  for (let y=0;y<grid.rows;y++){
    for (let x=0;x<grid.cols;x++){
      grid.set(x,y, Cell.EMPTY);
    }
  }
  grid.set(1,1, Cell.START);
  grid.set(grid.cols-2, grid.rows-2, Cell.GOAL);
  player.reset();
  updateSim({ running: false });
  cursor = createCursor();
  draw();
});

exportLevelBtn.addEventListener('click', downloadLevelJson);
copyLevelBtn.addEventListener('click', copyLevelJson);
importLevelInput.addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    importLevelFromText(String(reader.result));
    importLevelInput.value = '';
  };
  reader.onerror = () => {
    setIoMessage('파일을 읽지 못했어요.', true);
  };
  reader.readAsText(file);
});

applyLevelJsonBtn.addEventListener('click', ()=>{
  const text = levelJsonInput.value.trim();
  importLevelFromText(text);
});

clearJsonInputBtn.addEventListener('click', ()=>{
  levelJsonInput.value = '';
  setIoMessage('입력창을 비웠어요.');
});

noPathToastClose?.addEventListener('click', () => {
  hideNoPathToast();
  if (latestNoPathSignature){
    dismissedNoPathSignature = latestNoPathSignature;
  }
  displayedNoPathSignature = null;
});

noPathHelpBtn?.addEventListener('click', () => {
  if (!whatIfResults.length) return;
  renderNoPathToast(whatIfResults);
  showNoPathToast(false);
  if (latestNoPathSignature){
    displayedNoPathSignature = latestNoPathSignature;
  }
});

noPathToast?.addEventListener('mouseenter', clearNoPathToastTimer);
noPathToast?.addEventListener('focusin', clearNoPathToastTimer);
noPathToast?.addEventListener('mouseleave', () => {
  if (!noPathToast.hidden && noPathToast.dataset.autoshow === '1'){
    startNoPathToastTimer();
  }
});
noPathToast?.addEventListener('focusout', () => {
  if (!noPathToast.hidden && noPathToast.dataset.autoshow === '1'){
    const active = document.activeElement;
    if (!noPathToast.contains(active)){
      startNoPathToastTimer();
    }
  }
});

tutorialStartBtn?.addEventListener('click', startTutorial);
tutorialClose?.addEventListener('click', () => closeTutorialModal(true));
tutorialPrev?.addEventListener('click', () => tutorialPrevStep());
tutorialNext?.addEventListener('click', () => tutorialNextStep());
tutorialModal?.addEventListener('click', event => {
  if (event.target === tutorialModal){
    closeTutorialModal(true);
  }
});

onboardingClose?.addEventListener('click', closeOnboarding);
onboardingOverlay?.addEventListener('click', event => {
  if (event.target === onboardingOverlay){
    closeOnboarding();
  }
});

// 초기 그리기
window.addEventListener('resize', ()=> { renderer.resizeToFit(); draw(); });
window.addEventListener('keydown', handleKeyDown);
initOnboarding();
draw();
