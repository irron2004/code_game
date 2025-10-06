import { Grid } from './grid.js';

function isInteger(value) {
  return Number.isInteger(value);
}

function validatePoint(point, cols, rows, label) {
  if (!point || !isInteger(point.x) || !isInteger(point.y)) {
    return `${label} 좌표 형식이 올바르지 않습니다.`;
  }
  if (point.x < 0 || point.x >= cols || point.y < 0 || point.y >= rows) {
    return `${label} 좌표가 격자 범위를 벗어났습니다.`;
  }
  return null;
}

export function validateLevelJson(obj) {
  const errors = [];
  const warnings = [];

  if (typeof obj !== 'object' || obj === null) {
    errors.push('JSON 객체 구조가 필요합니다.');
    return { ok: false, errors, warnings };
  }

  if (typeof obj.version !== 'number') {
    errors.push('version이 숫자가 아닙니다. 최신 템플릿으로 다시 저장해 주세요.');
  }

  if (!isInteger(obj.cols) || obj.cols < 2) {
    errors.push('cols 값이 2 이상 정수인지 확인해 주세요.');
  }

  if (!isInteger(obj.rows) || obj.rows < 2) {
    errors.push('rows 값이 2 이상 정수인지 확인해 주세요.');
  }

  if (!Array.isArray(obj.cells)) {
    errors.push('cells 배열이 누락되었습니다.');
  }

  const total = isInteger(obj.cols) && isInteger(obj.rows) ? obj.cols * obj.rows : null;
  if (Array.isArray(obj.cells) && total !== null && obj.cells.length !== total) {
    errors.push('레벨 파일이 손상되었어요. 크기와 칸 수가 맞는지 확인해 주세요.');
  }

  if (Array.isArray(obj.cells) && obj.cells.some(v => !isInteger(v) || v < 0)) {
    errors.push('cells 배열에 올바르지 않은 값이 포함되어 있습니다.');
  }

  const startErr = validatePoint(obj.start, obj.cols, obj.rows, 'start');
  if (startErr) errors.push(startErr);

  const goalErr = validatePoint(obj.goal, obj.cols, obj.rows, 'goal');
  if (goalErr) errors.push(goalErr);

  if (!errors.length && obj.start && obj.goal && obj.start.x === obj.goal.x && obj.start.y === obj.goal.y) {
    warnings.push('start와 goal이 동일합니다. 필요한 경우 위치를 조정해 주세요.');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function gridFromJson(obj) {
  const { ok, errors } = validateLevelJson(obj);
  if (!ok) {
    throw new Error(errors.join(' / '));
  }
  const grid = new Grid(obj.cols, obj.rows);
  grid.cells = obj.cells.slice();
  grid.start = { ...obj.start };
  grid.goal = { ...obj.goal };
  return grid;
}

export function exportLevel(grid) {
  const payload = { version: 1, ...grid.toJSON() };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const filename = `level_${grid.cols}x${grid.rows}.json`;
  return { url, filename, revoke: () => URL.revokeObjectURL(url), json };
}
