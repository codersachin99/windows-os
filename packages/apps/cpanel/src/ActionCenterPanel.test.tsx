import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {ActionCenterPanel} from "./ActionCenterPanel";
describe("original Action Center history",()=>{
  it("renders the original empty notice and disabled sidebar links",()=>{
    const html=renderToStaticMarkup(<ActionCenterPanel theme="win7" messages={[]} onBack={()=>{}}/>);
    expect(html).toContain("data-test-no-messages");
    expect(html).toContain("No messages");
    expect(html).toContain("Change Action Center settings");
    expect(html).toContain("View archived messages");
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
  it("uses shared theme severity artwork and escapes notification content",()=>{
    const html=renderToStaticMarkup(<ActionCenterPanel theme="win10" messages={[
      {id:"error",type:"error",title:"Error",body:"<script>unsafe</script>"},
      {id:"success",type:"success",title:"Updated",body:"First\nSecond"},
      {id:"info",type:"info",title:"Info",body:"Text"}
    ]} onBack={()=>{}}/>);
    expect(html).toContain("notifi-error-win10.956ad576.webp");
    expect(html).toContain("notifi-success-win10.5fdfecb5.webp");
    expect(html).toContain("is-error");expect(html).toContain("is-success");
    expect(html).toContain("data-test-message");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;unsafe&lt;/script&gt;");
    expect(html).toContain("First\nSecond");
    expect(html).not.toContain("data-test-no-messages");
  });
});

it("renders validated history links without raw HTML",()=>{
  const html=renderToStaticMarkup(<ActionCenterPanel theme="win7" messages={[{id:"link",type:"success",title:"Update",body:"[changelog](https://example.com) [unsafe](file:///tmp/file)"}]} onBack={()=>{}}/>);
  expect(html).toContain('href="https://example.com/"');expect(html).toContain('rel="noopener noreferrer"');expect(html).not.toContain('href="file:');
});
