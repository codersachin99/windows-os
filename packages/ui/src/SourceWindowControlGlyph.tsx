import {useId} from "react";
import {sourceIsXpFamily,type ThemeId} from "@windows-os/contracts";

export type SourceWindowControlKind="minimize"|"maximize"|"restore"|"close";
interface SourceWindowControlGlyphProps{
  theme:ThemeId;
  kind:SourceWindowControlKind;
}

/** Pinned source compiled ControlItem, module e863:
 * legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * src/modules/chunks/shared~about~bin~bsod~calc~camera~chess~chrome~cmd~computer~cpanel~find~gadgets~games~ie~installer~i~40bd2819.js
 *
 * Original: Aero/Vista -> variant 1, WinXP -> variant 2,
 * Win11 -> fallback glyph. SVG path data, viewboxes, sizes and
 * Aero gradient stops are transferred from that exact source.
 * The React "win7" theme represents original Aero.
 */
const aeroFrameStops=[
  ["0","white"],["0.4","white"],["0.4","#F0F0F0"],
  ["0.5","#F0F0F0"],["0.502937","#E8E8E8"],["0.6","#E8E8E8"],
  ["0.603321","#E0E0E0"],["0.7","#E0E0E0"],["0.701063","#DADADA"]
] as const;
const aeroCloseStops=[
  ["0","white"],["0.379378","white"],["0.38","#F0F0F0"],
  ["0.49733","#F0F0F0"],["0.49733","#E8E8E8"],["0.63","#E8E8E8"],
  ["0.631714","#E0E0E0"],["0.85","#E0E0E0"],
  ["0.851186","#DADADA"]
] as const;

