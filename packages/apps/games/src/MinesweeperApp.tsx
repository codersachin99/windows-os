import {useEffect,useRef,useState,type MouseEvent} from "react";
import {
  emptyMineStatistics,persistMineStatistics,readMineStatistics,
  sourceMineRoundStarted,sourceMineRoundWon,sourceMineWinPercentage,
  type SourceMineStatsLevel
} from "./mineStatistics";
import {legacyMineArtwork,legacyMineAudio} from "@windows-os/assets";
import {SourceChildWindow} from "@windows-os/ui/child-window";
import {
  SourceMineBoard,sourceGenerateMineArray,sourceMineShouldStartTimer,
  sourceMineAdvancedOptions,SOURCE_MINE_BEGINNER,
  SOURCE_MINE_INTERMEDIATE,SOURCE_MINE_CELL_FLAG,SOURCE_MINE_CELL_STATE,
  type SourceMineOptions,type SourceMineCell
} from "./minesweeper";
import "./MinesweeperApp.css";

export interface MinesweeperAppProps {
  onClose():void;
  parentWindowId:string;
  parentMinimized?:boolean;
  fullscreen?:boolean;
  onFullscreenChange?(fullscreen:boolean):void;
}
type Level=0|1|2;
type Result=0|-1|1;
/** Source beginner/intermediate are fixed. Advanced holds its current
 * viewport-derived size until a new level is selected, as in Vue 245c. */
const optionsFor=(level:0|1):SourceMineOptions=>
  level===0?SOURCE_MINE_BEGINNER:SOURCE_MINE_INTERMEDIATE;
function newBoard(options:SourceMineOptions):SourceMineBoard{
  return new SourceMineBoard(sourceGenerateMineArray(options));
}
function sourceSafeOpenCount(grid:readonly (readonly SourceMineCell[])[]):number{
  return grid.reduce((count,row)=>count+row.filter(cell=>
    cell.state===SOURCE_MINE_CELL_STATE.OPEN&&!cell.isMine).length,0);
}

function playSourceGameAudio(audio:HTMLAudioElement|null):void{
  if(!audio)return;
  try{
    audio.currentTime=0;
    void audio.play().catch(()=>{/* Browser autoplay restrictions are nonfatal. */});
  }catch{/* Missing or disabled sound hardware must not break gameplay. */}
}

/** Source 9538 Board + 245c game rules, result and stats UI.
 * Original sprites are imported; audio, true static child windows,
 * Advanced layout and full pixel parity remain pending. */
