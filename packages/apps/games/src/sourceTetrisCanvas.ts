import {
  SOURCE_TETRIS_PIECES,SOURCE_TETRIS_BOARD_HEIGHT,
  SOURCE_TETRIS_BOARD_WIDTH,SOURCE_TETRIS_HIDDEN_ROWS,
  type SourceTetrisSnapshot
} from "./sourceTetris";
export interface TetrisRect{readonly x:number;readonly y:number;readonly width:number;readonly height:number;}
export interface SourceTetrisCanvasLayout{
  readonly isWide:boolean;readonly side:number;
  readonly boardX:number;readonly boardY:number;
  readonly board: TetrisRect;
  readonly next:TetrisRect;readonly stats:TetrisRect;
  readonly buttons:Readonly<Record<"play"|"newGame",TetrisRect>>;
}
/** Direct translation of pinned 13bc Classic Tetris resize(), including
 * its wide/narrow responsive branch, panel positions and 2 hidden rows.
 */
export function sourceTetrisCanvasLayout(width:number,height:number):SourceTetrisCanvasLayout{
  if(!(width>0&&height>0&&Number.isFinite(width)&&Number.isFinite(height)))
    throw Error("Invalid Tetris canvas size");
  const visible=SOURCE_TETRIS_BOARD_HEIGHT-SOURCE_TETRIS_HIDDEN_ROWS;
  const n=Math.min(height/(visible+1),width/(10+2*(5.5+0.75)+1));
  const h=Math.min(height/(visible+5.5),width/11);
  const isWide=n>=h,side=Math.max(1,Math.floor(isWide?n:h));
  const boardWidth=SOURCE_TETRIS_BOARD_WIDTH*side;
  const boardLeft=Math.round((width-boardWidth)/2);
  if(isWide){
    const top=Math.round((height-visible*side)/2);
    return {isWide,side,boardX:boardLeft,boardY:top-2*side,
      board:{x:boardLeft,y:top,width:boardWidth,height:visible*side},
      next:{x:boardLeft-0.75*side-5.5*side,y:top,width:5.5*side,height:4.5*side},
      stats:{x:boardLeft+boardWidth+0.75*side,y:top,width:5.5*side,height:4.5*side},
      buttons:{
        play:{x:boardLeft-0.75*side-2*side,y:top+visible*side-1.4*side-0.5*side-2*side,
          width:2*side,height:2*side},
        newGame:{x:boardLeft-0.75*side-1.4*side,y:top+visible*side-1.4*side,
          width:1.4*side,height:1.4*side}
      }};
  }
  const top=Math.round((height-(visible+4.5)*side)/2);
  const center=boardLeft+8.875*side;
  return {isWide,side,boardX:boardLeft,boardY:top+2.5*side,
    board:{x:boardLeft,y:top+4.5*side,width:boardWidth,height:visible*side},
    next:{x:boardLeft,y:top,width:3.5*side,height:4*side},
    stats:{x:boardLeft+3.75*side,y:top,width:4*side,height:4*side},
    buttons:{
      play:{x:center-0.9*side,y:top+0.2*side,width:1.8*side,height:1.8*side},
      newGame:{x:center-0.7*side,y:top+4*side-1.4*side,
        width:1.4*side,height:1.4*side}
    }};
}
const COLORS=["#a52d19","#4835ee","#126d12","#a52d19",
  "#4835ee","#a52d19","#126d12","#fff"];
