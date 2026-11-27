export function validateInquiryResponse(value, suppliedText) {
  const reject = reason => ({ok:false,reason});
  if (!value || typeof value !== 'object' || Array.isArray(value)) return reject('object');
  const fields=['status','question','evidence','rationale_type'];
  if(Object.keys(value).length!==fields.length || fields.some(k=>!Object.prototype.hasOwnProperty.call(value,k))) return reject('fields');
  const {status,question,evidence,rationale_type}=value;
  if(!['question','abstain'].includes(status)) return reject('status');
  if(!['observation','interpretation','significance','connection','uncertainty'].includes(rationale_type)) return reject('rationale');
  if(typeof question!=='string'||question.length>300||/[<>\r\n]/.test(question)) return reject('question format');
  if(!Array.isArray(evidence)||evidence.length>2||!Array.isArray(suppliedText)||suppliedText.some(x=>typeof x!=='string')) return reject('evidence format');
  if(evidence.some(x=>typeof x!=='string'||!x.trim()||x.length>240||!suppliedText.some(t=>t.includes(x)))) return reject('ungrounded evidence');
  if(status==='abstain' && (question!==''||evidence.length!==0)) return reject('abstention format');
  if(status==='question' && (!question.trim().endsWith('?')||(question.match(/\?/g)||[]).length!==1)) return reject('single question required');
  return {ok:true,response:{status,question,evidence:[...evidence],rationale_type}};
}
