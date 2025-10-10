import { describe, it, expect } from 'vitest';
import { Grid, Cell, keyOf } from '../grid.js';
import { analyzeNoPath, computeBoundaryWalls, tryWhatIf } from '../no_path_advice.js';

function makeBlockedGrid(){
  const grid = new Grid(3, 3);
  grid.set(0, 0, Cell.START);
  grid.set(2, 2, Cell.GOAL);
  grid.set(1, 0, Cell.WALL);
  grid.set(0, 1, Cell.WALL);
  return grid;
}

describe('analyzeNoPath / computeBoundaryWalls', () => {
  it('finds boundary walls adjacent to reachable region', () => {
    const grid = makeBlockedGrid();
    const rules = { allowDiagonal: false };
    const analysis = analyzeNoPath(grid, rules);
    const boundary = computeBoundaryWalls(grid, rules);
    expect(analysis.reachable.has(keyOf(grid.start.x, grid.start.y))).toBe(true);
    expect(boundary.has(keyOf(1, 0))).toBe(true);
    expect(boundary.has(keyOf(0, 1))).toBe(true);
  });
});

describe('tryWhatIf', () => {
  it('suggests allowing diagonal movement to resolve blockage', () => {
    const grid = makeBlockedGrid();
    const baseRules = { algorithm: 'BFS', allowDiagonal: false, useWeights: true };
    const suggestions = tryWhatIf(grid, baseRules);
    const diagOption = suggestions.find(opt => opt.patch.allowDiagonal === true);
    expect(diagOption).toBeTruthy();
    expect(diagOption.success).toBe(true);
    const weightOption = suggestions.find(opt => opt.patch.useWeights === false);
    expect(weightOption?.success).toBe(false);
  });
});
