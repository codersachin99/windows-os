import {useEffect,useState,type MouseEvent} from "react";
import {legacyMineArtwork} from "@windows-os/assets";
import {
  SourceMineBoard,sourceGenerateMineArray,sourceMineShouldStartTimer,SOURCE_MINE_BEGINNER,
  SOURCE_MINE_INTERMEDIATE,SOURCE_MINE_CELL_FLAG,SOURCE_MINE_CELL_STATE,
  type SourceMineOptions,type SourceMineCell
} from "./minesweeper";
import "./MinesweeperApp.css";

export interface MinesweeperAppProps {onClose():void;}
type Level=0|1;
type Result=0|-1|1;
/** Pinned source 245c uses level 0=8x9/10, 1=12x12/30. The original
 * Advanced dynamically derives cells from actual window scroll sizes;
 * that mode is intentionally disabled until its viewport contract ports. */
const optionsFor=(level:Level):SourceMineOptions=>
  level===0?SOURCE_MINE_BEGINNER:SOURCE_MINE_INTERMEDIATE;
function newBoard(options:SourceMineOptions):SourceMineBoard{
  return new SourceMineBoard(sourceGenerateMineArray(options));
}
function sourceSafeOpenCount(grid:readonly (readonly SourceMineCell[])[]):number{
  return grid.reduce((count,row)=>count+row.filter(cell=>
    cell.state===SOURCE_MINE_CELL_STATE.OPEN&&!cell.isMine).length,0);
}

/** First playable Games port: 9538 Board + 245c source game rules.
 * Source 21px grid, first-click mine reroll, right-click flag cycle, timer,
 * and all-safe-cells winning rule. Source CSS/audio/stats and Advanced
 * responsive layout remain pending and are never claimed implemented. */
