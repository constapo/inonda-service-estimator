import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,calculate} from '../dist/estimator.mjs';
import {incomingJourney,serviceDestination} from '../dist/journey.mjs';
import {guideAnswer} from '../dist/assistant.mjs';

test('management referral starts a monthly plan without changing any rate or saved source state',()=>{
  const before=initialState(),snapshot=structuredClone(before);
  const arrival=incomingJourney(before,'?lang=he&services=management&location=Limassol');
  assert.equal(arrival.imported,true);
  assert.deepEqual(arrival.state.selected,['management']);
  assert.equal(arrival.state.location,'Limassol');
  assert.deepEqual(arrival.state.services,before.services);
  assert.deepEqual(before,snapshot);
  assert.equal(calculate(arrival.state).monthly.central,77.35);
  assert.equal(calculate(arrival.state).oneOff.central,0);
});
test('renovation referral retains exclusions and editable pricing',()=>{
  const arrival=incomingJourney(initialState(),'?services=renovation');
  const result=calculate(arrival.state);
  assert.deepEqual(result.errors,[]);
  assert.equal(result.rows.length,1);
  assert.equal(result.rows[0].id,'renovation');
  assert.match(result.rows[0].scope,/minor finish/);
});
test('unknown, malformed and inherited service names cannot create calculator entries',()=>{
  for(const search of ['?services=electrical','?services=constructor','?services=__proto__','?services=cleaning,bogus','?services=','?location=Unknown','?services=management&rate=0&notes=secret']){
    const before=initialState(),result=incomingJourney(before,search);
    if(search.includes('services=management')){
      assert.equal(result.state.services.management.rate,77.35);
      assert.equal(result.state.notes,'');
    }else{
      assert.equal(result.imported,false);
      assert.equal(result.state,before);
    }
  }
});
test('duplicate services are deduplicated and all six languages keep identical amounts',()=>{
  const amounts=[];
  for(const lang of ['el','en','ru','uk','he','ro']){
    const arrival=incomingJourney(initialState(),`?lang=${lang}&services=maintenance,handyman,handyman`);
    assert.deepEqual(arrival.state.selected,['maintenance','handyman']);
    amounts.push(calculate(arrival.state).oneOff.central);
  }
  assert.equal(new Set(amounts).size,1);
});
test('detailed service referrals stay on the correct INONDA site in every language',()=>{
  for(const lang of ['el','en','ru','uk','he','ro']){
    assert.equal(serviceDestination('management',lang),`https://www.inonda.site/${lang}/property-management-services/`);
    assert.equal(serviceDestination('handyman',lang),`https://www.inonda.org/${lang}/handyman-services/`);
  }
  assert.equal(serviceDestination('constructor'),null);
  assert.equal(serviceDestination('maintenance','bad'),'https://www.inonda.org/el/maintenance-plans/');
});
test('automated guide explains the three websites and offers the website chooser',()=>{
  const state=initialState();
  for(const question of ['Which websites do you have?','inonda.org','ιστότοποι','сайты','אתרים','site-uri']){
    const answer=guideAnswer(question,{result:calculate(state),property:state.type,location:state.location,size:state.size});
    assert.equal(answer.action,'network');
    for(const domain of ['inonda.site','inonda.org','inonda.homes'])assert.ok(answer.text.includes(domain));
  }
});
