// UI for unpriced, multi-item custom carpentry requests. No network calls or quotations.
import {getLanguage} from './i18n.mjs';
import {CARPENTRY_CATEGORIES,CARPENTRY_MATERIALS,CARPENTRY_LIMIT,carpentryText,carpentryLabel,carpentryMaterial,blankCarpentryDraft,validateCarpentry,parseCarpentrySession,formatCarpentryItem} from './carpentry.mjs';

const STORE='inonda-carpentry-v1';
const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function load(){try{return parseCarpentrySession(sessionStorage.getItem(STORE));}catch{return [];}}
function save(items){try{sessionStorage.setItem(STORE,JSON.stringify({items}));}catch{}}
function makeId(){return Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,12);}

export function initCarpentry(root,onChange){
  if(!root)throw new Error('Carpentry section container is missing.');
  let items=load(),editing=null;
  const drafts=Object.fromEntries(CARPENTRY_CATEGORIES.map(c=>[c.id,blankCarpentryDraft()]));
  const lang=()=>getLanguage(),t=key=>carpentryText(lang(),key);
  function input(cat,key,type='text',extra=''){
    const draft=drafts[cat.id],value=draft[key]??'';
    return '<label class="bp-field"><span>'+escape(t(key))+'</span><input type="'+type+'" name="'+key+'" value="'+escape(value)+'" '+extra+'></label>';
  }
  function card(cat){
    const draft=drafts[cat.id],active=items.find(x=>x.id===editing&&x.category===cat.id);
    const opts=cat.materials.map(id=>'<option value="'+escape(id)+'"'+(draft.material===id?' selected':'')+'>'+escape(carpentryMaterial(lang(),id))+'</option>').join('');
    const workOptions=['new','replacement','repair'].map(id=>'<option value="'+id+'"'+(draft.workType===id?' selected':'')+'>'+escape(t(id))+'</option>').join('');
    return '<article class="bp-carpentry-card" data-category="'+cat.id+'">'+
      '<h4>'+escape(carpentryLabel(lang(),cat.id))+'</h4>'+
      '<p class="bp-carpentry-desc">'+escape(carpentryLabel(lang(),cat.id,'description'))+'</p>'+
      '<form data-carpentry-form="'+cat.id+'">'+
      '<div class="bp-carpentry-fields">'+
      '<label class="bp-field"><span>'+escape(t('material'))+'</span><select name="material" required><option value="">'+escape(t('chooseMaterial'))+'</option>'+opts+'</select></label>'+
      '<label class="bp-field"><span>'+escape(t('workType'))+'</span><select name="workType" required>'+workOptions+'</select></label>'+
      input(cat,'width','number','min="0.01" max="10000" step="any" inputmode="decimal"')+
      input(cat,'height','number','min="0.01" max="10000" step="any" inputmode="decimal"')+
      input(cat,'depth','number','min="0.01" max="10000" step="any" inputmode="decimal"')+
      input(cat,'qty','number','min="1" max="500" step="1" inputmode="numeric" required')+
      '<label class="bp-field bp-carpentry-wide"><span>'+escape(t('notes'))+'</span><textarea name="notes" maxlength="400" rows="2" placeholder="'+escape(t('notesHint'))+'">'+escape(draft.notes)+'</textarea></label></div>'+
      '<div class="bp-carpentry-actions"><button class="bp-btn primary" type="submit">'+escape(t(active?'save':'add'))+'</button>'+
      (active?'<button class="bp-btn ghost" type="button" data-carpentry-cancel>'+escape(t('cancel'))+'</button>':'')+
      '</div><p class="bp-carpentry-error" role="alert" hidden></p></form></article>';
  }
  function render(){
    root.innerHTML='<div class="bp-carpentry-heading"><h3>'+escape(t('title'))+'</h3><p>'+escape(t('intro'))+'</p></div>'+
      '<div class="bp-carpentry-grid">'+CARPENTRY_CATEGORIES.map(card).join('')+'</div>'+
      '<p class="bp-note">'+escape(t('measure'))+'</p>'+
      '<section class="bp-carpentry-summary" aria-live="polite" aria-label="'+escape(t('summary'))+'">'+
      '<h4>'+escape(t('summary'))+' ('+items.length+')</h4>'+
      (items.length?'<ol>'+items.map(item=>'<li><div><strong>'+escape(carpentryLabel(lang(),item.category))+'</strong><small>'+escape(formatCarpentryItem(item,lang()))+'</small><span class="bp-carpentry-por">'+escape(t('requestQuote'))+'</span></div>'+
      '<div class="bp-carpentry-row-actions"><button type="button" data-carpentry-edit="'+escape(item.id)+'">'+escape(t('edit'))+'</button>'+
      '<button type="button" data-carpentry-remove="'+escape(item.id)+'">'+escape(t('remove'))+'</button></div></li>').join('')+'</ol>':
      '<p>'+escape(t('empty'))+'</p>')+
      '</section>';
  }
  function notify(){save(items);render();onChange();}
  root.addEventListener('input',event=>{
    const form=event.target.closest('form[data-carpentry-form]');
    if(!form||!event.target.name)return;
    drafts[form.dataset.carpentryForm][event.target.name]=event.target.value;
  });
  root.addEventListener('change',event=>{
    const form=event.target.closest('form[data-carpentry-form]');
    if(!form||!event.target.name)return;
    drafts[form.dataset.carpentryForm][event.target.name]=event.target.value;
  });
  root.addEventListener('submit',event=>{
    const form=event.target.closest('form[data-carpentry-form]');if(!form)return;
    event.preventDefault();
    const category=form.dataset.carpentryForm,raw={...Object.fromEntries(new FormData(form)),category};
    const validated=validateCarpentry(raw);
    const error=form.querySelector('.bp-carpentry-error');
    if(!validated.item){error.textContent=t(validated.error==='notes'?'maxNote':'validation');error.hidden=false;return;}
    if(!editing&&items.length>=CARPENTRY_LIMIT){error.textContent=t('itemLimit');error.hidden=false;return;}
    if(editing&&items.some(x=>x.id===editing&&x.category===category)){
      items=items.map(item=>item.id===editing?{id:item.id,...validated.item}:item);
    }else{
      let id=makeId();while(items.some(item=>item.id===id))id=makeId();
      items.push({id,...validated.item});
    }
    editing=null;drafts[category]=blankCarpentryDraft();notify();
    root.querySelector('.bp-carpentry-summary')?.scrollIntoView({block:'nearest',behavior:'auto'});
  });
  root.addEventListener('click',event=>{
    const edit=event.target.closest('[data-carpentry-edit]');
    const remove=event.target.closest('[data-carpentry-remove]');
    const cancel=event.target.closest('[data-carpentry-cancel]');
    if(edit){
      const item=items.find(x=>x.id===edit.dataset.carpentryEdit);if(!item)return;
      editing=item.id;drafts[item.category]={...item,width:item.width??'',height:item.height??'',depth:item.depth??''};render();
      root.querySelector('[data-carpentry-form="'+item.category+'"] select[name=material]')?.focus();return;
    }
    if(remove){
      const id=remove.dataset.carpentryRemove,existing=items.find(x=>x.id===id);if(!existing)return;
      if(editing===id){editing=null;drafts[existing.category]=blankCarpentryDraft();}
      items=items.filter(x=>x.id!==id);notify();return;
    }
    if(cancel){
      const form=cancel.closest('form[data-carpentry-form]');if(form){drafts[form.dataset.carpentryForm]=blankCarpentryDraft();editing=null;render();}
    }
  });
  return {
    getItems:()=>items.slice(),
    render,
    label:id=>carpentryLabel(lang(),id),
    text:t,
    itemText:item=>formatCarpentryItem(item,lang())
  };
}
