import { describe, it, expect } from 'vitest';
import { Grid, Cell } from '../grid.js';

describe('Grid neighbors', () => {
  it('returns four orthogonal neighbors when diagonals disabled', () => {
    const grid = new Grid(3, 3);
    const result = grid.neighbors(1, 1, false, false);
    const coords = result.map(({ x, y }) => `${x},${y}`);
    expect(coords).toEqual(['2,1', '0,1', '1,2', '1,0']);
    expect(result.every(nb => nb.cost === 1)).toBe(true);
  });

  it('includes diagonal neighbors and weighted cost', () => {
    const grid = new Grid(3, 3);
    grid.set(1, 1, Cell.SAND);
    const result = grid.neighbors(0, 0, true, true);
    const target = result.find(({ x, y }) => x === 1 && y === 1);
    expect(target).toBeDefined();
    // Diagonal step should multiply terrain weight by sqrt(2)
    expect(target.cost).toBeCloseTo(Math.SQRT2 * 3, 5);
  });
});

describe('Grid serialization', () => {
  it('roundtrips through JSON', () => {
    const grid = new Grid(4, 3);
    grid.set(0, 0, Cell.START);
    grid.set(3, 2, Cell.GOAL);
    grid.set(2, 1, Cell.FOREST);

    const copy = Grid.fromJSON(grid.toJSON());

    expect(copy.cols).toBe(4);
    expect(copy.rows).toBe(3);
    expect(copy.get(2, 1)).toBe(Cell.FOREST);
    expect(copy.start).toEqual({ x: 0, y: 0 });
    expect(copy.goal).toEqual({ x: 3, y: 2 });
  });
});
