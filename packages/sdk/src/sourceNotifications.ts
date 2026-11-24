/** Guest-local notification delivery boundary. Based on source f0ed:
 * queued toast, history, MarkAllSeen, MarkAllRead and Dismiss are separate.
 * Only trusted application code may publish; no remote feed is implied. */
export type SourceNotificationType="success"|"info"|"warning"|"error";
export type SourceNotificationInput={id:string;type:SourceNotificationType;title:string;body:string};
export type SourceNotification=Readonly<SourceNotificationInput&{seen:boolean;read:boolean}>;
export type SourceNotificationSnapshot=Readonly<{history:readonly SourceNotification[];queue:readonly string[]}>;
export const SOURCE_NOTIFICATION_TIMEOUT=8000;
export function sourceNotificationCurrent(state:SourceNotificationSnapshot):SourceNotification|undefined{
  return state.history.find(message=>message.id===state.queue[0]);
}
export function sourceNotificationSeverity(state:SourceNotificationSnapshot):SourceNotificationType|undefined{
  const unread=state.history.filter(message=>!message.read);
  return (["error","warning","info","success"] as const).find(type=>unread.some(message=>message.type===type));
}
export class SourceNotificationStore{
  private state:SourceNotificationSnapshot={history:[],queue:[]};
  private listeners=new Set<()=>void>();
  snapshot=()=>this.state;
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
  private update(next:SourceNotificationSnapshot){
    this.state=next;
    for(const listener of this.listeners)listener();
  }
  publish(input:SourceNotificationInput):boolean{
    if(!input.id||!input.title||this.state.history.some(message=>message.id===input.id))return false;
    const message:SourceNotification=Object.freeze({...input,seen:false,read:false});
    this.update({history:[message,...this.state.history],queue:[...this.state.queue,message.id]});
    return true;
  }
  dismiss(id:string){
    if(!this.state.queue.includes(id))return;
    this.update({...this.state,queue:this.state.queue.filter(value=>value!==id)});
  }
  markAllSeen(){
    if(this.state.history.every(message=>message.seen))return;
    this.update({...this.state,history:this.state.history.map(message=>({...message,seen:true}))});
  }
  markAllRead(){
    if(this.state.history.every(message=>message.read))return;
    this.update({...this.state,history:this.state.history.map(message=>({...message,seen:true,read:true}))});
  }
  reset(){this.update({history:[],queue:[]});}
}
export const sourceNotifications=new SourceNotificationStore();
