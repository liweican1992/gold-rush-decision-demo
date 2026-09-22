import { useEffect, useState } from 'react'
import { advance, sceneFor } from '../demo/textPlay'
import { endings, epilogue, observations, pathLabel } from '../demo/reviewedStory'
import './textStoryPlay.css'

type Save = { history:string[]; visited:string[]; notes:{scene:string;text:string}[] }
const fresh:Save={history:[],visited:[],notes:[]}
const key='gold-text-play-r3.1-v1'
function restore():Save {
  if(typeof window==='undefined') return fresh
  try { const data=JSON.parse(localStorage.getItem(key)||'null') as Save
    if(!data||!Array.isArray(data.history)||!Array.isArray(data.visited)||!Array.isArray(data.notes)) return fresh
    let h:string[]=[]; for(const id of data.history) h=advance(h,id)
    return {history:h,visited:data.visited.filter(v=>typeof v==='string'),notes:data.notes.filter(n=>typeof n?.scene==='string'&&typeof n?.text==='string')}
  }catch{return fresh}
}
export function TextStoryPlay(){
  const [save,setSave]=useState<Save>(restore), [note,setNote]=useState(''), [notice,setNotice]=useState('')
  const scene=sceneFor(save.history), p=scene.ending, closing=p?epilogue(p):undefined
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(save))}catch{setNotice('浏览器存储不可用，本次记录仅在当前页面保留。')}},[save])
  useEffect(()=>{if(p)setSave(s=>s.visited.includes(p.id)?s:{...s,visited:[...s.visited,p.id]})},[p?.id])
  function go(id:string){setSave(s=>({...s,history:advance(s.history,id)}));setNote('');setNotice('');window.scrollTo({top:0})}
  return <main className="tp">
    <header className="tp-header"><a href="/docs/story-map/">← 剧情地图</a><span>R3.1 · 文字试玩 / 无视频</span><span>已走过 {save.visited.length} / 84 条结局路径</span></header>
    <article className="tp-story" aria-live="polite"><div className="tp-eyebrow">最后十四天 · {scene.time}</div><h1>{scene.title}</h1>
      {scene.text.map(t=><p key={t}>{t}</p>)}
      {p&&closing&&<><h2>{endings.find(e=>e.id===p.ending)!.title}</h2><p>{closing.scene}</p><blockquote>{closing.dialogue}</blockquote><p>{endings.find(e=>e.id===p.ending)!.limit}</p>{p.balance!==undefined&&<p>本轮剩余 {p.balance} BU · T{p.day} 结束。购地款、已付费用不退，照护储备不计入可用余额。</p>}<details className="tp-review"><summary>回看本次选择与课程复盘</summary><p>{pathLabel(p)}</p><ul>{observations(p).map(t=><li key={t}>{t}</li>)}</ul><p>你当时知道什么？下一笔投入能回答什么？有哪一项代价是你主动接受的？这里只记录行为，不替你推断人格。</p></details></>}
      <div className="tp-choices">{scene.choices.map((c,index)=><button key={c.id} disabled={c.disabled} onClick={()=>go(c.id)}><span className="tp-num">{index+1}</span><span><strong>{c.label}</strong>{c.detail&&<small>{c.detail}</small>}</span><span>→</span></button>)}</div>
      <footer className="tp-controls"><button disabled={!save.history.length} onClick={()=>{setSave(s=>({...s,history:s.history.slice(0,-1)}));setNote('');setNotice('')}}>返回上一步</button><button onClick={()=>{setSave(s=>({...s,history:[]}));setNote('');setNotice('');window.scrollTo({top:0})}}>从头再走（保留记录）</button></footer>
    </article>
    <aside className="tp-notes"><details><summary>审稿工具 · 标记疑问 / 查看本地记录</summary><p>记录仅保存在此浏览器，不发送服务器。回退用于审稿，不代表剧情中可以撤销时间和费用。</p><label htmlFor="tp-note">这里哪里看不懂？</label><textarea id="tp-note" value={note} onChange={e=>setNote(e.target.value)} placeholder="例如：我不知道为什么必须付这笔钱……"/><button disabled={!note.trim()} onClick={()=>{setSave(s=>({...s,notes:[...s.notes,{scene:`${scene.title} / ${save.history.join(' → ')||'开场'}`,text:note.trim()}]}));setNote('');setNotice('疑问已记录在本浏览器。')}}>保存疑问</button><p role="status">{notice}</p>{save.notes.map((n,i)=><p key={i}><b>{n.scene}</b><br/>{n.text}</p>)}<details><summary>已完成路径编号（审稿用）</summary><p>{save.visited.join(' · ')||'尚未走到结局'}</p></details></details></aside>
  </main>
}
