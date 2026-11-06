
import React, { useState, useRef, useEffect } from 'react'

type User = { id:string; name:string; emoji:string; rank:string; online:boolean; bio:string }
type Msg = { id:string; user:string; emoji:string; text:string; time:string; reactions:Record<string,number>; flagged?:boolean; type?:string }
type Group = { id:string; name:string; emoji:string; desc:string; members:number }

const SEED_USERS: User[] = [
  {id:'1', name:'nandu', emoji:'👑', rank:'OWNER', online:true, bio:'Founder of XYNARA'},
  {id:'2', name:'aria', emoji:'🦋', rank:'ADMIN', online:true, bio:'Vibes only'},
  {id:'3', name:'kai', emoji:'🎮', rank:'MOD', online:true, bio:'Grinding ranked'},
  {id:'4', name:'mia', emoji:'🎧', rank:'VIP', online:false, bio:'Music zone'},
  {id:'5', name:'zen', emoji:'🧘', rank:'MEMBER', online:true, bio:'Chill guy'},
]
const GROUPS: Group[] = [
  {id:'g1', name:'XYNARA HQ', emoji:'🪐', desc:'Main HQ', members:128},
  {id:'g2', name:'Gamers Lounge', emoji:'🎮', desc:'Ranked + chaos', members:86},
  {id:'g3', name:'Music Zone', emoji:'🎧', desc:'Lo-fi & drops', members:64},
]
const BAD = ['fuck','shit','bitch','dick','porn','sex']
const ADMIN_PASS = 'AuraNandu_2012'

function censored(t:string){ let out=t; BAD.forEach(w=>{ out = out.split(new RegExp(w,'gi')).join('***') }); return out }
function isFlagged(t:string){ return BAD.some(w=> t.toLowerCase().includes(w)) }

