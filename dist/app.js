import {initI18n,t,getLanguage,getLocale} from './i18n.mjs';
import {incomingJourney} from './journey.mjs';
import {guideAnswer} from './assistant.mjs';
import {JOBS,BOARDS,COMPLEXITY,LOCATIONS,LOCATION_KEYS,JOB_IMAGES,JOB_PAGES,DESC,MAX_QTY,MAX_SKIPS,initialState,calculate,money,range,copyText} from './estimator.mjs';
const $=s=>document.querySelector(s),escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const paths={home:'m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',building:'M4 21V4h11v17M15 9h5v12M8 8h3M8 12h3M8 16h3M2 21h20',calculator:'M6 3h12v18H6zM9 6h6M9 10h.01M15 10h.01M9 14h.01M15 14h.01M9 18h.01M15 18h.01',bookmark:'M6 3h12v18l-6-4-6 4z',help:'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',pin:'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',check:'m5 12 4 4L19 6',info:'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',tools:'m3 21 6-6M14 4l6 6M13 5l4-3 5 5-3 4M12 12l8 8-2 2-8-8M3 3l4 1 2 4-2 2-4-3z',wrench:'M14 4a6 6 0 0 0-7 8L2 17l5 5 5-5a6 6 0 0 0 8-7l-4 4-4-4z',paint:'M4 3h14v7H4zM18 6h3v7h-9v4M10 17h4v5h-4z',sparkles:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5zM21 2v4M19 4h4',leaf:'M20 3C8 2 2 7 5 15c3 8 16 7 15-12ZM4 21l12-13',clipboard:'M8 4H5v18h14V4h-3M8 2h8v5H8zM8 12h8M8 16h6',sliders:'M4 7h16M4 17h16M8 4v6M16 14v6',chevron:'m6 9 6 6 6-6',plus:'M12 5v14M5 12h14',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',printer:'M6 8V2h12v6M6 18H3V8h18v10h-3M6 14h12v8H6zM17 11h.01',shield:'m12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5zM8 11l3 3 5-6',close:'m6 6 12 12M6 18 18 6',trash:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7'};
function icon(name){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.info}"></path></svg>`;}
function hydrateIcons(root=document){root.querySelectorAll('i[data-icon]').forEach(el=>el.outerHTML=icon(el.dataset.icon));}
const STORE='inonda-budget-v2';
const c=key=>copyText(getLanguage(),key);
function restore(){try{const raw=JSON.parse(sessionStorage.getItem(STORE)||'null');if(!raw||typeof raw!=='object')return null;const base=initialState();const merged={...base,...raw,skip:{...base.skip,...(raw.skip||{})},jobs:{...base.jobs}};for(const id of Object.keys(JOBS))merged.jobs[id]={...base.jobs[id],...(raw.jobs?.[id]||{})};merged.selected=Array.isArray(raw.selected)?raw.selected.filter(id=>JOBS[id]):[];return calculate(merged).errors.length?null:merged;}catch{return null;}}
function persist(){try{sessionStorage.setItem(STORE,JSON.stringify(state));}catch{}}
const entry=incomingJourney(restore()||initialState(),location.search);
let state=entry.state,toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
const unit=id=>c('u_'+JOBS[id].unit);
const usesBoard=id=>Boolean(JOBS[id].boards)&&state.jobs[id].variant!=='plaster';
function options(list,current,label=x=>c(x)){return list.map(v=>`<option value="${escape(v)}" ${v===current?'selected':''}>${escape(label(v))}</option>`).join('');}
function jobMarkup(id){
  const on=state.selected.includes(id),j=state.jobs[id],body=`bp-job-${id}`;
  return `<div class="bp-job ${on?'on':''}" data-id="${id}">
    <button type="button" class="bp-job-head" aria-expanded="${on}" aria-controls="${body}"><span class="bp-tick" aria-hidden="true">${on?icon('check'):''}</span><span class="bp-job-title">${escape(c(id))}</span><span class="bp-job-price" data-price="${id}"></span></button>
    <div class="bp-job-body" id="${body}" ${on?'':'hidden'}>
      <label class="bp-field bp-wide"><span>${escape(c('type'))}</span><select data-k="variant">${options(Object.keys(JOBS[id].variants),j.variant)}</select></label>
      <label class="bp-field"><span>${escape(c('qtyl'))} (${escape(unit(id))})</span><input data-k="qty" type="number" inputmode="decimal" min="1" max="${MAX_QTY}" step="any" value="${escape(j.qty)}"></label>
      ${usesBoard(id)?`<label class="bp-field"><span>${escape(c('boardl'))}</span><select data-k="board">${options(Object.keys(BOARDS),j.board)}</select></label>`:''}
      <label class="bp-field"><span>${escape(c('complexity'))}</span><select data-k="cx">${options(Object.keys(COMPLEXITY),j.cx)}</select></label>
    </div></div>`;
}
function skipMarkup(){const on=state.skip.on;return `<div class="bp-job bp-skip ${on?'on':''}"><button type="button" class="bp-job-head" id="bp-skip-toggle" aria-expanded="${on}" aria-controls="bp-skip-body"><span class="bp-tick" aria-hidden="true">${on?icon('check'):''}</span><span class="bp-job-title">${escape(c('skip'))}<small>${escape(c('skipnote'))}</small></span><span class="bp-job-price" id="bp-skip-price"></span></button><div class="bp-job-body" id="bp-skip-body" ${on?'':'hidden'}><label class="bp-field"><span>${escape(c('qtyl'))} (${escape(c('u_skip'))})</span><input id="bp-skip-qty" type="number" inputmode="numeric" min="1" max="${MAX_SKIPS}" step="1" value="${escape(state.skip.qty)}"></label></div></div>`;}
function renderStatic(){
  document.querySelectorAll('[data-c]').forEach(el=>el.textContent=c(el.dataset.c));
  document.querySelectorAll('.bp-seg [data-type]').forEach(b=>{b.textContent=c(b.dataset.type);b.setAttribute('aria-pressed',String(b.dataset.type===state.type));});
  $('#bp-location').innerHTML=options(LOCATIONS,state.location,l=>c(LOCATION_KEYS[l]));
  $('#bp-jobs').innerHTML=Object.keys(JOBS).map(jobMarkup).join('')+skipMarkup();
  const lang=getLanguage();
  $('#bp-grid').innerHTML=Object.keys(JOBS).map(id=>`<article class="bp-tile"><img src="https://www.inonda.org/assets/img/${JOB_IMAGES[id]}-sm.webp" alt="" loading="lazy" decoding="async" width="480" height="320"><div><h3>${escape(c(id))}</h3><p>${escape(DESC[lang]?.[id]||DESC.en[id])}</p><a href="https://www.inonda.org/${lang}/${JOB_PAGES[id]}" target="_blank" rel="noopener">${escape(c('more'))} <span aria-hidden="true">↗</span></a></div></article>`).join('');
  update();
}
function lineMarkup(name,sub,price){return `<li><span>${escape(name)}<small>${escape(sub)}</small></span><span>${price}</span></li>`;}
function update(){
  const r=calculate(state),valid=!r.errors.length,has=r.rows.length>0;
  document.querySelectorAll('[data-price]').forEach(el=>{const row=r.rows.find(x=>x.id===el.dataset.price);el.textContent=row&&valid?range(row):'';});
  $('#bp-skip-price').textContent=r.skip&&valid?range(r.skip):'';
  const total=has&&valid?range(r.oneOff):'—';
  $('#bp-total').textContent=total;$('#mobile-total').textContent=total;$('.bp-mobile').hidden=!has;
  if(!valid){$('#bp-lines').innerHTML=`<li class="bp-error" role="alert">${escape(r.errors[0])}</li>`;}
  else $('#bp-lines').innerHTML=has?r.rows.map(row=>lineMarkup(c(row.id),`${c(row.variant)}${row.board&&row.board!=='bstd'?' · '+c(row.board):''} · ${row.qty} ${unit(row.id)}`,range(row))).join('')+(r.skip?lineMarkup(c('skip'),`${r.skip.qty} ${c('u_skip')}`,range(r.skip)):''):`<li class="bp-empty">${escape(c('empty'))}</li>`;
  for(const id of ['print','bp-clear'])$('#'+id).disabled=!has;
  $('#bp-book').href='https://wa.me/35794091616?text='+encodeURIComponent(planText(r));
  persist();
  return r;
}
function planText(r=calculate(state)){
  const lines=[c('msg')];
  for(const row of r.rows)lines.push(`• ${c(row.id)} – ${c(row.variant)}${row.board&&row.board!=='bstd'?', '+c(row.board):''}, ${row.qty} ${unit(row.id)}${state.jobs[row.id].cx!=='standard'?', '+c(state.jobs[row.id].cx):''}`);
  if(r.skip)lines.push(`• ${c('skip')} – ${r.skip.qty} ${c('u_skip')}`);
  lines.push(`${c('ptype')}: ${c(state.type)}`,`${c('location')}: ${c(LOCATION_KEYS[state.location])}`);
  if(r.rows.length&&!r.errors.length)lines.push(`${c('total')}: ${range(r.oneOff).replace(/[\u2066\u2069]/g,'')} (${c('incl')})`);
  return lines.join('\n');
}
function toggleJob(id){state.selected=state.selected.includes(id)?state.selected.filter(x=>x!==id):[...state.selected,id];renderStatic();const head=$(`.bp-job[data-id="${id}"] .bp-job-head`);head?.focus();if(state.selected.includes(id))$(`.bp-job[data-id="${id}"] [data-k="qty"]`)?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
$('#bp-jobs').addEventListener('click',event=>{
  if(event.target.closest('#bp-skip-toggle')){state.skip.on=!state.skip.on;renderStatic();$('#bp-skip-toggle').focus();return;}
  const head=event.target.closest('.bp-job-head');if(head)toggleJob(head.closest('.bp-job').dataset.id);
});
$('#bp-jobs').addEventListener('input',event=>{const el=event.target;
  if(el.id==='bp-skip-qty'){state.skip.qty=el.value;update();return;}
  const k=el.dataset.k;if(!k)return;const id=el.closest('.bp-job').dataset.id;state.jobs[id][k]=el.value;
  if(k==='variant'){renderStatic();$(`.bp-job[data-id="${id}"] [data-k="variant"]`)?.focus();}else update();
});
document.querySelectorAll('.bp-seg [data-type]').forEach(b=>b.addEventListener('click',()=>{state.type=b.dataset.type;renderStatic();}));
$('#bp-location').addEventListener('change',event=>{state.location=event.target.value;update();});
$('#bp-clear').addEventListener('click',()=>{state.selected=[];renderStatic();$('#bp-title').scrollIntoView({behavior:'smooth'});});
$('#print').addEventListener('click',()=>{const r=calculate(state);if(r.errors.length||!r.rows.length)return;$('#print-summary').innerHTML=`<img src="./inonda-logo.png" alt="INONDA LTD" width="130"><h2>${escape(c('title'))}</h2><pre>${escape(planText(r).split('\n').slice(1).join('\n'))}</pre><p>${escape(c('disclaimer'))}</p><p>Irina: +357 94 091 616 · Constantin: +357 94 091 613 · inonda2026@outlook.com</p>`;window.print();});
$('#how-button').addEventListener('click',()=>{$('#site-menu').close();$('#how-dialog').showModal();});$('#close-dialog').addEventListener('click',()=>$('#how-dialog').close());$('#how-dialog').addEventListener('click',event=>{if(event.target===$('#how-dialog')){const box=$('#how-dialog').getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)$('#how-dialog').close();}});
hydrateIcons();initI18n();renderStatic();
document.addEventListener('inonda:language',()=>renderStatic());

const siteMenu=$('#site-menu');
$('#menu-button').addEventListener('click',()=>{siteMenu.showModal();$('#menu-button').setAttribute('aria-expanded','true');});
$('#close-menu').addEventListener('click',()=>siteMenu.close());
siteMenu.addEventListener('close',()=>$('#menu-button').setAttribute('aria-expanded','false'));
siteMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>siteMenu.close()));
const heroVideo=$('#hero-video'),motionButton=$('#motion-toggle');
function motionState(){const playing=!heroVideo.paused;motionButton.textContent=playing?'Pause film':'Play film';motionButton.setAttribute('aria-pressed',String(playing));}
motionButton.addEventListener('click',async()=>{if(!heroVideo.paused){heroVideo.pause();return;}if(!heroVideo.src)heroVideo.src=heroVideo.dataset.src;try{await heroVideo.play();}catch{toast('The film could not start. You can still explore all services below.');}});
heroVideo.addEventListener('playing',()=>{$('#hero-poster').hidden=true;});heroVideo.addEventListener('error',()=>{$('#hero-poster').hidden=false;motionState();});heroVideo.addEventListener('play',motionState);heroVideo.addEventListener('pause',motionState);
document.addEventListener('visibilitychange',()=>{if(document.hidden)heroVideo.pause();});
document.addEventListener('inonda:guide-question',event=>{const answer=guideAnswer(event.detail.question,{result:calculate(state),property:state.type,location:state.location});event.detail.answer={...answer,text:t(answer.text),label:t(answer.label)};});
document.addEventListener('inonda:add-services',event=>{const ids=event.detail?.services;if(!Array.isArray(ids))return;const valid=ids.filter(id=>Object.hasOwn(JOBS,id));if(!valid.length)return;state.selected=[...new Set([...state.selected,...valid])];renderStatic();});
