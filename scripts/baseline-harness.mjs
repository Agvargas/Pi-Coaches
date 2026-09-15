import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const BUDGET = Object.freeze({ operations: 150, tokens: 2_000_000, milliseconds: 3_600_000 });
export const OUTPUT_PATH = ".pi/coordination/research/pc-12-baseline.json";
const sequences = Object.freeze([
  { frameworkId:"heart", feedbackMode:"final", scenarioId:"air-conditioning", cases:[
    ["greeting","Hello. I am sorry that the air conditioning kept you awake.","ALLOW"],["heart-early-unrelated","What is the capital of Iceland?","BLOCK"],["weak-relevant","I understand that this was frustrating.","ALLOW"],["heart-mid-unrelated","Can you recommend a recipe for bread?","BLOCK"],["long-relevant","I am sorry the rattling noise disrupted your night. I can arrange for maintenance to inspect the unit now, and I will check back with you after they have visited. Would that be a helpful next step?","ALLOW"],["late-unrelated","What is the weather like on Mars?","BLOCK"] ] },
  { frameworkId:"heart", feedbackMode:"immediate-and-final", scenarioId:"air-conditioning", cases:[
    ["reference-precondition","I understand that the unit kept you awake. Would you like me to arrange maintenance to inspect it now?","ALLOW"],["immediate-reference","Yes, I can arrange that now. Would that help?","ALLOW"],["heart-immediate-unrelated","What is the square root of 144?","BLOCK"],["heart-immediate-late-unrelated","Who painted the Mona Lisa?","BLOCK"] ] },
  { frameworkId:"grow", feedbackMode:"final", scenarioId:"kam-career-readiness", cases:[
    ["open-question","What feels most important to you about this opportunity right now?","ALLOW"],["grow-early-unrelated","What is the fastest animal in the world?","BLOCK"],["earlier-reference-precondition","What realistic next step toward your PDR objectives would feel manageable this month?","ALLOW"],["earlier-reference","How would that next step fit with the circumstances you mentioned earlier?","ALLOW"],["grow-late-unrelated","How many planets are in the solar system?","BLOCK"] ] },
  { frameworkId:"grow", feedbackMode:"immediate-and-final", scenarioId:"lee-cross-functional-project", cases:[
    ["unrelated","Can you recommend a good recipe for bread?","BLOCK"],["late-unrelated-precondition","What outcome would help you feel more confident when Pat challenges you in a meeting?","ALLOW"],["late-unrelated","What is the weather like on Mars?","BLOCK"],["grow-immediate-late-unrelated","Who wrote Hamlet?","BLOCK"] ] },
]);
const allowedCaseIds = new Set(sequences.flatMap((s)=>[...s.cases.map((c)=>c[0]),`${s.frameworkId}-opening`,`${s.frameworkId}-end`]));
const allowedStages = new Set(["VALIDATE","CHARACTER","IMMEDIATE_FEEDBACK","FINAL_FEEDBACK"]), allowedFrameworks = new Set(["heart","grow"]), allowedModes = new Set(["final","immediate-and-final"]);
const finite = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const number = (value) => finite(value) ? value : 0;
const percentile = (values, p) => values.length ? values.slice().sort((a,b)=>a-b)[Math.ceil(p*values.length)-1] : null;
const median = (values) => { if (!values.length) return null; const sorted=values.slice().sort((a,b)=>a-b), m=Math.floor(sorted.length/2); return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2; };
function group(rows) {
  const success=rows.filter((o)=>o.outcome==="success"), eligible=success.filter((o)=>o.decision&&o.expectedDecision), complete=rows.filter((o)=>o.usageComplete);
  const totals={input:0,output:0,cacheRead:0,cacheWrite:0,costTotal:0}; for(const o of complete) for(const key of Object.keys(totals)) totals[key]+=o.usage[key];
  const denominator=totals.input+totals.cacheRead+totals.cacheWrite;
  return { accuracy:{eligible:eligible.length,correct:eligible.filter((o)=>o.decision===o.expectedDecision).length,falseBlock:eligible.filter((o)=>o.expectedDecision==="ALLOW"&&o.decision==="BLOCK").length,falseAllow:eligible.filter((o)=>o.expectedDecision==="BLOCK"&&o.decision==="ALLOW").length,excluded:rows.length-eligible.length},cacheRatio:complete.length&&denominator?totals.cacheRead/denominator:null,usageTotals:{...totals,complete:complete.length,missing:rows.length-complete.length},latencyMs:{n:success.length,median:median(success.map((o)=>o.durationMs)),p95:percentile(success.map((o)=>o.durationMs),.95)}};
}
export function sanitizeArtifact(run={}) {
  const observations=(run.observations??[]).map((o)=>{ const usage=o.usage&&[o.usage.input,o.usage.output,o.usage.cacheRead,o.usage.cacheWrite,o.usage.costTotal].every(finite)?{input:o.usage.input,output:o.usage.output,cacheRead:o.usage.cacheRead,cacheWrite:o.usage.cacheWrite,costTotal:o.usage.costTotal}:null; return {caseId:allowedCaseIds.has(o.caseId)?o.caseId:"",repetition:number(o.repetition),stage:allowedStages.has(o.stage)?o.stage:"",turn:number(o.turn),frameworkId:allowedFrameworks.has(o.frameworkId)?o.frameworkId:"",feedbackMode:allowedModes.has(o.feedbackMode)?o.feedbackMode:"",durationMs:number(o.durationMs),outcome:["success","error","timeout"].includes(o.outcome)?o.outcome:"error",decision:["ALLOW","BLOCK"].includes(o.decision)?o.decision:null,expectedDecision:["ALLOW","BLOCK"].includes(o.expectedDecision)?o.expectedDecision:null,assistantCompletionsObserved:number(o.completions),sdkAutoRetriesObserved:number(o.retries),usage,usageComplete:!!usage}; });
  const validates=observations.filter((o)=>o.stage==="VALIDATE");
  return {schemaVersion:1,status:["completed","stopped","inconclusive"].includes(run.status)?run.status:"inconclusive",runLabel:"pc-12-baseline",stopReason:["budget","auth","provider-failures","timeout","quality-regression","none"].includes(run.stopReason)?run.stopReason:"none",planned:{repetitions:3,validateCases:57,expectedAllow:27,expectedBlock:30},counts:{logicalOperations:observations.length,assistantCompletionsObserved:observations.reduce((n,o)=>n+o.assistantCompletionsObserved,0),sdkAutoRetriesObserved:observations.reduce((n,o)=>n+o.sdkAutoRetriesObserved,0),missingUsage:observations.filter((o)=>!o.usageComplete).length},validate:{overall:group(validates),expectedAllow:group(validates.filter((o)=>o.expectedDecision==="ALLOW")),expectedBlock:group(validates.filter((o)=>o.expectedDecision==="BLOCK"))},observations};
}
export function canStart(state, started, now=performance.now()) { return state.operations < BUDGET.operations && state.tokens < BUDGET.tokens && now-started < BUDGET.milliseconds; }
export async function runBaseline({ TrainingService, write=writeFile, now=()=>performance.now(), outputPath=OUTPUT_PATH }={}) {
  if (typeof TrainingService!=="function") ({TrainingService}=await import("../src/training-service.mjs"));
  const observations=[], state={operations:0,retries:0,tokens:0}, started=now(); let current={caseId:"",repetition:0,expectedDecision:null}, stopReason="none", status="completed", consecutiveFailures=0, consecutiveTimeouts=0;
  const recorder=(metric)=>{ const row={...metric,...current}; observations.push(row); state.operations++; state.retries+=number(metric.retries); if(metric.usage) state.tokens+=number(metric.usage.input)+number(metric.usage.output)+number(metric.usage.cacheRead)+number(metric.usage.cacheWrite); };
  const service=new TrainingService({recorder});
  const budget=(needed=1)=>canStart({operations:state.operations+state.retries+needed-1,tokens:state.tokens},started,now());
  try { outer: for(let repetition=1;repetition<=3;repetition++) for(const sequence of sequences) {
    if(!budget(sequence.frameworkId==="heart"?1:0)){status="stopped";stopReason="budget";break outer;} current={caseId:`${sequence.frameworkId}-opening`,repetition,expectedDecision:null};
    let training; try { training=await service.createTraining(sequence); } catch { status="inconclusive";stopReason="provider-failures";break outer; }
    for(const [caseId,message,expectedDecision] of sequence.cases) { const expectedOps=expectedDecision==="ALLOW"?(sequence.feedbackMode==="immediate-and-final"?3:2):1; if(!budget(expectedOps)){status="stopped";stopReason="budget";break outer;} current={caseId,repetition,expectedDecision}; try { await service.sendMessage(training.trainingId,message); consecutiveFailures=0; consecutiveTimeouts=0; const observed=observations.findLast((o)=>o.stage==="VALIDATE"&&o.caseId===caseId&&o.repetition===repetition); if(["immediate-reference","earlier-reference"].includes(caseId)&&observed?.decision!==expectedDecision){status="stopped";stopReason="quality-regression";break outer;} } catch (error) { consecutiveFailures++; const observed=observations.at(-1); consecutiveTimeouts=observed?.outcome==="timeout"?consecutiveTimeouts+1:0; if(error?.name==="AuthenticationError"){status="stopped";stopReason="auth";break outer;} if(consecutiveTimeouts>=2){status="stopped";stopReason="timeout";break outer;} if(consecutiveFailures>=2){status="inconclusive";stopReason="provider-failures";break outer;} } }
    if(!service.trainings.has(training.trainingId)) continue; if(!budget(1)){status="stopped";stopReason="budget";break outer;} current={caseId:`${sequence.frameworkId}-end`,repetition,expectedDecision:null}; try { await service.endTraining(training.trainingId); } catch { status="inconclusive";stopReason="provider-failures";break outer; }
  }} finally { await service.shutdown(); }
  const artifact=sanitizeArtifact({status,stopReason,observations}); await write(outputPath,JSON.stringify(artifact,null,2),"utf8"); return artifact;
}
export async function main(args=process.argv.slice(2),deps={}) { if(!args.includes("--approved-baseline")||!args.includes("--execute-baseline")) throw new Error("baseline_not_authorized"); return runBaseline(deps); }
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) main().catch(()=>{process.exitCode=1;});
