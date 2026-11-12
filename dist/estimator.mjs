import {getLocale} from './i18n.mjs';
// Illustrative planning assumptions only. All monetary inputs include 19% VAT.
export const VAT_RATE = 19;
export const PRICING_VERSION = 2;
export const COMMERCIAL_UPLIFT = 0.20;
export const SERVICES = {
  maintenance: {name:'Maintenance',icon:'tools',description:'Preventive checks & property upkeep',unit:'visit',scope:'Preventive inspection; repairs and parts excluded.',rate:101.15,minimum:101.15,quantity:1,frequency:0},
  renovation: {name:'Renovation',icon:'paint',description:'Refresh, refurbish & reimagine',unit:'m²',scope:'Cosmetic refresh; labour and basic finish allowance only.',rate:53.55,minimum:535.5,quantity:25,frequency:0,variant:'cosmetic'},
  cleaning: {name:'Cleaning',icon:'sparkles',description:'A fresh start, from room to room',unit:'m²',scope:'Deep clean of the selected indoor area.',rate:3.09,minimum:166.6,quantity:100,frequency:0,variant:'deep'},
  handyman: {name:'Contract repairs',icon:'wrench',description:'Maintenance-contract customers only',unit:'hour',scope:'Small-repair labour for maintenance-contract customers; materials and specialist trades excluded.',rate:41.65,minimum:83.3,quantity:3,frequency:0},
  landscaping: {name:'Landscaping',icon:'leaf',description:'Care for your outdoor spaces',unit:'m²',scope:'Routine garden tidy; landscaping construction and waste removal excluded.',rate:1.9,minimum:95.2,quantity:50,frequency:0},
  aluminium: {name:'Aluminium works',icon:'building',description:'Windows, doors, shutters & enclosures',unit:'m²',scope:'Thermal-break aluminium windows and hinged doors, double glazed; materials, installation and VAT included in one price.',rate:345.1,minimum:1380.4,quantity:8,frequency:0,variant:'windows'},
  hpl: {name:'HPL cladding',icon:'home',description:'HPL panels for walls & facades',unit:'m²',scope:'HPL wall panels on a fixing subframe; materials, installation and VAT included in one price.',rate:130.9,minimum:1309,quantity:20,frequency:0,variant:'interior'},
  decor: {name:'Decorative panels',icon:'paint',description:'PVC marble, WPC & acoustic wall panels',unit:'m²',scope:'PVC marble-effect wall sheets with trims; materials, installation and VAT included in one price.',rate:83.3,minimum:666.4,quantity:15,frequency:0,variant:'pvc'},
  management: {name:'Management',icon:'clipboard',description:'Ongoing coordination & peace of mind',unit:'unit',scope:'Monthly service coordination and reporting; third-party bills excluded.',rate:77.35,minimum:77.35,quantity:1,frequency:1}
};
export const VARIANTS = {
  cleaning:{routine:{label:'Routine clean',rate:1.9,minimum:119,scope:'Routine clean of the selected indoor area.'},deep:{label:'Deep clean',rate:3.09,minimum:166.6,scope:'Deep clean of the selected indoor area.'},tenancy:{label:'Move-in / move-out',rate:3.81,minimum:190.4,scope:'Move-in / move-out clean of the selected indoor area; property assumed empty.'}},
  renovation:{cosmetic:{label:'Cosmetic refresh',rate:53.55,minimum:535.5,scope:'Cosmetic paint and minor finish refresh; labour and basic finish allowance only.'},partial:{label:'Partial refurbishment',rate:190.4,minimum:1785,scope:'Selected room finishes and minor refurbishment; major plumbing/electrical works and fixtures excluded.'},full:{label:'Full finish refurbishment',rate:499.8,minimum:5950,scope:'Broad internal finish refurbishment; structural works, permits, major services and fixtures excluded.'}},
  aluminium:{windows:{label:'Thermal-break windows & doors',rate:345.1,minimum:1380.4,scope:'Thermal-break aluminium windows and hinged doors, double glazed; materials, installation and VAT included in one price.'},sliding:{label:'Sliding / lift-and-slide doors',rate:440.3,minimum:1761.2,scope:'Thermal-break aluminium sliding or lift-and-slide doors, double glazed; materials, installation and VAT included in one price.'},shutters:{label:'Roller shutters',rate:172.55,minimum:690.2,scope:'Insulated aluminium roller shutters, manual operation; materials, installation and VAT included in one price.'},enclosure:{label:'Veranda / balcony enclosure',rate:404.6,minimum:2427.6,scope:'Aluminium and glass veranda or balcony enclosure; materials, installation and VAT included in one price. Permits excluded.'},pergola:{label:'Bioclimatic pergola',rate:535.5,minimum:6426,scope:'Aluminium bioclimatic pergola with adjustable louvres, manual operation; materials, installation and VAT included in one price. Foundations and permits excluded.'}},
  hpl:{interior:{label:'Interior wall panelling',rate:130.9,minimum:1309,scope:'HPL wall panels on a fixing subframe; materials, installation and VAT included in one price.'},facade:{label:'Ventilated facade',rate:196.35,minimum:3927,scope:'Exterior HPL ventilated facade on an aluminium subframe; materials, installation and VAT included in one price. Scaffolding and insulation excluded.'},compact:{label:'Compact HPL partitions',rate:214.2,minimum:1071,scope:'Compact HPL partitions and cubicles with hardware; materials, installation and VAT included in one price.'}},
  decor:{pvc:{label:'PVC marble-effect sheets',rate:83.3,minimum:666.4,scope:'PVC marble-effect wall sheets with trims; materials, installation and VAT included in one price.'},wpc:{label:'WPC / fluted panels',rate:101.15,minimum:809.2,scope:'WPC or fluted slat wall panels with trims; materials, installation and VAT included in one price.'},acoustic:{label:'Acoustic slat panels',rate:142.8,minimum:1142.4,scope:'Acoustic or 3D slat panels on felt backing; materials, installation and VAT included in one price.'}}
};
export const ONE_OFF=['renovation','aluminium','hpl','decor'];
export const FREQUENCIES = [{value:0,label:'One-off',short:'one-off'},{value:1,label:'Monthly · 1 visit',short:'1 visit / month'},{value:2,label:'Monthly · 2 visits',short:'2 visits / month'},{value:52/12,label:'Weekly · avg. 4.33 / month',short:'weekly · monthly average'}];
export const LOCATIONS=['Nicosia','Limassol','Larnaca','Paphos','Famagusta district','Other location in Cyprus'];
export function initialState(){return {pricingVersion:PRICING_VERSION,type:'residential',location:'Nicosia',size:100,condition:1,uncertainty:20,reserve:0,travel:0,notes:'',selected:['cleaning','maintenance'],services:Object.fromEntries(Object.entries(SERVICES).map(([id,s])=>[id,{quantity:s.quantity,rate:s.rate,minimum:s.minimum,frequency:s.frequency,variant:s.variant||''}]))};}
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
  if(state.services&&typeof state.services==='object')for(const [id,d] of Object.entries(SERVICES))state.services[id]??={quantity:d.quantity,rate:d.rate,minimum:d.minimum,frequency:d.frequency,variant:d.variant||''};
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
    const frequency=Number(s.frequency);if(!FREQUENCIES.some(x=>Math.abs(x.value-frequency)<.00001)||(id==='maintenance'&&![0,1].includes(frequency))||(ONE_OFF.includes(id)&&frequency!==0)||(id==='management'&&frequency!==1))errors.push(`Choose a valid ${def.name.toLowerCase()} frequency.`);
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
export const money=value=>new Intl.NumberFormat(getLocale(),{style:'currency',currency:'EUR',currencyDisplay:'narrowSymbol',minimumFractionDigits:0,maximumFractionDigits:2}).format(value).replace(/[\u200e\u200f\u061c]/g,'');
export const range=total=>`${money(total.low)} – ${money(total.high)}`;
export const plainNumber=value=>new Intl.NumberFormat(getLocale(),{minimumFractionDigits:0,maximumFractionDigits:2}).format(value).replace(/[\u200e\u200f\u061c]/g,'');
export const frequencyText=row=>row.id==='management'?'monthly':FREQUENCIES.find(x=>Math.abs(x.value-row.frequency)<.00001)?.short||'one-off';

// Public controls show the applicable VAT-inclusive price for the chosen property.
export const applicableValue=(state,value)=>numeric(value)?Number((Number(value)*(state.type==='commercial'?1+COMMERCIAL_UPLIFT:1)).toFixed(4)):value;
export const internalValue=(state,value)=>numeric(value)?Number(value)/(state.type==='commercial'?1+COMMERCIAL_UPLIFT:1):value;
export const rateMoney=value=>new Intl.NumberFormat(getLocale(),{style:'currency',currency:'EUR',currencyDisplay:'narrowSymbol',minimumFractionDigits:0,maximumFractionDigits:4}).format(value).replace(/[\u200e\u200f\u061c]/g,'');
