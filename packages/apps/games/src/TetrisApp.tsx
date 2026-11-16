import {
  useEffect,useRef,useState,type CSSProperties,
  type KeyboardEvent as ReactKeyEvent,type PointerEvent as ReactPointerEvent
} from "react";
import {SourceChildWindow} from "@windows-os/ui/child-window";
import {legacyTetrisArtwork} from "@windows-os/assets";
import {SourceTetrisEngine,type SourceTetrisInput,
  type SourceTetrisSnapshot} from "./sourceTetris";
import {sourceTetrisCanvasLayout,drawSourceTetris,
  type SourceTetrisCanvasLayout} from "./sourceTetrisCanvas";
import {emptyTetrisStats,loadTetrisStats,saveTetrisStats,
  sourceTetrisStarted,sourceTetrisFinished} from "./tetrisStats";
import "./TetrisApp.css";

export interface TetrisAppProps{
  onClose():void;parentWindowId:string;parentMinimized?:boolean;
}
const initialLayout=sourceTetrisCanvasLayout(800,600);
function play(audio:HTMLAudioElement|undefined,rewind=true):void{
  if(!audio)return;
  try{if(rewind)audio.currentTime=0;void audio.play().catch(()=>{});}
  catch{/* Browser audio permission/device errors do not break the game. */}
}
export function TetrisApp({onClose,parentWindowId,parentMinimized=false}:TetrisAppProps){
  const engineRef=useRef<SourceTetrisEngine|null>(null);
  if(!engineRef.current)engineRef.current=new SourceTetrisEngine();
  const engine=engineRef.current;
  const root=useRef<HTMLElement|null>(null);
  const canvas=useRef<HTMLCanvasElement|null>(null);
  const audio=useRef<Record<string,HTMLAudioElement>>({});
  const queued=useRef<SourceTetrisInput>({});
  const drag=useRef<{x:number;y:number;time:number}|null>(null);
  const [snapshot,setSnapshot]=useState<SourceTetrisSnapshot>(()=>engine.snapshot());
  const [layout,setLayout]=useState<SourceTetrisCanvasLayout>(initialLayout);
  const [menu,setMenu]=useState<"game"|"help"|null>(null);
  const [help,setHelp]=useState(false);
  const [statsOpen,setStatsOpen]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const [stats,setStats]=useState(loadTetrisStats);
  const statsRef=useRef(stats);
  statsRef.current=stats;
  const handleSnapshot=(before:SourceTetrisSnapshot,after:SourceTetrisSnapshot)=>{
    if(before.state==="drop"&&after.state==="burn")
      play(audio.current.burn);
    else if(before.state==="drop"&&after.state==="are")
      play(audio.current.lock);
    else if(before.state!=="game-over"&&after.state==="game-over"){
      play(audio.current.over);
      audio.current.bgm?.pause();
      const updated=sourceTetrisFinished(statsRef.current,{
        level:after.level,score:after.score,lines:after.lines});
      statsRef.current=updated;setStats(updated);
    }
    if(before.level!==after.level)play(audio.current.levelup);
  };
  useEffect(()=>{
    const sounds:Record<string,HTMLAudioElement>={};
    for(const [name,path] of Object.entries(legacyTetrisArtwork.audio)){
      const element=new Audio(path);element.preload="auto";
      if(name==="bgm")element.loop=true;
      sounds[name]=element;
    }
    audio.current=sounds;
    return ()=>{for(const el of Object.values(sounds)){
      el.pause();el.removeAttribute("src");el.load();
    }};
  },[]);
  useEffect(()=>{saveTetrisStats(stats);},[stats]);
  useEffect(()=>{
    const element=canvas.current;
    if(!element)return;
    const resize=()=>{
      const width=element.clientWidth,height=element.clientHeight;
      if(!(width>0&&height>0))return;
      const dpr=window.devicePixelRatio||1;
      element.width=Math.round(width*dpr);
      element.height=Math.round(height*dpr);
      element.getContext("2d")?.setTransform(dpr,0,0,dpr,0,0);
      setLayout(sourceTetrisCanvasLayout(width,height));
    };
    resize();
    const observer=typeof ResizeObserver!=="undefined"?
      new ResizeObserver(resize):null;
    observer?.observe(element);
    window.addEventListener("resize",resize);
    return ()=>{observer?.disconnect();window.removeEventListener("resize",resize);};
  },[]);
  useEffect(()=>{
    const element=canvas.current;
    const ctx=element?.getContext("2d");
    if(element&&ctx&&element.clientWidth>0&&element.clientHeight>0)
      drawSourceTetris(ctx,snapshot,layout,element.clientWidth,element.clientHeight);
  },[snapshot,layout]);
  useEffect(()=>{
    let request=0,last=0,bank=0;
    const tick=(time:number)=>{
      if(!last)last=time;
      bank=Math.min(250,bank+Math.max(0,time-last));last=time;
      let changed=false;let steps=0;
      const first=engine.snapshot();
      if(first.state!=="game-over"&&first.state!=="pause"&&
        !help&&!statsOpen&&!parentMinimized){
        let before=first;
        while(bank>=1000/60&&steps++<15){
          const input=queued.current;queued.current={};
          const after=engine.advance(input);
          handleSnapshot(before,after);
          before=after;bank-=1000/60;changed=true;
        }
        if(changed)setSnapshot(engine.snapshot());
      }else bank=0;
      request=requestAnimationFrame(tick);
    };
    request=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(request);
    // Engine state is mutable, while window/modal locks change effect scope.
  },[engine,help,statsOpen,parentMinimized]);
  useEffect(()=>{
    const onHide=()=>{
      if(document.hidden&&engine.snapshot().state!=="pause"&&
        engine.snapshot().state!=="game-over"){
        setSnapshot(engine.advance({pause:true}));audio.current.bgm?.pause();
      }
    };
    document.addEventListener("visibilitychange",onHide);
    return ()=>document.removeEventListener("visibilitychange",onHide);
  },[engine]);
  const start=()=>{
    engine.start();queued.current={};
    const latest=sourceTetrisStarted(statsRef.current);
    statsRef.current=latest;setStats(latest);
    setSnapshot(engine.snapshot());
    play(audio.current.bgm);
    root.current?.focus();
  };
  const togglePlay=()=>{
    if(engine.snapshot().state==="game-over"){start();return;}
    const next=engine.advance({pause:true});
    setSnapshot(next);
    if(next.state==="pause")audio.current.bgm?.pause();
    else play(audio.current.bgm,false);
    root.current?.focus();
  };
  const pauseForDialog=()=>{
    if(engine.snapshot().state!=="pause"&&engine.snapshot().state!=="game-over"){
      setSnapshot(engine.advance({pause:true}));
      audio.current.bgm?.pause();
    }
  };
  const openStats=()=>{
    setMenu(null);pauseForDialog();setStatsOpen(true);
  };
  const openHelp=()=>{
    setMenu(null);pauseForDialog();setHelp(true);
  };
  const key=(event:ReactKeyEvent<HTMLElement>)=>{
    if(event.altKey||event.ctrlKey||event.metaKey||help||statsOpen)return;
    const controls:Record<string,keyof SourceTetrisInput>={
      ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",
      ArrowDown:"down",KeyS:"down",ArrowUp:"clockwise",KeyW:"clockwise",
      KeyX:"clockwise",KeyK:"clockwise",KeyZ:"counterClockwise",
      KeyL:"counterClockwise",Space:"hardDrop"
    };
    if(event.code==="KeyP"||event.code==="Escape"){
      event.preventDefault();
      if(!event.repeat)togglePlay();
      return;
    }
    const action=controls[event.code];
    if(!action)return;
    event.preventDefault();
    if(event.repeat&&action==="hardDrop")return;
    queued.current={...queued.current,[action]:true};
    if(action==="clockwise"||action==="counterClockwise")
      play(audio.current.rotate);
    if(action==="left"||action==="right")play(audio.current.move);
  };
  const pointerDown=(event:ReactPointerEvent<HTMLCanvasElement>)=>{
    root.current?.focus();
    drag.current={x:event.clientX,y:event.clientY,time:performance.now()};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerUp=(event:ReactPointerEvent<HTMLCanvasElement>)=>{
    const start=drag.current;drag.current=null;if(!start)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(Math.hypot(dx,dy)<=10&&performance.now()-start.time<=500)
      queued.current={...queued.current,clockwise:true};
    else if(Math.abs(dx)>Math.abs(dy))
      queued.current={...queued.current,[dx<0?"left":"right"]:true};
    else if(dy>0)queued.current={...queued.current,down:true};
  };
  const styleFor=(name:"play"|"newGame"):CSSProperties=>{
    const rect=layout.buttons[name];
    return {left:rect.x,top:rect.y,width:rect.width,height:rect.height,
      fontSize:Math.max(12,Math.round(rect.width*0.4))};
  };
  const state=snapshot.state;
  return <section ref={root} tabIndex={0} className="windows-tetris"
    data-test-tetris-root="" data-test-tetris-state={state}
    data-test-tetris-score={snapshot.score}
    data-test-tetris-lines={snapshot.lines}
    onKeyDown={key}>
    <nav className="windows-tetris__menu" aria-label="Tetris menus">
      <button type="button" aria-expanded={menu==="game"}
        onClick={()=>setMenu(v=>v==="game"?null:"game")}>Game</button>
      <button type="button" aria-expanded={menu==="help"}
        onClick={()=>setMenu(v=>v==="help"?null:"help")}>Help</button>
      {menu&&<div role="menu" className="windows-tetris__submenu">
        {menu==="game"?<>
          <button type="button" role="menuitem" onClick={()=>{setMenu(null);start();}}>New Game</button>
          <button type="button" role="menuitem" onClick={openStats}>Statistics</button>
          <button type="button" role="menuitem" onClick={onClose}>Exit</button>
        </>:<button type="button" role="menuitem" onClick={openHelp}>View Help</button>}
      </div>}
    </nav>
    <div className="windows-tetris__screen"
      style={{backgroundImage:`url("${legacyTetrisArtwork.background}")`}}>
      <canvas ref={canvas} className="windows-tetris__canvas"
        data-test-tetris-canvas="" aria-label="Classic Tetris board"
        onPointerDown={pointerDown} onPointerUp={pointerUp}
        onContextMenu={event=>event.preventDefault()}/>
      <button type="button" className="windows-tetris__control"
        data-test-tetris="play" aria-label={state==="pause"||state==="game-over"?"Play":"Pause"}
        onClick={togglePlay} style={styleFor("play")}>
        {state==="pause"||state==="game-over"?"▶":"Ⅱ"}
      </button>
      <button type="button" className="windows-tetris__control"
        data-test-tetris="new" aria-label="New Game" title="New Game"
        onClick={start} style={styleFor("newGame")}>↶</button>
    </div>
    {help?<SourceChildWindow id="tetris-help" title="Help"
      parentWindowId={parentWindowId} hidden={parentMinimized} width={360}
      onClose={()=>setHelp(false)}>
      <div className="windows-tetris__dialog" data-test-tetris-help="">
        <h3>Controls</h3>
        <ul>
          <li>Move piece: Left/Right arrow keys, or drag on the board.</li>
          <li>Rotate piece: Up arrow or X (Z turns the other way), or tap the board.</li>
          <li>Soft drop: Down arrow, or drag down on the board.</li>
          <li>Hard drop: Space bar.</li>
          <li>Pause: P or Esc.</li>
        </ul>
        <h3>Credits</h3>
        <p>Classic Tetris is created by Albert Lobo and licensed MIT.</p>
      </div>
    </SourceChildWindow>:null}
    {statsOpen?<SourceChildWindow id="tetris-stats" title="Statistics"
      parentWindowId={parentWindowId} hidden={parentMinimized} width={300}
      onClose={()=>setStatsOpen(false)}>
      <div className="windows-tetris__dialog" data-test-tetris-statistics="">
        <fieldset><legend>Highscores</legend>
          <table><thead><tr><th>Level</th><th>Score</th><th>Lines</th></tr></thead>
            <tbody>{stats.scores.map((s,i)=><tr key={i}>
              <td>{s.level}</td><td>{s.score}</td><td>{s.lines}</td>
            </tr>)}</tbody></table>
        </fieldset>
        <p>Games played: {stats.total}</p>
        <p>Games completed: {stats.completed}</p>
        <p>Completion rate: {Math.round(100*stats.completed/(stats.total||1))}%</p>
        <footer>
          <button type="button" onClick={()=>setStatsOpen(false)}>Close</button>
          <button type="button" onClick={()=>setConfirm(true)}>Reset</button>
        </footer>
        {confirm?<div className="windows-tetris__confirm"
          role="alertdialog" aria-label="Reset statistics" aria-modal="true">
          <p>Reset Tetris statistics?</p>
          <button type="button" onClick={()=>setConfirm(false)}>Cancel</button>
          <button type="button" onClick={()=>{
            const empty=emptyTetrisStats();setStats(empty);statsRef.current=empty;
            setConfirm(false);
          }}>Reset</button>
        </div>:null}
      </div>
    </SourceChildWindow>:null}
  </section>;
}
