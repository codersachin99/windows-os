import {useEffect,useRef,useState} from "react";
import {SourceAnalogClock} from "./SourceAnalogClock";
import {sourceClockDigital} from "./sourceClock";
import {sourceCalendarDays,sourceCalendarMonth,sourceCalendarSameDay} from "./sourceCalendar";

const fullDate=(d:Date)=>d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const monthLabel=(d:Date)=>d.toLocaleDateString("en-US",{month:"long"});

export function SourceMacOSDateTime({onOpen,open,setOpen,baseLayout=false,ubuntu=false}:{onOpen:()=>void;open:boolean;setOpen:(open:boolean)=>void;baseLayout?:boolean;ubuntu?:boolean}){
  const [now,setNow]=useState(()=>new Date());
  const [month,setMonth]=useState(()=>sourceCalendarMonth(now,0));
  const [selected,setSelected]=useState(now);
  const [picker,setPicker]=useState<"month"|"year"|null>(null);
  const [yearPage,setYearPage]=useState(now.getFullYear()-now.getFullYear()%12);
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const reset=()=>{
    const date=new Date();
    setSelected(date);setMonth(sourceCalendarMonth(date,0));setPicker(null);
  };
  useEffect(()=>{
    const timer=window.setInterval(()=>setNow(new Date()),1000);
    return()=>window.clearInterval(timer);
  },[]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    return()=>document.removeEventListener("pointerdown",outside);
  },[open]);
  return <div ref={root} className="source-macos-datetime" data-test-tray-clock=""
    onKeyDown={event=>{
      if(event.key==="Escape"&&open){
        event.preventDefault();event.stopPropagation();
        if(picker)setPicker(null);
        else{setOpen(false);trigger.current?.focus({preventScroll:true});}
      }
    }}>
    <button ref={trigger} type="button" className="source-macos-datetime-trigger"
      data-test-macos-datetime-trigger="" data-test-datetime-trigger="" aria-label="Date and time" aria-haspopup="dialog" aria-expanded={open}
      onClick={()=>{if(open)setOpen(false);else{onOpen();reset();setOpen(true);}}}>
      <time dateTime={now.toISOString()} className="windows-taskbar__clock">
        <span>{sourceClockDigital(now)}</span>
        <span>{ubuntu?now.toLocaleDateString("en-US"):now.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
      </time>
    </button>
    {open&&<div role="dialog" aria-label="Calendar" className="source-macos-datetime-popup" data-test-macos-datetime-popup="" data-test-datetime-popup="">
      <button type="button" className="source-macos-calendar-today" onClick={reset}>{fullDate(now)}</button>
      <div className="source-datetime-content">
      <section className="source-macos-calendar">
        <header>
          <div className="source-macos-calendar-monthyear">
            <button type="button" aria-label="Choose month" onClick={()=>setPicker(picker==="month"?null:"month")}>{monthLabel(month)}</button>
            <button type="button" aria-label="Choose year" onClick={()=>{setYearPage(month.getFullYear()-month.getFullYear()%12);setPicker(picker==="year"?null:"year");}}>{month.getFullYear()}</button>
          </div>
          <button type="button" className="source-macos-calendar-arrow" aria-label="Previous month" onClick={()=>{setPicker(null);setMonth(m=>sourceCalendarMonth(m,-1));}}>‹</button>
          <button type="button" className="source-macos-calendar-arrow" aria-label="Next month" onClick={()=>{setPicker(null);setMonth(m=>sourceCalendarMonth(m,1));}}>›</button>
        </header>
        {picker==="month"?<div className="source-macos-calendar-picker" aria-label="Months">
          {Array.from({length:12},(_,i)=><button type="button" key={i}
            className={month.getFullYear()===now.getFullYear()&&i===now.getMonth()?"is-today":""}
            onClick={()=>{setMonth(new Date(month.getFullYear(),i,1));setPicker(null);}}>
            {new Date(2000,i,1).toLocaleDateString("en-US",{month:"short"})}
          </button>)}
        </div>:picker==="year"?<>
          <div className="source-macos-calendar-picker" aria-label="Years">
            {Array.from({length:12},(_,i)=>yearPage+i).map(year=><button type="button" key={year}
              className={year===now.getFullYear()?"is-today":""}
              onClick={()=>{setMonth(new Date(year,month.getMonth(),1));setPicker(null);}}>{year}</button>)}
          </div>
          <div className="source-macos-calendar-year-arrows">
            <button type="button" aria-label="Previous years" onClick={()=>setYearPage(y=>y-12)}>‹</button>
            <button type="button" aria-label="Next years" onClick={()=>setYearPage(y=>y+12)}>›</button>
          </div>
        </>:<>
          <div className="source-macos-calendar-weekdays" aria-hidden="true">
            {["S","M","T","W","T","F","S"].map((day,i)=><span key={i}>{day}</span>)}
          </div>
          <div className="source-macos-calendar-days">
            {sourceCalendarDays(month).map(day=><button type="button" key={day.getTime()}
              data-test-macos-calendar-day="" aria-label={fullDate(day)}
              aria-current={sourceCalendarSameDay(day,now)?"date":undefined}
              aria-pressed={sourceCalendarSameDay(day,selected)}
              className={(day.getMonth()!==month.getMonth()?"is-outside ":"")+(sourceCalendarSameDay(day,now)?"is-today":"")}
              onClick={()=>{setSelected(day);if(day.getMonth()!==month.getMonth())setMonth(sourceCalendarMonth(day,0));}}>{day.getDate()}</button>)}
          </div>
        </>}
      </section>
      {baseLayout&&<SourceAnalogClock now={now}/>}
      </div>
      {baseLayout&&<button type="button" className="source-chromeos-date-settings" disabled title="Native date settings are unavailable in the browser build">Change date and time settings...</button>}
    </div>}
  </div>;
}
