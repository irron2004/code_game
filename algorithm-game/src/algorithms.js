// algorithms.js
import { keyOf, parseKey, heuristic } from './grid.js';

class Queue {
  constructor(){ this.a=[]; this.h=0; }
  push(v){ this.a.push(v); }
  shift(){ return this.a[this.h++]; }
  get length(){ return this.a.length - this.h; }
}

class PriorityQueue {
  constructor(){ this.data=[]; }
  push(node){ this.data.push(node); this._siftUp(this.data.length-1); }
  pop(){
    if(this.data.length===0) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    if(this.data.length>0){ this.data[0]=last; this._siftDown(0); }
    return top;
  }
  _siftUp(i){
    while(i>0){
      const p=(i-1>>1);
      if(this.data[p].prio <= this.data[i].prio) break;
      [this.data[p],this.data[i]]=[this.data[i],this.data[p]];
      i=p;
    }
  }
  _siftDown(i){
    const n=this.data.length;
    while(true){
      let l=i*2+1, r=l+1, s=i;
      if(l<n && this.data[l].prio < this.data[s].prio) s=l;
      if(r<n && this.data[r].prio < this.data[s].prio) s=r;
      if(s===i) break;
      [this.data[s],this.data[i]]=[this.data[i],this.data[s]];
      i=s;
    }
  }
  get length(){ return this.data.length; }
}

function reconstructPath(cameFrom, goalKey){
  const path=[];
  let cur = goalKey;
  if (!cameFrom.has(cur)) return path;
  while(cur){
    path.push(parseKey(cur));
    cur = cameFrom.get(cur);
  }
  path.reverse();
  return path;
}

// 모든 알고리즘은 동일한 "yield 상태" 포맷으로 내보냅니다.
// { current, visited:Set<string>, frontier:Set<string>, cameFrom:Map, distances:Map, path?:[], done?:bool, reached?:bool }

export function* bfs(grid, rules){
  const startKey = keyOf(grid.start.x, grid.start.y);
  const goalKey  = keyOf(grid.goal.x, grid.goal.y);

  const q = new Queue();
  const visited = new Set([startKey]);
  const frontier = new Set([startKey]);
  const cameFrom = new Map([[startKey, null]]);
  const distances = new Map([[startKey, 0]]);
  q.push(startKey);

  while(q.length){
    const curKey = q.shift();
    frontier.delete(curKey);
    const cur = parseKey(curKey);
    if (curKey === goalKey){
      const path = reconstructPath(cameFrom, goalKey);
      yield { current:cur, visited, frontier, cameFrom, distances, path, done:true, reached:true };
      return;
    }

    for (const nb of grid.neighbors(cur.x, cur.y, rules.allowDiagonal, false /*BFS는 가중치 무시*/)){
      const nk = keyOf(nb.x, nb.y);
      if (!visited.has(nk)){
        visited.add(nk);
        frontier.add(nk);
        cameFrom.set(nk, curKey);
        distances.set(nk, (distances.get(curKey)??0) + 1);
        q.push(nk);
      }
    }

    yield { current:cur, visited, frontier, cameFrom, distances, done:false };
  }

  // 실패
  yield { current:null, visited, frontier, cameFrom, distances, path:[], done:true, reached:false };
}

export function* dijkstra(grid, rules){
  const startKey = keyOf(grid.start.x, grid.start.y);
  const goalKey  = keyOf(grid.goal.x, grid.goal.y);

  const pq = new PriorityQueue();
  const visited = new Set();
  const frontier = new Set([startKey]);
  const cameFrom = new Map([[startKey, null]]);
  const dist = new Map([[startKey, 0]]);

  pq.push({ key:startKey, prio:0 });

  while(pq.length){
    const {key:curKey} = pq.pop();
    if (visited.has(curKey)) continue;
    frontier.delete(curKey);
    visited.add(curKey);

    const cur = parseKey(curKey);
    if (curKey === goalKey){
      const path = reconstructPath(cameFrom, goalKey);
      yield { current:cur, visited, frontier, cameFrom, distances:dist, path, done:true, reached:true };
      return;
    }

    for (const nb of grid.neighbors(cur.x, cur.y, rules.allowDiagonal, true /*가중치 사용*/)){
      const nk = keyOf(nb.x, nb.y);
      const alt = (dist.get(curKey)??Infinity) + nb.cost;
      if (alt < (dist.get(nk)??Infinity)){
        dist.set(nk, alt);
        cameFrom.set(nk, curKey);
        pq.push({ key:nk, prio: alt });
        if (!visited.has(nk)) frontier.add(nk);
      }
    }

    yield { current:cur, visited, frontier, cameFrom, distances:dist, done:false };
  }

  yield { current:null, visited, frontier, cameFrom, distances:dist, path:[], done:true, reached:false };
}

export function* aStar(grid, rules){
  const startKey = keyOf(grid.start.x, grid.start.y);
  const goalKey  = keyOf(grid.goal.x, grid.goal.y);
  const goalPos  = { ...grid.goal };

  const pq = new PriorityQueue();
  const visited = new Set();
  const frontier = new Set([startKey]);
  const cameFrom = new Map([[startKey, null]]);
  const g = new Map([[startKey, 0]]);
  const f = new Map([[startKey, heuristic(grid.start, goalPos, rules.allowDiagonal)]]);

  pq.push({ key:startKey, prio: f.get(startKey) });

  while(pq.length){
    const {key:curKey} = pq.pop();
    if (visited.has(curKey)) continue;
    frontier.delete(curKey);
    visited.add(curKey);
    const cur = parseKey(curKey);

    if (curKey === goalKey){
      const path = reconstructPath(cameFrom, goalKey);
      yield { current:cur, visited, frontier, cameFrom, distances:g, path, done:true, reached:true };
      return;
    }

    for (const nb of grid.neighbors(cur.x, cur.y, rules.allowDiagonal, rules.useWeights)){
      const nk = keyOf(nb.x, nb.y);
      const tentative = (g.get(curKey)??Infinity) + nb.cost;
      if (tentative < (g.get(nk)??Infinity)){
        g.set(nk, tentative);
        const pri = tentative + heuristic({x:nb.x,y:nb.y}, goalPos, rules.allowDiagonal);
        f.set(nk, pri);
        cameFrom.set(nk, curKey);
        pq.push({ key:nk, prio: pri });
        if (!visited.has(nk)) frontier.add(nk);
      }
    }

    yield { current:cur, visited, frontier, cameFrom, distances:g, done:false };
  }

  yield { current:null, visited, frontier, cameFrom, distances:g, path:[], done:true, reached:false };
}
