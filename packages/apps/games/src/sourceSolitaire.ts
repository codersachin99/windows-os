import {
  sourceCardsDeck,sourceCardsDifferentColor,sourceCardsLast,
  SOURCE_CARD_ACE,SOURCE_CARD_KING,
  type SourceCard
} from "./sourceCards";

/** Pure pinned Solitaire e202 game rules. The original 5ea1 card
 * primitives are shared with Spider; UI/drag/audio live separately.
 */
export const SOURCE_SOLITAIRE_TABLEAUS=7;
export const SOURCE_SOLITAIRE_FOUNDATIONS=4;
export const SOURCE_SOLITAIRE_HISTORY_LIMIT=50;
export const SOURCE_SOLITAIRE_SCORE=Object.freeze({
  FlipCard:5,WasteToTableau:5,ToFoundation:10,
  FoundationToTableau:-15,RecycleThree:-20,
  RecycleOne:-100,PerTenSeconds:-2
});
export type SourceSolitairePile=
  "stock"|"waste"| `foundation-${number}`| `tableau-${number}`;
export interface SourceSolitaireState{
  stock:SourceCard[];
  waste:SourceCard[];
  foundations:SourceCard[][];
  tableau:SourceCard[][];
}
export interface SourceSolitaireSnapshot{
  readonly state:SourceSolitaireState;
  readonly score:number;
  readonly time:number;
  readonly started:boolean;
  readonly won:boolean;
  readonly drawThree:boolean;
  readonly historyLength:number;
}
function cloneState(state:SourceSolitaireState):SourceSolitaireState{
  const clone=(list:SourceCard[])=>list.map(c=>({...c}));
  return {stock:clone(state.stock),waste:clone(state.waste),
    foundations:state.foundations.map(clone),tableau:state.tableau.map(clone)};
}
export function sourceSolitaireDeal(
  deck:readonly SourceCard[]
):SourceSolitaireState{
  if(deck.length!==52||new Set(deck.map(c=>c.id)).size!==52)
    throw Error("Solitaire needs a 52-card source deck");
  const stock=deck.map(card=>({...card,faceUp:false}));
  const tableau:SourceCard[][]=[];
  for(let i=0;i<SOURCE_SOLITAIRE_TABLEAUS;i++){
    const pile=stock.splice(0,i+1);
    pile.forEach((card,index)=>{
      card.faceUp=index===pile.length-1;
    });
    tableau.push(pile);
  }
  return {stock,waste:[],foundations:Array.from({length:4},()=>[]),
    tableau};
}
export function sourceSolitairePile(
  state:SourceSolitaireState,key:SourceSolitairePile
):SourceCard[]{
  if(key==="stock"||key==="waste")return state[key];
  const [kind,number]=key.split("-");
  const index=Number(number);
  if(!Number.isInteger(index)||index<0)throw Error("Invalid Solitaire pile");
  if(kind==="foundation"&&index<SOURCE_SOLITAIRE_FOUNDATIONS)
    return state.foundations[index];
  if(kind==="tableau"&&index<SOURCE_SOLITAIRE_TABLEAUS)
    return state.tableau[index];
  throw Error("Invalid Solitaire pile");
}
function kind(key:SourceSolitairePile){
  return key.split("-")[0] as "stock"|"waste"|"foundation"|"tableau";
}
/** Pinned e202 m(t,pile,index): only movable face-up cards,
 * an alternating-color descending tableau run or a single top card
 * from Waste/Foundation.
 */
