/* Research as Encounter: Student-First Language Companion, development preview.
 * All analysis runs inside the user's browser. No network, AI API, or source text transmission.
 * This is transparent word/phrase co-occurrence, not semantic interpretation.
 */
(function(root){
  'use strict';
  const STOP=new Set(("a an and are as at be been being but by can could did do does doing for from had has have having he her hers him his how i if in into is it its itself just me mine my myself nor not of on or our ours out over she should so some than that the their them there these they this those through to too us very was were what when where which while who why will with would you your yours" +
    " after again also always another around before because between called came come coming each ever every first found get gets getting give given going good great here itself know knowing later like little look looked looking made make making many more most much must near never now often once one only other own perhaps quite really said say saying see seeing seemed seems several something still such sure take taken taking tell telling then thing things think thinking thought throughout today together tried trying until used using want wanted way ways well went whenever within without wonder wondered wondering years year").split(/\s+/));
  const generic=new Set("someone anybody everybody people person experience encounter writing wrote research question questions word words idea ideas remember remembered life time moment felt feeling feel something anything nothing loved love showed show showing sees seen seeing seemed watching watched wasn't weren't couldn't wouldn't don't didn't had hadn't experienced experience provide provides provided stayed stay stays walk walking walked pass passed small side quite much really strongly does did do asked asking felt feels feeling know knowing think".split(" "));
  const clean=s=>String(s||'').trim().replace(/^[\s"'“”‘’—:;,!?]+|[\s"'“”‘’—:;,!?]+$/g,'').replace(/\s+/g,' ').slice(0,110);
  const norm=s=>(' '+String(s||'').toLocaleLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim()+' ');
  function words(source){
    const result=[];
    for(const m of String(source||'').matchAll(/[\p{L}][\p{L}\p{M}'’\-]*/gu)){
      const text=m[0], key=text.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu,'');
      if(key.length<4||STOP.has(key)||generic.has(key)||/^\d+$/.test(key))continue;
      result.push({text,key,start:m.index,end:m.index+text.length,proper:/^\p{Lu}/u.test(text)});
    }
    return result;
  }
  function extract(source){
    const raw=String(source||''),tokens=words(raw),items=new Map(),counts=new Map();
    for(const t of tokens)counts.set(t.key,(counts.get(t.key)||0)+1);
    function offer(text,score,type,provenance){
      text=clean(text);if(text.length<4||text.length>108)return;
      const k=norm(text);if(!k.trim()||items.has(k)&&items.get(k).score>=score)return;
      items.set(k,{text,score,kind:type||'student',why:provenance||'Exact words from your freewrite'});
    }
    const sentences=raw.split(/(?<=[.!?\n])\s+|\n+/u).filter(x=>x.trim());
    for(const sentence of sentences){
      if(sentence.includes('?')&&sentence.length>=12&&sentence.length<=148){
        const mark=sentence.indexOf('?');const span=sentence.slice(Math.max(0,mark-120),mark+1);
        offer(span,12,'question','A question you asked');
      }
    }
    // Distinctive terms and personal names need not be in an instructor-created list.
    for(const t of tokens){
      const frequency=counts.get(t.key)||1;
      let score=3+Math.min(frequency,4)*1.5+(t.proper?3:0);
      const context=raw.slice(Math.max(0,t.start-42),Math.min(raw.length,t.end+55));
      if(context.includes('?'))score+=1;
      offer(t.text,score,'keyword',frequency>=2?'A word you returned to':'A word you wrote');
    }
    // Two neighboring content words often preserve an image better than an isolated noun.
    for(let i=0;i<tokens.length-1;i++){
      const a=tokens[i],b=tokens[i+1];
      if(b.start-a.end>3||b.start-a.start>34)continue;
      const phrase=raw.slice(a.start,b.end);
      offer(phrase,6+(counts.get(a.key)>1?1:0)+(counts.get(b.key)>1?1:0),'phrase','Two words next to each other in your writing');
    }
    return [...items.values()].sort((a,b)=>b.score-a.score||a.text.length-b.text.length).slice(0,30);
  }
  function concepts(source,selected){
    const raw=String(source||''),all=extract(raw),picked=Array.isArray(selected)?selected.filter(x=>typeof x==='string'&&x.trim()):[];
    const found=[],seen=new Set();
    function add(term,reason,kind){
      term=clean(term);const key=norm(term);if(!term||seen.has(key)||term.length>105)return;
      seen.add(key);found.push({term,reason,kind:kind||'student'});
    }
    // Start with a small number of the exact passages the writer chose.
    for(const phrase of picked.slice(0,2)){
      add(phrase,'You selected these words from your own writing. What would you like to learn about them?','chosen');
    }
    for(const item of all.filter(x=>x.kind==='question').slice(0,2)){
      add(item.text,'This is a question you asked yourself. It can stay open as you research.','question');
    }
    const keywords=all.filter(x=>x.kind==='keyword').slice(0,18);
    // Build connections from co-occurrence, not predefined topic-to-concept mappings.
    const spans=[...(raw.matchAll(/[^.!?\n]+[.!?]?/gu))].map(m=>({text:m[0],start:m.index,end:m.index+m[0].length}));
    const pairs=[];
    function overlaps(a,b){
      const ak=norm(a.text).trim(),bk=norm(b.text).trim();
      return ak===bk||ak.includes(bk)||bk.includes(ak)||ak.slice(0,5)===bk.slice(0,5);
    }
    const seenPairs=new Set();
    for(let i=0;i<spans.length;i++){
      const span=spans[i];if(span.text.trim().length<10)continue;
      // Adjacent sentences may continue the same encounter. Keep near topics connected.
      const windowText=span.text+' '+(spans[i+1]?.text||'');
      const local=keywords.filter(x=>norm(windowText).includes(norm(x.text))).slice(0,12);
      for(let j=0;j<local.length;j++)for(let k=j+1;k<local.length;k++){
        const a=local[j],b=local[k];if(overlaps(a,b))continue;
        const key=[a.text.toLowerCase(),b.text.toLowerCase()].sort().join(':');
        if(seenPairs.has(key))continue;seenPairs.add(key);
        const sameSentence=norm(span.text).includes(norm(a.text))&&norm(span.text).includes(norm(b.text));
        let score=a.score+b.score+(sameSentence?2:0);
        // Prioritize a relationship to a named being/place over incidental generic words.
        if(/^\p{Lu}/u.test(a.text)||/^\p{Lu}/u.test(b.text))score+=2;
        pairs.push({a,b,score,sameSentence});
      }
    }
    pairs.sort((a,b)=>b.score-a.score||a.a.text.localeCompare(b.a.text));
    const usedWords=new Map();
    for(const pair of pairs){
      if(found.filter(x=>x.kind==='relationship').length>=4)break;
      // Avoid twelve combinations of the same repeated keyword.
      if((usedWords.get(pair.a.text.toLowerCase())||0)>=2||(usedWords.get(pair.b.text.toLowerCase())||0)>=2)continue;
      add(pair.a.text+' and '+pair.b.text,
        'These are words you used '+(pair.sameSentence?'in the same sentence':'near one another')+'. Do they belong together, or is a different connection more useful?','relationship');
      usedWords.set(pair.a.text.toLowerCase(),(usedWords.get(pair.a.text.toLowerCase())||0)+1);
      usedWords.set(pair.b.text.toLowerCase(),(usedWords.get(pair.b.text.toLowerCase())||0)+1);
    }
    for(const item of keywords){
      if(found.length>=8)break;
      if(found.some(x=>x.term.includes(item.text)))continue;
      add(item.text,'A meaningful-looking word from your writing. You decide whether it deserves further attention.','keyword');
    }
    return found.slice(0,8);
  }
  root.FieldStudentLanguage=Object.freeze({extract,concepts});
})(window);
