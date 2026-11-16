/** Browser-backed adapter for source minesweeper.js 245c's e0b8 GameStats
 * lifecycle: init on the first PRISTINE open, complete on loss, win and
 * saveScore on victory, per difficulty. Storage is an explicit browser
 * adaptation rather than a claim that source account persistence is ported.
 */
export const MINE_STATISTICS_KEY="windows-os:minesweeper:guest:statistics:v1";
export type SourceMineStatsLevel=0|1|2;
export interface SourceMineScore{
  readonly time:number;
  readonly date:number;
}
export interface SourceMineLevelStats{
  readonly total:number;
  readonly won:number;
  readonly scores:readonly SourceMineScore[];
}
export type SourceMineStatistics=Readonly<Record<SourceMineStatsLevel,SourceMineLevelStats>>;
const emptyLevel=():SourceMineLevelStats=>({total:0,won:0,scores:[]});
export const emptyMineStatistics=():SourceMineStatistics=>({
  0:emptyLevel(),1:emptyLevel(),2:emptyLevel()
});
function validCount(v:unknown):v is number{
  return typeof v==="number"&&Number.isSafeInteger(v)&&v>=0;
}
export function parseMineStatistics(raw:string|null):SourceMineStatistics{
  if(!raw)return emptyMineStatistics();
  let value:unknown;
  try{value=JSON.parse(raw);}catch{return emptyMineStatistics();}
  if(!value||typeof value!=="object")return emptyMineStatistics();
  const source=value as Record<string,unknown>;
  const result=emptyMineStatistics();
  const levels:Record<SourceMineStatsLevel,SourceMineLevelStats>={...result};
  for(const level of [0,1,2] as const){
    const candidate=source[String(level)];
    if(!candidate||typeof candidate!=="object")continue;
    const row=candidate as Record<string,unknown>;
    if(!validCount(row.total)||!validCount(row.won)||row.won>row.total)continue;
    const scores=Array.isArray(row.scores)?
      row.scores.filter((entry:unknown):entry is SourceMineScore=>{
        if(!entry||typeof entry!=="object")return false;
        const score=entry as Record<string,unknown>;
        return validCount(score.time)&&validCount(score.date)&&
          Number.isFinite(new Date(score.date).getTime());
      }).slice(0,1000).map((score:SourceMineScore)=>({
        time:score.time,date:score.date
      })):[];
    levels[level]={total:row.total,won:row.won,scores};
  }
  return levels;
}
export function readMineStatistics():SourceMineStatistics{
  try{return typeof window==="undefined"?emptyMineStatistics():
    parseMineStatistics(window.localStorage.getItem(MINE_STATISTICS_KEY));}
  catch{return emptyMineStatistics();}
}
export function persistMineStatistics(data:SourceMineStatistics):void{
  try{if(typeof window!=="undefined")
    window.localStorage.setItem(MINE_STATISTICS_KEY,JSON.stringify(data));}
  catch{/* Private browsing/blocked localStorage must not prevent gameplay. */}
}
export function sourceMineRoundStarted(
  data:SourceMineStatistics,level:SourceMineStatsLevel
):SourceMineStatistics{
  const current=data[level];
  return {...data,[level]:{...current,total:current.total+1}};
}
export function sourceMineRoundWon(
  data:SourceMineStatistics,level:SourceMineStatsLevel,time:number,date:number
):SourceMineStatistics{
  if(!validCount(time)||!validCount(date))throw Error("Invalid Minesweeper score");
  const current=data[level];
  return {...data,[level]:{
    ...current,
    // A source 245c game can flag before opening, suppressing GameStats.init.
    // Never invent a corresponding played round when it was not recorded.
    won:current.won+1,
    scores:[...current.scores,{time,date}].sort((a,b)=>a.time-b.time||a.date-b.date)
  }};
}
export function sourceMineWinPercentage(data:SourceMineLevelStats):string{
  return ((data.won/(data.total||1))*100).toFixed(0)+"%";
}
