

const TOTAL=58, KEY='delta-reign-manual-v3', STREAM_KEY='delta-reign-streams-v1';
const cards = window.CARDS;
let owned={};try{owned=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
let streams=[];try{streams=JSON.parse(localStorage.getItem(STREAM_KEY))||[]}catch(e){}
let filtered=cards,offset=0,chosen=null,chosenImage=null;
const $=id=>document.getElementById(id);
function persist(){localStorage.setItem(KEY,JSON.stringify(owned));localStorage.setItem(STREAM_KEY,JSON.stringify(streams))}
function update(){const count=cards.filter(c=>owned[c.n]).length;$('progress').textContent=count+' / '+cards.length+' collected';$('fill').style.width=(count/Math.max(cards.length,1)*100)+'%'}
function pocket(c){
 if(!c)return '<div class="pocket" style="visibility:hidden"></div>';
 const safe=String(c.name||'Untitled').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 const img=c.customImage||c.image||'';
 return `<button class="pocket ${owned[c.n]?'owned':'missing'}" data-num="${c.n}" aria-label="${safe}">
 ${img?`<img src="${img}" alt="${safe}" loading="lazy">`:`<div class="fallback"><span>${safe}</span><small>${c.rarity}</small><small>Upload image</small></div>`}
 <span class="tag">${owned[c.n]?'✓ Owned':'○ Missing'} · ${String(c.n).padStart(3,'0')}</span></button>`;
}
function render(){
 const per=innerWidth<=680?9:18,chunk=filtered.slice(offset,offset+per),parts=[];
 for(let i=0;i<chunk.length;i+=9){let part=chunk.slice(i,i+9);parts.push('<div class="page">'+Array.from({length:9},(_,j)=>pocket(part[j])).join('')+'<div class="page-label">Page '+(Math.floor((offset+i)/9)+1)+'</div></div>')}
 $('binder').innerHTML=parts.join('')||'<p>No cards match your filters.</p>';
 $('pages').textContent=filtered.length?'Cards '+(offset+1)+'–'+Math.min(offset+per,filtered.length)+' of '+filtered.length:'No results';
 $('prev').disabled=offset===0;$('next').disabled=offset+per>=filtered.length;update();
}
function filter(){const q=$('search').value.toLowerCase().trim(),r=$('rarity').value;filtered=cards.filter(c=>(!r||c.rarity===r)&&(!q||(c.name||'').toLowerCase().includes(q)||String(c.n).includes(q)));offset=0;render()}
function refreshStreamSelect(){
 $('streamSelect').innerHTML='<option value="">Choose a saved stream…</option>'+streams.map(s=>`<option value="${s.id}">${s.name} · ${s.date||'No date'}</option>`).join('');
}
function showHistory(c){
 const arr=c.pulls||[];
 $('pullHistory').innerHTML=arr.length?arr.slice().reverse().map(x=>`<div class="history-entry">
 <b>${escapeText(x.buyerName||'Buyer not entered')}</b> · Order #${escapeText(x.orderNumber||'—')}<br>
 <span>${escapeText(x.packer||'Packer not entered')} · ${escapeText(x.streamName||'Unassigned stream')}</span><br>
 <small>${escapeText((x.date||'').replace('T',' ')||'Date not entered')}</small>
 ${x.notes?`<br>${escapeText(x.notes)}`:''}
 </div>`).join(''):'No stream history recorded yet.';
}
function openCardEditor(c){
 chosen=c;chosenImage=c.customImage||null;
 $('dialogTitle').textContent=c.name+' · #'+c.n;
 $('editName').value=c.name||'';$('editSet').value=c.set||'Delta Reign';$('editNumber').value=c.n;
 $('editRarity').value=c.rarity;$('editImage').value='';
 $('cardPreview').src=chosenImage||c.image||'';$('cardPreview').style.display=(chosenImage||c.image)?'block':'none';
 $('packer').value='';$('buyerName').value='';$('orderNumber').value='';$('pullNotes').value='';$('pullDate').value=new Date().toISOString().slice(0,16);
 refreshStreamSelect();showHistory(c);$('dialog').showModal();
}
$('editImage').onchange=e=>{
 const file=e.target.files[0];if(!file)return;
 const reader=new FileReader();reader.onload=()=>{chosenImage=reader.result;$('cardPreview').src=chosenImage;$('cardPreview').style.display='block'};reader.readAsDataURL(file);
};
$('saveCard').onclick=()=>{
 if(!chosen)return;
 chosen.name=$('editName').value.trim()||'Untitled';chosen.set=$('editSet').value.trim();chosen.n=Number($('editNumber').value)||chosen.n;
 chosen.rarity=$('editRarity').value;if(chosenImage)chosen.customImage=chosenImage;
 try{persist();$('dialog').close();filter()}catch(e){alert('Could not save. The image may be too large for browser storage. Try a smaller JPG/PNG image.')}
};
$('logPull').onclick=()=>{
 if(!chosen)return;
 const stream=streams.find(s=>s.id===$('streamSelect').value);
 if(!chosen.pulls)chosen.pulls=[];
 chosen.pulls.push({buyerName:$('buyerName').value.trim(),orderNumber:$('orderNumber').value.trim(),packer:$('packer').value.trim(),streamName:stream?stream.name:'Unassigned stream',streamId:stream?stream.id:'',date:$('pullDate').value,notes:$('pullNotes').value.trim()});
 owned[chosen.n]=true;
 try{persist();showHistory(chosen);render()}catch(e){alert('Could not save this pull record.')}
};
$('binder').onclick=e=>{const b=e.target.closest('[data-num]');if(!b)return;const c=cards.find(x=>x.n===Number(b.dataset.num));if(c)openCardEditor(c)};
$('addManual').onclick=()=>{
 const n=Number(prompt('Enter the card number (use a number not already in the binder):'));
 if(!n||cards.some(c=>c.n===n)){alert('Please enter a new, unused card number.');return}
 const c={n,name:'New card',rarity:'Other',set:'Delta Reign',pulls:[]};cards.push(c);filter();openCardEditor(c);
};
$('saveStream').onclick=()=>{
 const name=$('streamName').value.trim();if(!name){alert('Enter a stream name first.');return}
 streams.push({id:String(Date.now()),name,date:$('streamDate').value,notes:$('streamNotes').value.trim()});
 persist();renderStreams();refreshStreamSelect();$('streamName').value='';$('streamDate').value='';$('streamNotes').value='';
};
function renderStreams(){
 $('streamList').innerHTML=streams.length?streams.map(s=>{
  const pulls=cards.flatMap(c=>(c.pulls||[]).filter(p=>p.streamId===s.id).map(p=>({card:c.name,num:c.n,packer:p.packer})));
  return `<div class="library-item"><div><b>${s.name}</b><br><small>${s.date||'No date'} · ${pulls.length} logged pulls</small>${s.notes?'<br>'+s.notes:''}<div>${pulls.map(p=>`<small>${p.card} #${p.num} — ${p.packer||'Unknown packer'}</small>`).join('<br>')}</div></div><button class="btn" data-delete-stream="${s.id}">Delete</button></div>`;
 }).join(''):'<p>No streams saved yet. Add your first stream above.</p>';
}
$('streamList').onclick=e=>{const b=e.target.closest('[data-delete-stream]');if(!b)return;streams=streams.filter(s=>s.id!==b.dataset.deleteStream);persist();renderStreams();refreshStreamSelect()};
$('showLibrary').onclick=()=>{$('binder').classList.add('hidden');$('libraryPanel').classList.remove('hidden');$('loading').classList.add('hidden');$('filters')?.classList.add('hidden');renderStreams()};
$('closeLibrary').onclick=()=>{$('libraryPanel').classList.add('hidden');$('binder').classList.remove('hidden');$('loading').classList.remove('hidden');render()};
$('search').oninput=filter;$('rarity').onchange=filter;$('reset').onclick=()=>{$('search').value='';$('rarity').value='';filter()};
$('open').onclick=()=>{$('cover').classList.add('hidden');$('main').classList.remove('hidden');render()};
$('home').onclick=()=>{$('cover').classList.remove('hidden');$('main').classList.add('hidden')};
$('prev').onclick=()=>{offset=Math.max(0,offset-(innerWidth<=680?9:18));render()};
$('next').onclick=()=>{offset+=innerWidth<=680?9:18;render()};
$('cancel').onclick=()=>$('dialog').close();
addEventListener('resize',()=>{offset=0;render()});
$('loading').textContent='Upload card images, record who pulled each card, and keep a library of your streams.';

// --- Saved pack presets and stream defaults (browser-local storage) ---
const PACK_KEY = 'carlito-connect-pack-presets-v1';
const SETTINGS_KEY = 'carlito-connect-stream-settings-v1';
let packPresets = [];
let streamSettings = {};
try { packPresets = JSON.parse(localStorage.getItem(PACK_KEY)) || []; } catch(e) {}
try { streamSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch(e) {}
if (!packPresets.length) {
  packPresets = [{id:'delta-reign', name:'Delta Reign', price:'', notes:'First collection'}];
  localStorage.setItem(PACK_KEY, JSON.stringify(packPresets));
}
function savePackData() {
  localStorage.setItem(PACK_KEY, JSON.stringify(packPresets));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(streamSettings));
}
function renderPackPresets() {
  const select = $('streamPack');
  if (select) {
    select.innerHTML = packPresets.map(p => `<option value="${p.id}">${escapeText(p.name)}</option>`).join('');
  }
  const list = $('packList');
  if (list) list.innerHTML = packPresets.map(p =>
    `<div class="library-item"><div><b>${escapeText(p.name)}</b><br><small>${p.price ? '£'+p.price+' per pack' : 'Price not set'}${p.notes ? ' · '+escapeText(p.notes) : ''}</small></div><span class="subtle">Saved preset</span></div>`
  ).join('');
}
function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function loadStreamSettings() {
  if ($('settingStreamTitle')) $('settingStreamTitle').value = streamSettings.title || '';
  if ($('settingPacker')) $('settingPacker').value = streamSettings.packer || '';
  if ($('settingStreamNotes')) $('settingStreamNotes').value = streamSettings.notes || '';
  if ($('defaultPacker')) $('defaultPacker').value = streamSettings.packer || '';
  if ($('packName')) $('packName').value = packPresets[0]?.name || 'Delta Reign';
  if ($('packPrice')) $('packPrice').value = packPresets[0]?.price || '';
  if ($('packNotes')) $('packNotes').value = packPresets[0]?.notes || '';
  if ($('streamPackPrice')) $('streamPackPrice').value = packPresets[0]?.price || '';
  if ($('streamName') && ! $('streamName').value) $('streamName').value = streamSettings.title || '';
  renderPackPresets();
}
if ($('savePack')) $('savePack').onclick = () => {
  const p = packPresets[0] || {id:'delta-reign'};
  p.name = $('packName').value.trim() || 'Delta Reign';
  p.price = $('packPrice').value;
  p.notes = $('packNotes').value.trim();
  if (!packPresets.length) packPresets.push(p); else packPresets[0] = p;
  savePackData(); renderPackPresets();
  $('settingsMessage').textContent = 'Delta Reign pack settings saved in this browser.';
};
if ($('saveSettings')) $('saveSettings').onclick = () => {
  streamSettings = {
    title: $('settingStreamTitle').value.trim(),
    packer: $('settingPacker').value.trim(),
    notes: $('settingStreamNotes').value.trim()
  };
  savePackData(); loadStreamSettings();
  $('settingsMessage').textContent = 'Default stream settings saved in this browser.';
};
if ($('streamPack')) $('streamPack').onchange = () => {
  const p = packPresets.find(x => x.id === $('streamPack').value);
  if (p && $('streamPackPrice')) $('streamPackPrice').value = p.price || '';
};
const originalSaveStream = $('saveStream').onclick;
$('saveStream').onclick = () => {
  const selectedPack = packPresets.find(p => p.id === $('streamPack').value) || packPresets[0];
  const before = streams.length;
  originalSaveStream();
  if (streams.length > before) {
    const saved = streams[streams.length - 1];
    saved.packId = selectedPack?.id || 'delta-reign';
    saved.packName = selectedPack?.name || 'Delta Reign';
    saved.packPrice = $('streamPackPrice').value;
    saved.defaultPacker = $('defaultPacker').value.trim();
    saved.status = $('streamStatus').value;
    saved.notes = [saved.notes, streamSettings.notes].filter(Boolean).join(' · ');
    persist();
    renderStreams();
  }
};
const originalOpenCardEditor = openCardEditor;
openCardEditor = function(c) {
  originalOpenCardEditor(c);
  if ($('packer') && !$('packer').value) $('packer').value = streamSettings.packer || '';
};
loadStreamSettings();

render();
