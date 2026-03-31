import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const G = {
  bg: "#07070f",
  surface: "#0f0f1a",
  card: "#16162200",
  cardSolid: "#161622",
  border: "#25253a",
  accent: "#00f5c4",
  purple: "#9b5de5",
  pink: "#f72585",
  blue: "#4361ee",
  orange: "#fb8500",
  yellow: "#ffd60a",
  red: "#ff4d6d",
  green: "#06d6a0",
  text: "#eeeeff",
  muted: "#6a6a8a",
  font: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
};

const injectFonts = () => {
  if (document.getElementById("sync-fonts")) return;
  const l = document.createElement("link");
  l.id = "sync-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap";
  document.head.appendChild(l);
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const ACTIVE_APP = { name: "WhatsApp", icon: "💬", color: "#25d366" };

const FRIENDS = [
  { id: 1, name: "Maya Chen",  handle: "@maya.c", av: "MC", color: "#f72585", online: true  },
  { id: 2, name: "Luca Visser",handle: "@luca.v", av: "LV", color: "#4361ee", online: true  },
  { id: 3, name: "Kai Park",   handle: "@kai.p",  av: "KP", color: "#00f5c4", online: true  },
  { id: 4, name: "Dev Squad",  handle: "8 members",av:"DS", color: "#fb8500", online: true, group: true },
  { id: 5, name: "Nora Sato",  handle: "@nora.s", av: "NS", color: "#9b5de5", online: false },
];

const FILES = [
  { id: 1, name: "pitch_deck.pdf",      size: "4.2 MB",  icon: "📄", color: "#f72585", type: "pdf"   },
  { id: 2, name: "design_v2.zip",       size: "240 MB",  icon: "🗜️", color: "#9b5de5", type: "zip"   },
  { id: 3, name: "demo_video.mp4",      size: "92 MB",   icon: "🎬", color: "#4361ee", type: "video" },
  { id: 4, name: "notes.txt",           size: "12 KB",   icon: "📝", color: "#25d366", type: "txt"   },
  { id: 5, name: "budget_q2.xlsx",      size: "880 KB",  icon: "📊", color: "#fb8500", type: "excel" },
  { id: 6, name: "profile_photo.jpg",   size: "3.1 MB",  icon: "🖼️", color: "#00f5c4", type: "image" },
];

const TOOLS = [
  { id: "draw",  icon: "✏️", label: "Draw",    color: "#f72585" },
  { id: "zoom",  icon: "🔍", label: "Zoom",    color: "#4361ee" },
  { id: "blur",  icon: "🌫️", label: "Blur",    color: "#9b5de5", pro: true },
  { id: "clip",  icon: "✂️", label: "Clip",    color: "#00f5c4" },
  { id: "react", icon: "🎭", label: "React",   color: "#fb8500" },
  { id: "voice", icon: "🎤", label: "Voice",   color: "#06d6a0" },
  { id: "ai",    icon: "🤖", label: "AI Sum",  color: "#ffd60a", pro: true },
  { id: "laser", icon: "🔴", label: "Laser",   color: "#ff4d6d" },
];

// ─── TINY COMPONENTS ──────────────────────────────────────────────────────────
const Av = ({ initials, color, size = 36, pulse }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${color}cc,${color}44)`,
      border: `2px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.31, fontWeight: 700, color: "#fff", fontFamily: G.font,
    }}>{initials}</div>
    {pulse && <div style={{ position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:G.green,border:`2px solid #07070f`,animation:"livePulse 1.8s infinite" }} />}
  </div>
);

const Pill = ({ label, color, small }) => (
  <span style={{
    background:`${color}18`,color,border:`1px solid ${color}35`,
    borderRadius:20,padding: small?"2px 7px":"3px 10px",
    fontSize: small?10:11,fontWeight:700,fontFamily:G.font,
    textTransform:"capitalize",whiteSpace:"nowrap",letterSpacing:"0.3px",
  }}>{label}</span>
);

