// Illustrative planning assumptions only. All monetary inputs include 19% VAT.
export const VAT_RATE = 19;
export const PRICING_VERSION = 2;
export const COMMERCIAL_UPLIFT = 0.20;
export const SERVICES = {
  maintenance: {name:'Maintenance',icon:'tools',description:'Preventive checks & property upkeep',unit:'visit',scope:'Preventive inspection; repairs and parts excluded.',rate:101.15,minimum:101.15,quantity:1,frequency:0},
  renovation: {name:'Renovation',icon:'paint',description:'Refresh, refurbish & reimagine',unit:'m²',scope:'Cosmetic refresh; labour and basic finish allowance only.',rate:53.55,minimum:535.5,quantity:25,frequency:0,variant:'cosmetic'},
  cleaning: {name:'Cleaning',icon:'sparkles',description:'A fresh start, from room to room',unit:'m²',scope:'Deep clean of the selected indoor area.',rate:3.09,minimum:166.6,quantity:100,frequency:0,variant:'deep'},
  handyman: {name:'Handyman',icon:'wrench',description:'Small fixes. A big difference.',unit:'hour',scope:'General handyman labour; materials and specialist trades excluded.',rate:41.65,minimum:83.3,quantity:3,frequency:0},
  landscaping: {name:'Landscaping',icon:'leaf',description:'Care for your outdoor spaces',unit:'m²',scope:'Routine garden tidy; landscaping construction and waste removal excluded.',rate:1.9,minimum:95.2,quantity:50,frequency:0},
  management: {name:'Management',icon:'clipboard',description:'Ongoing coordination & peace of mind',unit:'unit',scope:'Monthly service coordination and reporting; third-party bills excluded.',rate:77.35,minimum:77.35,quantity:1,frequency:1}
};
export const VARIANTS = {
  cleaning:{routine:{label:'Routine clean',rate:1.9,minimum:119,scope:'Routine clean of the selected indoor area.'},deep:{label:'Deep clean',rate:3.09,minimum:166.6,scope:'Deep clean of the selected indoor area.'},tenancy:{label:'Move-in / move-out',rate:3.81,minimum:190.4,scope:'Move-in / move-out clean of the selected indoor area; property assumed empty.'}},
  renovation:{cosmetic:{label:'Cosmetic refresh',rate:53.55,minimum:535.5,scope:'Cosmetic paint and minor finish refresh; labour and basic finish allowance only.'},partial:{label:'Partial refurbishment',rate:190.4,minimum:1785,scope:'Selected room finishes and minor refurbishment; major plumbing/electrical works and fixtures excluded.'},full:{label:'Full finish refurbishment',rate:499.8,minimum:5950,scope:'Broad internal finish refurbishment; structural works, permits, major services and fixtures excluded.'}}
};
export const FREQUENCIES = [{value:0,label:'One-off',short:'one-off'},{value:1,label:'Monthly · 1 visit',short:'1 visit / month'},{value:2,label:'Monthly · 2 visits',short:'2 visits / month'},{value:52/12,label:'Weekly · avg. 4.33 / month',short:'weekly · monthly average'}];
export const LOCATIONS=['Nicosia','Limassol','Larnaca','Paphos','Famagusta district','Other location in Cyprus'];
export function initialState(){return {pricingVersion:PRICING_VERSION,type:'residential',location:'Nicosia',size:100,condition:1,uncertainty:20,reserve:0,travel:0,notes:'',selected:['cleaning','handyman'],services:Object.fromEntries(Object.entries(SERVICES).map(([id,s])=>[id,{quantity:s.quantity,rate:s.rate,minimum:s.minimum,frequency:s.frequency,variant:s.variant||''}]))};}
// Older locally saved scenarios stored VAT-exclusive rates. Convert once, without
// changing the visitor's quantities, scope or notes, and never double-add VAT.
export function migrateState(previous){
  if(!previous||typeof previous!=='object')return previous;
  const state=structuredClone(previous);
  if(state.pricingVersion===undefined){
    const gross=value=>numeric(value)?Math.round(Number(value)*1.19*100)/100:value;
    for(const service of Object.values(state.services||{})){if(service&&typeof service==='object'){service.rate=gross(service.rate);service.minimum=gross(service.minimum);}}
    state.travel=gross(state.travel);state.pricingVersion=PRICING_VERSION;
  }
  delete state.tax;
  return state;
}
const numeric=(value)=>value!==''&&value!==null&&typeof value!=='boolean'&&Number.isFinite(Number(value));
export function calculate(state){
  const errors=[];
  function number(value,min,max,label,integer=false){if(!numeric(value)||Number(value)<min||Number(value)>max||(integer&&!Number.isInteger(Number(value)))){errors.push(`${label} must be ${integer?'a whole number ':''}between ${min} and ${max}.`);return 0;}return Number(value);}
  if(!state||typeof state!=='object')return {errors:['Invalid scenario.'],rows:[]};
  if(state.pricingVersion!==PRICING_VERSION)errors.push('This saved scenario needs a pricing update.');
  const size=number(state.size,10,10000,'Indoor size',true),spread=number(state.uncertainty,5,60,'Estimate range')/100,reserve=number(state.reserve,0,50,'Budget reserve')/100,tax=VAT_RATE/100,travel=number(state.travel,0,500,'Travel allowance');
  const condition=Number(state.condition);if(![1,1.15,1.35].includes(condition))errors.push('Choose a valid property condition.');
  if(!['residential','commercial'].includes(state.type))errors.push('Choose a property type.');
  const commercialFactor=state.type==='commercial'?1+COMMERCIAL_UPLIFT:1;
  if(!LOCATIONS.includes(state.location))errors.push('Choose a location.');
  if(typeof state.notes!=='string'||state.notes.length>1500)errors.push('Notes must be under 1,500 characters.');
  const ids=Array.isArray(state.selected)?state.selected:[];
  if(!Array.isArray(state.selected)||new Set(ids).size!==ids.length||ids.some(id=>!SERVICES[id]))errors.push('Invalid service selection.');
  const rows=[];
  for(const id of ids){
    if(!SERVICES[id])continue;
    const def=SERVICES[id],s=state.services?.[id];if(!s){errors.push(`Missing ${def.name} settings.`);continue;}
    const minQty=id==='handyman'?.5:1,maxQty=['cleaning','renovation'].includes(id)?(size||10000):id==='landscaping'?100000:id==='handyman'?500:id==='maintenance'?100:1000;
    const quantity=number(s.quantity,minQty,maxQty,`${def.name} ${def.unit} quantity`,['maintenance','management'].includes(id));
    const rate=number(s.rate,0,10000,`${def.name} unit rate`),minimum=number(s.minimum,0,1000000,`${def.name} minimum`);
    const frequency=Number(s.frequency);if(!FREQUENCIES.some(x=>Math.abs(x.value-frequency)<.00001)||(id==='maintenance'&&![0,1].includes(frequency))||(id==='renovation'&&frequency!==0)||(id==='management'&&frequency!==1))errors.push(`Choose a valid ${def.name.toLowerCase()} frequency.`);
    if(VARIANTS[id]&&!VARIANTS[id][s.variant])errors.push(`Choose a valid ${def.name.toLowerCase()} scope.`);
    const recurring=frequency>0,multiplier=recurring?frequency:1,conditionFactor=id==='management'?1:condition;
    const perVisit=Math.max(quantity*rate,minimum)*conditionFactor;
    const visits=id==='management'?0:id==='maintenance'?quantity*multiplier:multiplier;
    // Maintenance quantity is visits. Its minimum is a project/month minimum,
    // while all other on-site services have a per-visit minimum.
    const serviceBase=perVisit*multiplier*commercialFactor,travelCost=visits*travel*commercialFactor;
    rows.push({id,name:def.name,quantity,rate,minimum,frequency,recurring,conditionFactor,commercialFactor,serviceBase,travelCost,visits,base:serviceBase+travelCost,scope:VARIANTS[id]?.[s.variant]?.scope||def.scope,unit:def.unit,minimumApplied:quantity*rate<minimum});
  }
  function total(recurring){const bucket=rows.filter(r=>r.recurring===recurring),base=bucket.reduce((s,r)=>s+r.base,0),buffer=base*reserve,central=base+buffer,net=central/(1+tax),taxAmount=central-net;return {base,reserve:buffer,net,tax:taxAmount,central,low:central===0?0:Math.floor(central*(1-spread)/5)*5,high:central===0?0:Math.ceil(central*(1+spread)/5)*5,visits:bucket.reduce((s,r)=>s+r.visits,0)};}
  return {errors,rows,oneOff:total(false),monthly:total(true),size,spread,reserveRate:reserve,taxRate:tax,condition,commercialFactor};
}
export const money=value=>new Intl.NumberFormat('en-CY',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
export const range=total=>`${money(total.low)} – ${money(total.high)}`;
export const plainNumber=value=>new Intl.NumberFormat('en-CY',{minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
export const frequencyText=row=>row.id==='management'?'monthly':FREQUENCIES.find(x=>Math.abs(x.value-row.frequency)<.00001)?.short||'one-off';
