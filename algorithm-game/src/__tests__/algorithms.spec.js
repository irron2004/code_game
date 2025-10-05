import { describe, it, expect } from 'vitest';
import { Grid, Cell, keyOf } from '../grid.js';
import { bfs, dijkstra, aStar } from '../algorithms.js';

function runToEnd(iter) {
  let last = null;
  for (const state of iter) {
    last = state;
  }
  return last;
}

describe('BFS', () => {
  it('finds the shortest unweighted path length', () => {
    const grid = new Grid(5, 5);
    grid.set(0, 0, Cell.START);
    grid.set(4, 4, Cell.GOAL);

    const result = runToEnd(bfs(grid, { allowDiagonal: false }));

    expect(result?.reached).toBe(true);
    expect(result?.path?.length).toBe(9);
  });
});

describe('Dijkstra', () => {
  it('prefers lower total cost even if path is longer', () => {
    const grid = new Grid(5, 3);
    grid.set(0, 1, Cell.START);
    grid.set(4, 1, Cell.GOAL);
    grid.set(1, 1, Cell.SAND);
    grid.set(2, 1, Cell.SAND);
    grid.set(3, 1, Cell.SAND);

    const result = runToEnd(dijkstra(grid, { allowDiagonal: false }));

    const goalKey = keyOf(grid.goal.x, grid.goal.y);
    const bestCost = result?.distances?.get(goalKey);

    expect(result?.reached).toBe(true);
    expect(result?.path?.length).toBe(7);
    expect(bestCost).toBeCloseTo(6);
  });
});

describe('A*', () => {
  it('uses diagonal moves when allowed to shorten the route', () => {
    const grid = new Grid(5, 5);
    grid.set(0, 0, Cell.START);
    grid.set(4, 4, Cell.GOAL);

    const result = runToEnd(aStar(grid, { allowDiagonal: true, useWeights: false }));

    expect(result?.reached).toBe(true);
    expect(result?.path?.length).toBe(5);
  });
});
