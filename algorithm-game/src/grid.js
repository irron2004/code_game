// grid.js
export const Cell = Object.freeze({
  EMPTY: 0, WALL: 1, START: 2, GOAL: 3, FOREST: 4, SAND: 5,
});

export function keyOf(x, y) { return `${x},${y}`; }
export function parseKey(k) { const [x,y] = k.split(',').map(Number); return {x,y}; }

export class Grid {
  constructor(cols=20, rows=15) {
    this.cols = cols;
    this.rows = rows;
    this.cells = new Array(cols * rows).fill(Cell.EMPTY);
    this.start = { x: 1, y: 1 };
    this.goal  = { x: cols - 2, y: rows - 2 };
  }

  index(x, y) { return y * this.cols + x; }
  inBounds(x, y) { return x >= 0 && y >= 0 && x < this.cols && y < this.rows; }
  get(x, y) { return this.cells[this.index(x, y)]; }

  set(x, y, val) {
    const prev = this.get(x, y);
    if (val === Cell.START) this.start = { x, y };
    if (val === Cell.GOAL)  this.goal  = { x, y };
    // 한 칸에 두 역할이 겹치지 않게 보정
    if (val === Cell.START && this.equalPos({x,y}, this.goal)) this.goal = this.findEmptyElse({x,y});
    if (val === Cell.GOAL && this.equalPos({x,y}, this.start)) this.start = this.findEmptyElse({x,y});
    this.cells[this.index(x, y)] = val;
  }

  equalPos(a,b){ return a.x===b.x && a.y===b.y; }

  findEmptyElse(exclude) {
    // 간단한 비어있는 칸 찾기(좌상단부터)
    for (let y=0;y<this.rows;y++){
      for (let x=0;x<this.cols;x++){
        if ((exclude && x===exclude.x && y===exclude.y)) continue;
        if (this.get(x,y) === Cell.EMPTY) return {x,y};
      }
    }
    return {x:0,y:0};
  }

  isPassable(x,y, useWeights) {
    const c = this.get(x,y);
    if (c === Cell.WALL) return false;
    // 시작/목표/빈/숲/모래는 통과 가능
    return true;
  }

  terrainCost(x,y, useWeights) {
    if (!useWeights) return 1;
    const c = this.get(x,y);
    if (c === Cell.FOREST) return 2;
    if (c === Cell.SAND) return 3;
    return 1;
  }

  neighbors(x,y, allowDiagonal, useWeights) {
    const dirs4 = [
      {dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1},
    ];
    const dirs8 = [
      ...dirs4,
      {dx:1,dy:1}, {dx:1,dy:-1}, {dx:-1,dy:1}, {dx:-1,dy:-1},
    ];
    const res = [];
    const dirs = allowDiagonal ? dirs8 : dirs4;
    for (const d of dirs) {
      const nx = x + d.dx, ny = y + d.dy;
      if (!this.inBounds(nx,ny)) continue;
      if (!this.isPassable(nx,ny, useWeights)) continue;
      const isDiag = Math.abs(d.dx) + Math.abs(d.dy) === 2;
      const stepCost = (isDiag ? Math.SQRT2 : 1) * this.terrainCost(nx,ny, useWeights);
      res.push({ x:nx, y:ny, cost: stepCost });
    }
    return res;
  }

  toJSON() {
    return {
      cols: this.cols, rows: this.rows,
      start: this.start, goal: this.goal, cells: this.cells,
    };
  }

  static fromJSON(obj) {
    const g = new Grid(obj.cols, obj.rows);
    g.cells = obj.cells.slice();
    g.start = obj.start; g.goal = obj.goal;
    return g;
  }
}

// 휴리스틱(맨해튼/옥타일)
export function heuristic(a, b, allowDiagonal){
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  if (allowDiagonal) {
    // 옥타일 거리: max(dx,dy) + (sqrt2-1)*min(dx,dy)
    const F = Math.SQRT2 - 1;
    return (dx < dy) ? F*dx + dy : F*dy + dx;
  }
  return dx + dy; // 맨해튼
}
