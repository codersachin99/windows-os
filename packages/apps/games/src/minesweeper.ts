/** Exact source behavior port of pinned legacy-win7 minesweeper.js webpack
 * 9538 Board/generateMineArray, pinned SHA 4e63290. The original Vue
 * component 245c performs first-click protection and game-result tracking
 * *outside* this board, so those remain in the React app adapter.
 */
export const SOURCE_MINE_CELL_STATE={CLOSED:0,OPEN:1} as const;
export const SOURCE_MINE_CELL_FLAG={NONE:0,EXCLAMATION:1,QUESTION:2} as const;
export const SOURCE_MINE_BOARD_STATE={PRISTINE:0,IN_PROGRESS:1,LOST:2,WON:3} as const;
export type SourceMineCellState=0|1;
export type SourceMineCellFlag=0|1|2;
export type SourceMineBoardState=0|1|2|3;
export type SourceMine=0|1;
export interface SourceMineCell{
  readonly x:number;readonly y:number;readonly isMine:boolean;
  readonly numAdjacentMines:number;readonly state:SourceMineCellState;
  readonly flag:SourceMineCellFlag;
}
type MutableCell={
  -readonly [K in keyof SourceMineCell]:SourceMineCell[K]
};
export interface SourceMineOptions{
  rows:number;cols:number;mines:number;
}
export const SOURCE_MINE_BEGINNER:Readonly<SourceMineOptions>=Object.freeze({
  rows:8,cols:9,mines:10
});
export const SOURCE_MINE_INTERMEDIATE:Readonly<SourceMineOptions>=Object.freeze({
  rows:12,cols:12,mines:30
});

/** Exact pinned Vue 245c Advanced level watcher uses
 * e=size(21)+1; scrollWidth-- / scrollHeight-- then:
 * rows=floor(height/e), cols=floor(width/e),
 * mines=floor(((width/e)*(height/e))/2).
 * Its measured grid is fullscreen; the React adapter supplies available
 * content dimensions after requesting a fullscreen shell window.
 * Guard pathological zero/huge host viewports before calling 9538.
 */
export function sourceMineAdvancedOptions(
  scrollWidth:number,scrollHeight:number
):SourceMineOptions{
  if(!Number.isFinite(scrollWidth)||!Number.isFinite(scrollHeight))
    throw new Error("Invalid Advanced Minesweeper viewport");
  const factor=22;
  const width=Math.max(0,scrollWidth-1)/factor;
  const height=Math.max(0,scrollHeight-1)/factor;
  let cols=Math.max(2,Math.floor(width));
  let rows=Math.max(2,Math.floor(height));
  if(cols*rows>20000){
    const scale=Math.sqrt(20000/(cols*rows));
    cols=Math.max(2,Math.floor(cols*scale));
    rows=Math.max(2,Math.floor(rows*scale));
  }
  return {rows,cols,mines:Math.max(1,
    Math.min(rows*cols-1,Math.floor(width*height/2)))};
}

/** Pinned 245c.open() starts the clock only while the *board* is
 * PRISTINE. A right-click flag advances Board to IN_PROGRESS, even
 * before a safe cell opens; preserve that original timer quirk.
 */
export function sourceMineShouldStartTimer(
  state:SourceMineBoardState
):boolean{
  return state===SOURCE_MINE_BOARD_STATE.PRISTINE;
}

export function sourceGenerateMineArray(
  options:Partial<SourceMineOptions>={},
  random:()=>number=Math.random
):SourceMine[][]{
  // Original 9538's defaults use JavaScript truthiness, not nullishness.
  const rows=options.rows||10;
  const cols=options.cols||options.rows||10;
  const mines=options.mines||parseInt(String(rows*cols*0.15),10)||0;
  if(!Number.isInteger(rows)||!Number.isInteger(cols)||!Number.isInteger(mines)||
      rows<1||cols<1||rows*cols>20000||mines<0||mines>rows*cols)
    throw new Error("Invalid source Minesweeper dimensions");
  const cells:SourceMine[]=Array.from({length:rows*cols},(_,i)=>
    i<mines?1:0);
  // Original 9538 Fisher-Yates shuffle.
  let i=cells.length;
  while(i){
    const r=random();
    if(!Number.isFinite(r)||r<0||r>=1)
      throw new Error("Random source must return a number in [0,1)");
    const j=Math.floor(r*i--);
    [cells[i],cells[j]]=[cells[j],cells[i]];
  }
  const board:SourceMine[][]=[];
  for(let y=0;y<rows;y++)board.push(cells.slice(y*cols,(y+1)*cols));
  return board;
}

