import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,calculate,JOBS,COPY,DESC,range,PLACES,PLACE_BY_ID,distanceKm,travelCharge,findPlace} from '../dist/estimator.mjs';
const plan=(ids,edit=()=>{})=>{const s=initialState();s.selected=ids;edit(s);return s;};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} ≠ ${b}`);

test('only one-off jobs are offered; contract work is excluded',()=>{
  for(const id of ['maintenance','management','cleaning','landscaping','handyman'])assert.equal(Object.hasOwn(JOBS,id),false,id);
  for(const id of ['flooring','kitchen','bathroom','painting','gypsum','plumbing','electrical','roofing','doors','outdoor','aluminium','hpl','decor','renovation'])assert.ok(JOBS[id],id);
  const r=calculate(plan(['cleaning']));assert.notDeepEqual(r.errors,[]);
});
test('empty plan has no total and no skip',()=>{const r=calculate(initialState());assert.deepEqual(r.errors,[]);assert.equal(r.rows.length,0);assert.equal(r.skip,null);assert.equal(r.oneOff.central,0);});
test('per-unit price, minimum job price and ±15% range rounded to €5',()=>{
  const r=calculate(plan(['gypsum'],s=>{s.skip.on=false;s.jobs.gypsum.variant='ceiling';s.jobs.gypsum.qty=25;}));
  close(r.rows[0].central,950);assert.equal(r.rows[0].low,805);assert.equal(r.rows[0].high,1095);
  const small=calculate(plan(['gypsum'],s=>{s.skip.on=false;s.jobs.gypsum.variant='lining';s.jobs.gypsum.qty=5;}));
  close(small.rows[0].central,400);
});
test('gypsum board types add to the m² price; plastering ignores the board',()=>{
  const base=s=>{s.skip.on=false;s.jobs.gypsum.variant='partitionins';s.jobs.gypsum.qty=20;};
  close(calculate(plan(['gypsum'],base)).rows[0].central,1100);
  close(calculate(plan(['gypsum'],s=>{base(s);s.jobs.gypsum.board='bmr';})).rows[0].central,(55+8)*20);
  close(calculate(plan(['gypsum'],s=>{base(s);s.jobs.gypsum.board='bfire';})).rows[0].central,(55+12)*20);
  const plaster=calculate(plan(['gypsum'],s=>{s.skip.on=false;s.jobs.gypsum.variant='plaster';s.jobs.gypsum.qty=20;s.jobs.gypsum.board='bfire';}));
  close(plaster.rows[0].central,440);assert.equal(plaster.rows[0].board,null);
});
test('complexity and commercial factors apply silently',()=>{
  const s=plan(['flooring'],s=>{s.skip.on=false;s.jobs.flooring.qty=30;});
  close(calculate(s).rows[0].central,1350);
  s.jobs.flooring.cx='cuts';close(calculate(s).rows[0].central,1350*1.2);
  s.jobs.flooring.cx='complex';close(calculate(s).rows[0].central,1350*1.4);
  s.type='commercial';close(calculate(s).rows[0].central,1350*1.4*1.2);
});
test('skip & site preparation is added only when a job is selected',()=>{
  const r=calculate(plan(['flooring'],s=>{s.jobs.flooring.qty=30;s.skip.qty=2;}));
  close(r.skip.central,2*250+Math.max(100,1350*.05));
  close(r.oneOff.central,1350+r.skip.central);
  assert.equal(r.oneOff.low,r.rows[0].low+r.skip.low);
  const off=calculate(plan(['flooring'],s=>{s.skip.on=false;}));assert.equal(off.skip,null);
  assert.notDeepEqual(calculate(plan(['flooring'],s=>{s.skip.qty=0;})).errors,[]);
});
test('VAT is included once and invalid inputs never produce a price',()=>{
  const r=calculate(plan(['bathroom']));close(r.oneOff.tax,r.oneOff.central*19/119);
  for(const edit of [s=>{s.jobs.bathroom.qty=0;},s=>{s.jobs.bathroom.qty='';},s=>{s.jobs.bathroom.variant='bogus';},s=>{s.jobs.bathroom.cx='x';},s=>{s.type='villa';},s=>{s.place={id:'mars'};},s=>{s.selected=['bathroom','bathroom'];}])
    assert.notDeepEqual(calculate(plan(['bathroom'],edit)).errors,[]);
});
test('every job, type, unit and description is translated in all six languages',()=>{
  const keys=new Set(Object.keys(COPY.en));
  for(const lang of ['el','en','ru','uk','he','ro']){
    for(const key of keys)assert.ok(COPY[lang][key],`${lang}:${key}`);
    for(const [id,job] of Object.entries(JOBS)){assert.ok(COPY[lang][id]);assert.ok(DESC[lang][id]);assert.ok(COPY[lang]['u_'+job.unit]);for(const v of Object.keys(job.variants))assert.ok(COPY[lang][v],`${lang}:${v}`);}
  }
});
test('customer-facing text never reveals internal factors or unit rates',()=>{
  const text=JSON.stringify([COPY,DESC]);
  assert.doesNotMatch(text,/20%|40%|60%|uplift|margin|per m²|€\s?\d/);
  assert.match(range({low:100,high:200}),/^⁦.*⁩$/);
});
test('the total waits for the job location',()=>{
  const s=plan(['flooring']);let r=calculate(s);
  assert.equal(r.needsPlace,true);assert.equal(r.travel,null);
  s.place={id:'nicosia'};r=calculate(s);
  assert.equal(r.needsPlace,false);assert.equal(r.travel.amount,0);
  assert.equal(calculate(initialState()).needsPlace,false);
});
test('travel: free up to 20 km from Nicosia, then €10 for each further 10 km',()=>{
  for(const [km,eur] of [[0,0],[20,0],[20.1,10],[30,10],[30.5,20],[48,30],[80,60],[80.4,70],[125,110]])assert.equal(travelCharge(km),eur,String(km));
  for(const id of ['nicosia','strovolos','lakatamia','latsia','aglantzia','engomi'])assert.equal(calculate(plan(['flooring'],s=>{s.place={id};})).travel.amount,0,id);
  const lim=calculate(plan(['flooring'],s=>{s.skip.on=false;s.place={id:'limassol'};}));
  assert.ok(lim.travel.km>=70&&lim.travel.km<=95,String(lim.travel.km));
  close(lim.oneOff.central,lim.rows[0].central+lim.travel.amount);
  assert.equal(lim.oneOff.low,lim.rows[0].low+lim.travel.amount);
});
test('travel is not raised by the commercial factor or the complexity',()=>{
  const a=calculate(plan(['flooring'],s=>{s.place={id:'paphos'};})).travel.amount;
  const b=calculate(plan(['flooring'],s=>{s.place={id:'paphos'};s.type='commercial';s.jobs.flooring.cx='complex';})).travel.amount;
  assert.equal(a,b);
});
test('own position works and places outside Cyprus are refused',()=>{
  assert.equal(calculate(plan(['flooring'],s=>{s.place={lat:35.17,lon:33.36};})).travel.amount,0);
  assert.notDeepEqual(calculate(plan(['flooring'],s=>{s.place={lat:37.98,lon:23.73};})).errors,[]);
  assert.notDeepEqual(calculate(plan(['flooring'],s=>{s.place={lat:'x',lon:1};})).errors,[]);
});
test('places are found by English or Greek name, with or without accents',()=>{
  assert.equal(findPlace('limassol').id,'limassol');assert.equal(findPlace('Λεμεσός').id,'limassol');assert.equal(findPlace('λεμεσος').id,'limassol');
  assert.equal(findPlace('ayia napa').id,'ayianapa');assert.equal(findPlace('nowhere'),null);
  assert.equal(new Set(PLACES.map(p=>p.id)).size,PLACES.length);
  for(const p of PLACES)assert.ok(distanceKm(p.lat,p.lon)<260,p.id);
});
test('location texts exist in all six languages',()=>{for(const lang of ['el','en','ru','uk','he','ro'])for(const key of ['where','placeLabel','placeHint','myLoc','locFail','outside','notListed','needPlace','travel','travelFree','kmFrom','myPlace','locNote'])assert.ok(COPY[lang][key],lang+':'+key);});
