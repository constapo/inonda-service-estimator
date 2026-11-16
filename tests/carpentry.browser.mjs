// Run with: python3 -m http.server 8088 --directory dist & node tests/carpentry.browser.mjs
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const base='http://127.0.0.1:8088/';
const form=id=>page.locator('[data-carpentry-form="'+id+'"]');
async function clickCentered(locator){await locator.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await locator.click();}
async function activateKeyboard(locator){await locator.focus();await page.keyboard.press('Enter');}
try{
  await page.goto(base+'?lang=en',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.bp-carpentry-card');
  await page.evaluate(()=>{sessionStorage.clear()});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('.bp-carpentry-card',{timeout:12000});
  assert.equal(await page.locator('.bp-carpentry-card').count(),10,'Ten separate cards must be visible');
  assert.equal(await page.locator('.bp-carpentry-card form').count(),10);
  for(const lang of ['en','el','ru','uk','he','ro']){
    await page.goto(base+'?lang='+lang,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('.bp-carpentry-card');
    assert.equal(await page.locator('.bp-carpentry-card').count(),10,lang);
    assert.equal(await page.locator('.bp-carpentry-card select[name=material]').count(),10,lang);
    const titles=await page.locator('.bp-carpentry-card h4').allTextContents();
    assert.equal(titles.filter(Boolean).length,10,lang);
    if(lang==='he')assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
    assert.deepEqual(errors,[],'JavaScript error in '+lang);
  }

  await page.goto(base+'?lang=en',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.bp-carpentry-card');
  await page.evaluate(()=>{sessionStorage.removeItem('inonda-carpentry-v1')});
  await page.reload({waitUntil:'domcontentloaded'});
  await form('doorsFrames').locator('[name=material]').selectOption('solid');
  await form('doorsFrames').locator('[name=workType]').selectOption('new');
  await form('doorsFrames').locator('[name=width]').fill('92.5');
  await form('doorsFrames').locator('[name=height]').fill('210');
  await form('doorsFrames').locator('[name=qty]').fill('2');
  await form('doorsFrames').locator('[name=notes]').fill('First custom door');
  await clickCentered(form('doorsFrames').locator('button[type=submit]'));
  assert.equal(await page.locator('[data-carpentry-edit]').count(),1);

  // A second item in exactly the same subsection must remain independent.
  await form('doorsFrames').locator('[name=material]').selectOption('engineered');
  await form('doorsFrames').locator('[name=qty]').fill('3');
  await form('doorsFrames').locator('[name=notes]').fill('Second custom door');
  await clickCentered(form('doorsFrames').locator('button[type=submit]'));
  assert.equal(await page.locator('[data-carpentry-edit]').count(),2);
  assert.match(await page.locator('.bp-carpentry-summary').innerText(),/First custom door/);
  assert.match(await page.locator('.bp-carpentry-summary').innerText(),/Second custom door/);

  await activateKeyboard(page.locator('[data-carpentry-edit]').first());
  await form('doorsFrames').locator('[name=notes]').fill('Edited first door');
  await form('doorsFrames').locator('[name=qty]').fill('5');
  await clickCentered(form('doorsFrames').locator('button[type=submit]'));
  assert.equal(await page.locator('[data-carpentry-edit]').count(),2);
  assert.match(await page.locator('.bp-carpentry-summary').innerText(),/Edited first door/);
  await activateKeyboard(page.locator('[data-carpentry-remove]').last());
  assert.equal(await page.locator('[data-carpentry-edit]').count(),1);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('[data-carpentry-edit]').count(),1,'Saved items must persist after reload');

  await page.locator('#bp-place').fill('Limassol');
  await page.locator('#bp-place').blur();
  assert.equal(await page.locator('#bp-book').evaluate(el=>el.classList.contains('bp-disabled')),false);
  assert.ok(!(await page.locator('#print').isDisabled()),'Custom-only request should be printable');
  assert.match(await page.locator('#bp-total').innerText(),/Price on Request/);
  const link=await page.locator('#bp-book').getAttribute('href');
  const message=new URL(link).searchParams.get('text');
  assert.match(message,/Edited first door/);
  assert.match(message,/Price on Request/);
  assert.doesNotMatch(message,/20%|commercial uplift|material cost|travel charge/i);

  await page.evaluate(()=>{window.__printed=false;window.print=()=>{window.__printed=true;}});
  await activateKeyboard(page.locator('#print'));
  assert.equal(await page.evaluate(()=>window.__printed),true);
  assert.match(await page.locator('#print-summary').innerText(),/Edited first door/);

  // Existing numeric jobs are kept separate; their total is explicitly partial.
  await activateKeyboard(page.locator('.bp-job[data-id=flooring] .bp-job-head'));
  assert.match(await page.locator('.bp-total small').innerText(),/Partial budget/i);
  assert.match(await page.locator('#bp-lines').innerText(),/Price on Request/);
  assert.match(await page.locator('#bp-total').innerText(),/€/);

  // No horizontal overflow from ten visible forms on a mobile viewport.
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
  assert.equal(overflow,false,'Carpentry controls overflow the mobile viewport');
  assert.deepEqual(errors,[],'No uncaught client errors');
  await activateKeyboard(page.locator('#bp-clear'));
  assert.equal(await page.locator('[data-carpentry-edit]').count(),0,'Clear resets custom items');
  assert.equal(await page.locator('.bp-job.on').count(),0,'Clear resets standard items');
  console.log('Carpentry UI smoke tests passed: all six languages, ten sections, add/edit/remove, persistence, print, WhatsApp, partial budget, mobile.');
}finally{
  await browser.close();
}
