/* Research as Encounter: Student-First Language Companion, development preview.
 * All analysis runs inside the user's browser. No network, AI API, or source text transmission.
 * This is transparent word/phrase co-occurrence, not semantic interpretation.
 */
(function(root){
  'use strict';
  const STOP=new Set(("a an and are as at be been being but by can could did do does doing for from had has have having he her hers him his how i if in into is it its itself just me mine my myself nor not of on or our ours out over she should so some than that the their them there these they this those through to too us very was were what when where which while who why will with would you your yours" +
    " after again also always another around before because between called came come coming each ever every first found get gets getting give given going good great here itself know knowing later like little look looked looking made make making many more most much must near never now often once one only other own perhaps quite really said say saying see seeing seemed seems several something still such sure take taken taking tell telling then thing things think thinking thought throughout today together tried trying until used using want wanted way ways well went whenever within without wonder wondered wondering years year").split(/\s+/));
  const generic=new Set("someone anybody everybody people person experience encounter writing wrote research question questions word words idea ideas remember remembered life time moment felt feeling feel something anything nothing".split(" "));
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
    const raw=String(source||''),extracts=extract(raw),picked=Array.isArray(selected)?selected.filter(x=>typeof x==='string'&&x.trim()):[];
    const chosen=[],seen=new Set();
    function add(term,reason,kind){
      term=clean(term);const key=norm(term);if(!term||seen.has(key)||term.length>105)return;
      seen.add(key);chosen.push({term,reason,kind:kind||'student'});
    }
    // A student-selected phrase counts more than any automated score.
    for(const phrase of picked.slice(0,5)){
      add(phrase,'You selected these exact words from your freewrite. What might they help you investigate?','chosen');
    }
    for(const item of extracts.filter(x=>x.kind==='question').slice(0,3)){
      add(item.text,'You asked this question yourself. It can remain open while you research.','question');
    }
    const singles=extracts.filter(x=>x.kind==='keyword').slice(0,18);
    const sentences=raw.split(/[.!?\n]+/).filter(x=>x.trim());
    const pairs=[];
    for(const sentence of sentences){
      const local=singles.filter(x=>norm(sentence).includes(norm(x.text)));
      for(let i=0;i<local.length;i++)for(let j=i+1;j<local.length;j++){
        const a=local[i],b=local[j];
        if(norm(a.text).includes(norm(b.text).trim())||norm(b.text).includes(norm(a.text).trim()))continue;
        pairs.push({a,b,score:a.score+b.score});
      }
    }
    pairs.sort((a,b)=>b.score-a.score);
    for(const pair of pairs.slice(0,12)){
      if(chosen.length>=8)break;
      add(pair.a.text+' and '+pair.b.text,
        'These words occur in the same sentence of your freewrite. Is there a relationship worth questioning? Neither word proves a connection.','relationship');
    }
    // Preserve single words when the student does not yet have a second idea.
    for(const item of singles.slice(0,7)){
      if(chosen.length>=9)break;
      add(item.text,'A keyword you used in your freewrite. Consider what it means in your particular encounter.','keyword');
    }
    return chosen.slice(0,9);
  }
  root.FieldStudentLanguage=Object.freeze({extract,concepts});
})(window);
