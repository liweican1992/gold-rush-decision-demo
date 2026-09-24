import {scenes,step,expired} from './story.mjs';
let history=[], reasons={};
const el=id=>document.getElementById(id);
function render(){
  const id=history.at(-1)||'start', s=scenes[id];
  el('time').textContent=s.time;el('title').textContent=s.title;el('body').replaceChildren();
  for(const text of s.body){const p=document.createElement('p');p.textContent=text;el('body').append(p)}
  if(expired.has(id)){const p=document.createElement('p');p.textContent='原购买条件不再保证；地主可能拍卖，但尚无他人已经买走的事实。你们保留记录、经验和信息，它们不自动变成新购买权或现金。';el('body').append(p)}
  el('reasonBox').hidden=!s.decision;el('reason').value=reasons[id]||'';
  el('choices').replaceChildren();
  for(const c of s.choices){const b=document.createElement('button'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=c.label;small.textContent=c.note;b.append(strong,small);b.onclick=()=>{if(s.decision)reasons[id]=el('reason').value;history=step(history,c.to);render()};el('choices').append(b)}
  el('review').hidden=!s.lesson;el('review').open=false;el('lesson').textContent=s.lesson||'';
  el('past').textContent='你的理由记录：'+history.filter(x=>scenes[x]?.decision).map(x=>`${scenes[x].title}：${reasons[x]||'未填写'}`).join('；');
  el('back').disabled=!history.length;el('title').focus();window.scrollTo({top:0});
}
el('back').onclick=()=>{const id=history.at(-1)||'start';if(scenes[id].decision)reasons[id]=el('reason').value;history.pop();render()};
el('restart').onclick=()=>{history=[];reasons={};render()};render();
