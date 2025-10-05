// levels.js
import { Grid, Cell } from './grid.js';

export const SAMPLE_LEVELS = [
  {
    id: 'basic-corridor',
    name: '기본: 직선 통로',
    build: () => {
      const g = new Grid(20, 10);
      // 벽 테두리
      for (let x=0;x<g.cols;x++){ g.set(x,0,Cell.WALL); g.set(x,g.rows-1,Cell.WALL); }
      for (let y=0;y<g.rows;y++){ g.set(0,y,Cell.WALL); g.set(g.cols-1,y,Cell.WALL); }
      g.set(1,1,Cell.START);
      g.set(18,8,Cell.GOAL);
      // 일부 장애물
      for (let x=3; x<17; x++){
        if (x%3===0) g.set(x,5,Cell.WALL);
      }
      return g;
    }
  },
  {
    id: 'forest-weights',
    name: '숲 가중치 연습',
    build: () => {
      const g = new Grid(20, 12);
      g.set(1,1,Cell.START);
      g.set(18,10,Cell.GOAL);
      // 숲 지대
      for (let y=2;y<10;y++){
        for (let x=6;x<14;x++){
          if ((x+y)%2===0) g.set(x,y,Cell.FOREST);
        }
      }
      // 벽
      for (let y=0;y<g.rows;y++){ g.set(0,y,Cell.WALL); g.set(g.cols-1,y,Cell.WALL); }
      for (let x=0;x<g.cols;x++){ g.set(x,0,Cell.WALL); g.set(x,g.rows-1,Cell.WALL); }
      return g;
    }
  },
  {
    id: 'diagonal-maze',
    name: '대각선 미로',
    build: () => {
      const g = new Grid(24, 14);
      g.set(1,1,Cell.START);
      g.set(22,12,Cell.GOAL);
      for (let i=2;i<12;i++) g.set(i,i,Cell.WALL);
      for (let i=12;i<22;i++) g.set(i,24-i,Cell.WALL);
      return g;
    }
  }
];

export function randomWalls(grid, density=0.25){
  for (let y=0;y<grid.rows;y++){
    for (let x=0;x<grid.cols;x++){
      if ((x===grid.start.x && y===grid.start.y) || (x===grid.goal.x && y===grid.goal.y)) continue;
      // 경계는 조금 비워두기
      if (x===0||y===0||x===grid.cols-1||y===grid.rows-1) continue;
      if (Math.random()<density) grid.set(x,y,Cell.WALL);
    }
  }
}
