import {useEffect,useRef,useState} from "react";
import {sourceBatteryPercent,sourceBrightness,sourceBatteryMeterOffset} from "./sourceBattery";
import "./sourceBatteryMeter.css";

type BatteryManager=EventTarget&{level:number;charging:boolean};
type BatteryStatus={level:number;percent:number;charging:boolean};
type BatteryNavigator=Navigator&{getBattery?:()=>Promise<BatteryManager>};

/** Source a88c battery status, via the browser capability when available.
 * Unsupported browsers must not report a fabricated full battery. */
export function useSourceBatteryStatus(){
  const [status,setStatus]=useState<BatteryStatus|null>(null);
  useEffect(()=>{
    let active=true;
    let manager:BatteryManager|undefined;
    const update=()=>{
      if(!active||!manager)return;
      const percent=sourceBatteryPercent(manager.level);
      setStatus(percent===null?null:{level:manager.level,percent,charging:manager.charging});
    };
    const nav=navigator as BatteryNavigator;
    if(nav.getBattery){
      void nav.getBattery().then(value=>{
        if(!active)return;
        manager=value;
        manager.addEventListener("levelchange",update);
        manager.addEventListener("chargingchange",update);
        update();
      }).catch(()=>{if(active)setStatus(null);});
    }
    return()=>{
      active=false;
      manager?.removeEventListener("levelchange",update);
      manager?.removeEventListener("chargingchange",update);
    };
  },[]);
  return status;
}

function BatteryGlyph({status,shadow=false}:{status:BatteryStatus|null;shadow?:boolean}){
  const level=status?.level??0;
  return <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true" className={shadow?"source-battery-icon-shadow":undefined}>
    {status?.charging?<>
      <path d="M12 8V12H14V18H15V19H16V26H6V8H12Z" fill="currentColor"/>
      <path d="M4 4.5H16M4 29.5H18M2.5 6V28M8 3.5H14M8 2.5H14M16 5.5H3.5V28.5H18M18.5 2V8M19.5 2V8M24.5 2V8M25.5 2V8M14 8.5H30M14 9.5H30M16 12.5H28M16 13.5H28M16 14.5H28M16 15.5H28M16 16.5H28M17 18.5H27M18 19.5H26M20 20.5H24M20 22.5H24M20 23.5H24M20 24.5H24M20 25.5H24M20 26.5H24M20 28.5H24M20 29.5H24M20 30.5H24M20 31.5H24" stroke="currentColor"/>
    </>:<>
      <path d="M9 4.5H23M9 29.5H23M24.5 6V28M7.5 6V28M13 3.5H19M13 2.5H19" stroke="currentColor"/>
      <rect x="8.5" y="5.5" width="15" height="23" stroke="currentColor"/>
      {status&&<rect x="11" y={8+18*(1-level)} width="10" height={18*level} fill="currentColor"/>}
      {!status&&<text x="16" y="22" textAnchor="middle" fontSize="14" fill="currentColor">?</text>}
    </>}
  </svg>;
}
export function SourceMacOSBattery({open,setOpen,onOpen,brightness,onBrightness,xpArtwork=false,theme="macos"}:{
  open:boolean;setOpen:(open:boolean)=>void;onOpen:()=>void;
  brightness:number;onBrightness:(value:number)=>void;xpArtwork?:boolean;theme?:string
}){
  const status=useSourceBatteryStatus();
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    return()=>document.removeEventListener("pointerdown",outside);
  },[open,setOpen]);
  return <div ref={root} className="source-macos-battery windows-taskbar__tray-icon" data-test-tray-icon="TaskbarBattery"
    onKeyDown={event=>{
      if(event.key==="Escape"&&open){
        event.preventDefault();event.stopPropagation();setOpen(false);trigger.current?.focus({preventScroll:true});
      }
    }}>
    <button type="button" ref={trigger} className="source-macos-battery-trigger" data-test-battery=""
      aria-label="Battery" title={status?status.percent+"%":"Battery status unavailable"}
      aria-expanded={open} aria-haspopup="dialog" onClick={()=>{if(!open)onOpen();setOpen(!open);}}>
      {xpArtwork&&status?<img width={16} height={16} alt="" src={status.charging?"/assets/images/battery-charging-winxp.321f84b7.webp":"/assets/images/battery-winxp.af8edd8a.webp"}/>:<BatteryGlyph status={status} shadow={theme!=="base"&&theme!=="win11"}/> }
    </button>
    {open&&<div className="source-macos-battery-popup" data-test-battery-popup="" role="dialog" aria-label="Battery">
      {theme==="macos"?<div role="status">
        <div className="source-macos-battery-heading"><strong>Battery</strong><span data-test-battery-percent="">{status?status.percent+"%":"Unavailable"}</span></div>
        <div>Power source: {status?(status.charging?"Power Adapter":"Battery"):"Unavailable"}</div>
        {!status&&<small>Battery information is not exposed by this browser.</small>}
      </div>:<div role="status" className="source-battery-meter-summary">
        {status?<><span className="source-battery-meter" data-test-battery-meter="" aria-hidden="true"
          style={{backgroundPositionX:(sourceBatteryMeterOffset(status.level)??0)+"px"}}>
          {status.charging&&<span className="source-battery-plug" data-test-battery-plug=""/>}
        </span>
        <div>{status.charging&&status.level===1?<>Fully charged (<span data-test-battery-percent="">{status.percent}%</span>)</>:<>
          <span data-test-battery-percent="">{status.percent}%</span> remaining
          {status.charging&&<> (plugged in, charging)</>}
        </>}</div></>:<div><span data-test-battery-percent="">Unavailable</span>
          <small>Battery information is not exposed by this browser.</small></div>}
      </div>}
      <fieldset>
        <legend>Select a power plan:</legend>
        <label><input type="radio" name="source-macos-power-plan" checked={brightness===1} onChange={()=>onBrightness(1)}/> Balanced</label>
        <label><input type="radio" name="source-macos-power-plan" checked={brightness===.6} onChange={()=>onBrightness(.6)}/> Power saver</label>
      </fieldset>
      <div>
        <label className="source-macos-battery-display">{theme==="macos"?<strong>Display</strong>:<span>Adjust screen brightness</span>}
          <input type="range" aria-label="Display brightness" min=".6" max="1.2" step=".1" value={brightness}
            onChange={event=>onBrightness(sourceBrightness(Number(event.currentTarget.value)))}/>
        </label>
        <small>Guest display only; does not change device brightness or power plan.</small>
      </div>
    </div>}
  </div>;
}
