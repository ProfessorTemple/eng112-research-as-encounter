const cases=require('./semantic-benchmark.json');
const groups=[["agency",/\b(freedom|autonomy|independence|agency|self.determination)\b/i],
["perception",/\b(perception|attention|attentiveness|listen\w*|sensory|notice\w*)\b/i],
["reciprocity",/\b(reciproc\w*|mutual|responsibilit\w*|owe)\b/i],
["memory",/\b(memory|childhood|autobiograph\w*|remember\w*)\b/i],
["embodiment",/\b(bodily|skin|sensation|embodied)\b/i],
["communication",/\b(posture|nonverbal|signal\w*|gesture\w*)\b/i],
["waterway",/\b(river|stream|creek|waterway)\b/i],
["animal response",/\b(firefl\w*|insect\w*|mammal\w*|deer|animal\w*)\b/i],
["intention",/\b(intent\w*|deliberat\w*|purpose\w*)\b/i],
["power",/\b(control|constrain\w*|decide|authority|power)\b/i]];
const score=(a,b)=>groups.filter(([_,r])=>r.test(a)&&r.test(b)).length;
const rows=cases.map(x=>({id:x.id,related:score(x.query,x.related),distractor:score(x.query,x.distractor)}));
console.table(rows);
console.log('Strict wins',rows.filter(x=>x.related>x.distractor).length,'Ties',rows.filter(x=>x.related===x.distractor).length);
// Exploratory, tuned on these examples; independent held-out evaluation required.
