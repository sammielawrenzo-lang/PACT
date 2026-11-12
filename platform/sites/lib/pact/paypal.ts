import {env} from "cloudflare:workers";
import {participantIds,event,derive,insist,validateOrder,payoutStatus,reserve,type Pact,type Actor,type Operation} from "./domain";
import {change,read,save} from "./store";
type Settings={PAYPAL_CLIENT_ID?:string;PAYPAL_CLIENT_SECRET?:string;PAYPAL_MERCHANT_ID?:string;OPENAI_API_KEY?:string;OPENAI_MODEL?:string};
export const settings=()=>env as unknown as Settings;
export function configured(){const s=settings();return !!(s.PAYPAL_CLIENT_ID&&s.PAYPAL_CLIENT_SECRET&&s.PAYPAL_MERCHANT_ID);}
async function api(path:string,method="GET",payload?:unknown,key?:string){
 insist(configured(),"PayPal sandbox is not connected.");const s=settings();
 const r=await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token",{method:"POST",headers:{Authorization:"Basic "+btoa(s.PAYPAL_CLIENT_ID+":"+s.PAYPAL_CLIENT_SECRET),"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials",signal:AbortSignal.timeout(20000)});
 const auth:any=await r.json();insist(r.ok&&auth.access_token,"PayPal sandbox authentication failed.");
 const response=await fetch("https://api-m.sandbox.paypal.com"+path,{method,headers:{Authorization:"Bearer "+auth.access_token,"Content-Type":"application/json",Prefer:"return=representation",...(key?{"PayPal-Request-Id":key}:{})},...(payload===undefined?{}:{body:JSON.stringify(payload)}),signal:AbortSignal.timeout(25000)});
 const data:any=await response.json();if(!response.ok)throw new Error("PayPal sandbox: "+String(data.details?.[0]?.issue||data.name||response.status)+". Reconcile the existing operation.");return data;
}
export async function operate(owner:string,id:string,type:Operation["type"],actor:Actor,base:string){
 let p=await change(owner,id,x=>reserve(x,type,actor));const op=p.operation!,leaseId=op.leaseId;
 async function persist(){const c=await read(owner,id);insist(c.pact.operation?.id===op.id&&c.pact.operation.leaseId===leaseId,"Another request owns this operation. Refresh.");await save(owner,p,c.version);}
 try{
  if(type==="order"){
   if(!p.people[actor].orderId){
    const o=await api("/v2/checkout/orders","POST",{intent:"CAPTURE",purchase_units:[{reference_id:op.id,custom_id:p.id+":"+actor,description:"Pact sandbox demonstration",amount:{currency_code:"USD",value:(p.stakeCents/100).toFixed(2)}}],payment_source:{paypal:{experience_context:{shipping_preference:"NO_SHIPPING",user_action:"PAY_NOW",return_url:base+"/?payment="+p.id+"&actor="+actor,cancel_url:base+"/?cancelled="+p.id}}}},op.id);
    const url=o.links?.find((l:any)=>l.rel==="payer-action"||l.rel==="approve")?.href;
    insist(o.id&&url&&new URL(url).hostname==="www.sandbox.paypal.com","PayPal approval URL is missing or unexpected.");
    p.people[actor].orderId=o.id;p.people[actor].approvalUrl=url;event(p,"Sandbox order created for "+p.people[actor].name+".");
   }delete p.operation;
  }else if(type==="capture"){
   let o=await api("/v2/checkout/orders/"+encodeURIComponent(p.people[actor].orderId!));
   validateOrder(p,actor,o,settings().PAYPAL_MERCHANT_ID!);
   if(o.status!=="COMPLETED"){
    insist(o.status==="APPROVED","Approve the sandbox order first.");
    if(Date.now()>=Date.parse(p.deadline)){delete p.operation;event(p,"Expired checkout was not captured.");await persist();return p;}
    o=await api("/v2/checkout/orders/"+encodeURIComponent(p.people[actor].orderId!)+"/capture","POST",{},op.id);
   }
   const {payer,capture}=validateOrder(p,actor,o,settings().PAYPAL_MERCHANT_ID!);insist(capture?.id,"No completed capture returned.");
   Object.assign(p.people[actor],{payerId:payer,captureId:capture.id,funded:true});delete p.operation;derive(p);event(p,"PayPal confirmed "+p.people[actor].name+"'s sandbox stake.");
  }else if(type==="payout"){
   if(!p.payoutBatchId){
    const receiver=p.people[p.winner!].payerId;insist(receiver,"Winner has no verified PayPal buyer ID.");
    const b=await api("/v1/payments/payouts","POST",{sender_batch_header:{sender_batch_id:op.id,email_subject:"Pact sandbox result"},items:[{recipient_type:"PAYPAL_ID",receiver,amount:{currency:"USD",value:(p.stakeCents*participantIds(p).length/100).toFixed(2)},sender_item_id:p.id+"-winner",note:"Pact sandbox demonstration"}]},op.id);
    p.payoutBatchId=b.batch_header?.payout_batch_id;insist(p.payoutBatchId,"Payout batch ID is missing.");await persist();
   }
   const b=await api("/v1/payments/payouts/"+encodeURIComponent(p.payoutBatchId!));p.payoutStatus=payoutStatus(p,b);
   if(p.payoutStatus==="SUCCESS"){p.phase="settled";delete p.operation;event(p,"PayPal confirmed the winner's sandbox payout.");}
   else op.error="Payout item status: "+p.payoutStatus+". Refresh status to reconcile.";
  }else{
   for(const a of participantIds(p)){
    const person=p.people[a];if(!person.funded||person.refundStatus==="COMPLETED")continue;
    const r=person.refundId?await api("/v2/payments/refunds/"+encodeURIComponent(person.refundId)):await api("/v2/payments/captures/"+encodeURIComponent(person.captureId!)+"/refund","POST",{},op.id+"-"+a);
    insist(r.id,"PayPal refund ID is missing.");person.refundId=r.id;person.refundStatus=r.status;await persist();
   }
   if(participantIds(p).every(a=>!p.people[a].funded||p.people[a].refundStatus==="COMPLETED")){p.phase="refunded";delete p.operation;event(p,"All required sandbox refunds completed.");}
   else op.error="One or more refunds remain pending. Refresh status to reconcile.";
  }
  if(p.operation){p.operation.leaseUntil=0;delete p.operation.leaseId;}
  await persist();return p;
 }catch(e){
  const message=e instanceof Error?e.message:"Provider result is uncertain.";
  try{await change(owner,id,c=>{if(c.operation?.id===op.id&&c.operation.leaseId===leaseId){c.operation.error=message;c.operation.leaseUntil=0;delete c.operation.leaseId;}return c;});}catch{}
  throw e;
 }
}
