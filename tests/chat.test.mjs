import test from 'node:test';
import assert from 'node:assert/strict';
import chat from '../dist/inonda-chat.js';

test('shared chatbot recognizes service combinations in all six languages',()=>{
  for(const q of ['cleaning and renovation','καθαρισμός και ανακαίνιση','уборка и ремонт','прибирання та ремонт','ניקיון ושיפוץ','curățenie și renovare']){
    assert.equal(chat.classify(q),'combination');
    assert.deepEqual(new Set(chat.categories(q)),new Set(['cleaning','renovation']));
  }
});
test('specialist and urgent work leads to assessment rather than a handyman price',()=>{
  for(const q of ['urgent electrical repair','υδραυλικός','сантехник','електрик','חשמל','instalator'])assert.equal(chat.classify(q),'specialist');
});
test('request drafts preserve visitors own text and only target the two company numbers',()=>{
  const request={service:'Cleaning + painting',property:'Office',area:'Limassol',details:'Please inspect the rooms & discuss next month. <script>example</script>'};
  for(const lang of ['el','en','ru','uk','he','ro']){
    const text=chat.requestText(request,lang);
    assert.ok(text.includes(request.details));
    for(const [name,number]of [['Irina','35794091616'],['Constantin','35794091613']]){
      const url=new URL(chat.draftUrl(name,text));assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/'+number);assert.equal(url.searchParams.get('text'),text);
    }
  }
  assert.equal(chat.draftUrl('Unknown recipient','test'),null);
});
test('all six shared chatbot versions include every topic, service and request control',()=>{
  for(const lang of ['el','en','ru','uk','he','ro']){
    assert.equal(chat.ui[lang].length,42); // 39 chat strings + proactive greeting, "Not now", "Open the chat"
    assert.ok(chat.ui[lang].every(text=>typeof text==='string'&&text.length));
    assert.equal(Object.keys(chat.data[lang].services).length,6);
    for(const topic of ['network','contact','vat','warranty','area','cleaning','renovation','management','landscaping','maintenance'])assert.ok(chat.data[lang].faq[topic].text.length>30);
  }
});
