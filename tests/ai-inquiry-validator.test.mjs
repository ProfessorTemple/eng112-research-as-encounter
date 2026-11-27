import assert from 'node:assert/strict';
import {validateInquiryResponse as validate} from './ai-inquiry-validator.mjs';
const text=['The oak remembered me.','My note concerns memory.'];
const base={status:'question',question:'What does remembering mean here?',evidence:['The oak remembered me.'],rationale_type:'interpretation'};
const cases=[
['valid',base,true],
['abstain',{status:'abstain',question:'',evidence:[],rationale_type:'uncertainty'},true],
['invented evidence',{...base,evidence:['The oak spoke aloud.']},false],
['extra field',{...base,essay:'A finished essay'},false],
['multiple questions',{...base,question:'Why? How?'},false],
['markup',{...base,question:'<script>Why?</script>'},false],
['long response',{...base,question:'x'.repeat(301)+'?'},false],
['invalid category',{...base,rationale_type:'grade'},false],
['empty evidence span',{...base,evidence:[' ']},false],
['abstention with advice',{...base,status:'abstain'},false],
['explicit thesis',{...base,question:'The thesis is that nature heals us. Why?'},false],
['explicit interpretation',{...base,question:'Your interpretation should be that trees heal us. Why?'},false],
['legitimate thesis inquiry',{...base,question:'What might your thesis reveal about memory?'},true],
['legitimate interpretation inquiry',{...base,question:'How might your interpretation change if you return to this encounter?'},true],
['nonobject',null,false],
['answer not question',{...base,question:'Here is your thesis.'},false]
];
for(const [name,value,expected] of cases) assert.equal(validate(value,text).ok,expected,name);
console.log(cases.length+' structural checks passed');
