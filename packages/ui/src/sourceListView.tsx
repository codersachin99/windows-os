import type { CSSProperties, ReactNode } from "react";
import "./sourceListView.css";

/** Source listview-details.js (32cd) and listview-tiles.js (7662).
 * The source components own a common listview__view surface, while listview
 * item interactions, selection, icons and handlers are supplied by the caller.
 */
export type SourceListViewVariant="details"|"tiles"|"plain";
export interface SourceListViewProps {
  variant:SourceListViewVariant;
  className?:string;
  children:ReactNode;
  testId?:string;
}
export function SourceListView({variant,className="",children,testId}:SourceListViewProps){
  return <div data-test-source-listview={testId??variant}
    className={["listview__view",variant==="plain"?"":"has-"+variant,className]
      .filter(Boolean).join(" ")}>
    {children}
  </div>;
}

export interface SourceListViewExtraProps{
  children:ReactNode;
  /** Optional source-style width hint. Explorer uses its column CSS grid. */
  width?:number|string;
  count?:number;
  className?:string;
}
/** Source listview-extra c162 is the same element in both original bundles. */
export function SourceListViewExtra({
  children,width,count,className=""
}:SourceListViewExtraProps){
  const style:CSSProperties|undefined=width===undefined?undefined:
    {width:sourceListViewExtraWidth(width,count??1)};
  return <span className={"listview__item-extra "+className} style={style}>{children}</span>;
}
/** Bounded CSS width adapter; never insert arbitrary CSS from a virtual file.
 * a321.normalizeWidth exact source coercion still requires direct source trace.
 */
export function sourceListViewExtraWidth(
  width:number|string|undefined,count:number
):string|undefined{
  if(typeof width==="number")
    return Number.isFinite(width)&&width>=0?width+"px":undefined;
  if(typeof width==="string"){
    const normalized=width.trim();
    return /^(?:\d+(?:\.\d+)?)(?:px|%)$/.test(normalized)?normalized:undefined;
  }
  if(!Number.isFinite(count)||count<=0)return undefined;
  return (100/count)+"%";
}