const Tog = ({ on, setOn, color=G.accent }) => (
  <div onClick={()=>setOn(!on)} style={{
    width:42,height:22,borderRadius:11,background:on?color:"#2a2a40",
    cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0,
    boxShadow:on?`0 0 8px ${color}55`:"none",
  }}>
    <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?23:3,transition:"left .2s"}}/>
  </div>
);

// ─── SIMULATED PHONE SCREEN (background app) ──────────────────────────────────
function PhoneBg({ activeApp }) {
  const app = activeApp;
  const msgs = [
    { id:1, me:false, text:"Hey! Can you share that file we talked about?", time:"10:32" },
    { id:2, me:true,  text:"Sure! Give me a sec 📎", time:"10:33" },
    { id:3, me:false, text:"Also can you show me what you mean on screen?", time:"10:33" },
    { id:4, me:true,  text:"Yeah I'll share my screen now", time:"10:34" },
    { id:5, me:false, text:"Perfect 👌", time:"10:34" },
  ];
  const waColors = { header:"#075e54", bubble1:"#dcf8c6", bubble2:"#fff", bg:"#e5ddd5" };

  return (
    <div style={{ width:"100%", height:"100%", background: waColors.bg, display:"flex", flexDirection:"column", fontFamily:"sans-serif", position:"relative" }}>
      {/* WA Header */}
      <div style={{ background: waColors.header, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, paddingTop:24 }}>
        <div style={{ width:36,height:36,borderRadius:"50%",background:"#128c7e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",fontWeight:700 }}>MC</div>
        <div>
          <div style={{ color:"#fff",fontSize:15,fontWeight:600 }}>Maya Chen</div>
          <div style={{ color:"#b2dfdb",fontSize:11 }}>online</div>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",gap:16,color:"#fff",fontSize:18 }}>🔍 ⋮</div>
      </div>
      {/* Messages */}
      <div style={{ flex:1,padding:"10px 10px",display:"flex",flexDirection:"column",gap:6,overflowY:"auto" }}>
        {msgs.map(m=>(
          <div key={m.id} style={{ display:"flex",justifyContent:m.me?"flex-end":"flex-start" }}>
            <div style={{
              background:m.me?waColors.bubble1:waColors.bubble2,
              borderRadius:m.me?"12px 2px 12px 12px":"2px 12px 12px 12px",
              padding:"7px 10px 4px",maxWidth:"75%",
              boxShadow:"0 1px 2px rgba(0,0,0,0.15)",
            }}>
              <div style={{ fontSize:13,color:"#111",lineHeight:1.4 }}>{m.text}</div>
              <div style={{ fontSize:10,color:"#888",textAlign:"right",marginTop:2 }}>{m.time} {m.me&&"✓✓"}</div>
            </div>
          </div>
        ))}
      </div>
      {/* WA Input */}
      <div style={{ padding:"8px 10px",background:"#f0f0f0",display:"flex",gap:8,alignItems:"center" }}>
        <div style={{ flex:1,background:"#fff",borderRadius:22,padding:"9px 14px",fontSize:13,color:"#999",boxShadow:"0 1px 2px rgba(0,0,0,0.1)" }}>Message</div>
        <div style={{ width:40,height:40,borderRadius:"50%",background:waColors.header,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16 }}>🎤</div>
      </div>
    </div>
  );
}

