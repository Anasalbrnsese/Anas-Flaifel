import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Expected one main heading');
assert.ok(!/{{[A-Z_]+}}/.test(html), 'Unresolved template value');
for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const target = match[1];
  if (target.startsWith('#')) assert.ok(ids.includes(target.slice(1)), 'Broken anchor: ' + target);
  else if (target.startsWith('./')) await access(path.join(root, target));
}
for (const match of html.matchAll(/<(?:input|img)\b[^>]*>/g)) {
  if (match[0].startsWith('<img')) assert.ok(/alt="[^"]+"/.test(match[0]), 'Image needs alternative text');
  else {
    const id = /id="([^"]+)"/.exec(match[0])?.[1];
    assert.ok(id && html.includes('for="' + id + '"'), 'Input needs a label');
  }
}
const profile = JSON.parse(await readFile(path.join(root, 'content/portfolio.json'), 'utf8'));
assert.equal(profile.profile.title, 'SCADA & IoT Engineer');
assert.ok(html.includes('In development'));
assert.ok(!/20\+|03\+/.test(html), 'Unapproved legacy statistics');
for (const cssPath of ['my-personal-page.css', 'assets/css/projects.css', 'assets/css/scene.css']) {
  const css = await readFile(path.join(root, cssPath), 'utf8');
  for (const match of css.matchAll(/url\(['"]?([^)'"]+)/g)) {
    if (!match[1].startsWith('http')) await access(path.resolve(root, path.dirname(cssPath), match[1]));
  }
}
await access(path.join(root, 'assets/image/portrait.webp'));
console.log('Checked anchors, assets, IDs, headings, labels, template output, and public-content boundaries.');
