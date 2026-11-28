/** Frozen source clock-analog ada7 and clock-digital aa42. */
export function sourceClockHands(date:Date){
  return {hour:(date.getHours()%12)*30+date.getMinutes()/2,minute:date.getMinutes()*6,second:date.getSeconds()*6};
}
export function sourceClockDigital(date:Date,seconds=false){
  const values=[date.getHours(),date.getMinutes()];
  if(seconds)values.push(date.getSeconds());
  return values.map(n=>String(n).padStart(2,"0")).join(":");
}
