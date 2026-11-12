export type Actor=string;
export type Choice=Actor|"refund";
export type Mode="simulation"|"paypal";
export type Phase="invited"|"funding"|"active"|"review"|"disputed"|"ready"|"payout_pending"|"settled"|"refunding"|"refunded";
export type Person={name:string;outcome:string;accepted:boolean;funded:boolean;orderId?:string;approvalUrl?:string;captureId?:string;payerId?:string;refundId?:string;refundStatus?:string};
export type Operation={id:string;type:"order"|"capture"|"payout"|"refund";actor:Actor;startedAt:string;leaseId?:string;leaseUntil?:number;error?:string};
export type Pact={id:string;title:string;kind?:"challenge"|"goal";criteria:string;stakeCents:number;deadline:string;createdAt:string;mode:Mode;phase:Phase;people:Record<Actor,Person>;votes:Partial<Record<Actor,Choice>>;evidence:{id:string;actor:Actor;text:string;createdAt:string}[];events:{id:string;text:string;createdAt:string}[];terminal?:"payout"|"refund";winner?:Actor;operation?:Operation;payoutBatchId?:string;payoutStatus?:string;review?:{recommendation:Actor|"insufficient";rationale:string;missingEvidence:string[];createdAt:string}};
export type NewPact={title:string;kind?:"challenge"|"goal";criteria:string;stakeCents:number;deadline:string;mode:Mode;aName:string;bName:string;aOutcome:string;bOutcome:string;additional?:{name:string;outcome:string}[];solo?:boolean};
export type Command={type:"accept"|"fund"|"evidence"|"vote"|"settle"|"refund";actor:Actor;text?:string;choice?:Choice};
export const actors:Actor[]=["a","b"];
export const participantIds=(p:Pact)=>Object.keys(p.people);
export const other=(a:Actor):Actor=>a==="a"?"b":"a";
export const dollars=(c:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(c/100);
export function insist(x:unknown,m:string):asserts x{if(!x)throw new Error(m);}
export function event(p:Pact,text:string){p.events.push({id:crypto.randomUUID(),text,createdAt:new Date().toISOString()});}
export const allFunded=(p:Pact)=>participantIds(p).every(a=>p.people[a].funded);
export const allAccepted=(p:Pact)=>participantIds(p).every(a=>p.people[a].accepted);
export const unanimous=(p:Pact)=>{const ids=participantIds(p),first=p.votes[ids[0]];return first&&ids.every(a=>p.votes[a]===first)?first:undefined;};
export function derive(p:Pact){if(p.terminal)return;if(!allAccepted(p)){p.phase="invited";return;}if(!allFunded(p)){p.phase="funding";return;}const votes=participantIds(p).map(a=>p.votes[a]);p.phase=unanimous(p)?"ready":votes.every(Boolean)?"disputed":p.evidence.length||votes.some(Boolean)?"review":"active";}
export function canRefund(p:Pact,now=Date.now()){return !allFunded(p)||unanimous(p)==="refund"||now>=Date.parse(p.deadline);}
export function createPact(i:NewPact,now=Date.now()):Pact{
 insist(i.title.trim().length>=5&&i.title.length<=100,"Give your pact a title between 5 and 100 characters.");
 insist(i.criteria.trim().length>=20&&i.criteria.length<=3000,"Explain the decision rule in 20–3,000 characters.");
 insist(Number.isSafeInteger(i.stakeCents)&&i.stakeCents>=100&&i.stakeCents<=100000000,"Enter a contribution from $1 to $1,000,000. Payment provider limits also apply.");
 insist(Number.isFinite(Date.parse(i.deadline))&&Date.parse(i.deadline)>now,"Choose a future deadline.");
 insist(i.mode==="simulation"||i.mode==="paypal","Choose a valid payment mode.");
 const entries=[{name:i.aName,outcome:i.aOutcome},...(i.kind==="goal"&&i.solo?[]:[{name:i.bName,outcome:i.bOutcome},...(i.additional||[])])];
 insist(entries.length<=20,"A pact supports up to 20 participants.");
 for(const {name,outcome} of entries){insist(name.trim().length>0&&name.length<=40,"Add each participant's name, up to 40 characters.");if(i.kind!=="goal")insist(outcome.trim().length>=4&&outcome.length<=300,"Describe each outcome in 4–300 characters.");}
 insist(new Set(entries.map(e=>e.name.trim().toLowerCase())).size===entries.length,"Use a different name for each participant.");
 if(i.kind!=="goal")insist(new Set(entries.map(e=>e.outcome.trim().toLowerCase())).size===entries.length,"Outcomes must be different.");
 const people:Record<string,Person>={};entries.forEach((e,index)=>{people[index<2?actors[index]:"p"+index]={name:e.name.trim(),outcome:e.outcome.trim(),accepted:index===0,funded:false};});
 const p:Pact={id:crypto.randomUUID(),title:i.title.trim(),kind:i.kind||"challenge",criteria:i.criteria.trim(),stakeCents:i.stakeCents,mode:i.mode,deadline:i.deadline,createdAt:new Date(now).toISOString(),phase:"invited",people,votes:{},evidence:[],events:[]};
 event(p,p.people.a.name+" created and accepted the terms. Contributions are due for refund at the deadline unless a confirmed payout has already started.");derive(p);return p;
}
export function command(original:Pact,c:Command,now=Date.now()):Pact{
 const p=structuredClone(original);insist(participantIds(p).includes(c.actor),"Select a participant.");
 insist(!p.operation,"A payment operation is pending. Reconcile it before making another change.");
 insist(!p.terminal,"This pact already entered its settlement or refund path.");
 if(c.type==="accept"){
  insist(!p.people[c.actor].accepted,"This participant already accepted.");
  insist(now<Date.parse(p.deadline),"The deadline has passed. Cancel this pact.");
  p.people[c.actor].accepted=true;event(p,p.people[c.actor].name+" accepted the same terms.");
 }else if(c.type==="fund"){
  insist(p.mode==="simulation","PayPal funding must be confirmed by the server.");
  insist(allAccepted(p),"Every participant must accept before funding.");
  insist(now<Date.parse(p.deadline),"Funding is closed after the deadline.");
  insist(!p.people[c.actor].funded,"This participant already funded.");
  p.people[c.actor].funded=true;p.people[c.actor].captureId="SIM-"+crypto.randomUUID();
  event(p,p.people[c.actor].name+" added "+dollars(p.stakeCents)+" in simulated funds.");
 }else if(c.type==="evidence"){
  insist(allFunded(p),"Every contribution is required before evidence.");
  insist(p.evidence.length<30,"The demo allows 30 evidence entries.");
  insist(c.text&&c.text.trim().length>=10&&c.text.length<=5000,"Add evidence between 10 and 5,000 characters.");
  p.evidence.push({id:crypto.randomUUID(),actor:c.actor,text:c.text.trim(),createdAt:new Date(now).toISOString()});p.votes={};delete p.review;
  event(p,p.people[c.actor].name+" added evidence. Previous confirmations were reset.");
 }else if(c.type==="vote"){
  insist(allFunded(p),"Every contribution must be funded.");
  insist(!!c.choice&&(c.choice==="refund"||p.kind!=="goal"&&participantIds(p).includes(c.choice)),"Choose an outcome or refund.");
  insist(c.choice==="refund"||p.evidence.length>0,"Add evidence before confirming a winner.");
  p.votes[c.actor]=c.choice;event(p,p.people[c.actor].name+" confirmed "+(c.choice==="refund"?"a refund":"outcome "+c.choice.toUpperCase())+".");
 }else if(c.type==="settle"){
  insist(p.mode==="simulation","PayPal settlement must be confirmed by the provider.");
  insist(now<Date.parse(p.deadline),"The deadline has passed. Contributions are due for refund.");
  const agreed=unanimous(p);insist(p.kind!=="goal"&&allFunded(p)&&agreed&&agreed!=="refund","Every participant must confirm the same winner.");
  p.terminal="payout";p.winner=agreed;p.phase="settled";p.payoutStatus="SIMULATED";
  event(p,"Simulated "+dollars(p.stakeCents*participantIds(p).length)+" payout to "+p.people[p.winner].name+". No money moved.");
 }else if(c.type==="refund"){
  insist(p.mode==="simulation","PayPal refunds must be confirmed by the provider.");
  insist(canRefund(p,now),"Everyone must choose refund, or wait until the deadline.");
  p.terminal="refund";p.phase="refunded";for(const a of participantIds(p))if(p.people[a].funded)p.people[a].refundStatus="SIMULATED";
  event(p,"Pact closed. All funded stakes were refunded in the simulation.");
 }else throw new Error("Unknown action.");
 derive(p);return p;
}
export function reserve(original:Pact,type:Operation["type"],actor:Actor,now=Date.now()):Pact{
 const p=structuredClone(original);insist(p.mode==="paypal","PayPal sandbox mode is required.");insist(participantIds(p).includes(actor),"Select a participant.");
 if(p.operation){
  insist(p.operation.type===type&&(p.operation.actor===actor||type==="payout"||type==="refund"),"A different payment operation is pending.");
  insist(!p.operation.leaseUntil||p.operation.leaseUntil<=now,"This payment operation is already running. Wait before reconciling.");
  p.operation.leaseId=crypto.randomUUID();p.operation.leaseUntil=now+180000;delete p.operation.error;return p;
 }
 if(type==="order"||type==="capture"){
  insist(!p.terminal&&allAccepted(p)&&!p.people[actor].funded,"This participant cannot fund now.");
  if(type==="order")insist(now<Date.parse(p.deadline),"Funding is closed after the deadline.");
  if(type==="capture")insist(p.people[actor].orderId,"Create an order first.");
 }else if(type==="payout"){
  insist(!p.terminal,"A terminal payment path is already reserved.");
  insist(now<Date.parse(p.deadline),"The deadline has passed. Contributions are due for refund.");
  const agreed=unanimous(p);insist(p.kind!=="goal"&&allFunded(p)&&agreed&&agreed!=="refund","Every participant must confirm the same winner.");
  p.terminal="payout";p.winner=agreed;p.phase="payout_pending";
 }else{
  insist(!p.terminal&&canRefund(p,now),"Refund is not available yet.");p.terminal="refund";p.phase="refunding";
 }
 p.operation={id:crypto.randomUUID(),type,actor,startedAt:new Date(now).toISOString(),leaseId:crypto.randomUUID(),leaseUntil:now+180000};return p;
}
export function validateOrder(p:Pact,actor:Actor,o:any,merchant:string){
 insist(o.id===p.people[actor].orderId,"PayPal order does not match.");
 insist(Array.isArray(o.purchase_units)&&o.purchase_units.length===1,"Unexpected purchase units.");
 const u=o.purchase_units[0];
 insist(u.custom_id===p.id+":"+actor,"PayPal reference does not match.");
 insist(u.amount?.currency_code==="USD"&&u.amount?.value===(p.stakeCents/100).toFixed(2),"PayPal amount does not match.");
 insist(u.payee?.merchant_id===merchant,"PayPal merchant does not match.");
 const payer=o.payer?.payer_id||o.payment_source?.paypal?.account_id;
 insist(typeof payer==="string"&&payer,"PayPal buyer ID is missing.");
 insist(participantIds(p).every(a=>a===actor||p.people[a].payerId!==payer),"Use a different sandbox buyer account for each participant.");
 const capture=u.payments?.captures?.[0];
 if(capture){
  insist(capture.status==="COMPLETED","PayPal capture is not completed. Reconcile its status.");
  insist(capture.amount?.currency_code==="USD"&&capture.amount?.value===(p.stakeCents/100).toFixed(2),"Captured amount does not match.");
 }
 return {payer,capture};
}
export function payoutStatus(p:Pact,batch:any){
 insist(Array.isArray(batch.items)&&batch.items.length===1,"PayPal payout item is missing.");
 const i=batch.items[0];insist(i.payout_item?.sender_item_id===p.id+"-winner","Payout reference does not match.");
 insist(i.payout_item?.amount?.currency==="USD"&&i.payout_item?.amount?.value===(p.stakeCents*participantIds(p).length/100).toFixed(2),"Payout amount does not match.");
 insist(i.payout_item?.receiver===p.people[p.winner!].payerId,"Payout recipient does not match.");
 return String(i.transaction_status);
}
