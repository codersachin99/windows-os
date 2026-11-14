import type { CSSProperties, ReactNode } from "react";
import "./sourceListView.css";

/** Original listview-details.js (32cd), listview-tiles.js (7662),
 * listview-extra (c162), listview header and width util (a321).
 */
export type SourceListViewVariant="details"|"tiles"|"plain";
export interface SourceListViewProps {
  variant:SourceListViewVariant;className?:string;children:ReactNode;testId?:string;
}
export function SourceListView({variant,className="",children,testId}:SourceListViewProps){
  return <div data-test-source-listview={testId??variant}
    className={["listview__view",variant==="plain"?"":"has-"+variant,className]
      .filter(Boolean).join(" ")}>{children}</div>;
}

/** Exact a321.normalizeWidth(width,count,details): Details reserves one
 * additional label column when it divides unspecified extra widths.
 */
export function sourceNormalizeListWidth(
  width:number|string|null|undefined,count:number,details=false
):string{
  const extra=details?1:0;
  return width
    ?typeof width==="number"?width+"px":width.toString()
    :100/(count+extra)+"%";
}
export function sourceListColumnIsFixedWidth(width:unknown):boolean{
  return typeof width==="number";
}

/** Bounded adapter for optional external hints; the pure function above
 * deliberately retains all original source width coercion rules.
 */
export function sourceListViewExtraWidth(
  width:number|string|null|undefined,count:number,details=false
):string|undefined{
  if(!Number.isFinite(count)||count<=0)return undefined;
  if(!width)return sourceNormalizeListWidth(undefined,count,details);
  if(typeof width==="number")
    return Number.isFinite(width)&&width>=0
      ?sourceNormalizeListWidth(width,count,details):undefined;
  const normalized=width.trim();
  if(!/^(?:(?:\d+(?:\.\d+)?)(?:px|%|em|rem|vw|vh)|auto|min-content|max-content|fit-content)$/.test(normalized))
    return undefined;
  return sourceNormalizeListWidth(normalized,count,details);
}
export interface SourceListViewExtraProps{
  children:ReactNode;width?:number|string|null;count?:number;details?:boolean;className?:string;
}
/** Original c162 span is shared between the Details and Tiles chunks. */
export function SourceListViewExtra({
  children,width,count,details=false,className=""
}:SourceListViewExtraProps){
  const normalized=count===undefined?undefined
    :sourceListViewExtraWidth(width,count,details);
  const style:CSSProperties|undefined=normalized?{width:normalized}:undefined;
  return <span className={"listview__item-extra "+className} style={style}>{children}</span>;
}

/** Source a321 listview__header: native buttons for all listed columns.
 * Existing Explorer CSS grid opts out of inline widths for responsiveness.
 */
export interface SourceListViewHeaderColumn{
  key:string;label:string;width?:number|string;
}
export interface SourceListViewHeaderProps{
  columns:readonly SourceListViewHeaderColumn[];className?:string;useSourceWidths?:boolean;
}
export function SourceListViewHeader({
  columns,className="",useSourceWidths=true
}:SourceListViewHeaderProps){
  return <div className={"listview__header source-listview-header "+className}
    data-test-listview-columnheader="">
    {columns.map(column=><button key={column.key} type="button"
      className={"listview__header-column"+(sourceListColumnIsFixedWidth(column.width)?" shrink-0":"")}
      style={useSourceWidths?{width:sourceNormalizeListWidth(column.width,columns.length)}:undefined}>
      {column.label}
    </button>)}
  </div>;
}
