import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceMacOSNotificationToast} from "./SourceMacOSNotificationToast";
describe("macOS notification markup",()=>{
  it("renders the source close hook and escapes message content",()=>{
    const html=renderToStaticMarkup(<SourceMacOSNotificationToast message={{
      id:"sample",type:"warning",title:"Warning",body:"<script>bad()</script>",seen:false,read:false
    }} onDismiss={()=>{}}/>);
    expect(html).toContain("data-test-system-notification");
    expect(html).toContain("data-test-notification-close");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});

it("renders the original theme artwork and leaves info text-only",()=>{
  for(const [theme,type,file] of [
    ["win7","success","notifi-success.9bd6d775.webp"],
    ["win98","warning","warning-win2k.333f629e.png"],
    ["macos","error","notifi-error-win10.956ad576.webp"],
    ["onebit","success","check-onebit.35be58dd.svg"]
  ] as const){
    const html=renderToStaticMarkup(<SourceMacOSNotificationToast theme={theme} message={{
      id:"sample",type,title:"Message",body:"Body",seen:false,read:false
    }} onDismiss={()=>{}}/>);
    expect(html).toContain('src="/assets/images/'+file+'"');
    expect(html).toContain("data-test-notification-artwork");
  }
  const html=renderToStaticMarkup(<SourceMacOSNotificationToast theme="win7" message={{
    id:"info",type:"info",title:"Information",body:"Body",seen:false,read:false
  }} onDismiss={()=>{}}/>);
  expect(html).not.toContain("data-test-notification-artwork");
  expect(html).toContain("Information");
});
