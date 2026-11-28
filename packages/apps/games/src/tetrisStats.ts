export interface TetrisScore{
  readonly level:number;readonly score:number;readonly lines:number;
}
export interface TetrisStats{
  readonly total:number;readonly completed:number;
  readonly scores:readonly TetrisScore[];
}
export const TETRIS_STATS_KEY="windows-os:tetris:guest:statistics:v1";
export const emptyTetrisStats=():TetrisStats=>({total:0,completed:0,scores:[]});
const valid=(n:unknown):n is number=>typeof n==="number"&&
  Number.isSafeInteger(n)&&n>=0;
export function loadTetrisStats():TetrisStats{
  try{
    const raw=window.localStorage.getItem(TETRIS_STATS_KEY);
    if(!raw)return emptyTetrisStats();
    const value=JSON.parse(raw) as Partial<TetrisStats>;
    if(!valid(value.total)||!valid(value.completed)||
      value.completed>value.total)return emptyTetrisStats();
    const scores=Array.isArray(value.scores)?value.scores.filter(score=>
      score&&valid(score.level)&&valid(score.score)&&valid(score.lines)
    ).slice(0,500).sort((a,b)=>b.score-a.score):[];
    return {total:value.total,completed:value.completed,scores};
  }catch{return emptyTetrisStats();}
}
export function saveTetrisStats(value:TetrisStats):void{
  try{window.localStorage.setItem(TETRIS_STATS_KEY,JSON.stringify(value));}
  catch{/* Gameplay continues if localStorage is unavailable. */}
}
export function sourceTetrisStarted(value:TetrisStats):TetrisStats{
  return {...value,total:value.total+1};
}
export function sourceTetrisFinished(value:TetrisStats,score:TetrisScore):TetrisStats{
  return {...value,completed:Math.min(value.total,value.completed+1),
    scores:[...value.scores,score].sort((a,b)=>b.score-a.score).slice(0,500)};
}