export default function App(){
  const [user, setUser] = useState<string>('')
  const [pass, setPass] = useState('')
  const [logged, setLogged] = useState(false)
  const [activeGroup, setActiveGroup] = useState(GROUPS[0])
  const [activeDM, setActiveDM] = useState<string|null>(null)
  const [tab, setTab] = useState<'chat'|'discover'|'admin'>('chat')
  const [following, setFollowing] = useState<string[]>(['aria','kai'])
  const [messages, setMessages] = useState<Msg[]>([
    {id:'m1', user:'aria', emoji:'🦋', text:'Welcome to XYNARA!! This place is gonna be CHAOS 🔥', time:'10:02', reactions:{'🔥':3,'❤️':2}},
    {id:'m2', user:'kai', emoji:'🎮', text:'Who is up for ranked + soundboard spam tonight?', time:'10:04', reactions:{'🎮':2}},
    {id:'m3', user:'nandu', emoji:'👑', text:'Admin panel is live. Be good or get banned 😈', time:'10:05', reactions:{'👑':5}},
    {id:'m4', user:'mia', emoji:'🎧', text:'New drop in #music - check it out!', time:'10:07', reactions:{}},
  ])
  const [input, setInput] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminTab, setAdminTab] = useState<'overview'|'users'|'chats'|'moderation'|'groups'>('overview')
  const [banned, setBanned] = useState<string[]>([])
  const [ranks, setRanks] = useState<Record<string,string>>({nandu:'OWNER', aria:'ADMIN', kai:'MOD', mia:'VIP', zen:'MEMBER'})
  const [showCall, setShowCall] = useState<null|'voice'|'video'>(null)
  const [incoming, setIncoming] = useState<string|null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [callMins, setCallMins] = useState(0)
  const [demoParticipants, setDemoParticipants] = useState(2)
  const [showSound, setShowSound] = useState(false)
  const [showPoll, setShowPoll] = useState(false)
  const [pollQ, setPollQ] = useState('')
  const [pollOpts, setPollOpts] = useState(['',''])
  const [polls, setPolls] = useState<any[]>([])
  const [showGames, setShowGames] = useState(false)
  const [showStories, setShowStories] = useState(false)
  const [storyUser, setStoryUser] = useState('aria')
  const [inVoice, setInVoice] = useState(false)
  const [search, setSearch] = useState('')
  const [shoutMode, setShoutMode] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<any>(null)

  useEffect(()=>{ if(showCall==='video' && camOn){ navigator.mediaDevices?.getUserMedia({video:true,audio:true}).then(s=>{ setLocalStream(s); if(videoRef.current) videoRef.current.srcObject=s }).catch(()=>{}) } },[showCall, camOn])

  const send = (textOverride?:string)=>{
    const raw = (textOverride ?? input).trim(); if(!raw) return
    const flagged = isFlagged(raw)
    const m:Msg = {id:Date.now().toString(), user:user||'you', emoji:'👽', text: shoutMode ? raw.toUpperCase()+'!!!' : censored(raw), time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), reactions:{}, flagged}
    setMessages(p=>[...p,m]); setInput(''); if(flagged) alert('⚠️ Message flagged for admin review (bad word censored)')
  }
  const playSound = (name:string)=>{
    try{ const ctx=new (window.AudioContext|| (window as any).webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = name==='Airhorn'? 600 : name==='Fart'? 80 : 440; o.type='sawtooth'; g.gain.value=0.15; o.start(); setTimeout(()=>{o.stop(); ctx.close()}, 400)}catch{}
    send(`🔊 played ${name}`)
  }
  const startCall = (type:'voice'|'video', target?:string)=>{
    setShowCall(type); setCallMins(0)
    // simulate incoming for demo - in real app this goes via Worker signaling
    setTimeout(()=>{ setCallMins(1) }, 1000)
  }
  const simulateIncoming = ()=>{
    const names=['aria','kai','mia']; const n=names[Math.floor(Math.random()*names.length)]; setIncoming(n)
  }
  const addDemo = ()=> setDemoParticipants(p=> Math.min(6, p+1))
  const triggerConfetti = ()=>{ setConfetti(true); setTimeout(()=>setConfetti(false), 2000) }

  if(!logged){
    return <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-left">
          <div style={{fontSize:52}}>🪐</div>
          <h1>XYNARA</h1>
          <p style={{fontSize:18, opacity:.9, fontWeight:600}}>Connect Beyond Reality</p>
          <p style={{opacity:.85}}>Groups • Calls • Stories • Games • Chaos<br/>Admin Control Core built-in.</p>
          <div style={{marginTop:22, display:'flex', gap:8, flexWrap:'wrap'}}>
            <span className="chip" style={{background:'#00000055'}}>✨ 128 ONLINE</span>
            <span className="chip" style={{background:'#00000055'}}>🎮 3 GROUPS</span>
            <span className="chip" style={{background:'#00000055'}}>🔊 SOUNDBOARD</span>
          </div>
          <div style={{marginTop:28, background:'rgba(0,0,0,.25)', padding:14, borderRadius:16, fontSize:13}}>
            <b>Demo users:</b> nandu, aria, kai, mia, zen<br/>Password: anything<br/>Admin: <b>AuraNandu_2012</b>
          </div>
        </div>
        <div className="auth-right">
          <h2 className="font-display" style={{fontSize:26, margin:0}}>Welcome back, traveller</h2>
          <p style={{color:'#a1a1aa', fontSize:14}}>Login to enter XYNARA</p>
          <label style={{fontSize:13, fontWeight:700}}>USERNAME</label>
          <input className="field" value={user} onChange={e=>setUser(e.target.value)} placeholder="e.g. nandu" />
          <label style={{fontSize:13, fontWeight:700, display:'block', marginTop:14}}>PASSWORD</label>
          <input className="field" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" />
          <button className="btn-primary" onClick={()=>{ if(!user.trim()) return alert('Enter username'); if(banned.includes(user)) return alert('You are banned!'); setLogged(true) }}>Enter XYNARA →</button>
          <button className="btn-ghost" style={{width:'100%', marginTop:10}} onClick={()=>{ if(!user.trim()) return alert('Enter username to create'); setLogged(true) }}>Create New Account</button>
          <p style={{fontSize:12, color:'#888', textAlign:'center', marginTop:14}}>By entering you agree to be chaotic but kind. Admin watches all chats.</p>
        </div>
      </div>
    </div>
  }

  // ADMIN VIEW
  if(tab==='admin' && isAdmin){
    return <div style={{minHeight:'100vh', padding:20, background:'#070312'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h1 className="font-display">🛡️ CONTROL CORE <span style={{color:'#00f0ff'}}>• LIVE</span></h1><button className="btn-ghost" onClick={()=>setTab('chat')}>← Back to Chat</button></div>
      <div style={{display:'flex', gap:8, margin:'16px 0', flexWrap:'wrap'}}>
        {(['overview','users','chats','moderation','groups'] as any[]).map(t=> <button key={t} className={adminTab===t?'pill active':'pill'} onClick={()=>setAdminTab(t)}>{t.toUpperCase()}</button>)}
      </div>
      {adminTab==='overview' && <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}}>
        {[['Total Users','5'],['Live Groups','3'],['Total Messages', String(messages.length)],['Flagged','1'],['Online Now','4'],['Banned', String(banned.length)]].map(([l,v])=> <div key={l} className="card"><div style={{color:'#a78bfa', fontSize:12, fontWeight:800}}>{l}</div><div className="font-display" style={{fontSize:32}}>{v}</div></div>)}
      </div>}
      {adminTab==='users' && <div className="card"><input className="field" placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)} /><table><thead><tr><th>User</th><th>Rank</th><th>Status</th><th>Actions</th></tr></thead><tbody>{SEED_USERS.filter(u=>u.name.includes(search.toLowerCase())).map(u=> <tr key={u.id}><td>{u.emoji} {u.name}</td><td><select value={ranks[u.name]||'MEMBER'} onChange={e=>setRanks(p=>({...p,[u.name]:e.target.value}))} style={{background:'#0f0a22', color:'#fff', padding:6, borderRadius:8}}><option>OWNER</option><option>ADMIN</option><option>MOD</option><option>VIP</option><option>MEMBER</option></select></td><td>{banned.includes(u.name)?'🚫 BANNED': u.online?'🟢 Online':'⚪ Offline'}</td><td><button className="pill" onClick={()=>{ if(banned.includes(u.name)) setBanned(b=>b.filter(x=>x!==u.name)); else setBanned(b=>[...b,u.name]) }}>{banned.includes(u.name)?'Unban':'Ban'}</button></td></tr>)}</tbody></table></div>}
      {adminTab==='chats' && <div className="card"><h3>Inspect All Chats — {activeGroup.name}</h3><p style={{color:'#aaa'}}>Admin can read every conversation to keep XYNARA safe.</p>{messages.map(m=> <div key={m.id} style={{padding:'10px 0', borderTop:'1px solid rgba(255,255,255,.08)'}}><b>{m.emoji} {m.user}</b> <span style={{color:'#888', fontSize:12}}>{m.time}</span> {m.flagged && <span className="chip" style={{background:'#ef4444'}}>⚠️ FLAGGED</span>}<div>{m.text}</div><button className="pill" style={{marginTop:6}} onClick={()=>setMessages(ms=>ms.filter(x=>x.id!==m.id))}>Delete Message</button></div>)}</div>}
      {adminTab==='moderation' && <div className="card"><h3>Flagged Messages</h3>{messages.filter(m=>m.flagged).length===0 ? <p>No flagged messages. Send a bad word to test filter.</p> : messages.filter(m=>m.flagged).map(m=> <div key={m.id}>{m.user}: {m.text} <button className="pill" onClick={()=>setMessages(ms=>ms.filter(x=>x.id!==m.id))}>Delete</button></div>)}<p style={{color:'#aaa', fontSize:13, marginTop:12}}>Bad-word filter auto-censors: fuck, shit, bitch, dick, porn, sex → ***</p></div>}
      {adminTab==='groups' && <div style={{display:'grid', gap:12}}>{GROUPS.map(g=> <div key={g.id} className="card"><b>{g.emoji} {g.name}</b> — {g.desc} • {g.members} members • <span style={{color:'#22c55e'}}>● LIVE</span><div style={{marginTop:8}}><button className="pill" onClick={()=>{setActiveGroup(g); setTab('chat')}}>Open Group →</button></div></div>)}</div>}
    </div>
  }

  return <div style={{height:'100vh', display:'flex', flexDirection:'column'}}>
    {/* TOP BAR */}
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'#0a0620', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}><span style={{fontSize:24}}>🪐</span><b className="font-display" style={{fontSize:20}}>XYNARA</b><span className="chip" style={{background:'#22c55e33', color:'#86efac'}}>● LIVE</span>{confetti && <span>🎉🎉🎉 CONFETTI!!</span>}</div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="pill" onClick={simulateIncoming}>📞 Simulate Incoming Call</button>
        <button className="pill" onClick={()=>setShowGames(true)}>🎮 Games</button>
        <button className="pill" onClick={triggerConfetti}>🎉 Confetti</button>
        <button className="pill" onClick={()=>{setShowAdminLogin(true)}}>🛡️ Admin</button>
        <button className="pill" onClick={()=>setLogged(false)}>Logout</button>
      </div>
    </div>

    <div className="layout" style={{flex:1}}>
      <div className="sidebar">
        {GROUPS.map(g=> <div key={g.id} className={activeGroup.id===g.id?'server-ico active':'server-ico'} onClick={()=>{setActiveGroup(g); setActiveDM(null); setTab('chat')}} title={g.name}>{g.emoji}</div>)}
        <div className="server-ico" onClick={()=>setTab('discover')} title="Discover">🔍</div>
        <div className="server-ico" onClick={()=>setShowAdminLogin(true)} title="Admin">🛡️</div>
        <div style={{marginTop:'auto', textAlign:'center'}}><div className="avatar">👽</div><div style={{fontSize:11, marginTop:4}}>{user}</div><div className="chip" style={{background:'#a855f7', marginTop:4}}>{ranks[user]||'MEMBER'}</div></div>
      </div>

      <div className="col2">
        <div style={{padding:14, borderBottom:'1px solid rgba(255,255,255,.08)'}}><b>{activeGroup.emoji} {activeGroup.name}</b><div style={{fontSize:12, color:'#aaa'}}>{activeGroup.desc} • {activeGroup.members} members</div></div>
        <div style={{padding:12}}>
          <div style={{fontSize:11, fontWeight:800, color:'#a78bfa'}}>TEXT CHANNELS</div>
          {['# general','# gaming','# music','# announcements','# chaos'].map(c=> <div key={c} style={{padding:'9px 10px', borderRadius:10, background: c==='# general'?'rgba(255,255,255,.08)':'transparent', cursor:'pointer', marginTop:4}} onClick={()=>setActiveDM(null)}>{c}</div>)}
          <div style={{fontSize:11, fontWeight:800, color:'#22c55e', marginTop:16}}>VOICE CHANNELS {inVoice && <span>● IN VOICE</span>}</div>
          <div style={{padding:'9px 10px', borderRadius:10, background:'#22c55e22', marginTop:4}}><div>🔊 Lounge Voice {inVoice?'• YOU + kai':''}</div><button className="pill" style={{marginTop:6}} onClick={()=>setInVoice(v=>!v)}>{inVoice?'Leave Voice':'Join Voice'}</button></div>
          <div style={{padding:'9px 10px', borderRadius:10, marginTop:4}}>🎙️ Music Room</div>
          <div style={{fontSize:11, fontWeight:800, color:'#a78bfa', marginTop:16}}>DIRECT MESSAGES</div>
          {SEED_USERS.filter(u=>u.name!==user).map(u=> <div key={u.id} style={{display:'flex', gap:8, alignItems:'center', padding:'9px 10px', borderRadius:10, cursor:'pointer', background: activeDM===u.name?'rgba(255,255,255,.08)':'transparent'}} onClick={()=>setActiveDM(u.name)}><span>{u.emoji}</span><span>{u.name}</span><span style={{marginLeft:'auto', fontSize:10}}>{u.online?'🟢':'⚪'}</span></div>)}
        </div>
        <div style={{marginTop:'auto', padding:12, borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', gap:8}}>
          <button className="pill" onClick={()=>startCall('voice')}>📞 Voice</button>
          <button className="pill" onClick={()=>startCall('video')}>📹 Video</button>
        </div>
      </div>

      <div className="chat-col">
        {/* STORIES */}
        <div style={{display:'flex', gap:10, padding:'12px 14px', overflowX:'auto', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <div className="story" onClick={()=>{setStoryUser(user||'you'); setShowStories(true)}}><div>+</div></div>
          {SEED_USERS.map(u=> <div key={u.id} className="story" onClick={()=>{setStoryUser(u.name); setShowStories(true)}}><div>{u.emoji}</div></div>)}
          <div style={{alignSelf:'center', fontSize:12, color:'#aaa', whiteSpace:'nowrap'}}>Stories • tap to view</div>
        </div>
        <div style={{padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <b>{activeDM ? `💬 DM — ${activeDM}` : `# general — ${activeGroup.name}`}</b>
          <div style={{display:'flex', gap:6}}>
            <button className="pill" onClick={()=>startCall('voice')}>📞</button>
            <button className="pill" onClick={()=>startCall('video')}>📹</button>
            <button className="pill" onClick={()=>setShowSound(true)}>🎛️ Soundboard</button>
            <button className="pill" onClick={()=>setShowPoll(true)}>📊 Poll</button>
            <button className="pill" onClick={()=>setShoutMode(s=>!s)}>{shoutMode?'🔊 SHOUT ON':'🔈 Shout'}</button>
          </div>
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'10px 0'}}>
          {tab==='discover' ? <div style={{padding:16}}>
            <h3>Discover Users — Follow instantly, no accept needed</h3>
            <input className="field" placeholder="Search username..." value={search} onChange={e=>setSearch(e.target.value)} />
            {SEED_USERS.filter(u=>u.name.includes(search.toLowerCase())).map(u=> <div key={u.id} style={{display:'flex', alignItems:'center', gap:10, padding:12, background:'rgba(255,255,255,.04)', borderRadius:14, marginTop:10}}><span style={{fontSize:28}}>{u.emoji}</span><div style={{flex:1}}><b>{u.name}</b> <span className="chip" style={{background:'#a855f7'}}>{ranks[u.name]}</span><div style={{fontSize:12, color:'#aaa'}}>{u.bio}</div></div><button className="btn-cyan" onClick={()=>{ if(following.includes(u.name)) setFollowing(f=>f.filter(x=>x!==u.name)); else setFollowing(f=>[...f,u.name]) }}>{following.includes(u.name)?'Following ✓':'Follow'}</button><button className="pill" onClick={()=>{setActiveDM(u.name); setTab('chat')}}>DM</button></div>)}
            <div style={{marginTop:14, fontSize:13, color:'#aaa'}}>Following: {following.join(', ') || 'none'} • Friends (mutual): aria, kai</div>
          </div> : <>
            {messages.map(m=> <div key={m.id} className="msg"><div className="avatar">{m.emoji}</div><div><div><b>{m.user}</b> <span style={{fontSize:11, color:'#888'}}>{m.time}</span> {m.flagged && <span className="chip" style={{background:'#ef4444'}}>FLAGGED</span>}</div><div className="bubble" style={{marginTop:4}}>{m.text}</div><div style={{marginTop:6}}>{Object.entries(m.reactions).map(([e,c])=> <span key={e} className="reaction">{e} {c}</span>)}<button className="reaction" onClick={()=>setMessages(ms=>ms.map(x=> x.id===m.id? {...x, reactions:{...x.reactions, '🔥': (x.reactions['🔥']||0)+1}} : x))}>🔥</button><button className="reaction" onClick={()=>setMessages(ms=>ms.map(x=> x.id===m.id? {...x, reactions:{...x.reactions, '❤️': (x.reactions['❤️']||0)+1}} : x))}>❤️</button><button className="reaction" onClick={()=>setMessages(ms=>ms.map(x=> x.id===m.id? {...x, reactions:{...x.reactions, '👽': (x.reactions['👽']||0)+1}} : x))}>👽</button></div></div></div>)}
            {polls.map((p,i)=> <div key={i} className="card" style={{margin:'12px 16px'}}><b>📊 {p.q}</b>{p.opts.map((o:string, idx:number)=> <div key={idx} style={{marginTop:8}}><button className="pill" style={{width:'100%', textAlign:'left'}} onClick={()=>{ const np=[...polls]; np[i].votes[idx]=(np[i].votes[idx]||0)+1; setPolls(np)}}>{o} — {p.votes[idx]||0} votes</button></div>)}</div>)}
          </>}
        </div>
        <div style={{padding:12, borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', gap:8}}>
          <input className="field" style={{marginTop:0, flex:1}} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send() }} placeholder={shoutMode?'SHOUT SOMETHING CHAOTIC...':'Message #general...'} />
          <button className="btn-cyan" onClick={()=>send()}>Send</button>
          <button className="pill" onClick={()=>send('😂 MEME: When you say "one more game" at 3AM and it is 6AM')}>😂 Meme</button>
        </div>
      </div>

      <div className="members">
        <b style={{fontSize:13}}>MEMBERS — {SEED_USERS.filter(u=>u.online).length} ONLINE</b>
        {SEED_USERS.map(u=> <div key={u.id} style={{display:'flex', gap:8, alignItems:'center', marginTop:12}}><span style={{fontSize:22}}>{u.emoji}</span><div><div>{u.name} <span style={{fontSize:10}}>{u.online?'🟢':'⚪'}</span></div><span className="chip" style={{background: ranks[u.name]==='OWNER'?'#f59e0b': ranks[u.name]==='ADMIN'?'#ef4444': ranks[u.name]==='MOD'?'#3b82f6':'#6b7280'}}>{ranks[u.name]}</span></div></div>)}
        <div style={{marginTop:18, background:'rgba(255,255,255,.05)', padding:12, borderRadius:14}}><b>Following</b><div style={{fontSize:13, color:'#aaa', marginTop:6}}>{following.join(', ')}</div></div>
      </div>
    </div>

    {/* INCOMING CALL */}
    {incoming && <div className="modal"><div className="card" style={{textAlign:'center', maxWidth:380, width:'100%'}}><div style={{fontSize:56}}>📞</div><h2>{incoming} is calling you...</h2><p style={{color:'#aaa'}}>Voice Call • XYNARA</p><div style={{display:'flex', gap:10, justifyContent:'center'}}><button className="btn-cyan" onClick={()=>{setIncoming(null); startCall('voice')}}>✅ Accept</button><button className="btn-ghost" style={{background:'#ef4444', borderColor:'#ef4444'}} onClick={()=>{setIncoming(null); send(`📞 Missed call from ${incoming}`)}}>❌ Decline</button></div></div></div>}

    {/* ACTIVE CALL - MEET STYLE GRID */}
    {showCall && <div style={{position:'fixed', inset:0, background:'#05010f', zIndex:60, display:'flex', flexDirection:'column'}}>
      <div style={{display:'flex', justifyContent:'space-between', padding:14}}><b className="font-display">XYNARA CALL • {showCall==='video'?'VIDEO':'VOICE'} • {callMins}:00 • HD 1080p</b><span>{demoParticipants} participants</span></div>
      <div className="call-grid" style={{gridTemplateColumns: demoParticipants<=2?'1fr 1fr': demoParticipants<=4?'1fr 1fr':'1fr 1fr 1fr', flex:1}}>
        <div className="call-tile">{showCall==='video' ? <video ref={videoRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{fontSize:64}}>👽</span>}<div style={{position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,.6)', padding:'4px 10px', borderRadius:99, fontSize:12}}>YOU {micOn?'🎤':'🔇'} {camOn?'📹':'📷 Off'}</div></div>
        {Array.from({length: demoParticipants-1}).map((_,i)=> <div key={i} className="call-tile"><span style={{fontSize:52}}>{['🦋','🎮','🎧','🧘','👽'][i%5]}</span><div style={{position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,.6)', padding:'4px 10px', borderRadius:99, fontSize:12}}>{['aria','kai','mia','zen','nandu'][i]} • 🎤</div></div>)}
      </div>
      <div style={{display:'flex', gap:10, justifyContent:'center', padding:16, background:'#0a0620'}}>
        <button className="pill" style={{background: micOn?'#22c55e':'#ef4444'}} onClick={()=>setMicOn(m=>!m)}>{micOn?'🎤 Mic On':'🔇 Mic Off'}</button>
        <button className="pill" style={{background: camOn?'#22c55e':'#ef4444'}} onClick={()=>setCamOn(c=>!c)}>{camOn?'📹 Cam On':'📷 Cam Off'}</button>
        <button className="pill" onClick={addDemo}>➕ Add Demo Person ({demoParticipants}/6)</button>
        <button className="pill" onClick={()=>setShowSound(true)}>🎛️ Soundboard</button>
        <button className="pill" style={{background:'#ef4444'}} onClick={()=>{setShowCall(null); if(localStream) localStream.getTracks().forEach((t:any)=>t.stop())}}>📞 End Call</button>
      </div>
    </div>}

    {/* SOUNDBOARD */}
    {showSound && <div className="modal" onClick={()=>setShowSound(false)}><div className="card" onClick={e=>e.stopPropagation()}><h3>🎛️ Soundboard</h3><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>{['Airhorn','Fart','Applause','Drumroll','Sad Trombone','Gasp','Laser','Vine Boom'].map(s=> <button key={s} className="pill" style={{padding:14}} onClick={()=>playSound(s)}>{s}</button>)}</div><button className="btn-ghost" style={{marginTop:12, width:'100%'}} onClick={()=>setShowSound(false)}>Close</button></div></div>}

    {/* POLL */}
    {showPoll && <div className="modal"><div className="card"><h3>📊 Create Poll</h3><input className="field" placeholder="Question..." value={pollQ} onChange={e=>setPollQ(e.target.value)} />{pollOpts.map((o,i)=> <input key={i} className="field" placeholder={`Option ${i+1}`} value={o} onChange={e=>{ const n=[...pollOpts]; n[i]=e.target.value; setPollOpts(n)}} />)}<button className="pill" onClick={()=>setPollOpts(p=>[...p,''])}>+ Add Option</button><button className="btn-primary" onClick={()=>{ if(!pollQ) return; setPolls(p=>[...p,{q:pollQ, opts:pollOpts.filter(Boolean), votes:{}}]); setShowPoll(false); setPollQ(''); setPollOpts(['','']) }}>Post Poll</button><button className="btn-ghost" style={{width:'100%', marginTop:8}} onClick={()=>setShowPoll(false)}>Cancel</button></div></div>}

    {/* GAMES */}
    {showGames && <div className="modal"><div className="card" style={{maxWidth:520, width:'100%'}}><h3>🎮 Games Hub</h3>
      <div style={{display:'grid', gap:10}}>
        <button className="pill" onClick={()=>send('🎲 Rock Paper Scissors: You picked Rock, Bot picked Scissors — YOU WIN! 🎉')}>✊ Rock Paper Scissors — Play</button>
        <button className="pill" onClick={()=>send('❓ Truth: What is your most embarrassing XYNARA moment?')}>🤫 Truth or Dare — Truth</button>
        <button className="pill" onClick={()=>send('😈 Dare: Send a voice note saying "I love XYNARA" in a funny voice!')}>😈 Truth or Dare — Dare</button>
        <button className="pill" onClick={()=>send('🧠 Quiz: What does XYNARA mean? A) Galaxy B) Chaos C) Both — Answer: C!')}>🧠 Quick Quiz</button>
        <button className="pill" onClick={()=>send('⚖️ This or That: 3AM Gaming vs 3AM Chatting? Vote!')}>⚖️ This or That</button>
        <button className="pill" onClick={()=>send('⭕ Tic-Tac-Toe: X wins! GG!')}>⭕ Tic-Tac-Toe — Quick Win</button>
      </div>
      <button className="btn-ghost" style={{width:'100%', marginTop:12}} onClick={()=>setShowGames(false)}>Close</button></div></div>}

    {/* STORIES */}
    {showStories && <div className="modal" onClick={()=>setShowStories(false)}><div style={{textAlign:'center', color:'#fff'}}><div style={{fontSize:80}}>🌌</div><h2>{storyUser}'s Story</h2><p>XYNARA vibes only ✨</p><div style={{width:220, height:6, background:'rgba(255,255,255,.2)', borderRadius:99, margin:'16px auto'}}><div style={{width:'70%', height:'100%', background:'#00f0ff', borderRadius:99}} /></div><input className="field" placeholder="Reply to story..." onKeyDown={e=>{ if(e.key==='Enter'){ send(`💬 Replied to ${storyUser}'s story`); setShowStories(false) }}} style={{maxWidth:320}} /><p style={{fontSize:12, color:'#aaa', marginTop:10}}>Tap anywhere to close</p></div></div>}

    {/* ADMIN LOGIN */}
    {showAdminLogin && <div className="modal"><div className="card" style={{maxWidth:360, width:'100%'}}><h3>🛡️ Admin Login</h3><p style={{color:'#aaa', fontSize:13}}>Only you can access Control Core.</p><input className="field" type="password" placeholder="Admin password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} /><button className="btn-primary" onClick={()=>{ if(adminPass===ADMIN_PASS){ setIsAdmin(true); setTab('admin'); setShowAdminLogin(false)} else alert('Wrong password!') }}>Unlock Control Core</button><button className="btn-ghost" style={{width:'100%', marginTop:8}} onClick={()=>setShowAdminLogin(false)}>Cancel</button></div></div>}
  </div>
}
