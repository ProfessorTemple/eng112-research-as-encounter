// Offline evaluation of human-reviewed responses; never infers semantic quality.
export function summarizeReviews(expectedIds,reviews){
 if(!Array.isArray(expectedIds)||!expectedIds.length||new Set(expectedIds).size!==expectedIds.length||expectedIds.some(x=>typeof x!=='string'||!x.trim()))throw Error('Invalid case inventory');
 if(!Array.isArray(reviews))throw Error('Invalid reviews');
 const dimensions=['grounding','relevance','openness','culturalSensitivity','developmentalFit'];
 const seen=new Set();let qualified=0,critical=0;
 for(const r of reviews){
  if(!r||!expectedIds.includes(r.id)||seen.has(r.id))throw Error('Unknown or duplicate case');
  if(typeof r.criticalFailure!=='boolean'||typeof r.reason!=='string'||!r.reason.trim()||!r.scores||dimensions.some(d=>![0,1,2].includes(r.scores[d])))throw Error('Incomplete review');
  seen.add(r.id);
  if(r.criticalFailure)critical++;
  else if(dimensions.reduce((n,d)=>n+r.scores[d],0)>=8)qualified++;
 }
 const missing=expectedIds.filter(id=>!seen.has(id));
 return {total:expectedIds.length,reviewed:seen.size,qualified,critical,missing,eligible:missing.length===0&&critical===0&&qualified/expectedIds.length>=0.9};
}
