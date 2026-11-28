/** Pinned original startmenu-win11.js module 18ee:
 * pageItemCount=12, totalPageCount=Math.ceil(programItems.length/12),
 * wheel down/swipe up advances and wheel up/swipe down reverses.
 * Win7/XP and Win11 search results are deliberately unpaged.
 */
export const SOURCE_WIN11_START_PAGE_SIZE=12;
export function sourceWin11PageCount(total:number):number{
  return Math.max(1,Math.ceil(Math.max(0,total)/SOURCE_WIN11_START_PAGE_SIZE));
}
export function sourceWin11StartPage<T>(items:readonly T[],page:number):T[]{
  const total=sourceWin11PageCount(items.length);
  const bounded=Math.max(1,Math.min(Number.isFinite(page)?Math.floor(page):1,total));
  return items.slice((bounded-1)*SOURCE_WIN11_START_PAGE_SIZE,
    bounded*SOURCE_WIN11_START_PAGE_SIZE);
}
export function sourceWin11NextStartPage(page:number,count:number,direction:number):number{
  const p=Math.max(1,Math.min(page,Math.max(1,count)));
  return Math.max(1,Math.min(p+(direction>0?1:direction<0?-1:0),Math.max(1,count)));
}
