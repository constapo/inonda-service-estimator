import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,calculate} from '../dist/estimator.mjs';
import {incomingJourney,serviceDestination} from '../dist/journey.mjs';
import {guideAnswer} from '../dist/assistant.mjs';

test('job referrals preselect planner jobs without changing prices',()=>{
  const before=initialState(),snapshot=structuredClone(before);
  const arrival=incomingJourney(before,'?lang=he&services=aluminium,hpl&location=Limassol');
  assert.equal(arrival.imported,true);
  assert.deepEqual(arrival.state.selected,['aluminium','hpl']);
  assert.equal(arrival.state.location,'Limassol');
  assert.deepEqual(before,snapshot);
  assert.deepEqual(calculate(arrival.state).errors,[]);
});
test('contract services from sister sites are dropped, planner jobs are kept',()=>{
  const arrival=incomingJourney(initialState(),'?services=maintenance,renovation,cleaning');
  assert.deepEqual(arrival.state.selected,['renovation']);
  const contractOnly=incomingJourney(initialState(),'?services=management');
  assert.equal(contractOnly.servicesImported,false);
});
test('area-only referrals keep an empty plan',()=>{
  const arrival=incomingJourney(initialState(),'?lang=el&location=Limassol');
  assert.equal(arrival.imported,true);
  assert.equal(arrival.servicesImported,false);
  assert.equal(arrival.state.location,'Limassol');
  assert.deepEqual(arrival.state.selected,[]);
});
test('unknown, malformed and inherited service names cannot create planner entries',()=>{
  for(const search of ['?services=constructor','?services=__proto__','?services=bogus','?services=','?location=Unknown','?services=toString&rate=0&notes=secret']){
    const before=initialState(),result=incomingJourney(before,search);
    assert.equal(result.imported,false);
    assert.equal(result.state,before);
  }
});
test('duplicate services are deduplicated and all six languages keep identical amounts',()=>{
  const amounts=[];
  for(const lang of ['el','en','ru','uk','he','ro']){
    const arrival=incomingJourney(initialState(),`?lang=${lang}&services=decor,decor,renovation`);
    assert.deepEqual(arrival.state.selected,['decor','renovation']);
    amounts.push(calculate(arrival.state).oneOff.central);
  }
  assert.equal(new Set(amounts).size,1);
});
test('detailed service referrals stay on the correct INONDA site in every language',()=>{
  for(const lang of ['el','en','ru','uk','he','ro']){
    assert.equal(serviceDestination('management',lang),`https://www.inonda.site/${lang}/property-management-services/`);
    assert.equal(serviceDestination('handyman',lang),`https://www.inonda.org/${lang}/contract-repairs/`);
  }
  assert.equal(serviceDestination('constructor'),null);
  assert.equal(serviceDestination('maintenance','bad'),'https://www.inonda.org/el/maintenance-plans/');
  assert.equal(serviceDestination('gypsum','ro'),'https://www.inonda.org/ro/painting-plastering-gypsum/');
});
test('automated guide explains the three websites and offers the website chooser',()=>{
  const state=initialState();
  for(const question of ['Which websites do you have?','inonda.org','ιστότοποι','сайты','אתרים','site-uri']){
    const answer=guideAnswer(question,{result:calculate(state),property:state.type,location:state.location});
    assert.equal(answer.action,'network');
    for(const domain of ['inonda.site','inonda.org','inonda.homes'])assert.ok(answer.text.includes(domain));
  }
});
