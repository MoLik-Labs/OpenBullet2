const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

test('public ZIP compares two local files with no report service or network traffic', async t => {
    const browser = await puppeteer.launch({executablePath:process.env.CHROME_PATH, headless:true,
        args: process.env.CHROME_NO_SANDBOX ? ['--no-sandbox'] : []});
    t.after(() => browser.close());
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(),'manifest-'));
    t.after(() => fs.rmSync(tmp,{recursive:true,force:true}));
    const a = path.join(tmp,'before.txt'), b = path.join(tmp,'after.txt');
    fs.writeFileSync(a,'common\nold.dll\nUserData\n');
    fs.writeFileSync(b,'\ufeffcommon\r\n<new.dll>\r\nuserdata\r\n');
    const page = await browser.newPage(), requests = [], errors = [];
    page.on('request',r => requests.push(new URL(r.url()).pathname));
    page.on('pageerror',e => errors.push(e.message));
    await page.setViewport({width:360,height:800});
    await page.goto(process.env.PUBLIC_URL+'/#inspection',{waitUntil:'networkidle0'});
    assert.ok(!requests.some(url => url.startsWith('/cgi-bin')));
    assert.equal(await page.$('nav a[href="#inspection"]'),null);
    await page.waitForSelector('#compare:not([hidden])');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    requests.length=0;
    await (await page.$('#baseline-file')).uploadFile(a);
    await (await page.$('#candidate-file')).uploadFile(b);
    await page.click('#compare-run');
    await page.waitForFunction(()=>document.getElementById('compare-status').textContent==='1 added · 1 removed · 1 unchanged names');
    assert.deepEqual(await page.$$eval('#differences code',nodes=>nodes.map(e=>e.textContent)),['<new.dll>','old.dll']);
    const c = path.join(tmp,'invalid.txt'); fs.writeFileSync(c,'../bad\n');
    await (await page.$('#candidate-file')).uploadFile(c); await page.click('#compare-run');
    await page.waitForFunction(()=>document.getElementById('compare-status').textContent.startsWith('Error: Candidate:'));
    assert.equal(await page.$$eval('#differences li',e=>e.length),0);
    await page.click('a[href="#activity"]'); assert.equal(await page.$$eval('#events li',e=>e.length),1);
    assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);
});
