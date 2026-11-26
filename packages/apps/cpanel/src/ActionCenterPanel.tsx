import {useEffect,useRef} from "react";
import {sourceNotificationArt} from "@windows-os/assets";
import {SourceNotificationInline} from "@windows-os/ui/notification-inline";
import {SOURCE_CPANEL_ACTION_CENTER_TEXT as text,type SourceControlPanelActionMessage} from "./model";

/** Original cpanel.js te/oe: mark history read on entering this page.
 * Render validated inline links, never source HTML. */
export function ActionCenterPanel({theme,messages,onReadMessages,onBack}:{
  theme:string;messages:readonly SourceControlPanelActionMessage[];
  onReadMessages?:()=>void;onBack:()=>void;
}){
  const read=useRef(onReadMessages);
  read.current=onReadMessages;
  useEffect(()=>{read.current?.();},[]);
  return <div className="windows-cpanel__action" data-test-cpanel-action-center="">
    <aside className="windows-cpanel__action-sidebar">
      <button type="button" onClick={onBack}>Control Panel</button>
      <button type="button" disabled>{text.changeSettings}</button>
      <button type="button" disabled>{text.archived}</button>
    </aside>
    <div className="windows-cpanel__action-content">
      <h2>{text.title}</h2>
      <p>{messages.length?text.hasMessagesInstruction:text.emptyInstruction}</p>
      {!messages.length?<div className="windows-cpanel__action-empty" data-test-no-messages="">{text.empty}</div>:
        messages.map(message=>{
          const icon=sourceNotificationArt(theme,message.type);
          return <article key={message.id} data-test-message="" data-test-cpanel-action-message={message.id}
            className={"windows-cpanel__action-message is-"+message.type}>
            {icon&&<img className="windows-cpanel__action-icon" src={icon} width={32} height={32} alt=""/>}
            <div className="windows-cpanel__action-copy">
              <strong>{message.title}</strong><pre><SourceNotificationInline body={message.body}/></pre>
            </div>
          </article>;
        })}
    </div>
  </div>;
}
