import { describe, it, expect } from 'vitest';
import { Grid, Cell } from '../grid.js';
import { validateLevelJson, gridFromJson } from '../level_io.js';

function makeBaseLevel(){
  return {
    version: 1,
    cols: 4,
    rows: 3,
    start: { x: 0, y: 0 },
    goal: { x: 3, y: 2 },
    cells: Array.from({ length: 12 }, (_, idx) => (idx === 0 ? Cell.START : idx === 11 ? Cell.GOAL : Cell.EMPTY)),
  };
}

describe('validateLevelJson', () => {
  it('accepts well-formed payloads', () => {
    const payload = makeBaseLevel();
    const result = validateLevelJson(payload);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('warns when start and goal overlap', () => {
    const payload = makeBaseLevel();
    payload.goal = { ...payload.start };
    const result = validateLevelJson(payload);
    expect(result.ok).toBe(true);
    expect(result.warnings).toContain('start와 goal이 동일합니다. 필요한 경우 위치를 조정해 주세요.');
  });

  it('rejects when cells length mismatches', () => {
    const payload = makeBaseLevel();
    payload.cells = payload.cells.slice(0, -1);
    const result = validateLevelJson(payload);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('레벨 파일이 손상되었어요. 크기와 칸 수가 맞는지 확인해 주세요.');
  });

  it('rejects when coordinates leave the grid', () => {
    const payload = makeBaseLevel();
    payload.goal = { x: payload.cols, y: payload.rows };
    const result = validateLevelJson(payload);
    expect(result.ok).toBe(false);
    expect(result.errors.some(err => err.includes('goal'))).toBe(true);
  });
});

describe('gridFromJson', () => {
  it('returns a Grid instance with cloned data', () => {
    const payload = makeBaseLevel();
    const grid = gridFromJson(payload);
    expect(grid).toBeInstanceOf(Grid);
    expect(grid.cols).toBe(payload.cols);
    expect(grid.rows).toBe(payload.rows);
    expect(grid.start).toEqual(payload.start);
    expect(grid.goal).toEqual(payload.goal);
    expect(grid.cells).not.toBe(payload.cells);
    expect(grid.cells).toEqual(payload.cells);
  });

  it('throws when validation fails', () => {
    const payload = makeBaseLevel();
    payload.cells = [];
    expect(() => gridFromJson(payload)).toThrow(/크기와 칸 수/);
  });
});
