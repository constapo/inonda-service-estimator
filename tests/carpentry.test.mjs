import test from 'node:test';
import assert from 'node:assert/strict';
import {CARPENTRY_CATEGORIES,CARPENTRY_MATERIALS,CARPENTRY_TEXT,CARPENTRY_WORK_TYPES,CARPENTRY_LIMIT,carpentryText,carpentryCategory,carpentryLabel,carpentryMaterial,validateCarpentry,normalizeCarpentryItems,parseCarpentrySession,formatCarpentryItem} from '../dist/carpentry.mjs';
import {calculate,initialState} from '../dist/estimator.mjs';
const languages=['en','el','ru','uk','he','ro'];
const sample=category=>({category,workType:'new',material:carpentryCategory(category).materials[0],qty:2,width:92.5,height:210,depth:'',notes:'Custom fitted'});

test('exactly ten separate visible categories have complete localized titles, descriptions and suitable materials',()=>{
  assert.equal(CARPENTRY_CATEGORIES.length,10);
  assert.equal(new Set(CARPENTRY_CATEGORIES.map(c=>c.id)).size,10);
  for(const category of CARPENTRY_CATEGORIES){
    assert.ok(category.materials.length>=2,category.id);
    for(const lang of languages){
      assert.ok(carpentryLabel(lang,category.id).length>3,lang+':'+category.id);
      assert.ok(carpentryLabel(lang,category.id,'description').length>10,lang+':'+category.id);
      for(const material of category.materials)assert.ok(carpentryMaterial(lang,material),lang+':'+material);
    }
  }
  assert.equal(Object.keys(CARPENTRY_MATERIALS).length>=12,true);
});

test('all UI labels, work types and material selections are available in six languages',()=>{
  const keys=Object.keys(CARPENTRY_TEXT.en);
  for(const lang of languages){
    for(const key of keys)assert.equal(typeof carpentryText(lang,key),'string',lang+':'+key);
    for(const workType of CARPENTRY_WORK_TYPES)assert.ok(carpentryText(lang,workType),lang+':'+workType);
  }
});

test('every carpentry subsection accepts its applicable material, work type, dimensions and quantity',()=>{
  for(const cat of CARPENTRY_CATEGORIES){
    for(const material of cat.materials)for(const workType of CARPENTRY_WORK_TYPES){
      const x=validateCarpentry({...sample(cat.id),material,workType});
      assert.equal(x.error,undefined,cat.id+'/'+material+'/'+workType);
      assert.equal(x.item.qty,2);
      assert.equal(x.item.width,92.5);
      assert.equal(x.item.height,210);
      assert.equal(x.item.depth,null);
    }
  }
});
test('optional dimensions are allowed; invalid quantities, dimensions and notes are rejected',()=>{
  const valid=sample('doorsFrames');
  assert.ok(validateCarpentry({...valid,width:'',height:'',depth:''}).item);
  for(const qty of ['',0,-1,1.5,501,'bad',Infinity])assert.ok(validateCarpentry({...valid,qty}).error,'qty '+qty);
  for(const width of ['x',-3,0,10001,Infinity])assert.ok(validateCarpentry({...valid,width}).error,'width '+width);
  assert.ok(validateCarpentry({...valid,depth:-2}).error);
  assert.ok(validateCarpentry({...valid,material:'not-valid'}).error);
  assert.ok(validateCarpentry({...valid,workType:'other'}).error);
  assert.ok(validateCarpentry({...valid,notes:'a'.repeat(401)}).error);
  assert.ok(validateCarpentry({...valid,notes:'a'.repeat(400)}).item);
});

test('multiple independent items in same subsection survive session JSON and editing/removal',()=>{
  const first={id:'custom_00001',...validateCarpentry(sample('doorsFrames')).item};
  const second={id:'custom_00002',...validateCarpentry({...sample('doorsFrames'),qty:3,notes:'Second item'}).item};
  const unrelated={id:'custom_00003',...validateCarpentry(sample('wardrobes')).item};
  let items=parseCarpentrySession(JSON.stringify({items:[first,second,unrelated]}));
  assert.equal(items.length,3);
  assert.equal(items.filter(x=>x.category==='doorsFrames').length,2);
  items=items.map(x=>x.id===second.id?{...x,notes:'Edited item'}:x);
  assert.equal(items[1].notes,'Edited item');
  items=items.filter(x=>x.id!==first.id);
  assert.equal(items.length,2);
  assert.equal(parseCarpentrySession(JSON.stringify({items}))[0].notes,'Edited item');
});

test('corrupt or duplicated saved items are rejected without losing valid ones',()=>{
  const item={id:'custom_00001',...validateCarpentry(sample('doorsFrames')).item};
  assert.equal(parseCarpentrySession('not-json').length,0);
  assert.equal(normalizeCarpentryItems([item,item,{...item,id:'xx'}, {...item,id:'custom_00002',material:'fake'}]).length,1);
  const many=Array.from({length:CARPENTRY_LIMIT+10},(_,i)=>({...item,id:'custom_'+String(i).padStart(6,'0')}));
  assert.equal(normalizeCarpentryItems(many).length,CARPENTRY_LIMIT);
});

test('customer-facing carpentry output includes useful specifications without invented pricing',()=>{
  const item=validateCarpentry({...sample('stairs'),depth:42}).item;
  const line=formatCarpentryItem(item,'en');
  assert.match(line,/Stairs & Timber Balustrades/);
  assert.match(line,/Custom fitted/);
  assert.match(line,/92.5 cm/);
  assert.doesNotMatch(line,/€|20%|19%|margin|trav(el|el cost)|uplift/i);
  for(const lang of languages)assert.ok(formatCarpentryItem(item,lang).includes(carpentryLabel(lang,item.category)));
  assert.match(carpentryText('en','requestQuote'),/Price on Request/);
});

test('existing numeric VAT-inclusive calculations remain independent of custom requests',()=>{
  const state=initialState();state.selected=['flooring'];state.skip.on=false;state.place={id:'nicosia'};
  const baseline=calculate(state);
  const carpentry=[{id:'custom_00001',...validateCarpentry(sample('doorsFrames')).item}];
  const again=calculate({...state,carpentryItems:carpentry});
  assert.deepEqual(again,baseline);
  assert.equal(baseline.oneOff.tax,baseline.oneOff.central*19/119);
});
