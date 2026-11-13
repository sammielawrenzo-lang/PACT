"use client";

import {useState} from "react";
import {ArrowRight,CheckCircle2,CircleHelp,FileText,LockKeyhole,RotateCcw,ShieldCheck,Sparkles,Users,Wallet} from "lucide-react";

type Phase="setup"|"accept"|"fund"|"progress"|"resolve"|"done";
type Person={name:string;accepted:boolean;funded:boolean;confirmed:boolean};
type Evidence={name:string;text:string};
type Kind="challenge"|"goal";
const startingPeople="Zion, Maya, Theo";
const demoSteps=["Agreement","Acceptance","Contributions","Evidence","Resolution"];

export default function JudgeDemo(){
 const [phase,setPhase]=useState<Phase>("setup");
 const [kind,setKind]=useState<Kind>("challenge");
 const [idea,setIdea]=useState("Three friends compete to study the most hours during a seven-day study sprint.");
 const [title,setTitle]=useState("Seven-day study sprint");
 const [terms,setTerms]=useState("For seven days, everyone logs their study sessions. The participant with the most verified hours wins. Everyone reviews the submitted logs; a tie or unresolved dispute means a refund.");
 const [names,setNames]=useState(startingPeople);
 const [stake,setStake]=useState("10");
 const [people,setPeople]=useState<Person[]>([]);
 const [evidence,setEvidence]=useState<Evidence[]>([]);
 const [evidenceText,setEvidenceText]=useState("");
 const [evidencePerson,setEvidencePerson]=useState(0);
 const [resolution,setResolution]=useState("refund");
 const [advice,setAdvice]=useState(false);
 const [activity,setActivity]=useState<string[]>(["Public demonstration opened"]);
 const [error,setError]=useState("");
 const [finalOutcome,setFinalOutcome]=useState("");
 const note=(s:string)=>setActivity(prev=>[s,...prev].slice(0,18));
 const allAccepted=people.length>0&&people.every(p=>p.accepted);
 const allFunded=people.length>0&&people.every(p=>p.funded);
 const allConfirmed=people.length>0&&people.every(p=>p.confirmed);
 const total=people.length*(Number(stake)||0);
 const amount=(value:number)=>"$"+value.toFixed(2);
 const stepIndex=phase==="setup"?0:phase==="accept"?1:phase==="fund"?2:phase==="progress"?3:4;
 function reset(){
  setPhase("setup");setPeople([]);setEvidence([]);setEvidenceText("");setEvidencePerson(0);
  setResolution("refund");setAdvice(false);setFinalOutcome("");setError("");
  setActivity(["Public demonstration restarted"]);
 }
 function suggest(){
  const description=idea.trim();
  if(!description){setError("Describe the commitment before generating example terms.");return;}
  setError("");
  setTitle(kind==="goal"?"Shared accountability goal":"Friendly accountability challenge");
  setTerms(kind==="goal"
   ?"Each participant commits to: "+description+" Participants submit a written progress log. All contributions are marked for a simulated refund at the deadline; uncertain claims require human review."
   :"Challenge objective: "+description+" Participants provide written evidence before the cutoff. Everyone must confirm the same result. A tie, missing proof, or disagreement leads to simulated refunds.");
  note("Example agreement text prepared (offline; no AI API call)");
 }
 function create(){
  const members=names.split(",").map(x=>x.trim()).filter(Boolean).slice(0,8);
  if(title.trim().length<5||terms.trim().length<20||members.length<(kind==="challenge"?2:1)||new Set(members.map(x=>x.toLowerCase())).size!==members.length||!(Number(stake)>=0&&Number(stake)<=1000)){
   setError("Enter a title (5+ characters), agreement terms (20+ characters), unique participants and a contribution between $0 and $1,000. Challenges need at least two people.");return;
  }
  setPeople(members.map(name=>({name,accepted:false,funded:false,confirmed:false})));
  setError("");setPhase("accept");note("Agreement created for "+members.length+" participants");
 }
 function updatePerson(index:number,field:"accepted"|"funded"|"confirmed"){
  setPeople(prev=>prev.map((p,i)=>i===index?{...p,[field]:true}:p));
  note(people[index].name+" "+(field==="accepted"?"accepted the terms":field==="funded"?"recorded a simulated contribution":"confirmed the resolution"));
 }
 function addEvidence(){
  if(evidenceText.trim().length<8){setError("Add a short written study log or other evidence first.");return;}
  const person=people[evidencePerson];
  setEvidence(prev=>[...prev,{name:person.name,text:evidenceText.trim()}]);
  setEvidenceText("");setAdvice(false);setError("");note(person.name+" submitted written evidence");
 }
 function selectResolution(value:string){
  setResolution(value);setPeople(prev=>prev.map(p=>({...p,confirmed:false})));
  note("Proposed resolution changed; confirmations reset");
 }
 function finish(){
  if(!allConfirmed)return;
  const outcome=resolution==="refund"?"Contributions marked as refunded (simulation)":"Prize marked as paid to "+resolution+" (simulation)";
  setFinalOutcome(outcome);setPhase("done");note(outcome);
 }
 const card:React.CSSProperties={background:"#fff",border:"1px solid #d7dedb",borderRadius:17,padding:28,marginBottom:20};
 const small:React.CSSProperties={color:"#526170",fontSize:16,lineHeight:1.6};
 return <main className="app-shell" style={{padding:"32px 20px 70px",minHeight:"100vh"}}>
  <div style={{maxWidth:1050,margin:"0 auto"}}>
   <header style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",flexWrap:"wrap",marginBottom:26}}>
    <a href="/demo" aria-label="PACT public demo"><img src="/pact-wordmark.png" alt="PACT" style={{width:190,maxWidth:"44vw"}}/></a>
    <div style={{display:"flex",alignItems:"center",gap:22,flexWrap:"wrap"}}>
     <a href="/signin" style={{fontSize:17,fontWeight:700}}>Owner sign-in</a>
     <button type="button" className="button outline" style={{fontSize:17,minHeight:44,padding:"9px 15px"}} onClick={reset}><RotateCcw size={17}/> Reset demo</button>
    </div>
   </header>
   <div style={{padding:"12px 17px",borderRadius:12,background:"#e3f2ec",marginBottom:26,display:"flex",gap:12,alignItems:"flex-start"}}>
    <ShieldCheck size={24} style={{flexShrink:0,color:"#006968"}}/>
    <p style={{...small,color:"#183b39"}}><strong>Public judge demo · no login required.</strong> This is an isolated, browser-only walkthrough. Payments, payouts, refunds and suggested AI text are <strong>simulated</strong>. It never accesses private accounts, the live AI service or PayPal. The authenticated application contains the real integrations.</p>
   </div>
   <div style={{margin:"30px 0"}}>
    <span style={{display:"inline-block",padding:"6px 14px",background:"#d5eee9",borderRadius:30,color:"#006968",fontSize:15,fontWeight:800,marginBottom:13}}>JUDGE WALKTHROUGH</span>
    <h1 style={{fontSize:"clamp(35px,5vw,58px)",maxWidth:850}}>Your word. Backed.</h1>
    <p style={{fontSize:21,marginTop:14,maxWidth:780}}>Experience PACT's complete commitment journey, from an agreement to transparent resolution—without signing in or moving money.</p>
   </div>
   <div aria-label="Demonstration progress" style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:8,margin:"25px 0 32px"}}>
    {demoSteps.map((name,i)=><div key={name} style={{background:i<=stepIndex?"#c7eee6":"#fff",border:"1px solid #b8d6ce",padding:"11px 8px",borderRadius:10,textAlign:"center",fontSize:13,fontWeight:750,color:"#164943"}}><span style={{display:"block",fontSize:16}}>{i+1}</span>{name}</div>)}
   </div>
   {error&&<div role="alert" style={{background:"#fff0e5",color:"#783c19",padding:16,borderRadius:12,marginBottom:20}}>{error}</div>}
   {phase==="setup"&&<section style={card}>
    <h2 style={{fontSize:30,marginBottom:10}}>1. Create a Pact</h2>
    <p style={small}>Describe a commitment, then review and customize its terms. The suggested text is an offline example, not a live AI response.</p>
    <label style={{marginTop:24}}>Describe your idea<textarea value={idea} onChange={e=>setIdea(e.target.value)} maxLength={1000} style={{marginTop:8}}/></label>
    <label>Agreement type<select value={kind} onChange={e=>{setKind(e.target.value as Kind);setResolution("refund");}} style={{marginTop:8}}><option value="challenge">Challenge (simulated winner or refund)</option><option value="goal">Shared goal (simulated refund)</option></select></label>
    <button type="button" className="button outline" onClick={suggest} style={{fontSize:17,minHeight:49,marginBottom:25}}><Sparkles size={19}/> Use example agreement text</button>
    <label>Pact name<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={100} style={{marginTop:8}}/></label>
    <label>Agreed terms<textarea value={terms} onChange={e=>setTerms(e.target.value)} maxLength={3000} style={{marginTop:8}}/></label>
    <label>Participants (comma-separated, up to 8)<input value={names} onChange={e=>setNames(e.target.value)} maxLength={230} style={{marginTop:8}}/></label>
    <label>Simulated contribution per person (USD)<input type="number" min="0" max="1000" step="0.01" value={stake} onChange={e=>setStake(e.target.value)} style={{marginTop:8}}/></label>
    <button type="button" className="button solid" onClick={create}>Create demo Pact <ArrowRight size={21}/></button>
   </section>}
   {phase!=="setup"&&<section style={card}>
    <p style={{fontSize:15,color:"#006968",fontWeight:800,marginBottom:7}}>YOUR DEMO PACT</p>
    <h2 style={{fontSize:31,marginBottom:12}}>{title}</h2>
    <p style={{whiteSpace:"pre-wrap"}}>{terms}</p>
    <div style={{display:"flex",flexWrap:"wrap",gap:15,marginTop:20,paddingTop:15,borderTop:"1px solid #e4e8e5"}}>
     <span style={small}><Users size={18} style={{verticalAlign:"middle"}}/> {people.length} participants</span>
     <span style={small}><Wallet size={18} style={{verticalAlign:"middle"}}/> {amount(Number(stake)||0)} each</span>
     <span style={small}><FileText size={18} style={{verticalAlign:"middle"}}/> {kind==="challenge"?"Challenge":"Shared goal"}</span>
    </div>
   </section>}
   {phase==="accept"&&<section style={card}>
    <h2 style={{fontSize:29,marginBottom:12}}>2. Accept the agreement</h2>
    <p style={small}>Every participant must agree to the same rules before any contribution is recorded.</p>
    {people.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,padding:"17px 0",borderBottom:"1px solid #e4e8e5"}}>
     <strong>{p.name}</strong>{p.accepted?<span style={{color:"#006968",fontWeight:700}}><CheckCircle2 size={18} style={{display:"inline",verticalAlign:"middle"}}/> Accepted</span>:<button type="button" className="button outline" style={{fontSize:17,minHeight:45}} onClick={()=>updatePerson(i,"accepted")}>Accept terms</button>}
    </div>)}
    <button type="button" disabled={!allAccepted} className="button solid" style={{marginTop:22}} onClick={()=>{setPhase("fund");note("All participants accepted")}}>Continue to contributions <ArrowRight size={20}/></button>
   </section>}
   {phase==="fund"&&<section style={card}>
    <h2 style={{fontSize:29,marginBottom:12}}>3. Simulate contributions</h2>
    <p style={small}>These are locally recorded demonstration balances. No checkout, payment details, or PayPal API calls occur on this page.</p>
    {people.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,padding:"16px 0",borderBottom:"1px solid #e4e8e5"}}>
     <strong>{p.name} — {amount(Number(stake)||0)}</strong>{p.funded?<span style={{color:"#006968",fontWeight:700}}>Recorded</span>:<button type="button" className="button outline" style={{fontSize:17,minHeight:45}} onClick={()=>updatePerson(i,"funded")}>Record test contribution</button>}
    </div>)}
    <p style={{...small,marginTop:18}}>Total simulated pool: <strong>{amount(total)}</strong></p>
    <button type="button" disabled={!allFunded} className="button solid" style={{marginTop:20}} onClick={()=>{setPhase("progress");note("All simulated contributions recorded")}}>Continue to evidence <ArrowRight size={20}/></button>
   </section>}
   {phase==="progress"&&<section style={card}>
    <h2 style={{fontSize:29,marginBottom:12}}>4. Submit evidence</h2>
    <p style={small}>Choose a participant and add a written progress log or result. This is example evidence, not independently verified activity.</p>
    <label style={{marginTop:22}}>Submitted by<select value={evidencePerson} onChange={e=>setEvidencePerson(Number(e.target.value))} style={{marginTop:8}}>{people.map((p,i)=><option key={i} value={i}>{p.name}</option>)}</select></label>
    <label>Evidence<textarea value={evidenceText} onChange={e=>setEvidenceText(e.target.value)} placeholder="For example: Completed 12 hours of study; session log recorded each day." style={{marginTop:8}}/></label>
    <button type="button" className="button outline" onClick={addEvidence} style={{fontSize:18,minHeight:51}}>Submit evidence</button>
    {evidence.length>0&&<div style={{marginTop:25}}>
     <h3>Evidence log</h3>
     {evidence.map((e,i)=><div key={i} style={{padding:"12px 0",borderBottom:"1px solid #e5ebe7"}}><strong>{e.name}</strong><p style={small}>{e.text}</p></div>)}
     <button type="button" className="button outline" style={{fontSize:17,minHeight:46,marginTop:20}} onClick={()=>{setAdvice(true);note("Offline example of an advisory evidence review opened")}}><Sparkles size={18}/> Show example AI review</button>
     {advice&&<div style={{padding:18,background:"#e7f4f0",borderRadius:12,marginTop:15}}><strong>Sample AI-style recommendation (not a live model call)</strong><p style={small}>The submitted text alone cannot authenticate the real-world outcome. Review supporting logs and the agreed terms. Humans must confirm the result before resolution.</p></div>}
    </div>}
    <button type="button" disabled={evidence.length===0} className="button solid" style={{marginTop:25}} onClick={()=>{setPhase("resolve");note("Evidence review opened")}}>Review outcome <ArrowRight size={20}/></button>
   </section>}
   {phase==="resolve"&&<section style={card}>
    <h2 style={{fontSize:29,marginBottom:12}}>5. Confirm the resolution</h2>
    <p style={small}>All participants must confirm the same outcome. A simulated refund is available if the result is disputed or inconclusive.</p>
    <label style={{marginTop:24}}>Proposed outcome<select value={resolution} onChange={e=>selectResolution(e.target.value)} style={{marginTop:8}}>
     <option value="refund">Refund every participant (simulation)</option>
     {kind==="challenge"&&people.map(p=><option key={p.name} value={p.name}>{p.name} wins (simulated payout)</option>)}
    </select></label>
    {people.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,padding:"15px 0",borderBottom:"1px solid #e4e8e5"}}><strong>{p.name}</strong>{p.confirmed?<span style={{color:"#006968",fontWeight:700}}>Confirmed</span>:<button type="button" className="button outline" style={{fontSize:17,minHeight:45}} onClick={()=>updatePerson(i,"confirmed")}>Confirm outcome</button>}</div>)}
    <button type="button" disabled={!allConfirmed} className="button solid" style={{marginTop:23}} onClick={finish}>Finalize simulated resolution <ArrowRight size={20}/></button>
   </section>}
   {phase==="done"&&<section style={{...card,textAlign:"center",padding:40}}>
    <CheckCircle2 size={56} color="#006968" style={{margin:"0 auto 18px"}}/>
    <h2 style={{fontSize:32,marginBottom:11}}>Pact resolved</h2>
    <p style={{fontSize:20,marginBottom:18}}>{finalOutcome}</p>
    <p style={small}>You have completed the demonstration. No financial transactions occurred and no data was stored on the server.</p>
    <button type="button" className="button solid" onClick={reset} style={{marginTop:25}}>Try another Pact <RotateCcw size={19}/></button>
   </section>}
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18,marginTop:28}}>
    <section style={{...card,marginBottom:0}}>
     <h3 style={{fontSize:22,marginBottom:12}}><CircleHelp size={21} style={{display:"inline",verticalAlign:"middle"}}/> What this demo tests</h3>
     <p style={small}>Agreement creation, group acceptance, contribution tracking, written evidence, unanimous resolution and a simulated payout or refund. Live AI, PayPal Sandbox and private storage remain restricted to the authenticated application.</p>
    </section>
    <section style={{...card,marginBottom:0}}>
     <h3 style={{fontSize:22,marginBottom:12}}><LockKeyhole size={21} style={{display:"inline",verticalAlign:"middle"}}/> Activity history</h3>
     <div style={{maxHeight:170,overflowY:"auto"}}>{activity.map((item,i)=><p key={i} style={{...small,marginBottom:9,borderBottom:"1px solid #e7ebe8",paddingBottom:9}}>{item}</p>)}</div>
    </section>
   </div>
  </div>
 </main>;
}
