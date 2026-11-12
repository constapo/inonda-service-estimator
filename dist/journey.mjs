import {SERVICES,LOCATIONS,JOB_PAGES,DISTRICT_PLACE,PLACE_BY_ID} from './estimator.mjs';

// Only allow public service IDs and named service areas. No visitor notes, rates,
// contact details or saved scenarios are carried between the three websites.
export function incomingJourney(previous,search=''){
  const query=new URLSearchParams(String(search).slice(0,2000));
  const requested=query.get('services');
  const ids=requested?requested.split(','):[];
  // Contract services from the sister sites (maintenance, cleaning, management…) are not
  // budget-planner jobs; keep only the known one-off jobs.
  const known=ids.length<=40?[...new Set(ids.filter(id=>Object.hasOwn(SERVICES,id)))]:[];
  const selected=known.length?known:null;
  // Sister sites send a district name or a place id; both become a job location.
  const location=query.get('location'),placeId=Object.hasOwn(DISTRICT_PLACE,location||'')?DISTRICT_PLACE[location]:Object.hasOwn(PLACE_BY_ID,location||'')?location:null,validLocation=Boolean(placeId);
  if(!selected&&!validLocation)return {state:previous,imported:false,servicesImported:false};
  const state=structuredClone(previous);
  if(selected)state.selected=selected;
  if(validLocation)state.place={id:placeId};
  return {state,imported:true,servicesImported:Boolean(selected)};
}

const pages={...JOB_PAGES,maintenance:'maintenance-plans/',handyman:'contract-repairs/',landscaping:'outdoor-works/',management:'property-management-services/'};
export function serviceDestination(id,language='el'){
  if(!Object.hasOwn(pages,id))return null;
  const lang=['el','en','ru','uk','he','ro'].includes(language)?language:'el';
  return `https://www.inonda.${id==='management'?'site':'org'}/${lang}/${pages[id]}`;
}
