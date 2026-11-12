import {command,participantIds,type Pact} from "./domain";
import {change,due} from "./store";
import {operate} from "./paypal";

export async function processDeadlines(base:string,ownerId?:string){
 const rows=await due(ownerId);
 let completed=0,pending=0;
 for(const row of rows){
  let p=row.data as Pact;const actor=participantIds(p)[0];
  try{
   if(p.operation?.leaseUntil&&p.operation.leaseUntil>Date.now()){pending++;continue;}
   if(p.mode==="simulation"){
    await change(row.owner_id,p.id,current=>command(current,{type:"refund",actor}));completed++;continue;
   }
   if(p.operation?.type==="order")p=await change(row.owner_id,p.id,current=>{if(current.operation?.type==="order"&&(!current.operation.leaseUntil||current.operation.leaseUntil<Date.now()))delete current.operation;return current;});
   if(p.operation)p=await operate(row.owner_id,p.id,p.operation.type,p.operation.actor,base);
   if(!p.terminal&&!p.operation)p=await operate(row.owner_id,p.id,"refund",actor,base);
   if(p.phase==="refunded")completed++;else pending++;
  }catch{pending++;}
 }
 return {completed,pending,checked:rows.length};
}
