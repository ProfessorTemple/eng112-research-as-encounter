/* Research-only semantic retrieval review. No student data, network or model dependency.
 * An external candidate generator can return proposals for synthetic cases.
 * Structural validation cannot establish pedagogical or semantic validity.
 */
'use strict';
const kinds=new Set(['resonance','complication','contrast','transformation','differentiation','different-consequences','ethical-boundary','uncertainty']);
function validateProposal(testCase,proposal){
 const errors=[];
 if(!proposal||typeof proposal!=='object'||Array.isArray(proposal))return ['Expected a proposal object'];
 const permitted=new Set(['candidateId','relation','anchorEvidence','candidateEvidence','question']);
 for(const key of Object.keys(proposal))if(!permitted.has(key))errors.push('Unexpected field: '+key);
 if(proposal.candidateId===null){
  if(Object.keys(proposal).length!==1)errors.push('Abstention must not include a question or interpretation');
  return errors;
 }
 const candidate=testCase.candidates.find(c=>c.id===proposal.candidateId);
 if(!candidate)errors.push('Unknown candidate');
 if(!kinds.has(proposal.relation))errors.push('Unknown relation');
 const span=(v,text)=>typeof v==='string'&&v.trim()===v&&v.length>=8&&v.length<=300&&text.includes(v);
 if(!span(proposal.anchorEvidence,testCase.anchor))errors.push('Anchor evidence is not an exact span');
 if(!candidate||!span(proposal.candidateEvidence,candidate.text))errors.push('Candidate evidence is not an exact span');
 if(typeof proposal.question!=='string'||proposal.question.trim()!==proposal.question||proposal.question.length>260||!proposal.question.endsWith('?')||(proposal.question.match(/\?/g)||[]).length!==1)errors.push('Provide one concise question');
 return errors;
}
function evaluate(cases,proposals){
 const results=cases.map(c=>{
  const p=proposals[c.id];const errors=validateProposal(c,p);
  const chosen=p?.candidateId??null;
  const expected=c.expected;
  const acceptable=errors.length===0&&(chosen===null?expected.length===0:expected.includes(chosen));
  const abstain=chosen===null;
  return {id:c.id,chosen,expected,acceptable,errors,unwantedInvitation:expected.length===0&&!abstain,missedOpportunity:expected.length>0&&abstain,incorrectLink:!abstain&&!expected.includes(chosen)};
 });
 return {total:results.length,acceptable:results.filter(x=>x.acceptable).length,unwantedInvitations:results.filter(x=>x.unwantedInvitation).length,missedOpportunities:results.filter(x=>x.missedOpportunity).length,incorrectLinks:results.filter(x=>x.incorrectLink).length,structuralFailures:results.filter(x=>x.errors.length).length,results};
}
module.exports={validateProposal,evaluate};
if(require.main===module){
 const fs=require('node:fs');
 const fixture=require('./relational-semantic-development-cases.json');
 const path=process.argv[2];if(!path)throw Error('Supply a synthetic proposal JSON file');
 console.log(JSON.stringify(evaluate(fixture.cases,JSON.parse(fs.readFileSync(path,'utf8'))),null,2));
}
