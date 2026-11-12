import {z} from "zod";
import {createPact,command,type Command} from "@/lib/pact/domain";
import {list,insert,read,change} from "@/lib/pact/store";
import {configured,settings,operate} from "@/lib/pact/paypal";
import {owner,origin,requestOrigin,body,json,failure} from "@/lib/pact/http";
export const dynamic="force-dynamic";
const create=z.object({title:z.string(),criteria:z.string(),stakeCents:z.number(),deadline:z.string(),mode:z.enum(["simulation","paypal"]),aName:z.string(),bName:z.string(),aOutcome:z.string(),bOutcome:z.string(),kind:z.enum(["challenge","goal"]).optional(),solo:z.boolean().optional(),additional:z.array(z.object({name:z.string().max(40),outcome:z.string().max(300)})).max(18).optional()});
const action=z.object({id:z.string().uuid(),actor:z.string().regex(/^(a|b|p[0-9]{1,2})$/),action:z.enum(["accept","fund","evidence","vote","settle","refund","order","capture","reconcile"]),text:z.string().max(5000).optional(),choice:z.string().regex(/^(a|b|p[0-9]{1,2}|refund)$/).optional(),orderId:z.string().max(100).optional()});
export async function GET(){try{return json({pacts:await list(await owner()),paypalReady:configured(),aiReady:!!(settings().OPENAI_API_KEY&&settings().OPENAI_MODEL)});}catch(e){return failure(e);}}
export async function POST(req:Request){try{
 origin(req);const uid=await owner(),input=await body(req);
 if(input.action==="create"){
  const i=create.parse(input.pact);if(i.mode==="paypal"&&!configured())throw new Error("Connect PayPal sandbox first, or choose simulation.");
  if((await list(uid)).length>=100)throw new Error("Your workspace currently supports 100 pacts.");
  const p=createPact(i);await insert(uid,p);return json({pact:p});
 }
 const d=action.parse(input),p=(await read(uid,d.id)).pact,base=requestOrigin(req);
 if(!Object.hasOwn(p.people,d.actor))throw new Error("Participant not found.");
 if(d.action==="capture"&&d.orderId&&p.people[d.actor].orderId!==d.orderId)throw new Error("Returned order does not match.");
 if(d.action==="order"||d.action==="capture")return json({pact:await operate(uid,d.id,d.action,d.actor,base)});
 if(d.action==="reconcile"){if(!p.operation)throw new Error("No pending operation.");return json({pact:await operate(uid,d.id,p.operation.type,p.operation.actor,base)});}
 if(p.mode==="paypal"&&(d.action==="settle"||d.action==="refund"))return json({pact:await operate(uid,d.id,d.action==="settle"?"payout":"refund",d.actor,base)});
 return json({pact:await change(uid,d.id,p=>command(p,{type:d.action as Command["type"],actor:d.actor,text:d.text,choice:d.choice}))});
}catch(e){return failure(e);}}
