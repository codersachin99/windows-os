import {it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceNotificationInline} from "./SourceNotificationInline";
it("renders source inline tokens as safe React elements, not raw HTML or images",()=>{
  const html=renderToStaticMarkup(<SourceNotificationInline body={"**Bold** *Em* ~~old~~ "+String.fromCharCode(96)+"<script>"+String.fromCharCode(96)+" ![tracker](https://example.com/img) <https://example.org>"}/>);
  expect(html).toContain("<strong>Bold</strong>");
  expect(html).toContain("<em>Em</em>");
  expect(html).toContain("<del>old</del>");
  expect(html).toContain("<code>&lt;script&gt;</code>");
  expect(html).not.toContain("<img");
  expect(html).toContain('href="https://example.org/"');
});
