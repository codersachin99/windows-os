/** Source-traced pure core of pinned legacy-win7
 * src/modules/games/tetris.js webpack 13bc, Classic Tetris engine.
 * This is not yet the full canvas/render/audio port. Do not register
 * as a playable game until input, HUD, audio and source dialogs are wired.
 */
export const SOURCE_TETRIS_BOARD_WIDTH=10;
export const SOURCE_TETRIS_BOARD_HEIGHT=22;
export const SOURCE_TETRIS_HIDDEN_ROWS=2;
export const SOURCE_TETRIS_FPS=60;
export const SOURCE_TETRIS_MAX_CATCH_UP_MS=250;
export type SourceTetrisState="drop"|"burn"|"are"|"pause"|"game-over";
export type SourceTetrisPieceName="z"|"s"|"o"|"l"|"j"|"t"|"i";
export interface SourceTetrisPiece{
  readonly name:SourceTetrisPieceName;
  readonly rotations:readonly (readonly (readonly number[])[])[];
  readonly initial:readonly [number,number];
}
export const SOURCE_TETRIS_PIECES:readonly SourceTetrisPiece[]=[
  {name:"z",initial:[4,1],rotations:[
    [[0,0,0],[1,1,0],[0,1,1]],
    [[0,0,1],[0,1,1],[0,1,0]]
  ]},
  {name:"s",initial:[4,1],rotations:[
    [[0,0,0],[0,1,1],[1,1,0]],
    [[0,1,0],[0,1,1],[0,0,1]]
  ]},
  {name:"o",initial:[4,2],rotations:[[[1,1],[1,1]]]},
  {name:"l",initial:[4,1],rotations:[
    [[0,0,0],[1,1,1],[1,0,0]],
    [[1,1,0],[0,1,0],[0,1,0]],
    [[0,0,1],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,0],[0,1,1]]
  ]},
  {name:"j",initial:[4,1],rotations:[
    [[0,0,0],[1,1,1],[0,0,1]],
    [[0,1,0],[0,1,0],[1,1,0]],
    [[1,0,0],[1,1,1],[0,0,0]],
    [[0,1,1],[0,1,0],[0,1,0]]
  ]},
  {name:"t",initial:[4,1],rotations:[
    [[0,0,0],[1,1,1],[0,1,0]],
    [[0,1,0],[1,1,0],[0,1,0]],
    [[0,1,0],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,1],[0,1,0]]
  ]},
  {name:"i",initial:[3,0],rotations:[
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]]
  ]}
];
export function sourceTetrisFramesPerGridCell(level:number):number{
  if(level<0||!Number.isFinite(level))throw Error("Invalid Tetris level");
  if(level<=8)return 96-level*10;
  if(level===9)return 12;
  if(level<=12)return 10;
  if(level<=15)return 8;
  if(level<=18)return 6;
  if(level<=28)return 4;
  return 2;
}
export function sourceTetrisLinesScore(lines:number,level:number):number{
  if(!Number.isInteger(lines)||lines<1||lines>4)throw Error("Invalid clear count");
  return [0,40,100,300,1200][lines]*(level+1);
}
export function sourceTetrisLevel(lines:number,startLevel=0):number{
  const threshold=Math.min(10*startLevel+10,Math.max(100,10*startLevel-50));
  return startLevel+Math.max(0,lines>=threshold?1+Math.floor((lines-threshold)/10):0);
}
export interface SourceTetrisInput{
  readonly left?:boolean;readonly right?:boolean;
  readonly down?:boolean;readonly hardDrop?:boolean;
  readonly clockwise?:boolean;readonly counterClockwise?:boolean;
  readonly pause?:boolean;
}
export interface SourceTetrisSnapshot{
  readonly state:SourceTetrisState;
  readonly board:readonly (readonly number[])[];
  readonly current:SourceTetrisPieceName;
  readonly next:SourceTetrisPieceName;
  readonly position:readonly [number,number];
  readonly rotation:number;
  readonly level:number;readonly lines:number;readonly score:number;
  readonly frame:number;
}
function choose(random:()=>number,multiplier:number):number{
  const r=random();
  if(!Number.isFinite(r)||r<0||r>=1)
    throw Error("Tetris random must be between zero and one");
  return Math.floor(r*multiplier);
}
/** Source engine owns the board and state transitions, React owns rendering.
 * One advance() call is one original 60fps frame, independent of repaint.
 * The source's five-column burn and lock-entry delay are retained.
 */