export function MinesweeperApp({
  onClose,parentWindowId,parentMinimized=false,fullscreen=false,onFullscreenChange
}:MinesweeperAppProps){
  const [level,setLevel]=useState<Level>(0);
  const [options,setOptions]=useState<SourceMineOptions>(SOURCE_MINE_BEGINNER);
  const advancedViewport=useRef<HTMLDivElement|null>(null);
  const [board,setBoard]=useState(()=>newBoard(SOURCE_MINE_BEGINNER));
  const [grid,setGrid]=useState(()=>board.grid());
  const [result,setResult]=useState<Result>(0);
  const [elapsed,setElapsed]=useState(0);
  const [started,setStarted]=useState(false);
  const [flagMode,setFlagMode]=useState(false);
  const [gameMenu,setGameMenu]=useState(false);
  const [roundEnded,setRoundEnded]=useState(false);
  const [statsOpen,setStatsOpen]=useState(false);
  const [resetConfirm,setResetConfirm]=useState(false);
  const [statLevel,setStatLevel]=useState<SourceMineStatsLevel>(0);
  const [stats,setStats]=useState(readMineStatistics);
  const resultTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  const bgmRef=useRef<HTMLAudioElement|null>(null);
  const sfxRef=useRef<HTMLAudioElement|null>(null);
  useEffect(()=>{persistMineStatistics(stats);},[stats]);
  // Pinned 245c mounted() calls newGame(), attempting to play this track.
  useEffect(()=>{playSourceGameAudio(bgmRef.current);},[]);
  useEffect(()=>()=>{
    if(resultTimeout.current!==null)clearTimeout(resultTimeout.current);
  },[]);
  useEffect(()=>{
    if(!started||result!==0)return;
    const interval=setInterval(()=>setElapsed(value=>value+1),1000);
    return ()=>clearInterval(interval);
  },[started,result]);
  const reset=(chosen:Level=level,sourceOptions?:SourceMineOptions)=>{
    if(resultTimeout.current!==null)clearTimeout(resultTimeout.current);
    resultTimeout.current=null;
    const nextOptions=sourceOptions??(chosen===2?options:optionsFor(chosen));
    const next=newBoard(nextOptions);
    playSourceGameAudio(bgmRef.current);
    setLevel(chosen);setOptions(nextOptions);
    setBoard(next);setGrid(next.grid());
    setResult(0);setRoundEnded(false);setElapsed(0);setStarted(false);
    setFlagMode(false);setGameMenu(false);setStatsOpen(false);
    setResetConfirm(false);
  };
  const selectLevel=(chosen:Level)=>{
    setGameMenu(false);
    if(chosen===2){
      // Original WindowMain receives fullscreen=true before its watcher
      // measures scrollWidth/scrollHeight for Advanced.
      if(!onFullscreenChange)return;
      setLevel(2);
      onFullscreenChange(true);
      return;
    }
    if(level===2)onFullscreenChange?.(false);
    reset(chosen);
  };
  useEffect(()=>{
    if(level!==2||!fullscreen)return;
    const measure=advancedViewport.current;
    if(!measure)return;
    const sized=sourceMineAdvancedOptions(measure.clientWidth,measure.clientHeight);
    reset(2,sized);
    // Recompute once upon fullscreen transition, not on every board click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[level,fullscreen]);
  const finish=(outcome:Exclude<Result,0>)=>{
    if(outcome===-1)playSourceGameAudio(sfxRef.current);
    setStarted(false);setRoundEnded(true);
    // Source 245c schedules its child result window one second after the
    // board has ended, while revealing all mine images immediately on loss.
    resultTimeout.current=setTimeout(()=>{
      setResult(outcome);resultTimeout.current=null;
    },1000);
  };
  const closeGame=()=>{
    if(resultTimeout.current!==null)clearTimeout(resultTimeout.current);
    resultTimeout.current=null;onClose();
  };
  const flag=(x:number,y:number)=>{
    if(result!==0||roundEnded||statsOpen||resetConfirm)return;
    board.cycleCellFlag(x,y);
    setGrid(board.grid());
  };
  const open=(x:number,y:number)=>{
    if(result!==0||roundEnded||statsOpen||resetConfirm)return;
    if(flagMode){flag(x,y);return;}
    const chosen=board.cell(x,y);
    if(!chosen||chosen.state===SOURCE_MINE_CELL_STATE.OPEN||
      chosen.flag!==SOURCE_MINE_CELL_FLAG.NONE)return;
    let active=board;
    const pristine=sourceMineShouldStartTimer(board.state());
    const recorded=pristine?sourceMineRoundStarted(stats,level):stats;
    if(pristine)setStats(recorded);
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
    if(chosen.isMine){
      // Original source explicitly reveals every mine on a lost board.
      setGrid(next.map(row=>row.map(cell=>cell.isMine?
        {...cell,state:SOURCE_MINE_CELL_STATE.OPEN}:cell)));
      finish(-1);
      return;
    }
    setGrid(next);
    // Source 245c counts opened safe cells separately from 9538.Board.WON,
    // which also requires correctly flagged mines. Preserve the UI rule.
    if(sourceSafeOpenCount(next)===options.rows*options.cols-options.mines){
      setStats(sourceMineRoundWon(recorded,level,elapsed,Date.now()));
      finish(1);
    }
  };
  const flagged=grid.flat().filter(cell=>cell.flag===SOURCE_MINE_CELL_FLAG.EXCLAMATION).length;
  const remaining=options.mines-flagged;
  const status=result===1?"You won!":result===-1?"Game over":"";
  return <section className="windows-minesweeper" data-test-minesweeper="">
    <nav className="windows-minesweeper__menubar" aria-label="Minesweeper menus">
      <button type="button" aria-expanded={gameMenu}
        disabled={statsOpen||result!==0}
        onClick={()=>setGameMenu(v=>!v)}>Game</button>
      <button type="button" disabled>Help</button>
      {gameMenu&&<div className="windows-minesweeper__menu" role="menu">
        <button type="button" role="menuitem" onClick={()=>reset()}>New Game</button>
        <button type="button" role="menuitemradio" aria-checked={level===0}
          onClick={()=>selectLevel(0)}>Beginner</button>
        <button type="button" role="menuitemradio" aria-checked={level===1}
          onClick={()=>selectLevel(1)}>Intermediate</button>
        <button type="button" role="menuitemradio" aria-checked={level===2}
          disabled={!onFullscreenChange}
          onClick={()=>selectLevel(2)}>Advanced</button>
        <button type="button" role="menuitem" onClick={()=>{
          setGameMenu(false);setStatLevel(level);setStatsOpen(true);
        }}>Statistics</button>
        <button type="button" role="menuitem" onClick={closeGame}>Exit</button>
      </div>}
    </nav>
    <div className="windows-minesweeper__stage">
      <div className="windows-minesweeper__advanced-viewport"
        ref={advancedViewport} data-test-minesweeper-advanced-viewport="" />
      <div className="windows-minesweeper__source-grid">
      <div className="windows-minesweeper__board minesweeper__grid"
        role="group" aria-label="Minesweeper grid"
        data-test-minesweeper-level={level}
        data-test-minesweeper-rows={options.rows}
        data-test-minesweeper-cols={options.cols}
        style={{gridTemplateColumns:`repeat(${options.cols},21px)`}}>
        {grid.map((row,y)=>row.map((cell,x)=>{
          const openCell=cell.state===SOURCE_MINE_CELL_STATE.OPEN;
          const mine=openCell&&cell.isMine;
          const content=mine?"":!openCell?
            cell.flag===SOURCE_MINE_CELL_FLAG.EXCLAMATION?"F":
            cell.flag===SOURCE_MINE_CELL_FLAG.QUESTION?"?":""
            :cell.numAdjacentMines||"";
          const label=`Row ${y+1} column ${x+1} ${mine?"mine":
            openCell?"open":cell.flag===SOURCE_MINE_CELL_FLAG.EXCLAMATION?
            "flagged":cell.flag===SOURCE_MINE_CELL_FLAG.QUESTION?"question":"covered"}`;
          return <button key={x+"-"+y} type="button"
            disabled={roundEnded||result!==0||statsOpen}
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

        <div className="windows-minesweeper__scorebar minesweeper__stats">
          <img className="windows-minesweeper__stats-icon" src={legacyMineArtwork.timer}
            alt="" width={30} height={30}/>
          <output data-test-minesweeper-seconds="" aria-label="Elapsed seconds">{elapsed}</output>
          <output data-test-minesweeper-total-mines="" aria-label="Total mines">{options.mines}</output>
          <img className="windows-minesweeper__stats-icon" src={legacyMineArtwork.mine}
            alt="" width={30} height={30}/>
        </div>
      </div>
      <div className="windows-minesweeper__controls">
        <button type="button" className="windows-minesweeper__restart"
          aria-label="New Game" disabled={statsOpen||result!==0}
          onClick={()=>reset()}>New game</button>
        <label><input type="checkbox" checked={flagMode}
          disabled={statsOpen||result!==0||roundEnded}
          onChange={event=>setFlagMode(event.target.checked)}
          data-test-minesweeper-flag-mode=""/>Flag mode (touch)</label>
        <output data-test-minesweeper-remaining="" aria-label="Mines remaining">{remaining}</output>
        <span role="status" data-test-minesweeper-result="">{status}</span>
      </div>
    </div>
    {result!==0?<SourceChildWindow id="minesweeper-result"
      parentWindowId={parentWindowId} hidden={parentMinimized}
      title={result===1?"Games won":"Games lost"} width={280} onClose={closeGame}>
      <section className="windows-minesweeper__dialog"
        data-test-minesweeper-result-dialog="">
        <p>{result===1?"Congratulations, you won the game!":
          "Sorry you lost this game. Better luck next time!"}</p>
        <p>Time: {elapsed} Seconds</p>
        <footer>
          <button type="button" onClick={closeGame}>Exit</button>
          <button type="button" className="is-default" data-child-autofocus=""
            onClick={()=>reset()}>Play again</button>
        </footer>
      </section>
    </SourceChildWindow>:null}
    {statsOpen?<SourceChildWindow id="minesweeper-stats"
      parentWindowId={parentWindowId} hidden={parentMinimized}
      title="Minesweeper Statistics" width={260}
      onClose={()=>{
        if(resetConfirm)setResetConfirm(false);
        else setStatsOpen(false);
      }}>
      <section className="windows-minesweeper__dialog windows-minesweeper__dialog--stats"
        data-test-minesweeper-statistics="">
        <label className="windows-minesweeper__stats-level">Difficulty
          <select value={statLevel}
            onChange={event=>setStatLevel(Number(event.target.value) as SourceMineStatsLevel)}>
            <option value={0}>Beginner</option>
            <option value={1}>Intermediate</option>
            <option value={2} disabled={!onFullscreenChange}>Advanced</option>
          </select>
        </label>
        <fieldset><legend>Best times</legend>
          {stats[statLevel].scores.length?<table><tbody>
            {stats[statLevel].scores.map((score,index)=><tr key={index}>
              <td>{score.time} Seconds</td>
              <td>{new Date(score.date).toLocaleDateString()}</td>
            </tr>)}
          </tbody></table>:null}
        </fieldset>
        <p data-test-mine-games-played="">Games played: {stats[statLevel].total}</p>
        <p data-test-mine-games-won="">Games won: {stats[statLevel].won}</p>
        <p data-test-mine-win-percentage="">Win percentage: {
          sourceMineWinPercentage(stats[statLevel])}</p>
        <footer>
          <button type="button" className="is-default" data-child-autofocus=""
            onClick={()=>setStatsOpen(false)}>Close</button>
          <button type="button" onClick={()=>setResetConfirm(true)}>Reset</button>
        </footer>
      </section>
      {resetConfirm?<div className="windows-minesweeper__overlay windows-minesweeper__overlay--confirm">
        <section className="windows-minesweeper__dialog" role="alertdialog"
          aria-modal="true" aria-label="Reset statistics"
          data-test-minesweeper-reset-confirm=""
          onKeyDown={event=>{
            if(event.key==="Escape"){
              event.preventDefault();event.stopPropagation();setResetConfirm(false);
            }
          }}>
          <header>Reset statistics</header>
          <p>Reset all Minesweeper statistics?</p>
          <footer>
            <button type="button" onClick={()=>setResetConfirm(false)}>Cancel</button>
            <button type="button" className="is-default" onClick={()=>{
              setStats(emptyMineStatistics());setResetConfirm(false);
            }}>Reset</button>
          </footer>
        </section>
      </div>:null}
    </SourceChildWindow>:null}
    <audio ref={bgmRef} src={legacyMineAudio.newGame}
      data-test-minesweeper-bgm="" preload="auto"/>
    <audio ref={sfxRef} src={legacyMineAudio.lose}
      data-test-minesweeper-sfx="" preload="auto"/>
  </section>;
}
