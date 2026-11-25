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

it("chooses the original top/bottom balloon or modern card direction",()=>{
  for(const [theme,direction] of [["win7","top"],["winxp","top"],["onebit","top"],["macos","bottom"],["ubuntu","bottom"],["win10","card"],["win11dark","card"],["chromeos","card"]]){
    const html=renderToStaticMarkup(<SourceMacOSNotificationToast theme={theme} message={{id:"direction",type:"success",title:"Title",body:"Body",seen:false,read:false}} onDismiss={()=>{}}/>);
    expect(html).toContain('data-notification-balloon="'+direction+'"');
    expect(html).toContain("source-notification-copy");
  }
});

it("renders safe inline links without interpreting unsafe schemes or labels",()=>{
  const html=renderToStaticMarkup(<SourceMacOSNotificationToast message={{id:"link",type:"success",title:"Update",body:"[<b>changelog</b>](https://example.com) [bad](javascript:alert(1))",seen:false,read:false}} onDismiss={()=>{}}/>);
  expect(html).toContain('href="https://example.com/"');expect(html).toContain('target="_blank"');expect(html).toContain('rel="noopener noreferrer"');expect(html).toContain("&lt;b&gt;changelog&lt;/b&gt;");expect(html).not.toContain('href="javascript:');
});
