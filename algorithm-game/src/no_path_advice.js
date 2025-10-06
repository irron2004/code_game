import { Cell, keyOf } from './grid.js';
import { bfs, dijkstra, aStar } from './algorithms.js';

function analyzeReachable(grid, allowDiagonal){
  const visited = new Set();
  const queue = [];
  const start = { ...grid.start };
  const startKey = keyOf(start.x, start.y);
  visited.add(startKey);
  queue.push(start);
  const dirs4 = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];
  const dirs8 = [
    ...dirs4,
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
  ];
  const dirs = allowDiagonal ? dirs8 : dirs4;
  const boundary = new Set();

  while (queue.length){
    const { x, y } = queue.shift();
    for (const dir of dirs){
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      if (!grid.inBounds(nx, ny)) continue;
      const cell = grid.get(nx, ny);
      if (cell === Cell.WALL){
        boundary.add(keyOf(nx, ny));
        continue;
      }
      const nk = keyOf(nx, ny);
      if (!visited.has(nk)){
        visited.add(nk);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  const unreachable = new Set();
  for (let y = 0; y < grid.rows; y++){
    for (let x = 0; x < grid.cols; x++){
      const key = keyOf(x, y);
      if (grid.get(x, y) === Cell.WALL) continue;
      if (!visited.has(key)) unreachable.add(key);
    }
  }

  return { reachable: visited, boundary, unreachable };
}

function consume(generator, limit = 10000){
  let last = null;
  for (let i = 0; i < limit; i++){
    const step = generator.next();
    if (step.value) last = step.value;
    if (step.done || last?.done) return step.value ?? last;
  }
  return last;
}

function pickAlgorithm(name){
  if (name === 'BFS') return bfs;
  if (name === 'Dijkstra') return dijkstra;
  if (name === 'AStar') return aStar;
  throw new Error(`Unknown algorithm: ${name}`);
}

export function analyzeNoPath(grid, rules){
  return analyzeReachable(grid, !!rules.allowDiagonal);
}

export function computeBoundaryWalls(grid, rules){
  return analyzeReachable(grid, !!rules.allowDiagonal).boundary;
}

export function tryWhatIf(grid, rules){
  const base = {
    algorithm: rules.algorithm,
    allowDiagonal: !!rules.allowDiagonal,
    useWeights: !!rules.useWeights,
  };

  const scenarios = [
    { label: '대각선 허용 켜기', patch: { allowDiagonal: true } },
    { label: '가중치 끄기', patch: { useWeights: false } },
    { label: 'A*로 바꾸기', patch: { algorithm: 'AStar' } },
  ];

  return scenarios.map((scenario) => {
    const nextRules = { ...base, ...scenario.patch };
    const genFactory = pickAlgorithm(nextRules.algorithm);
    const finalState = consume(genFactory(grid, nextRules));
    const success = !!finalState?.reached;
    const changed = Object.keys(scenario.patch).some((key) => scenario.patch[key] !== base[key]);
    return {
      label: scenario.label,
      success,
      patch: scenario.patch,
      changed,
    };
  });
}