export class SourceTetrisEngine{
  private readonly random:()=>number;
  private board:number[][]=Array.from({length:22},()=>Array(10).fill(-1));
  private currentId=0;
  private nextId=0;
  private pos:[number,number]=[0,0];
  private rotation=0;
  private status:SourceTetrisState="game-over";
  private previous:SourceTetrisState="drop";
  private level=0;
  private lines=0;
  private score=0;
  private downScore=0;
  private framesTilDrop=0;
  private frame=0;
  private cleared:number[]=[];
  private clearedColumns=-1;
  private areFrames=-1;
  private lastLockHeight=0;
  constructor(random:()=>number=Math.random){this.random=random;}
  snapshot():SourceTetrisSnapshot{
    return {state:this.status,board:this.board.map(row=>[...row]),
      current:SOURCE_TETRIS_PIECES[this.currentId].name,
      next:SOURCE_TETRIS_PIECES[this.nextId].name,
      position:[...this.pos],rotation:this.rotation,
      level:this.level,lines:this.lines,score:this.score,frame:this.frame};
  }
  private nextPiece():number{
    let id=choose(this.random,8);
    if(id===7||id===this.currentId)
      id=(choose(this.random,8)+this.currentId)%7;
    return id;
  }
  start():void{
    this.board=Array.from({length:SOURCE_TETRIS_BOARD_HEIGHT},
      ()=>Array(SOURCE_TETRIS_BOARD_WIDTH).fill(-1));
    this.currentId=choose(this.random,7);
    this.nextId=this.nextPiece();
    this.pos=[...SOURCE_TETRIS_PIECES[this.currentId].initial];
    this.rotation=0;this.status="drop";
    this.level=0;this.lines=0;this.score=0;this.downScore=0;
    this.frame=0;this.areFrames=-1;this.lastLockHeight=0;this.cleared=[];
    this.clearedColumns=-1;
    // Source _resetParams: first gridcell starts after 36 extra frames.
    this.framesTilDrop=36+sourceTetrisFramesPerGridCell(this.level);
  }
  private canPlace(pieceId:number,rotation:number,x:number,y:number):boolean{
    const shape=SOURCE_TETRIS_PIECES[pieceId].rotations[rotation];
    for(let row=0;row<shape.length;row++)
      for(let col=0;col<shape[row].length;col++){
        if(!shape[row][col])continue;
        const xx=x+col,yy=y+row;
        if(xx<0||xx>=10||yy<0||yy>=22||this.board[yy][xx]!==-1)return false;
      }
    return true;
  }
  private rotate(direction:1|-1):void{
    const piece=SOURCE_TETRIS_PIECES[this.currentId];
    const next=(this.rotation+piece.rotations.length+direction)%piece.rotations.length;
    if(this.canPlace(this.currentId,next,...this.pos))this.rotation=next;
  }
  private move(dx:number,dy:number):boolean{
    if(!this.canPlace(this.currentId,this.rotation,
      this.pos[0]+dx,this.pos[1]+dy))return false;
    this.pos=[this.pos[0]+dx,this.pos[1]+dy];return true;
  }
  private lock():void{
    const shape=SOURCE_TETRIS_PIECES[this.currentId].rotations[this.rotation];
    let bottom=0;
    for(let y=0;y<shape.length;y++)
      for(let x=0;x<shape[y].length;x++)if(shape[y][x]){
        this.board[this.pos[1]+y][this.pos[0]+x]=this.currentId;
        bottom=Math.max(bottom,this.pos[1]+y);
      }
    this.lastLockHeight=21-bottom;
    this.cleared=this.board.map((row,y)=>
      row.every(cell=>cell!==-1)?y:-1).filter(y=>y>=0);
    if(this.cleared.length){
      this.clearedColumns=0;
      const center=SOURCE_TETRIS_BOARD_WIDTH/2;
      for(const row of this.cleared){
        this.board[row][center]=-1;this.board[row][center-1]=-1;
      }
      this.status="burn";
    }else{
      this.score+=this.downScore;
      this.areFrames=2*(10+2*Math.floor((this.lastLockHeight+2)/4));
      this.status="are";
    }
  }
  private burn():void{
    if(this.frame%8!==0)return;
    this.clearedColumns++;
    if(this.clearedColumns<5){
      const mid=SOURCE_TETRIS_BOARD_WIDTH/2;
      for(const row of this.cleared){
        this.board[row][mid+this.clearedColumns]=-1;
        this.board[row][mid-1-this.clearedColumns]=-1;
      }
      return;
    }
    for(let i=this.cleared.length-1;i>=0;i--)
      this.board.splice(this.cleared[i],1);
    while(this.board.length<22)this.board.unshift(Array(10).fill(-1));
    this.score+=this.downScore+
      sourceTetrisLinesScore(this.cleared.length,this.level);
    this.lines+=this.cleared.length;
    this.level=sourceTetrisLevel(this.lines);
    // Source _getARE uses the *locked piece's* last height even after
    // burning one or four lines, rather than an arbitrary fixed delay.
    this.areFrames=2*(10+2*Math.floor((this.lastLockHeight+2)/4));
    this.status="are";
  }
  private spawn():void{
    this.currentId=this.nextId;
    this.nextId=this.nextPiece();
    this.rotation=0;
    this.pos=[...SOURCE_TETRIS_PIECES[this.currentId].initial];
    if(this.canPlace(this.currentId,this.rotation,...this.pos)){
      this.framesTilDrop=sourceTetrisFramesPerGridCell(this.level);
      this.status="drop";
    }else this.status="game-over";
  }
  advance(input:SourceTetrisInput={}):SourceTetrisSnapshot{
    if(input.pause&&this.status!=="game-over"){
      if(this.status==="pause")this.status=this.previous;
      else{this.previous=this.status;this.status="pause";}
    }
    if(this.status==="drop"){
      this.framesTilDrop--;
      if(input.left)this.move(-1,0);
      if(input.right)this.move(1,0);
      if(input.clockwise)this.rotate(1);
      if(input.counterClockwise)this.rotate(-1);
      if(input.hardDrop){
        while(this.move(0,1))this.downScore+=2;
        this.lock();
      }else if(input.down||this.framesTilDrop===0){
        if(this.move(0,1)){
          if(input.down)this.downScore++;
          this.framesTilDrop=sourceTetrisFramesPerGridCell(this.level);
        }else this.lock();
      }
    }else if(this.status==="burn")this.burn();
    else if(this.status==="are"){
      this.areFrames--;
      if(this.areFrames===0)this.spawn();
    }
    this.frame++;
    return this.snapshot();
  }
}