// ─── OVERLAY PANEL CONTENT ────────────────────────────────────────────────────
function ShareTab({ onStart, isLive, timer, viewers }) {
  const [invited, setInvited] = useState({});
  const fmt = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      {/* Live status card */}
      <div style={{
        background: isLive ? "linear-gradient(135deg,#041a0e,#071a10)" : "linear-gradient(135deg,#0d0d18,#12102a)",
        border:`1px solid ${isLive?G.green+"44":G.accent+"33"}`,
        borderRadius:14,padding:16,
      }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
              {isLive && <div style={{ width:8,height:8,borderRadius:"50%",background:G.red,animation:"livePulse 1.2s infinite" }}/>}
              <span style={{ fontFamily:G.font,fontWeight:800,fontSize:16,color:G.text }}>
                {isLive ? "Screen Sharing" : "Share Your Screen"}
              </span>
            </div>
            {isLive
              ? <div style={{ display:"flex",gap:10 }}>
                  <span style={{ fontFamily:G.mono,fontSize:13,color:G.green }}>{fmt(timer)}</span>
                  <span style={{ fontSize:13,color:G.muted,fontFamily:G.font }}>· {viewers} watching</span>
                </div>
              : <div style={{ fontSize:12,color:G.muted,fontFamily:G.font }}>WhatsApp stays open — no interruption</div>
            }
          </div>
          <button onClick={onStart} style={{
            background:isLive?`${G.red}22`:`${G.accent}22`,
            color:isLive?G.red:G.accent,
            border:`1px solid ${isLive?G.red:G.accent}55`,
            borderRadius:10,padding:"9px 16px",fontFamily:G.font,
            fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0,
          }}>{isLive?"Stop":"Go Live"}</button>
        </div>

        {isLive && (
          <div style={{ marginTop:12,display:"flex",gap:7,flexWrap:"wrap" }}>
            {["✏️ Draw","🔍 Zoom","🌫️ Blur","✂️ Clip"].map(t=>(
              <button key={t} style={{
                background:G.surface,color:G.text,border:`1px solid ${G.border}`,
                borderRadius:8,padding:"6px 11px",fontSize:11,fontFamily:G.font,
                fontWeight:600,cursor:"pointer",
              }}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {/* Invite strip */}
      <div>
        <div style={{ fontFamily:G.font,fontWeight:700,fontSize:12,color:G.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>Invite to Watch</div>
        <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
          {FRIENDS.filter(f=>f.online).map((f,i)=>(
            <div key={f.id} style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"10px 0",
              borderBottom:`1px solid ${G.border}`,
            }}>
              <Av initials={f.av} color={f.color} size={36} pulse={f.online} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:G.font,fontWeight:600,fontSize:13,color:G.text }}>{f.name}</div>
                <div style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>{f.handle}</div>
              </div>
              <button
                onClick={()=>setInvited(p=>({...p,[f.id]:!p[f.id]}))}
                style={{
                  background:invited[f.id]?`${G.green}22`:`${G.accent}18`,
                  color:invited[f.id]?G.green:G.accent,
                  border:`1px solid ${invited[f.id]?G.green:G.accent}44`,
                  borderRadius:8,padding:"5px 12px",fontSize:11,
                  fontFamily:G.font,fontWeight:700,cursor:"pointer",
                }}>
                {invited[f.id]?"Invited ✓":"Invite"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Also share with current WA chat */}
      <div style={{
        background:`${ACTIVE_APP.color}0f`,border:`1px solid ${ACTIVE_APP.color}33`,
        borderRadius:12,padding:12,display:"flex",gap:10,alignItems:"center",
      }}>
        <span style={{ fontSize:22 }}>{ACTIVE_APP.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:G.font,fontWeight:700,fontSize:13,color:G.text }}>Share in this chat</div>
          <div style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>Send live link to your WhatsApp conversation</div>
        </div>
        <button style={{
          background:`${ACTIVE_APP.color}22`,color:ACTIVE_APP.color,
          border:`1px solid ${ACTIVE_APP.color}55`,borderRadius:8,
          padding:"6px 12px",fontSize:11,fontFamily:G.font,fontWeight:700,cursor:"pointer",
        }}>Send</button>
      </div>
    </div>
  );
}

function FilesTab() {
  const [sent, setSent] = useState({});
  const [filter, setFilter] = useState("all");
  const types = ["all","pdf","video","image","zip"];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      {/* Storage */}
      <div style={{ background:G.cardSolid,border:`1px solid ${G.border}`,borderRadius:12,padding:12 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
          <span style={{ fontFamily:G.font,fontWeight:700,fontSize:12,color:G.text }}>📦 Phone Storage</span>
          <span style={{ fontFamily:G.mono,fontSize:11,color:G.muted }}>68% used</span>
        </div>
        <div style={{ height:6,background:G.border,borderRadius:3,overflow:"hidden" }}>
          <div style={{ height:"100%",width:"68%",background:`linear-gradient(90deg,${G.accent},${G.purple})`,borderRadius:3 }}/>
        </div>
        <div style={{ fontSize:10,color:G.muted,fontFamily:G.font,marginTop:5 }}>6.8 GB of 10 GB · tap a file to send directly to WhatsApp</div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:5,overflowX:"auto" }}>
        {types.map(t=>(
          <div key={t} onClick={()=>setFilter(t)} style={{
            padding:"4px 11px",borderRadius:16,cursor:"pointer",whiteSpace:"nowrap",
            background:filter===t?`${G.accent}22`:G.cardSolid,
            border:`1px solid ${filter===t?G.accent:G.border}`,
            color:filter===t?G.accent:G.muted,
            fontSize:10,fontWeight:700,fontFamily:G.font,textTransform:"uppercase",
          }}>{t==="all"?"All":t}</div>
        ))}
      </div>

      {/* Files */}
      {FILES.filter(f=>filter==="all"||f.type===filter).map(file=>(
        <div key={file.id} style={{
          background:G.cardSolid,border:`1px solid ${G.border}`,
          borderRadius:12,padding:12,display:"flex",alignItems:"center",gap:10,
        }}>
          <div style={{
            width:40,height:40,borderRadius:10,flexShrink:0,
            background:`${file.color}1a`,border:`1px solid ${file.color}33`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
          }}>{file.icon}</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontFamily:G.font,fontWeight:600,fontSize:12,color:G.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{file.name}</div>
            <div style={{ fontSize:10,color:G.muted,fontFamily:G.font,marginTop:2 }}>{file.size}</div>
          </div>
          <button
            onClick={()=>setSent(p=>({...p,[file.id]:!p[file.id]}))}
            style={{
              background:sent[file.id]?`${G.green}22`:`${ACTIVE_APP.color}18`,
              color:sent[file.id]?G.green:ACTIVE_APP.color,
              border:`1px solid ${sent[file.id]?G.green:ACTIVE_APP.color}44`,
              borderRadius:8,padding:"5px 10px",fontSize:11,
              fontFamily:G.font,fontWeight:700,cursor:"pointer",flexShrink:0,
            }}>
            {sent[file.id]?"Sent ✓":"Send"}
          </button>
        </div>
      ))}
    </div>
  );
}

function ToolsTab() {
  const [on, setOn] = useState({});
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <div style={{ fontFamily:G.font,fontSize:12,color:G.muted,lineHeight:1.6 }}>
        Tools activate <span style={{ color:G.accent,fontWeight:700 }}>on top of WhatsApp</span> — draw on screen, zoom in, blur private info or react live without switching apps.
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {TOOLS.map(t=>(
          <div key={t.id} onClick={()=>setOn(p=>({...p,[t.id]:!p[t.id]}))} style={{
            background:on[t.id]?`${t.color}12`:G.cardSolid,
            border:`1px solid ${on[t.id]?t.color+"55":G.border}`,
            borderRadius:12,padding:12,cursor:"pointer",
            position:"relative",transition:"all .15s",
          }}>
            {t.pro && <div style={{ position:"absolute",top:7,right:7,background:`${G.yellow}22`,color:G.yellow,fontSize:8,fontFamily:G.font,fontWeight:700,border:`1px solid ${G.yellow}40`,borderRadius:4,padding:"1px 5px" }}>PRO</div>}
            <div style={{ fontSize:22,marginBottom:5 }}>{t.icon}</div>
            <div style={{ fontFamily:G.font,fontWeight:700,fontSize:12,color:on[t.id]?t.color:G.text }}>{t.label}</div>
            <div style={{ marginTop:8 }}><Tog on={on[t.id]||false} setOn={v=>setOn(p=>({...p,[t.id]:v}))} color={t.color}/></div>
          </div>
        ))}
      </div>
      {/* Pro */}
      <div style={{ background:"linear-gradient(135deg,#1a1200,#2a1800)",border:`1px solid ${G.yellow}33`,borderRadius:12,padding:14,display:"flex",gap:10,alignItems:"center" }}>
        <span style={{ fontSize:24 }}>⭐</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:G.font,fontWeight:800,fontSize:13,color:G.text }}>Unlock PRO Tools</div>
          <div style={{ fontSize:11,color:G.muted,fontFamily:G.font,marginTop:1 }}>AI Summarizer, Privacy Blur & more</div>
        </div>
        <button style={{ background:G.yellow,color:"#000",border:"none",borderRadius:8,padding:"7px 12px",fontFamily:G.font,fontWeight:800,fontSize:11,cursor:"pointer" }}>$4.99</button>
      </div>
    </div>
  );
}

function PrivacyTab() {
  const [masterLock, setMasterLock] = useState(false);
  const [stealth,    setStealth]    = useState(false);
  const [perms, setPerms] = useState({
    screen:"friends", control:"specific", files:"groups", camera:"none", mic:"friends",
  });
  const levels   = ["none","specific","friends","everyone"];
  const lColors  = { none:G.red, specific:G.orange, friends:G.accent, everyone:G.blue };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      {/* Master */}
      <div style={{
        background:masterLock?"linear-gradient(135deg,#1a0808,#280a0a)":G.cardSolid,
        border:`1px solid ${masterLock?G.red+"55":G.border}`,borderRadius:14,padding:14,
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
          <span style={{ fontSize:22 }}>🔐</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:G.font,fontWeight:800,fontSize:14,color:G.text }}>Master Lock</div>
            <div style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>Block all Sync access instantly</div>
          </div>
          <Tog on={masterLock} setOn={setMasterLock} color={G.red}/>
        </div>
        <div style={{ height:1,background:G.border,marginBottom:12 }}/>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ fontSize:20 }}>🥷</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:G.font,fontWeight:700,fontSize:13,color:G.text }}>Stealth Mode</div>
            <div style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>Appear offline to everyone</div>
          </div>
          <Tog on={stealth} setOn={setStealth} color={G.purple}/>
        </div>
      </div>

      {/* Per-perm */}
      <div style={{ opacity:masterLock?.4:1,pointerEvents:masterLock?"none":"auto" }}>
        {[
          { key:"screen",  icon:"👁️", label:"Screen Viewing"  },
          { key:"control", icon:"🕹️", label:"Remote Control"  },
          { key:"files",   icon:"📁", label:"File Access"     },
          { key:"camera",  icon:"📷", label:"Camera"          },
          { key:"mic",     icon:"🎙️", label:"Microphone"      },
        ].map(p=>(
          <div key={p.key} style={{ background:G.cardSolid,border:`1px solid ${G.border}`,borderRadius:12,padding:12,marginBottom:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:9 }}>
              <span style={{ fontSize:18 }}>{p.icon}</span>
              <div style={{ fontFamily:G.font,fontWeight:700,fontSize:13,color:G.text }}>{p.label}</div>
            </div>
            <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
              {levels.map(l=>(
                <div key={l} onClick={()=>setPerms(x=>({...x,[p.key]:l}))} style={{
                  padding:"3px 9px",borderRadius:7,cursor:"pointer",
                  background:perms[p.key]===l?`${lColors[l]}25`:"transparent",
                  border:`1px solid ${perms[p.key]===l?lColors[l]:G.border}`,
                  color:perms[p.key]===l?lColors[l]:G.muted,
                  fontSize:10,fontWeight:700,fontFamily:G.font,textTransform:"capitalize",
                }}>{l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OVERLAY PANEL ────────────────────────────────────────────────────────────
function OverlayPanel({ open, onClose, isLive, timer, viewers, onToggleLive }) {
  const [tab, setTab] = useState(0);
  const tabs = ["Share","Files","Tools","Privacy"];
  const icons = ["📡","📁","🛠️","🔒"];
  const panelH = "78vh";

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",
            zIndex:200,backdropFilter:"blur(2px)",transition:"opacity .25s",
          }}
        />
      )}

      {/* Slide-up Panel */}
      <div style={{
        position:"absolute",bottom:0,left:0,right:0,
        height: panelH,
        background:"#0e0e1c",
        border:`1px solid ${G.border}`,
        borderRadius:"22px 22px 0 0",
        zIndex:300,
        transform: open ? "translateY(0)" : "translateY(105%)",
        transition:"transform 0.35s cubic-bezier(.32,.72,0,1)",
        display:"flex",flexDirection:"column",
        boxShadow:"0 -12px 60px rgba(0,0,0,0.7)",
      }}>
        {/* Handle + header */}
        <div style={{ padding:"12px 18px 0", flexShrink:0 }}>
          <div style={{ width:36,height:4,borderRadius:2,background:G.border,margin:"0 auto 12px" }}/>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:28,height:28,borderRadius:8,background:`${G.accent}18`,border:`1px solid ${G.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:G.accent,fontFamily:G.font }}>S</div>
              <div>
                <div style={{ fontFamily:G.font,fontWeight:800,fontSize:14,color:G.text }}>Sync</div>
                <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:1 }}>
                  <div style={{ width:5,height:5,borderRadius:"50%",background:isLive?G.red:G.green,animation:isLive?"livePulse 1.2s infinite":"none" }}/>
                  <span style={{ fontSize:10,color:G.muted,fontFamily:G.font }}>{isLive?"Live":"Active"} · on top of {ACTIVE_APP.name}</span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <div style={{ background:`${ACTIVE_APP.color}18`,border:`1px solid ${ACTIVE_APP.color}33`,borderRadius:8,padding:"4px 8px",fontSize:11,color:ACTIVE_APP.color,fontFamily:G.font,fontWeight:600,display:"flex",gap:4,alignItems:"center" }}>
                {ACTIVE_APP.icon} {ACTIVE_APP.name}
              </div>
              <div onClick={onClose} style={{ width:28,height:28,borderRadius:"50%",background:"#25253a",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:G.muted }}>✕</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex",gap:0,background:"#0a0a14",borderRadius:12,padding:4 }}>
            {tabs.map((t,i)=>(
              <div key={t} onClick={()=>setTab(i)} style={{
                flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                gap:2,padding:"7px 4px",borderRadius:9,cursor:"pointer",
                background:tab===i?G.cardSolid:"transparent",
                transition:"background .15s",
              }}>
                <span style={{ fontSize:15,opacity:tab===i?1:.5 }}>{icons[i]}</span>
                <span style={{ fontSize:9,fontFamily:G.font,fontWeight:700,color:tab===i?G.accent:G.muted,letterSpacing:.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1,overflowY:"auto",padding:"14px 16px 20px" }}>
          {tab===0 && <ShareTab onStart={onToggleLive} isLive={isLive} timer={timer} viewers={viewers}/>}
          {tab===1 && <FilesTab/>}
          {tab===2 && <ToolsTab/>}
          {tab===3 && <PrivacyTab/>}
        </div>
      </div>
    </>
  );
}

// ─── FLOATING BUBBLE ──────────────────────────────────────────────────────────
function FloatingBubble({ onClick, isLive, viewers }) {
  const [pos,  setPos]  = useState({ x: 20, y: 220 });
  const [drag, setDrag] = useState(null);
  const ref = useRef(null);

  const onPointerDown = e => {
    e.preventDefault();
    const start = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y };
    setDrag(start);
  };

  useEffect(()=>{
    if (!drag) return;
    const move = e => {
      const dx = e.clientX - drag.mx;
      const dy = e.clientY - drag.my;
      setPos({ x: drag.ox + dx, y: drag.oy + dy });
    };
    const up = e => {
      const dx = Math.abs(e.clientX - drag.mx);
      const dy = Math.abs(e.clientY - drag.my);
      if (dx < 5 && dy < 5) onClick();
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return ()=>{ window.removeEventListener("pointermove",move); window.removeEventListener("pointerup",up); };
  },[drag]);

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      style={{
        position:"absolute",
        left: pos.x, top: pos.y,
        zIndex:400,
        userSelect:"none",
        cursor:"grab",
        filter:`drop-shadow(0 4px 20px ${isLive?G.red+"99":G.accent+"88"})`,
      }}
    >
      {/* Outer ring */}
      <div style={{
        width:58,height:58,borderRadius:"50%",
        background: isLive
          ? `conic-gradient(${G.red},${G.pink},${G.red})`
          : `conic-gradient(${G.accent},${G.purple},${G.accent})`,
        padding:3,
        animation: isLive ? "spinRing 3s linear infinite" : "spinRing 6s linear infinite",
      }}>
        <div style={{
          width:"100%",height:"100%",borderRadius:"50%",
          background:"#0e0e1c",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          gap:1,
        }}>
          <span style={{ fontSize:20 }}>⚡</span>
          {isLive && (
            <span style={{ fontSize:8,fontFamily:G.font,fontWeight:800,color:G.red,letterSpacing:.5 }}>LIVE</span>
          )}
        </div>
      </div>
      {/* Viewer badge */}
      {isLive && viewers>0 && (
        <div style={{
          position:"absolute",top:-4,right:-4,
          background:G.red,color:"#fff",
          width:18,height:18,borderRadius:"50%",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:9,fontWeight:800,fontFamily:G.font,
          border:"2px solid #0e0e1c",
        }}>{viewers}</div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function SyncOverlay() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [isLive,    setIsLive]    = useState(false);
  const [timer,     setTimer]     = useState(0);
  const [viewers,   setViewers]   = useState(0);

  useEffect(() => { injectFonts(); }, []);

  useEffect(() => {
    let t;
    if (isLive) t = setInterval(() => setTimer(s => s+1), 1000);
    else setTimer(0);
    return () => clearInterval(t);
  }, [isLive]);

  const toggleLive = () => {
    if (!isLive) {
      setIsLive(true);
      setViewers(Math.floor(Math.random()*5)+1);
    } else {
      setIsLive(false);
      setViewers(0);
    }
  };

  return (
    <div style={{
      width:"100%", height:"100vh", maxWidth:390,
      margin:"0 auto", position:"relative", overflow:"hidden",
      fontFamily:G.font, background:"#e5ddd5",
    }}>
      <style>{`
        @keyframes livePulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:.5;transform:scale(1.3)}
        }
        @keyframes spinRing {
          from{transform:rotate(0deg)} to{transform:rotate(360deg)}
        }
        ::-webkit-scrollbar{width:0}
        *{box-sizing:border-box}
      `}</style>

      {/* Background app (WhatsApp) */}
      <PhoneBg activeApp={ACTIVE_APP} />

      {/* Live screen-share tint overlay */}
      {isLive && (
        <div style={{
          position:"absolute",inset:0,
          border:`3px solid ${G.red}`,
          borderRadius:0,
          pointerEvents:"none",
          zIndex:100,
          boxShadow:`inset 0 0 30px ${G.red}22`,
        }}>
          <div style={{
            position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",
            background:G.red,color:"#fff",borderRadius:6,
            padding:"3px 10px",fontSize:11,fontFamily:G.font,fontWeight:800,
            display:"flex",alignItems:"center",gap:5,
          }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#fff",animation:"livePulse 1s infinite" }}/>
            SHARING · {viewers} watching
          </div>
        </div>
      )}

      {/* Floating Sync bubble */}
      <FloatingBubble
        onClick={() => setPanelOpen(true)}
        isLive={isLive}
        viewers={viewers}
      />

      {/* Overlay panel */}
      <OverlayPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        isLive={isLive}
        timer={timer}
        viewers={viewers}
        onToggleLive={toggleLive}
      />
    </div>
  );
}
