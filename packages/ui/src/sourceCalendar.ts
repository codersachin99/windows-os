/** Source BaseCalendar: local dates, Sunday-first, 42 day cells. */
export function sourceCalendarMonth(date:Date,offset:number){
  return new Date(date.getFullYear(),date.getMonth()+offset,1);
}
export function sourceCalendarDays(month:Date){
  const first=sourceCalendarMonth(month,0);
  return Array.from({length:42},(_,i)=>new Date(first.getFullYear(),first.getMonth(),i+1-first.getDay()));
}
export function sourceCalendarSameDay(a:Date,b:Date){
  return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
}
