import {sourceClockHands,sourceClockDigital} from "./sourceClock";

/** Source ada7: 128px face, sixty marks and hour/minute/second hands. */
export function SourceAnalogClock({now}:{now:Date}){
  const hands=sourceClockHands(now);
  return <div className="source-chromeos-clock" data-test-source-analog-clock="">
    <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true">
      {Array.from({length:60},(_,i)=><line key={i} x1="64" x2="64" y1="1" y2={i%5===0?8:3}
        stroke="currentColor" strokeWidth={i%5===0?2:1} transform={`rotate(${i*6} 64 64)`}/>)}
      <line x1="64" y1="64" x2="64" y2="38.4" stroke="currentColor" strokeWidth="4"
        transform={`rotate(${hands.hour} 64 64)`} data-test-clock-hand="hour"/>
      <line x1="64" y1="64" x2="64" y2="19.2" stroke="currentColor" strokeWidth="2"
        transform={`rotate(${hands.minute} 64 64)`} data-test-clock-hand="minute"/>
      <line x1="64" y1="64" x2="64" y2="19.2" stroke="currentColor" strokeWidth="1"
        transform={`rotate(${hands.second} 64 64)`} data-test-clock-hand="second"/>
      <circle cx="64" cy="64" r="2" fill="currentColor"/>
    </svg>
    <time dateTime={now.toISOString()} data-test-source-digital-seconds="">{sourceClockDigital(now,true)}</time>
  </div>;
}