export function SourceWindowControlGlyph({theme,kind}:SourceWindowControlGlyphProps){
  const svgId=useId();
  const aero=theme==="win7"||theme==="winvista";
  const xp=sourceIsXpFamily(theme);
  const common={
    "aria-hidden":true as const,
    focusable:"false" as const,
    "data-source-window-glyph":kind,
    className:"windows-window__control-glyph"
  };
  if(aero){
    const gradientId="window-control-"+svgId.replace(/:/g,"");
    if(kind==="minimize")return <svg {...common} width="12" height="12"
      viewBox="0 -3 12 5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x=".5" y=".5" width="11" height="4"
        fill={`url(#${gradientId})`} stroke="#535666"/>
      <defs><linearGradient id={gradientId} x1="6" y1="0" x2="6" y2="5"
        gradientUnits="userSpaceOnUse">
        <stop offset=".5" stopColor="#EEEEEE"/>
        <stop offset=".5" stopColor="#E4E4E4"/>
      </linearGradient></defs>
    </svg>;
    if(kind==="maximize")return <svg {...common} width="12" height="12"
      viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M17 15H0V0H17V15ZM4 4.5V10.5H13V4.5H4Z"
        fill={`url(#${gradientId})`}/>
      <rect x="4.75" y="5.25" width="7.5" height="4.5"
        stroke="#535666" strokeWidth="1.5"/>
      <rect x=".75" y=".75" width="15.5" height="13.5"
        stroke="#535666" strokeWidth="1.5"/>
      <defs><linearGradient id={gradientId} x1="8.5" y1="0" x2="8.5"
        y2="15" gradientUnits="userSpaceOnUse">
        {aeroFrameStops.map(([offset,color],i)=>
          <stop key={i} offset={offset} stopColor={color}/>)}
      </linearGradient></defs>
    </svg>;
    if(kind==="restore")return <svg {...common} width="12" height="12"
      viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 0H4V8H8V5.1H17V11.9H13V17H21V0Z" fill="white"/>
      <rect x="4.75" y=".75" width="15.5" height="15.5"
        stroke="#535666" strokeWidth="1.5"/>
      <path fillRule="evenodd" clipRule="evenodd"
        d="M17 21H0V4H17V21ZM5 9.7V16.5H12V9.7H5Z"
        fill={`url(#${gradientId})`}/>
      <path d="M11.75 9.25V15.75H5.25V9.25H11.75Z"
        stroke="#535666" strokeWidth="1.5"/>
      <rect x=".75" y="4.75" width="15.5" height="15.5"
        stroke="#535666" strokeWidth="1.5"/>
      <defs><linearGradient id={gradientId} x1="8.5" y1="4" x2="8.5"
        y2="21" gradientUnits="userSpaceOnUse">
        {aeroFrameStops.map(([offset,color],i)=>
          <stop key={i} offset={offset} stopColor={color}/>)}
      </linearGradient></defs>
    </svg>;
    return <svg {...common} width="13" height="12" viewBox="0 0 13 12"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 1H0.5V3H1.5V4H2.5V5H3.5V7H2.5V8H1.5V9H0.5V11H5.5V10H7.5V11H12.5V9H11.5V8H10.5V7H9.5V5H10.5V4H11.5V3H12.5V1H7.5V2H5.5V1Z"
        fill={`url(#${gradientId})`}/>
      <path d="M6.5 10V8.5M6.5 3.5V2M0.5 1H5.5V2H7.5V1H12.5V3H11.5V4H10.5V5H9.5V7H10.5V8H11.5V9H12.5V11H7.5V10H5.5V11H0.5V9H1.5V8H2.5V7H3.5V5H2.5V4H1.5V3H0.5V1Z"
        stroke="#535666"/>
      <defs><linearGradient id={gradientId} x1="6.5" y1="-.5" x2="6.5"
        y2="11.5" gradientUnits="userSpaceOnUse">
        {aeroCloseStops.map(([offset,color],i)=>
          <stop key={i} offset={offset} stopColor={color}/>)}
      </linearGradient></defs>
    </svg>;
  }
  if(xp){
    if(kind==="minimize")return <svg {...common} width="14" height="14"
      viewBox="1 -5 7 7" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h6v2H0z" fill="currentColor"/>
    </svg>;
    if(kind==="maximize")return <svg {...common} width="14" height="14"
      viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 0H0v9h9V0zM8 2H1v6h7V2z"
        fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
    </svg>;
    if(kind==="restore")return <svg {...common} width="14" height="14"
      viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 11H9ZM0 5H9ZM0 6H9ZM0.5 4.5V11.5ZM8.5 4.5V11.5ZM2 1H11ZM2 2H11ZM9 7H11ZM2.5 1V5ZM10.5 1V7Z"
        fill="currentColor"/>
      <path d="M0 11H9M0 5H9M0 6H9M0.5 4.5V11.5M8.5 4.5V11.5M2 1H11M2 2H11M9 7H11M2.5 1V5M10.5 1V7"
        stroke="currentColor"/>
    </svg>;
    return <svg {...common} width="14" height="14"
      viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 0.5H2ZM9 0.5H10ZM0 1.5H3ZM8 1.5H11ZM1 2.5H4ZM7 2.5H10ZM2 3.5H5ZM6 3.5H9ZM3 4.5H8ZM4 5.5H7ZM3 6.5H8ZM2 7.5H5ZM6 7.5H9ZM1 8.5H4ZM7 8.5H10ZM0 9.5H3ZM8 9.5H11ZM1 10.5H2ZM9 10.5H10Z"
        fill="currentColor"/>
      <path d="M1 0.5H2M9 0.5H10M0 1.5H3M8 1.5H11M1 2.5H4M7 2.5H10M2 3.5H5M6 3.5H9M3 4.5H8M4 5.5H7M3 6.5H8M2 7.5H5M6 7.5H9M1 8.5H4M7 8.5H10M0 9.5H3M8 9.5H11M1 10.5H2M9 10.5H10"
        stroke="currentColor"/>
    </svg>;
  }
  // Win11 original fallback glyphs in ControlItem (not Unicode symbols).
  if(kind==="minimize")return <svg {...common} width="12" height="12"
    viewBox="0 -3 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0.5H10" stroke="currentColor"/>
  </svg>;
  if(kind==="maximize")return <svg {...common} width="12" height="12"
    viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x=".5" y=".5" width="9" height="9" stroke="currentColor"/>
  </svg>;
  if(kind==="restore")return <svg {...common} width="12" height="12"
    viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="8" height="8" stroke="currentColor"/>
    <path d="M11.5 0.5V8.5H9.5V2.5H3.5V0.5H11.5Z" stroke="currentColor"/>
  </svg>;
  return <svg {...common} width="14" height="14" viewBox="0 0 10 11"
    fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.757359 1.25737L9.24264 9.74265M9.24264 1.25737L0.757359 9.74265"
      stroke="currentColor"/>
  </svg>;
}
