import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 })
for (const [name, path] of [['home','/card/'],['tool','/card/annual-fee']]) {
  await p.goto('http://localhost:6174'+path, { waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  await p.screenshot({ path: `/tmp/shot/card-${name}.png` })
  console.log(name, await p.title())
}
await b.close()