export function MinesweeperApp({onClose}:MinesweeperAppProps){
  const [level,setLevel]=useState<Level>(0);
  const [board,setBoard]=useState(()=>newBoard(SOURCE_MINE_BEGINNER));
  const [grid,setGrid]=useState(()=>board.grid());
  const [result,setResult]=useState<Result>(0);
  const [elapsed,setElapsed]=useState(0);
  const [started,setStarted]=useState(false);
  const [flagMode,setFlagMode]=useState(false);
  const [gameMenu,setGameMenu]=useState(false);
  const options=optionsFor(level);
  useEffect(()=>{
    if(!started||result!==0)return;
    const interval=setInterval(()=>setElapsed(value=>value+1),1000);
    return ()=>clearInterval(interval);
  },[started,result]);
  const reset=(chosen:Level=level)=>{
    const next=newBoard(optionsFor(chosen));
    setLevel(chosen);setBoard(next);setGrid(next.grid());
    setResult(0);setElapsed(0);setStarted(false);setFlagMode(false);
    setGameMenu(false);
  };
  const flag=(x:number,y:number)=>{
    if(result!==0)return;
    board.cycleCellFlag(x,y);
    setGrid(board.grid());
  };
  const open=(x:number,y:number)=>{
    if(result!==0)return;
    if(flagMode){flag(x,y);return;}
    const chosen=board.cell(x,y);
    if(!chosen||chosen.state===SOURCE_MINE_CELL_STATE.OPEN||
      chosen.flag!==SOURCE_MINE_CELL_FLAG.NONE)return;
    let active=board;
    const pristine=sourceMineShouldStartTimer(board.state());
    // Original Vue 245c.open() protects a mine on the first unopened
    // board cell by regenerating the entire source board once.
    if(pristine&&chosen.isMine){
      active=newBoard(options);
      setBoard(active);
      active.openCell(x,y);
      setGrid(active.grid());
      setStarted(true);
      return;
    }
    // Source 245c only starts the timer on a pristine Board. Flagging
    // first makes it IN_PROGRESS and deliberately leaves the clock stopped.
    if(pristine)setStarted(true);
    active.openCell(x,y);
    const next=active.grid();
    setGrid(next);
    if(chosen.isMine){
      setResult(-1);
      return;
    }
    // Source 245c counts opened safe cells separately from 9538.Board.WON,
    // which also requires correctly flagged mines. Preserve the UI rule.
    if(sourceSafeOpenCount(next)===options.rows*options.cols-options.mines)
      setResult(1);
  };
  const flagged=grid.flat().filter(cell=>cell.flag===SOURCE_MINE_CELL_FLAG.EXCLAMATION).length;
  const remaining=options.mines-flagged;
  const status=result===1?"You won!":result===-1?"Game over":"";
  return <section className="windows-minesweeper" data-test-minesweeper="">
    <nav className="windows-minesweeper__menubar" aria-label="Minesweeper menus">
      <button type="button" aria-expanded={gameMenu}
        onClick={()=>setGameMenu(v=>!v)}>Game</button>
      <button type="button" disabled>Help</button>
      {gameMenu&&<div className="windows-minesweeper__menu" role="menu">
        <button type="button" role="menuitem" onClick={()=>reset()}>New Game</button>
        <button type="button" role="menuitemradio" aria-checked={level===0}
          onClick={()=>reset(0)}>Beginner</button>
        <button type="button" role="menuitemradio" aria-checked={level===1}
          onClick={()=>reset(1)}>Intermediate</button>
        <button type="button" role="menuitem" disabled
          title="Original viewport-derived Advanced mode is not migrated">Advanced</button>
        <button type="button" role="menuitem" disabled>Statistics</button>
        <button type="button" role="menuitem" onClick={onClose}>Exit</button>
      </div>}
    </nav>
    <div className="windows-minesweeper__stage">
      <div className="windows-minesweeper__scorebar">
        <img className="windows-minesweeper__stats-icon" src={legacyMineArtwork.mine}
          alt="" width={21} height={21}/>
        <output data-test-minesweeper-remaining="" aria-label="Mines remaining">{remaining}</output>
        <button type="button" className="windows-minesweeper__restart"
          aria-label="New Game" onClick={()=>reset()}>
          {result===-1?":(":result===1?":D":":)"}
        </button>
        <output data-test-minesweeper-seconds="" aria-label="Elapsed seconds">{elapsed}</output>
        <img className="windows-minesweeper__stats-icon" src={legacyMineArtwork.timer}
          alt="" width={21} height={21}/>
      </div>
      <div className="windows-minesweeper__controls">
        <label><input type="checkbox" checked={flagMode}
          onChange={event=>setFlagMode(event.target.checked)}
          data-test-minesweeper-flag-mode=""/>Flag mode (touch)</label>
        <span role="status" data-test-minesweeper-result="">{status}</span>
      </div>
      <div className="windows-minesweeper__board"
        role="group" aria-label="Minesweeper grid"
        style={{gridTemplateColumns:`repeat(${options.cols},21px)`}}>
        {grid.map((row,y)=>row.map((cell,x)=>{
          const openCell=cell.state===SOURCE_MINE_CELL_STATE.OPEN;
          const mine=(openCell||result===-1)&&cell.isMine;
          const content=mine?"*":!openCell?
            cell.flag===SOURCE_MINE_CELL_FLAG.EXCLAMATION?"F":
            cell.flag===SOURCE_MINE_CELL_FLAG.QUESTION?"?":""
            :cell.numAdjacentMines||"";
          const label=`Row ${y+1} column ${x+1} ${mine?"mine":
            openCell?"open":cell.flag===SOURCE_MINE_CELL_FLAG.EXCLAMATION?
            "flagged":cell.flag===SOURCE_MINE_CELL_FLAG.QUESTION?"question":"covered"}`;
          return <button key={x+"-"+y} type="button"
            data-test-mine-cell={x+":"+y}
            aria-label={label} aria-pressed={openCell}
            className={"windows-minesweeper__cell"+
              (openCell?" is-open":"")+(mine?" is-mine":"")}
            data-adjacent={openCell?cell.numAdjacentMines:undefined}
            onClick={()=>open(x,y)}
            onContextMenu={(event:MouseEvent<HTMLButtonElement>)=>{
              event.preventDefault();flag(x,y);
            }}>{content}</button>;
        }))}
      </div>
    </div>
  </section>;
}
