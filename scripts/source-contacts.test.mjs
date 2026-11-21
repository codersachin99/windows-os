import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = async path => readFile(new URL(path, root));
const blobSha = bytes => createHash("sha1")
  .update(`blob ${bytes.length}\0`).update(bytes).digest("hex");

test("the original Contacts entry is pinned byte-for-byte", async () => {
  const html = await read("apps/web/public/apps/contacts/index.html");
  assert.equal(blobSha(html), "9079378b7349c3ba255e40c40f117d73a6040f32");
});

test("the React Contacts app uses exactly the original CSS rules", async () => {
  const html = (await read("apps/web/public/apps/contacts/index.html")).toString("utf8");
  const style = html.match(/<style>([\s\S]*?)<\/style>/);
  assert.ok(style, "source Contacts page must contain its own stylesheet");
  const port = (await read("packages/apps/contacts/src/source.css")).toString("utf8");
  assert.equal(port.trim(), style[1].trim());
});

test("source-defined external app identity and window dimensions stay locked", async () => {
  const config = await read("packages/sdk/src/legacy-shortcuts.json");
  assert.equal(blobSha(config), "d6692d9d5a4c2ee9417344a6dea8eab88c74f6ed");
  const shortcuts = JSON.parse(config.toString("utf8"));
  assert.deepEqual(shortcuts.map(({ key, lbl, icon, width, height }) =>
    ({ key, lbl, icon, width, height })), [
    { key: "web_contacts", lbl: "Contacts",
      icon: "/apps/contacts/icon.webp", width: 780, height: 520 }
  ]);
});
