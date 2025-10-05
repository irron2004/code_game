// main.js
import { Grid, Cell } from './grid.js';
import { Renderer } from './renderer.js';
import { Simulator, Player } from './simulator.js';
import { SAMPLE_LEVELS, randomWalls } from './levels.js';

const el = (sel) => document.querySelector(sel);
const els = (sel) => Array.from(document.querySelectorAll(sel));

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

let grid = new Grid(+colsInput.value, +rowsInput.value);
let renderer = new Renderer(canvas, grid);
renderer.resizeToFit();

const rules = reactiveRules();
let sim = new Simulator(grid, rules);
let player = new Player(sim, onUpdate);
let cursor = createCursor();
let painting = false;
let currentBrush = 'WALL';
const brushRadios = els('input[name="brush"]');
const brushOrder = ['WALL','EMPTY','START','GOAL','FOREST','SAND'];

populateSamples();

function reactiveRules(){
  return new Proxy({
    algorithm: algoSelect.value,
    allowDiagonal: allowDiagonal.checked,
    useWeights: useWeights.checked,
  },{
    set(obj, prop, val){
      obj[prop]=val;
      // 알고리즘/규칙 변경 시 제너레이터 새로 구성
      sim = new Simulator(grid, rules);
      player = new Player(sim, onUpdate);
      draw();
      return true;
    }
  });
}

function draw(){
  renderer.gridLines = showGridLines.checked;
  renderer.draw(sim.state || null, {
    showVisited: showVisited.checked,
    showFrontier: showFrontier.checked,
    showPath: showPath.checked,
    showGridLines: showGridLines.checked,
    cursor,
  });
}

function onUpdate(state){
  draw();
  updateStatus(state);
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

function applyBrush(pos, brush){
  if (!grid.inBounds(pos.x,pos.y)) return;
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
  draw();
}

function togglePlay(){
  if (player.isPlaying()){
    player.pause();
  } else {
    player.play();
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
      applyBrush(cursor, currentBrush);
      break;
    case 'Enter':
    case 'p':
      e.preventDefault();
      togglePlay();
      break;
    case 'n':
      e.preventDefault();
      player.step();
      break;
    case 'r':
      e.preventDefault();
      player.reset();
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
  grid = newGrid;
  renderer = new Renderer(canvas, grid);
  renderer.resizeToFit();
  cursor = createCursor();
  sim = new Simulator(grid, rules);
  player = new Player(sim, onUpdate);
  draw();
}

function serializeGrid(){
  return JSON.stringify(grid.toJSON(), null, 2);
}

function downloadLevelJson(){
  const json = serializeGrid();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const timestamp = new Date().toISOString().replace(/[:T]/g,'-').split('.')[0];
  a.download = `level-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  if (levelJsonInput){
    levelJsonInput.value = json;
  }
  stMsg.textContent = 'JSON을 다운로드했습니다.';
}

async function copyLevelJson(){
  const json = serializeGrid();
  if (navigator.clipboard?.writeText){
    try {
      await navigator.clipboard.writeText(json);
      stMsg.textContent = '클립보드에 JSON을 복사했습니다.';
    } catch (err){
      stMsg.textContent = '복사에 실패했습니다: ' + err.message;
    }
  } else {
    levelJsonInput.value = json;
    stMsg.textContent = '복사 기능을 지원하지 않아 텍스트 영역에 채워졌습니다.';
  }
  if (levelJsonInput){
    levelJsonInput.value = json;
  }
}

function parseLevelJson(jsonText){
  let raw;
  try {
    raw = JSON.parse(jsonText);
  } catch (err){
    throw new Error('JSON 구문을 확인하세요. (' + err.message + ')');
  }
  if (!raw || typeof raw !== 'object') throw new Error('객체 형태의 JSON이 필요합니다.');
  const { cols, rows, cells, start, goal } = raw;
  if (!Number.isInteger(cols) || cols <= 0) throw new Error('cols 값이 올바르지 않습니다.');
  if (!Number.isInteger(rows) || rows <= 0) throw new Error('rows 값이 올바르지 않습니다.');
  if (!Array.isArray(cells) || cells.length !== cols * rows) throw new Error('cells 배열 길이가 cols*rows와 일치해야 합니다.');
  if (!cells.every(v => Number.isInteger(v) && v >= 0 && v <= 5)) throw new Error('cells 값은 0~5 사이의 정수여야 합니다.');
  if (!start || !Number.isInteger(start.x) || !Number.isInteger(start.y)) throw new Error('start 좌표가 없습니다.');
  if (!goal || !Number.isInteger(goal.x) || !Number.isInteger(goal.y)) throw new Error('goal 좌표가 없습니다.');
  if (start.x < 0 || start.x >= cols || start.y < 0 || start.y >= rows) throw new Error('start 좌표가 격자 범위를 벗어났습니다.');
  if (goal.x < 0 || goal.x >= cols || goal.y < 0 || goal.y >= rows) throw new Error('goal 좌표가 격자 범위를 벗어났습니다.');
  return raw;
}

function importLevelFromJson(jsonText){
  try {
    const parsed = parseLevelJson(jsonText);
    const newGrid = Grid.fromJSON(parsed);
    resetForNewGrid(newGrid);
    stMsg.textContent = 'JSON 레벨을 불러왔습니다.';
  } catch (err){
    stMsg.textContent = '불러오기 실패: ' + err.message;
  }
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
algoSelect.addEventListener('change', e => rules.algorithm = e.target.value);
allowDiagonal.addEventListener('change', e => rules.allowDiagonal = e.target.checked);
useWeights.addEventListener('change', e => rules.useWeights = e.target.checked);

playBtn.addEventListener('click', ()=> player.play());
pauseBtn.addEventListener('click', ()=> player.pause());
stepBtn.addEventListener('click', ()=> player.step());
resetBtn.addEventListener('click', ()=> {
  player.reset();
  cursor = createCursor();
  draw();
});

speedRange.addEventListener('input', e => {
  const v = +e.target.value;
  speedVal.textContent = v;
  player.setFPS(v);
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
    importLevelFromJson(String(reader.result));
    importLevelInput.value = '';
  };
  reader.onerror = () => {
    stMsg.textContent = '파일을 읽지 못했습니다.';
  };
  reader.readAsText(file);
});

applyLevelJsonBtn.addEventListener('click', ()=>{
  const text = levelJsonInput.value.trim();
  if (!text){
    stMsg.textContent = '적용할 JSON 텍스트가 없습니다.';
    return;
  }
  importLevelFromJson(text);
});

clearJsonInputBtn.addEventListener('click', ()=>{
  levelJsonInput.value = '';
  stMsg.textContent = '입력창을 비웠습니다.';
});

// 초기 그리기
window.addEventListener('resize', ()=> { renderer.resizeToFit(); draw(); });
window.addEventListener('keydown', handleKeyDown);
draw();