export function sourceSolitaireMovableRun(
  state:SourceSolitaireState,key:SourceSolitairePile,index:number
):SourceCard[]{
  const pile=sourceSolitairePile(state,key);
  if(!Number.isInteger(index)||index<0||index>=pile.length)
    return [];
  const card=pile[index];
  if(!card.faceUp)return [];
  if(kind(key)!=="tableau")
    return index===pile.length-1&&kind(key)!=="stock"?[card]:[];
  const run=pile.slice(index);
  for(let i=0;i<run.length-1;i++){
    const [a,b]=[run[i],run[i+1]];
    if(!b.faceUp||a.rank!==b.rank+1||
      !sourceCardsDifferentColor(a,b))return [];
  }
  return run;
}
export function sourceSolitaireCanDrop(
  state:SourceSolitaireState,key:SourceSolitairePile,cards:readonly SourceCard[]
):boolean{
  const type=kind(key);
  if(!cards.length)return false;
  if(type==="foundation"){
    if(cards.length!==1)return false;
    const card=cards[0],last=sourceCardsLast(sourceSolitairePile(state,key));
    return last?last.suit===card.suit&&card.rank===last.rank+1:
      card.rank===SOURCE_CARD_ACE;
  }
  if(type==="tableau"){
    const card=cards[0],last=sourceCardsLast(sourceSolitairePile(state,key));
    return last?card.rank===last.rank-1&&sourceCardsDifferentColor(card,last):
      card.rank===SOURCE_CARD_KING;
  }
  return false;
}
export function sourceSolitaireAutoTarget(
  state:SourceSolitaireState,from:SourceSolitairePile,cards:readonly SourceCard[]
):SourceSolitairePile|null{
  if(kind(from)!=="foundation")
    for(let i=0;i<SOURCE_SOLITAIRE_FOUNDATIONS;i++){
      const dest=`foundation-${i}` as const;
      if(sourceSolitaireCanDrop(state,dest,cards))return dest;
    }
  const fromPile=sourceSolitairePile(state,from);
  const skipEmpty=kind(from)==="tableau"&&fromPile.length===cards.length;
  for(let i=0;i<SOURCE_SOLITAIRE_TABLEAUS;i++){
    const dest=`tableau-${i}` as const;
    if(dest===from||skipEmpty&&!state.tableau[i].length)continue;
    if(sourceSolitaireCanDrop(state,dest,cards))return dest;
  }
  return null;
}
export function sourceSolitaireWon(state:SourceSolitaireState):boolean{
  return state.foundations.every(pile=>pile.length===SOURCE_CARD_KING);
}
interface HistoryEntry{state:SourceSolitaireState;score:number}
export class SourceSolitaireEngine{
  private readonly random:()=>number;
  private state:SourceSolitaireState;
  private history:HistoryEntry[]=[];
  private score=0;
  private time=0;
  private started=false;
  private won=false;
  private drawThree=true;
  constructor(random:()=>number=Math.random){
    this.random=random;this.state=sourceSolitaireDeal(sourceCardsDeck(random));
  }
  snapshot():SourceSolitaireSnapshot{
    return {state:cloneState(this.state),score:this.score,time:this.time,
      started:this.started,won:this.won,drawThree:this.drawThree,
      historyLength:this.history.length};
  }
  newGame():void{
    this.state=sourceSolitaireDeal(sourceCardsDeck(this.random));
    this.history=[];this.score=0;this.time=0;this.started=false;this.won=false;
  }
  setDrawThree(value:boolean):boolean{
    if(value===this.drawThree)return false;
    this.drawThree=value;this.newGame();return true;
  }
  private saveHistory():void{
    this.history.push({state:cloneState(this.state),score:this.score});
    if(this.history.length>SOURCE_SOLITAIRE_HISTORY_LIMIT)
      this.history.shift();
  }
  private addScore(points:number):void{
    this.score=Math.max(0,this.score+points);
  }
  dealFromStock():boolean{
    if(this.won||(!this.state.stock.length&&!this.state.waste.length))
      return false;
    this.saveHistory();
    if(this.state.stock.length){
      for(let i=0;i<(this.drawThree?3:1)&&this.state.stock.length;i++){
        const card=this.state.stock.pop()!;
        card.faceUp=true;
        this.state.waste.push(card);
      }
    }else{
      while(this.state.waste.length){
        const card=this.state.waste.pop()!;
        card.faceUp=false;this.state.stock.push(card);
      }
      this.addScore(this.drawThree?
        SOURCE_SOLITAIRE_SCORE.RecycleThree:
        SOURCE_SOLITAIRE_SCORE.RecycleOne);
    }
    this.started=true;return true;
  }
  move(
    from:SourceSolitairePile,index:number,to:SourceSolitairePile
  ):boolean{
    if(this.won||from===to)return false;
    const run=sourceSolitaireMovableRun(this.state,from,index);
    if(!sourceSolitaireCanDrop(this.state,to,run))return false;
    this.saveHistory();
    const origin=sourceSolitairePile(this.state,from);
    const destination=sourceSolitairePile(this.state,to);
    destination.push(...origin.splice(index));
    let points=kind(to)==="foundation"?
      SOURCE_SOLITAIRE_SCORE.ToFoundation:
      kind(from)==="foundation"?
        SOURCE_SOLITAIRE_SCORE.FoundationToTableau:
        kind(from)==="waste"?
          SOURCE_SOLITAIRE_SCORE.WasteToTableau:0;
    if(kind(from)==="tableau"){
      const last=sourceCardsLast(origin);
      if(last&&!last.faceUp){last.faceUp=true;points+=SOURCE_SOLITAIRE_SCORE.FlipCard;}
    }
    this.addScore(points);this.started=true;
    this.won=sourceSolitaireWon(this.state);
    return true;
  }
  autoMove(from:SourceSolitairePile,index:number):boolean{
    const cards=sourceSolitaireMovableRun(this.state,from,index);
    if(!cards.length)return false;
    const to=sourceSolitaireAutoTarget(this.state,from,cards);
    return to?this.move(from,index,to):false;
  }
  undo():boolean{
    const last=this.history.pop();if(!last)return false;
    this.state=cloneState(last.state);this.score=last.score;
    // Source undo restores only state/score; the timer is unchanged.
    this.won=sourceSolitaireWon(this.state);
    return true;
  }
  tick(seconds=1):void{
    if(!this.started||this.won||!Number.isInteger(seconds)||seconds<0)return;
    for(let i=0;i<seconds;i++){
      this.time++;
      if(this.time%10===0)this.addScore(SOURCE_SOLITAIRE_SCORE.PerTenSeconds);
    }
  }
}
