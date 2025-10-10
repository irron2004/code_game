import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../store.js';

describe('createStore', () => {
  it('provides get/set/update helpers', () => {
    const store = createStore({ count: 1, flag: false });
    expect(store.get()).toEqual({ count: 1, flag: false });

    const spy = vi.fn();
    const unsubscribe = store.subscribe(spy);
    expect(spy).toHaveBeenCalledWith({ count: 1, flag: false });

    store.set({ flag: true });
    expect(store.get()).toEqual({ count: 1, flag: true });
    expect(spy).toHaveBeenLastCalledWith({ count: 1, flag: true });

    store.update(state => ({ ...state, count: state.count + 4 }));
    expect(store.get()).toEqual({ count: 5, flag: true });
    expect(spy).toHaveBeenLastCalledWith({ count: 5, flag: true });

    unsubscribe();
    store.set({ flag: false });
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('clones initial state so external mutations do not leak', () => {
    const original = { nested: { value: 1 } };
    const store = createStore(original);
    original.nested.value = 99;
    expect(store.get().nested.value).toBe(1);
  });
});