export function sourceTetrisCanPlace(snapshot:SourceTetrisSnapshot,x:number,y:number,
  rotation=snapshot.rotation):boolean{
  const shape=SOURCE_TETRIS_PIECES.find(p=>p.name===snapshot.current)!
    .rotations[rotation];
  for(let row=0;row<shape.length;row++)
    for(let col=0;col<shape[row].length;col++){
      if(!shape[row][col])continue;
      const cx=x+col,cy=y+row;
      if(cx<0||cx>=SOURCE_TETRIS_BOARD_WIDTH||cy<0||
        cy>=SOURCE_TETRIS_BOARD_HEIGHT||snapshot.board[cy][cx]!==-1)return false;
    }
  return true;
}
export function sourceTetrisGhostY(snapshot:SourceTetrisSnapshot):number{
  let y=snapshot.position[1];
  while(sourceTetrisCanPlace(snapshot,snapshot.position[0],y+1))y++;
  return y;
}
function square(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,color:string,
  ghost=false):void{
  const n=Math.max(2,Math.round(size/10));
  ctx.fillStyle=ghost?"#222":color;
  ctx.strokeStyle=ghost?"#000":"#000";
  ctx.fillRect(x+1,y+1,size-2,size-2);
  ctx.strokeRect(x+1,y+1,size-2,size-2);
  if(!ghost){
    ctx.fillStyle="#fff";
    ctx.fillRect(x+1,y+1,n-1,n-1);
  }
}
function panel(ctx:CanvasRenderingContext2D,rect:TetrisRect){
  ctx.fillStyle="#9edbf2";ctx.fillRect(rect.x-2,rect.y-2,rect.width+4,rect.height+4);
  ctx.fillStyle="#000";ctx.fillRect(rect.x,rect.y,rect.width,rect.height);
}
export function drawSourceTetris(ctx:CanvasRenderingContext2D,
  snapshot:SourceTetrisSnapshot,layout:SourceTetrisCanvasLayout,
  width:number,height:number):void{
  ctx.clearRect(0,0,width,height);
  panel(ctx,layout.board);
  const s=layout.side;
  ctx.strokeStyle="#000";ctx.lineWidth=0.5;ctx.beginPath();
  for(let row=1;row<20;row++){
    const y=layout.board.y+row*s;ctx.moveTo(layout.board.x,y);
    ctx.lineTo(layout.board.x+layout.board.width,y);
  }
  for(let col=1;col<10;col++){
    const x=layout.board.x+col*s;ctx.moveTo(x,layout.board.y);
    ctx.lineTo(x,layout.board.y+layout.board.height);
  }
  ctx.stroke();ctx.lineWidth=1;
  if(snapshot.state==="pause"){
    ctx.fillStyle="#fff";ctx.font=`bold ${Math.max(8,Math.round(s*0.8))}px Verdana,sans-serif`;
    ctx.textAlign="center";ctx.fillText("PAUSE",layout.board.x+layout.board.width/2,
      layout.board.y+layout.board.height/2);ctx.textAlign="left";
  }else{
    for(let y=2;y<22;y++)for(let x=0;x<10;x++){
      const cell=snapshot.board[y][x];if(cell===-1)continue;
      square(ctx,layout.boardX+x*s,layout.boardY+y*s,s,COLORS[cell]??"#fff");
    }
    if(snapshot.state==="drop"){
      const shape=SOURCE_TETRIS_PIECES.find(p=>p.name===snapshot.current)!
        .rotations[snapshot.rotation];
      const ghostY=sourceTetrisGhostY(snapshot);
      for(let y=0;y<shape.length;y++)for(let x=0;x<shape[y].length;x++){
        if(!shape[y][x])continue;
        const gx=snapshot.position[0]+x,gy=ghostY+y;
        if(gy>=2)square(ctx,layout.boardX+gx*s,layout.boardY+gy*s,s,"#222",true);
        const py=snapshot.position[1]+y;
        if(py>=2)square(ctx,layout.boardX+gx*s,layout.boardY+py*s,s,
          COLORS[SOURCE_TETRIS_PIECES.findIndex(p=>p.name===snapshot.current)]);
      }
    }
  }
  panel(ctx,layout.next);panel(ctx,layout.stats);
  ctx.fillStyle="#fff";ctx.textAlign="left";
  ctx.font=`bold ${Math.max(8,Math.round(s*0.5))}px Verdana,sans-serif`;
  ctx.fillText("NEXT",layout.next.x+0.35*s,layout.next.y+0.65*s);
  const label=[["SCORE",snapshot.score],["LEVEL",snapshot.level],["LINES",snapshot.lines]] as const;
  label.forEach(([name,value],i)=>{
    const y=layout.stats.y+0.35*s+
      (layout.stats.height-0.7*s)*(i+0.5)/3;
    ctx.font=`bold ${Math.max(8,Math.round(s*0.45))}px Verdana,sans-serif`;
    ctx.textAlign="left";ctx.fillStyle="#9edbf2";
    ctx.fillText(name,layout.stats.x+0.35*s,y);
    if(snapshot.state!=="pause"){
      ctx.fillStyle="#fff";ctx.textAlign="right";
      ctx.fillText(String(value),layout.stats.x+layout.stats.width-0.35*s,y);
    }
  });
  if(snapshot.state!=="pause"&&snapshot.state!=="game-over"){
    const next=SOURCE_TETRIS_PIECES.find(p=>p.name===snapshot.next)!;
    const shape=next.rotations[0];
    const side=Math.max(2,Math.floor(Math.min(0.8*s,(layout.next.width-0.5*s)/4)));
    const occupied:{x:number;y:number}[]=[];
    for(let row=0;row<shape.length;row++)for(let col=0;col<shape[row].length;col++)
      if(shape[row][col])occupied.push({x:col,y:row});
    const minX=Math.min(...occupied.map(p=>p.x)),maxX=Math.max(...occupied.map(p=>p.x));
    const minY=Math.min(...occupied.map(p=>p.y)),maxY=Math.max(...occupied.map(p=>p.y));
    const startX=layout.next.x+(layout.next.width-(maxX-minX+1)*side)/2;
    const startY=layout.next.y+s+
      (layout.next.height-s-(maxY-minY+1)*side)/2;
    const color=COLORS[SOURCE_TETRIS_PIECES.indexOf(next)];
    occupied.forEach(p=>square(ctx,startX+(p.x-minX)*side,
      startY+(p.y-minY)*side,side,color));
  }
}
