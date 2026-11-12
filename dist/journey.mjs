import {SERVICES,LOCATIONS} from './estimator.mjs';

// Only allow public service IDs and named service areas. No visitor notes, rates,
// contact details or saved scenarios are carried between the three websites.
export function incomingJourney(previous,search=''){
  const query=new URLSearchParams(String(search).slice(0,2000));
  const requested=query.get('services');
  const ids=requested?requested.split(','):[];
  const selected=ids.length&&ids.length<=Object.keys(SERVICES).length&&ids.every(id=>Object.hasOwn(SERVICES,id))?[...new Set(ids)]:null;
  const location=query.get('location'),validLocation=LOCATIONS.includes(location);
  if(!selected&&!validLocation)return {state:previous,imported:false,servicesImported:false};
  const state=structuredClone(previous);
  if(selected)state.selected=selected;
  if(validLocation)state.location=location;
  return {state,imported:true,servicesImported:Boolean(selected)};
}

const pages={maintenance:'maintenance-plans/',renovation:'home-renovation/',cleaning:'contact/#quote',handyman:'contract-repairs/',landscaping:'outdoor-works/',management:'property-management-services/',aluminium:'aluminium-works/',hpl:'hpl-cladding/',decor:'decorative-panels/'};
export function serviceDestination(id,language='el'){
  if(!Object.hasOwn(pages,id))return null;
  const lang=['el','en','ru','uk','he','ro'].includes(language)?language:'el';
  return `https://www.inonda.${id==='management'?'site':'org'}/${lang}/${pages[id]}`;
}
