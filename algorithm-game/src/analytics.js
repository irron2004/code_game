const subscribers = new Set();

function clonePayload(payload){
  if (payload === null || typeof payload !== 'object'){
    return payload;
  }
  if (Array.isArray(payload)){
    return payload.map(clonePayload);
  }
  const result = {};
  for (const [key, value] of Object.entries(payload)){
    result[key] = clonePayload(value);
  }
  return result;
}

export function logEvent(event, payload = {}){
  const entry = {
    event,
    timestamp: new Date().toISOString(),
    payload: clonePayload(payload),
  };
  subscribers.forEach((listener) => {
    try {
      listener(entry);
    } catch (err){
      if (typeof console !== 'undefined' && console.warn){
        console.warn('[analytics] listener error', err);
      }
    }
  });
  if (typeof console !== 'undefined' && console.info){
    console.info('[analytics]', event, entry.payload);
  }
  return entry;
}

export function subscribeAnalytics(listener){
  if (typeof listener !== 'function') return () => {};
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function logRuleToggle(rule, value){
  logEvent('rule_toggle', { rule, value });
}

export function logLevelLoaded({ cols, rows, source }){
  const payload = { cols, rows };
  if (source){
    payload.source = source;
  }
  logEvent('level_loaded', payload);
}

export function logLevelSaved({ cols, rows, size, source }){
  logEvent('level_saved', {
    cols,
    rows,
    size,
    source,
    timestamp: Date.now(),
  });
}

export function logAlgoRun({ algorithm, allowDiagonal, useWeights, trigger }){
  logEvent('algo_run', { algorithm, allowDiagonal, useWeights, trigger });
}

export function logAlgoRunResult({ runId, durationMs, result, pathLength, visited, frontier, cost, algorithm, allowDiagonal, useWeights, trigger, gridCols, gridRows }){
  logEvent('algo_run_end', {
    runId,
    durationMs,
    result,
    pathLength,
    visited,
    frontier,
    cost,
    algorithm,
    allowDiagonal,
    useWeights,
    trigger,
    gridCols,
    gridRows,
  });
}

export function logNoPathDetected({ blockedCells, unreachable }){
  logEvent('no_path_detected', {
    blockedCells,
    unreachable,
  });
}
