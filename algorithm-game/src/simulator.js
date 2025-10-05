// simulator.js
import { bfs, dijkstra, aStar } from './algorithms.js';

export class Simulator {
  constructor(grid, rules){
    this.grid = grid;
    this.rules = rules;
    this.reset();
  }

  buildGenerator(){
    const { algorithm } = this.rules;
    if (algorithm === 'BFS')       return bfs(this.grid, this.rules);
    if (algorithm === 'Dijkstra')  return dijkstra(this.grid, this.rules);
    if (algorithm === 'AStar')     return aStar(this.grid, this.rules);
    throw new Error('Unknown algorithm');
  }

  reset(){
    this.gen = this.buildGenerator();
    this.state = null;
    this.done = false;
    this.reached = false;
  }

  step(){
    if (this.done) return this.state;
    const n = this.gen.next();
    if (n && !n.done) {
      this.state = n.value;
      this.done = !!this.state?.done;
      this.reached = !!this.state?.reached;
    } else if (n.done) {
      // 제너레이터가 종료 형태로 끝난 경우도 처리
      const v = n.value ?? this.state;
      if (v) {
        this.state = v;
        this.done = !!v.done;
        this.reached = !!v.reached;
      } else {
        this.done = true;
      }
    }
    return this.state;
  }
}

export class Player {
  constructor(sim, onUpdate){
    this.sim = sim;
    this.onUpdate = onUpdate;
    this.fps = 20;
    this._timer = null;
  }
  setFPS(fps){ this.fps = Math.max(1, Math.min(120, fps|0)); if(this._timer){ this.play(); } }
  play(){
    this.pause();
    const interval = 1000 / this.fps;
    this._timer = setInterval(()=>{
      const s = this.sim.step();
      this.onUpdate?.(s);
      if (this.sim.done) this.pause();
    }, interval);
  }
  pause(){ if (this._timer){ clearInterval(this._timer); this._timer = null; } }
  step(){ this.pause(); const s = this.sim.step(); this.onUpdate?.(s); }
  reset(){ this.pause(); this.sim.reset(); this.onUpdate?.(null); }
  isPlaying(){ return this._timer !== null; }
}
