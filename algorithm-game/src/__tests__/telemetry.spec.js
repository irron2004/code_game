import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Telemetry } from '../telemetry.js';

function makeStorage(){
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
    clear: () => store.clear(),
  };
}

describe('Telemetry', () => {
  let telemetry;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
    vi.stubGlobal('navigator', {
      language: 'en-US',
      sendBeacon: vi.fn(() => true),
    });
    vi.stubGlobal('window', {
      innerWidth: 1024,
      innerHeight: 768,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('sessionStorage', makeStorage());
    vi.stubGlobal('localStorage', makeStorage());
    telemetry = new Telemetry({
      endpoint: '/test/events',
      appVersion: '1.0.0',
      env: 'test',
      flushInterval: 60_000,
    });
  });

  afterEach(() => {
    telemetry?.destroy?.();
    vi.unstubAllGlobals();
  });

  it('flushes queued events via fetch', async () => {
    telemetry.track('rule_toggle', { rule: 'allowDiagonal', value: true });
    expect(telemetry.queue.length).toBe(1);
    await telemetry.flush();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [, options] = globalThis.fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    const payload = JSON.parse(options.body);
    expect(payload.events[0].type).toBe('rule_toggle');
    expect(payload.events[0].props.rule).toBe('allowDiagonal');
  });

  it('uses sendBeacon for immediate events', async () => {
    telemetry.track('algo_run_end', { result: 'success' }, { immediate: true });
    expect(globalThis.navigator.sendBeacon).toHaveBeenCalledTimes(1);
  });
});