export class SourceMineBoard{
  private readonly cells:MutableCell[][];
  private readonly rows:number;
  private readonly cols:number;
  private readonly mines:number;
  private boardState:SourceMineBoardState=SOURCE_MINE_BOARD_STATE.PRISTINE;
  constructor(mineArray:readonly (readonly number[])[]){
    if(!mineArray.length||!mineArray[0]?.length||
       mineArray.some(row=>row.length!==mineArray[0].length||
         row.some(cell=>cell!==0&&cell!==1)))
      throw new Error("The mine array supplied to Board constructor was not valid");
    this.rows=mineArray.length;
    this.cols=mineArray[0].length;
    this.mines=mineArray.flat().filter(cell=>cell===1).length;
    this.cells=mineArray.map((row,y)=>row.map((isMine,x)=>({
      x,y,isMine:isMine===1,numAdjacentMines:this.neighborCount(mineArray,x,y),
      state:SOURCE_MINE_CELL_STATE.CLOSED,flag:SOURCE_MINE_CELL_FLAG.NONE
    } satisfies MutableCell)));
  }
  state():SourceMineBoardState{return this.boardState;}
  numRows():number{return this.rows;}
  numCols():number{return this.cols;}
  numMines():number{return this.mines;}
  grid():SourceMineCell[][]{return this.cells.map(row=>row.map(cell=>({...cell})));}
  cell(x:number,y:number):SourceMineCell|undefined{
    const cell=this.get(x,y);
    return cell?{...cell}:undefined;
  }
  private get(x:number,y:number):MutableCell|undefined{
    return x>=0&&y>=0&&x<this.cols&&y<this.rows
      ?this.cells[y]?.[x]:undefined;
  }
  private neighborCount(array:readonly (readonly number[])[],x:number,y:number):number{
    let total=0;
    for(let ny=y-1;ny<=y+1;ny++)
      for(let nx=x-1;nx<=x+1;nx++)
        if((nx!==x||ny!==y)&&array[ny]?.[nx]===1)total++;
    return total;
  }
  cycleCellFlag(x:number,y:number):void{
    const cell=this.get(x,y);
    if(!cell||cell.state===SOURCE_MINE_CELL_STATE.OPEN||
       this.boardState===SOURCE_MINE_BOARD_STATE.WON||
       this.boardState===SOURCE_MINE_BOARD_STATE.LOST)return;
    cell.flag=cell.flag===SOURCE_MINE_CELL_FLAG.NONE
      ?SOURCE_MINE_CELL_FLAG.EXCLAMATION
      :cell.flag===SOURCE_MINE_CELL_FLAG.EXCLAMATION
        ?SOURCE_MINE_CELL_FLAG.QUESTION
        :SOURCE_MINE_CELL_FLAG.NONE;
    if(this.boardState===SOURCE_MINE_BOARD_STATE.PRISTINE)
      this.boardState=SOURCE_MINE_BOARD_STATE.IN_PROGRESS;
    this.updateState();
  }
  openCell(x:number,y:number):void{
    const cell=this.get(x,y);
    if(!cell||cell.state===SOURCE_MINE_CELL_STATE.OPEN||
       cell.flag!==SOURCE_MINE_CELL_FLAG.NONE||
       this.boardState===SOURCE_MINE_BOARD_STATE.WON||
       this.boardState===SOURCE_MINE_BOARD_STATE.LOST)return;
    cell.state=SOURCE_MINE_CELL_STATE.OPEN;
    if(!cell.isMine){
      // Pinned 9538 floods every safe clicked cell's neighbors, even
      // numbered cells; preserve this historical behavior deliberately.
      for(const [dx,dy] of SOURCE_MINE_NEIGHBORS)this.floodFill(x+dx,y+dy);
    }
    if(this.boardState===SOURCE_MINE_BOARD_STATE.PRISTINE)
      this.boardState=SOURCE_MINE_BOARD_STATE.IN_PROGRESS;
    this.updateState();
  }
  private floodFill(x:number,y:number):void{
    const cell=this.get(x,y);
    if(!cell||cell.isMine||cell.state!==SOURCE_MINE_CELL_STATE.CLOSED||
       cell.flag!==SOURCE_MINE_CELL_FLAG.NONE)return;
    cell.state=SOURCE_MINE_CELL_STATE.OPEN;
    if(cell.numAdjacentMines===0)
      for(const [dx,dy] of SOURCE_MINE_NEIGHBORS)this.floodFill(x+dx,y+dy);
  }
  private updateState():void{
    let won=true;
    for(const row of this.cells)for(const cell of row){
      if(cell.state===SOURCE_MINE_CELL_STATE.OPEN){
        if(cell.isMine){this.boardState=SOURCE_MINE_BOARD_STATE.LOST;return;}
      }else if(cell.state===SOURCE_MINE_CELL_STATE.CLOSED){
        if(!cell.isMine||cell.flag!==SOURCE_MINE_CELL_FLAG.EXCLAMATION)
          won=false;
      }
    }
    if(won)this.boardState=SOURCE_MINE_BOARD_STATE.WON;
  }
}

const SOURCE_MINE_NEIGHBORS:readonly (readonly [number,number])[]=[
  [1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[-1,1],[1,-1]
] as const;
