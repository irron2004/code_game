// renderer.js
import { Cell } from './grid.js';

export class Renderer {
  constructor(canvas, grid){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.grid = grid;
    this.gridLines = true;
    this.colors = {
      wall: getCss('--wall'),
      start: getCss('--start'),
      goal: getCss('--goal'),
      forest: getCss('--forest'),
      sand: getCss('--sand'),
      visited: getCss('--visited'),
      frontier: getCss('--frontier'),
      current: getCss('--current'),
      path: getCss('--path'),
      line: getCss('--line'),
      cursor: getCss('--cursor'),
    };
    function getCss(name){
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
  }

  resizeToFit() {
    // 캔버스 비율 유지: 셀 크기 정하기
    const maxW = this.canvas.clientWidth || this.canvas.width;
    const maxH = this.canvas.clientHeight || this.canvas.height;
    const cw = Math.floor(maxW / this.grid.cols);
    const ch = Math.floor(maxH / this.grid.rows);
    const s = Math.max(8, Math.min(cw, ch)); // 최소 8px
    this.cellSize = s;
    this.canvas.width = this.grid.cols * s;
    this.canvas.height = this.grid.rows * s;
  }

  draw(state, options={}){
    const { ctx, grid } = this;
    const s = this.cellSize;
    const { cursor } = options;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    // 배경 및 셀
    for (let y=0;y<grid.rows;y++){
      for (let x=0;x<grid.cols;x++){
        const c = grid.get(x,y);
        let fill = '#fff';
        if (c === Cell.WALL) fill = this.colors.wall;
        else if (c === Cell.FOREST) fill = this.colors.forest;
        else if (c === Cell.SAND) fill = this.colors.sand;
        ctx.fillStyle = fill;
        ctx.fillRect(x*s, y*s, s, s);
      }
    }

    // 방문/프론티어
    if (options.showVisited && state?.visited){
      ctx.fillStyle = this.colors.visited;
      for (const k of state.visited){
        const [x,y] = k.split(',').map(Number);
        ctx.fillRect(x*s, y*s, s, s);
      }
    }
    if (options.showFrontier && state?.frontier){
      ctx.fillStyle = this.colors.frontier;
      for (const k of state.frontier){
        const [x,y] = k.split(',').map(Number);
        ctx.fillRect(x*s, y*s, s, s);
      }
    }

    // 시작/목표
    this.drawCell(grid.start.x, grid.start.y, this.colors.start);
    this.drawCell(grid.goal.x, grid.goal.y, this.colors.goal);

    // 경로
    if (options.showPath && state?.path && state.path.length>0){
      ctx.strokeStyle = this.colors.path;
      ctx.lineWidth = Math.max(2, s * 0.2);
      ctx.beginPath();
      const pts = state.path.map(p => ({ x: p.x*s + s/2, y: p.y*s + s/2 }));
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }

    // 현재 노드
    if (state?.current){
      this.drawCell(state.current.x, state.current.y, this.colors.current);
    }

    // 격자선
    if (options.showGridLines){
      ctx.strokeStyle = this.colors.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x=0;x<=grid.cols;x++){
        ctx.moveTo(x*s,0); ctx.lineTo(x*s,this.canvas.height);
      }
      for (let y=0;y<=grid.rows;y++){
        ctx.moveTo(0,y*s); ctx.lineTo(this.canvas.width,y*s);
      }
      ctx.stroke();
    }

    if (cursor){
      this.drawCursor(cursor.x, cursor.y);
    }
  }

  drawCell(x,y,color){
    const s = this.cellSize;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x*s, y*s, s, s);
  }

  pickCell(clientX, clientY){
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / this.cellSize);
    const y = Math.floor((clientY - rect.top) / this.cellSize);
    return { x, y };
  }

  drawCursor(x,y){
    if (!this.grid.inBounds(x,y)) return;
    const s = this.cellSize;
    const pad = Math.max(1, s * 0.08);
    this.ctx.strokeStyle = this.colors.cursor;
    this.ctx.lineWidth = Math.max(2, s * 0.18);
    this.ctx.strokeRect(x*s + pad, y*s + pad, s - pad*2, s - pad*2);
  }
}
