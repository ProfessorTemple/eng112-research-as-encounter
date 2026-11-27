const cases=require('./semantic-benchmark.json');
const stop=new Set(["about","along","there","where","which","these","those","with","that","this","have","from","their","some","other","often","think","thought","remember","would","could","should","like","into","then","what","more","than","human","when","were","they"]);
const tok=s=>new Set(s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').trim().split(/\s+/).filter(t=>t.length>2&&!stop.has(t)));
const score=(a,b)=>[...tok(b)].filter(t=>tok(a).has(t)).length;
const rows=cases.map(x=>({id:x.id,related:score(x.query,x.related),distractor:score(x.query,x.distractor)}));
console.table(rows);
console.log('Strict wins:',rows.filter(x=>x.related>x.distractor).length,'of',rows.length);
console.log('Ties:',rows.filter(x=>x.related===x.distractor).length);
console.log('Related candidates meeting current threshold:',rows.filter(x=>x.related>=2).length);
