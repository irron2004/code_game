function deepClone(value){
  if (typeof structuredClone === 'function'){
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function createStore(initial){
  let state = deepClone(initial);
  const subscribers = new Set();

  function notify(){
    subscribers.forEach(fn => fn(state));
  }

  return {
    get(){
      return state;
    },
    set(partial){
      state = { ...state, ...partial };
      notify();
    },
    update(mutator){
      state = mutator(state);
      notify();
    },
    subscribe(fn){
      subscribers.add(fn);
      fn(state);
      return () => subscribers.delete(fn);
    },
  };
}
