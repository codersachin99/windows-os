import {
  useEffect,useRef,useState,
  type CSSProperties,type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import {legacyCardArtwork,legacyCardAudio} from "@windows-os/assets";
import {SourceChildWindow} from "@windows-os/ui/child-window";
import {sourceCardSpriteStyle,type SourceCardBack} from "./sourceCardArtwork";
import {
  sourceCardBestDropTarget,sourceCardBoardPoint,
  sourceCardDragShouldBegin
} from "./sourceCardDrag";
import type {SourceCard} from "./sourceCards";
import {
  SourceSolitaireEngine,sourceSolitaireAutoTarget,
  sourceSolitaireMovableRun,type SourceSolitairePile,
  type SourceSolitaireSnapshot
} from "./sourceSolitaire";
import {
  sourceSolitaireLayout,sourceSolitairePileRect
} from "./sourceSolitaireLayout";
import {
  sourceSolitaireRenderedCards,sourceSolitaireDropZones,
  sourceSolitaireDraggedRect
} from "./sourceSolitaireView";
import "./SolitaireApp.css";

export interface SolitaireAppProps{
  onClose():void;
  parentWindowId:string;
  parentMinimized?:boolean;
}
type Dialog="help"|"about"|"appearance"|null;
interface CardPointer{
  pointerId:number;
  from:SourceSolitairePile;
  index:number;
  cards:SourceCard[];
  startX:number;
  startY:number;
  startBoardX:number;
  startBoardY:number;
  originX:number;
  originY:number;
  x:number;
  y:number;
  active:boolean;
  target:string|null;
}
const cardPiles:SourceSolitairePile[]=[
  "stock","waste",...Array.from({length:4},(_,i)=>
    `foundation-${i}` as SourceSolitairePile),
  ...Array.from({length:7},(_,i)=>
    `tableau-${i}` as SourceSolitairePile)
];
const rankNames=[
  "","Ace","Two","Three","Four","Five","Six","Seven",
  "Eight","Nine","Ten","Jack","Queen","King"
];
function describeCard(card:SourceCard):string{
  return `${rankNames[card.rank]} of ${card.suit}`;
}
function playAudio(audio:HTMLAudioElement|undefined):void{
  if(!audio)return;
  try{audio.currentTime=0;void audio.play().catch(()=>{});}
  catch{/* Device restrictions are not gameplay failures. */}
}
function sourceTime(seconds:number):string{
  return `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
}
/** Source e202 board + 0510 drag. The engine and layout are pure;
 * this component owns only DOM interaction, responsive measurement,
 * local presentation and game audio. */
export function SolitaireApp({
  onClose,parentWindowId,parentMinimized=false
}:SolitaireAppProps){
  const engineRef=useRef<SourceSolitaireEngine|null>(null);
  if(!engineRef.current)engineRef.current=new SourceSolitaireEngine();
  const engine=engineRef.current;
  const boardRef=useRef<HTMLDivElement|null>(null);
  const pointerRef=useRef<CardPointer|null>(null);
  const audioRef=useRef<Record<string,HTMLAudioElement>>({});
  const [snapshot,setSnapshot]=useState<SourceSolitaireSnapshot>(
    ()=>engine.snapshot());
  const [size,setSize]=useState({width:660,height:410});
  const [menu,setMenu]=useState<"game"|"help"|null>(null);
  const [dialog,setDialog]=useState<Dialog>(null);
  const [back,setBack]=useState<SourceCardBack>(0);
  const [drag,setDrag]=useState<CardPointer|null>(null);
  const board=sourceSolitaireLayout(size.width,size.height,snapshot.state);
  const cards=sourceSolitaireRenderedCards(
    snapshot.state,board,snapshot.drawThree,
    drag?.active?drag.cards.map(card=>card.id):[]);
  const refresh=()=>setSnapshot(engine.snapshot());
  const sound=(name:keyof typeof legacyCardAudio)=>
    playAudio(audioRef.current[name]);
  useEffect(()=>{
    const sounds:Record<string,HTMLAudioElement>={};
    for(const [name,url] of Object.entries(legacyCardAudio)){
      const sound=new Audio(url);
      sound.preload="auto";sounds[name]=sound;
    }
    audioRef.current=sounds;
    return ()=>{
      for(const sound of Object.values(sounds)){
        sound.pause();sound.removeAttribute("src");sound.load();
      }
    };
  },[]);
  useEffect(()=>{
    const element=boardRef.current;
    if(!element)return;
    const measure=()=>{
      setSize(old=>{
        const width=Math.max(360,element.clientWidth);
        const height=Math.max(300,element.clientHeight);
        return old.width===width&&old.height===height?
          old:{width,height};
      });
    };
    measure();
    const observer=typeof ResizeObserver==="undefined"?
      null:new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize",measure);
    return ()=>{observer?.disconnect();window.removeEventListener("resize",measure);};
  },[]);
  useEffect(()=>{
    if(!snapshot.started||snapshot.won)return;
    const timer=setInterval(()=>{engine.tick();refresh();},1000);
    return ()=>clearInterval(timer);
  },[engine,snapshot.started,snapshot.won]);
  const reset=()=>{
    engine.newGame();pointerRef.current=null;setDrag(null);
    setMenu(null);setDialog(null);refresh();
  };
  const undo=()=>{
    if(engine.undo()){sound("drop");refresh();}
    pointerRef.current=null;setDrag(null);setMenu(null);
  };
  const setDraw=(drawThree:boolean)=>{
    engine.setDrawThree(drawThree);pointerRef.current=null;
    setDrag(null);setMenu(null);refresh();
  };
  const deal=()=>{
    if(dialog||snapshot.won)return;
    if(engine.dealFromStock()){sound("place");refresh();}
  };
  const auto=(from:SourceSolitairePile,index:number)=>{
    if(dialog)return;
    const now=engine.snapshot().state;
    const run=sourceSolitaireMovableRun(now,from,index);
    const target=sourceSolitaireAutoTarget(now,from,run);
    if(engine.autoMove(from,index)){
      sound(target?.startsWith("foundation-")?"home":"place");
      refresh();
      if(engine.snapshot().won)sound("complete");
    }else sound("drop");
  };
  const boardPoint=(clientX:number,clientY:number)=>{
    const element=boardRef.current;
    if(!element)return null;
    const bounds=element.getBoundingClientRect();
    return sourceCardBoardPoint(
      clientX,clientY,bounds,element.offsetWidth);
  };
  const press=(event:ReactPointerEvent<HTMLDivElement>,
    from:SourceSolitairePile,index:number,x:number,y:number)=>{
    if(event.button!==0||dialog||snapshot.won||parentMinimized)return;
    const cards=sourceSolitaireMovableRun(engine.snapshot().state,from,index);
    const point=boardPoint(event.clientX,event.clientY);
    if(!cards.length||!point)return;
    event.preventDefault();
    pointerRef.current={pointerId:event.pointerId,from,index,cards,
      startX:event.clientX,startY:event.clientY,
      startBoardX:point.x,startBoardY:point.y,
      originX:x,originY:y,x,y,active:false,target:null};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const previous=pointerRef.current;
    if(!previous||previous.pointerId!==event.pointerId)return;
    const point=boardPoint(event.clientX,event.clientY);
    if(!point)return;
    if(!previous.active&&!sourceCardDragShouldBegin(previous.startX,
      previous.startY,event.clientX,event.clientY))return;
    event.preventDefault();
    const x=previous.originX+point.x-previous.startBoardX;
    const y=previous.originY+point.y-previous.startBoardY;
    const rect=sourceSolitaireDraggedRect(
      x,y,board.cardWidth,board.cardHeight,
      previous.cards.length,board.runOffset);
    const target=sourceCardBestDropTarget(rect,sourceSolitaireDropZones(
      engine.snapshot().state,board,previous.from,previous.index));
    const next:CardPointer={...previous,x,y,active:true,target};
    pointerRef.current=next;setDrag(next);
  };
  const release=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const previous=pointerRef.current;
    if(!previous||previous.pointerId!==event.pointerId)return;
    pointerRef.current=null;setDrag(null);
    if(event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    event.preventDefault();
    if(previous.active){
      if(previous.target&&engine.move(previous.from,previous.index,
        previous.target as SourceSolitairePile)){
        sound(previous.target.startsWith("foundation-")?"home":"place");
        refresh();if(engine.snapshot().won)sound("complete");
      }else sound("drop");
    }else auto(previous.from,previous.index);
  };
  const cancel=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(pointerRef.current?.pointerId!==event.pointerId)return;
    pointerRef.current=null;setDrag(null);
  };
  const cardKey=(event:ReactKeyboardEvent<HTMLDivElement>,
    from:SourceSolitairePile,index:number)=>{
    if(event.key!=="Enter"&&event.key!==" ")return;
    event.preventDefault();auto(from,index);
  };
  const openDialog=(next:Dialog)=>{
    pointerRef.current=null;setDrag(null);setMenu(null);setDialog(next);
  };
  const slotStyle=(key:SourceSolitairePile):CSSProperties=>{
    const rect=sourceSolitairePileRect(key,board);
    return {left:rect.x,top:rect.y,width:rect.width,height:rect.height};
  };
  const faceStyle=(card:SourceCard|null):CSSProperties=>
    sourceCardSpriteStyle(card,board.cardWidth,back);
  return <section className="windows-solitaire"
    data-test-solitaire-root="" data-test-solitaire-score={snapshot.score}
    data-test-solitaire-time={snapshot.time} data-test-solitaire-won={snapshot.won}>
    <nav className="windows-solitaire__menubar" aria-label="Solitaire menus">
      <button type="button" aria-expanded={menu==="game"}
        onClick={()=>setMenu(current=>current==="game"?null:"game")}>Game</button>
      <button type="button" aria-expanded={menu==="help"}
        onClick={()=>setMenu(current=>current==="help"?null:"help")}>Help</button>
      {menu&&<div role="menu" className="windows-solitaire__submenu">
        {menu==="game"?<>
          <button type="button" role="menuitem" data-test-solitaire-new-game=""
            onClick={reset}>New Game</button>
          <button type="button" role="menuitem" disabled={!snapshot.historyLength}
            data-test-solitaire-undo="" onClick={undo}>Undo</button>
          <button type="button" role="menuitemradio"
            aria-checked={!snapshot.drawThree} data-test-solitaire-draw-one=""
            onClick={()=>setDraw(false)}>Draw One</button>
          <button type="button" role="menuitemradio"
            aria-checked={snapshot.drawThree} data-test-solitaire-draw-three=""
            onClick={()=>setDraw(true)}>Draw Three</button>
          <button type="button" role="menuitem"
            onClick={()=>openDialog("appearance")}>Change Appearance</button>
          <button type="button" role="menuitem" disabled
            title="Original game statistics are not yet migrated">Statistics</button>
          <button type="button" role="menuitem" onClick={onClose}>Exit</button>
        </>:<>
          <button type="button" role="menuitem"
            onClick={()=>openDialog("help")}>View Help</button>
          <button type="button" role="menuitem"
            onClick={()=>openDialog("about")}>About</button>
        </>}
      </div>}
    </nav>
    <div className="windows-solitaire__viewport">
      <div ref={boardRef} className="windows-solitaire__board solitaire__board"
        data-test-solitaire-board=""
        style={{backgroundImage:`url("${legacyCardArtwork.klondikeBackground}")`}}>
        {cardPiles.map(key=><div key={key}
          className="windows-solitaire__slot solitaire__slot"
          style={slotStyle(key)} aria-hidden="true"/>)}
        {cards.map(item=><div key={item.card.id}
          className={["windows-solitaire__card","cards__card","solitaire__card",
            item.draggable?"can-play":"",item.hidden?"is-hidden":""].join(" ")}
          data-test-solitaire-card={item.card.id} data-test-pile={item.key}
          data-test-solitaire-index={item.index}
          role={item.draggable?"button":undefined}
          tabIndex={item.draggable?0:undefined}
          aria-label={item.draggable?describeCard(item.card):undefined}
          style={{...faceStyle(item.card),left:item.x,top:item.y,
            zIndex:item.z,pointerEvents:item.draggable?"auto":"none"}}
          onPointerDown={event=>press(event,item.key,item.index,item.x,item.y)}
          onPointerMove={move} onPointerUp={release} onPointerCancel={cancel}
          onKeyDown={event=>cardKey(event,item.key,item.index)}
          onContextMenu={event=>event.preventDefault()}/>)}
        <button type="button" className="windows-solitaire__stock solitaire__stock"
          data-test-solitaire-stock="" aria-label="Deal cards from stock"
          disabled={snapshot.won||(!snapshot.state.stock.length&&
            !snapshot.state.waste.length)}
          onClick={deal}
          style={{...slotStyle("stock"),
            ...(snapshot.state.stock.length?{}:faceStyle(null))}}/>
        {drag?.active&&drag.target?
          <div className="windows-solitaire__target solitaire__target"
            aria-hidden="true" style={slotStyle(drag.target as SourceSolitairePile)}/>:null}
        {drag?.active&&<div className="windows-solitaire__drag solitaire__drag"
          aria-hidden="true" style={{left:drag.x,top:drag.y,
            width:board.cardWidth,zIndex:100}}>
          {drag.cards.map((card,index)=><div key={card.id}
            className="windows-solitaire__card cards__card"
            style={{...faceStyle(card),left:0,
              top:index*board.runOffset,zIndex:index+1}}/>)}
        </div>}
        {snapshot.won&&<div className="windows-solitaire__won"
          role="status">You won!
          <button type="button" onClick={reset}>New Game</button>
        </div>}
      </div>
    </div>
    <footer className="windows-solitaire__status" aria-label="Solitaire status">
      <span>Time: {sourceTime(snapshot.time)}</span>
      <span>Score: {snapshot.score}</span>
    </footer>
    {dialog&&<SourceChildWindow id={`solitaire-${dialog}`}
      parentWindowId={parentWindowId} hidden={parentMinimized}
      title={dialog==="about"?"About":dialog==="help"?"Help":"Change Appearance"}
      width={dialog==="appearance"?380:340} onClose={()=>setDialog(null)}>
      <div className="windows-solitaire__dialog"
        data-test-solitaire-dialog={dialog}>
        {dialog==="help"?<>
          <h3>How to play</h3>
          <p>Move the cards into four foundations, in suit from Ace to King.</p>
          <h3>Controls</h3>
          <p>Click a card to place it automatically, or drag it onto a valid pile.
            Click the stock to deal more cards. Use Game → Undo to undo a move.</p>
        </>:dialog==="about"?
          <p>Solitaire — Klondike, based on the original Windows 7 simulator game.</p>
          :<>
            <h3>Card backs</h3>
            <div className="windows-solitaire__backs">
              {([0,1,2] as const).map(option=><button type="button"
                key={option} aria-label={`Card back ${option+1}`}
                aria-pressed={back===option}
                onClick={()=>setBack(option)}>
                <span style={sourceCardSpriteStyle(
                  {id:"preview",suit:"clubs",rank:1,faceUp:false},73,option)}/>
              </button>)}
            </div>
          </>}
        <footer><button type="button" onClick={()=>setDialog(null)}>Close</button></footer>
      </div>
    </SourceChildWindow>}
  </section>;
}
