const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const url = process.env.GUIDED_URL || 'http://127.0.0.1:8765/guided-journey-example.html';
const KEY = 'eng112-guided-journey-example-v1';
const essay = 'I saw the tree in our garden. Smith (2020) considers memory.\n\nThe garden held family memory.';
const fixture = {
 step:19, encounter:'I saw the tree in our garden.', question:'How does the garden shape family memory?', words:['tree','garden'], search:'tree AND memory',
 notes:[{id:'n1',title:'Garden study',author:'Smith',year:'2020',passage:'Garden memory and place are related.',reflection:'I see place differently.',sourceOrigin:'web',doi:'https://example.org/garden'}],
 activeNoteId:'n1',journalStage:'saved',workingThesis:'Gardens carry family memory, shaping belonging.',strengthenedThesis:'Gardens carry family memory, shaping belonging.',evidenceReadiness:'ready',writingEvidenceNote:'My journal and family history',
 braidSections:[{id:'a',idea:'Garden memory',keys:['strand:original-encounter','note:n1'],connection:'They reveal belonging',gap:''}],essayDraft:essay,reconsideredThesis:'Gardens connect memory and belonging.',thesisReflection:'Research changed my view.',paperReferences:'Smith, A. (2020). *Garden study*. Publisher.'
};
async function seed(page, state){await page.goto(url);await page.evaluate(([k,v])=>localStorage.setItem(k,JSON.stringify(v)),[KEY,state]);await page.reload();}
async function click(page,name){await page.getByRole('button',{name,exact:true}).click();}
test('guided writing, revision, APA, figure and DOCX journey',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seed(page,fixture);
 await click(page,'Build my Living Braiding Map →');
 await expect(page.getByRole('heading',{name:'My Living Braiding Map',exact:true})).toBeVisible();
 await click(page,'Begin drafting my essay →');
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(essay);
 await page.getByText('Writing tools and research',{exact:true}).click();
 await page.getByText('Essay Strength Meter · review my writing',{exact:true}).click();
 await page.getByLabel('Lived experience and reflection',{exact:true}).selectOption('developing');
 await expect(page.getByText('1 of 7 dimensions reviewed by you.',{exact:true})).toBeVisible();
 await page.getByText('Essay Strength Meter · review my writing',{exact:true}).click();
 await click(page,'Save draft and reconsider my working thesis →');
 await click(page,'Save my writing and reflection →');
 await click(page,'Begin my layered revision →');
 for(let i=0;i<3;i++)await click(page,'Save this review and continue →');
 await click(page,'Save and check assignment completeness →');
 await click(page,'Save my revision review →');
 await click(page,'Prepare my Word document →');
 await page.getByLabel('Essay title',{exact:true}).fill('Garden memory');
 await page.getByLabel('Your name',{exact:true}).fill('Sample Student');
 await page.getByLabel('Course and section',{exact:true}).fill('ENG 112-02FX');
 await page.getByLabel('Submission date',{exact:true}).fill('December 8, 2026');
 await page.getByLabel('My abstract',{exact:true}).fill('A test abstract.');
 await click(page,'Continue to citations and References →');
 await page.getByText('APA examples by source type',{exact:true}).click();
 await page.getByLabel('What kind of source are you documenting?').selectOption('book');
 await expect(page.getByText('Use the edition actually consulted.',{exact:false})).toBeVisible();
 await click(page,'Check my citations and References');
 await expect(page.getByText('No obvious mismatch in the patterns recognized.',{exact:false})).toBeVisible();
 await click(page,'Continue to original visuals →');
 await page.getByText('Figure 1 · add image',{exact:true}).click();
 const png=Buffer.from(await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const context=canvas.getContext('2d');context.fillStyle='#316849';context.fillRect(0,0,32,32);return canvas.toDataURL('image/png').split(',')[1];}),'base64');
 await page.getByLabel('Choose image for Figure 1').setInputFiles({name:'sample.png',mimeType:'image/png',buffer:png});
 try {await expect(page.getByLabel('Figure title',{exact:true})).toBeVisible({timeout:10000});}catch(error){console.log('Figure attachment status:',await page.locator('[role=status]').allTextContents());throw error;}
 await page.getByLabel('Figure title',{exact:true}).fill('Original test image');
 await page.getByLabel('Image description (alt text)',{exact:true}).fill('A small test graphic');
 await page.getByLabel('My essay draft (including figure markers)',{exact:true}).fill(essay+'\n\n[Figure 1]');
 await click(page,'Continue to Word export →');
 await page.getByLabel('AI Use Disclosure',{exact:true}).fill('Synthetic test document.');
 page.once('dialog',d=>d.accept());
 const [download]=await Promise.all([page.waitForEvent('download'),click(page,'Download my Word document (.docx)')]);
 expect(download.suggestedFilename()).toBe('my-living-world-essay.docx');
 const data=await fs.readFile(await download.path());
 expect(data.subarray(0,4).toString('hex')).toBe('504b0304');
 expect(data.includes(Buffer.from('word/media/figure1.png'))).toBeTruthy();
 await page.reload();
 await expect(page.getByRole('heading',{name:'Download my Word document',exact:true})).toBeVisible();
 await click(page,'← Previous page');
 await expect(page.getByLabel('My essay draft (including figure markers)',{exact:true})).toHaveValue(essay+'\n\n[Figure 1]');
 expect(errors).toEqual([]);
});
test('new student start and back navigation preserve encounter',async({page})=>{
 await page.goto(url);
 await page.getByLabel('Course and section (for example, ENG 112-02FX)',{exact:true}).fill('ENG 112-10SY');
 await click(page,'Start with my own experience');
 await page.getByLabel('My experience',{exact:true}).fill('I watched fireflies near the creek.');
 await click(page,'Discover my words →');
 await expect(page.getByRole('heading',{name:'Discover my words',exact:true})).toBeVisible();
 await click(page,'← Previous page');
 await expect(page.getByLabel('My experience',{exact:true})).toHaveValue('I watched fireflies near the creek.');
 await page.getByLabel('My experience',{exact:true}).fill('I watched fireflies near the creek again.');
 await click(page,'Discover my words →');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).firstEncounter,KEY)).toBe('I watched fireflies near the creek.');
 await click(page,'← Previous page');
 await page.reload();
 await expect(page.getByLabel('My experience',{exact:true})).toHaveValue('I watched fireflies near the creek again.');
});

test('course profile differentiates FX and online requirements',async({page})=>{
 await seed(page,{...fixture,step:0,encounter:''});
 const course=page.getByLabel('Course and section (for example, ENG 112-02FX)',{exact:true});
 await course.fill('ENG 112-01FX');await course.blur();
 await expect(page.getByText('FX: Use at least one relevant physical book',{exact:false})).toBeVisible();
 await course.fill('ENG 112-10SY');await course.blur();
 await expect(page.getByText('IN/SY: A relevant physical library book is encouraged',{exact:false})).toBeVisible();
 await course.fill('ENG 112-92IN');await click(page,'Start with my own experience');
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.courseSection).toBe('ENG 112-92IN');expect(saved.paperCourse).toBe('ENG 112-92IN');
});

test('intellectual trail preserves student text and permits an unchanged thesis',async({page})=>{
 const thesis='The garden holds family memory.';
 await seed(page,{...fixture,step:21,firstEncounter:'I first watched the tree.',initialThesis:thesis,workingThesis:thesis,strengthenedThesis:thesis,reconsideredThesis:thesis,notes:[{id:'n1',title:'Garden study',reflection:'The garden holds family memory.'}]});
 await page.getByText('How my thinking changed',{exact:true}).click();
 await expect(page.getByText('I first watched the tree.',{exact:true})).toBeVisible();
 await expect(page.getByText('Your thesis wording is unchanged.',{exact:false})).toBeVisible();
 await expect(page.getByText('My reading reflection · Garden study',{exact:true})).toBeVisible();
 await click(page,'Save my writing and reflection →');
 await click(page,'Begin my layered revision →');
 await page.getByText('More revision tools',{exact:true}).click();
 await page.getByText('How my thinking changed',{exact:true}).click();
 await expect(page.getByText('First saved working thesis',{exact:true})).toBeVisible();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(essay);
});

test('continuity review identifies a possible crossing without changing the essay',async({page})=>{
 const first='The garden carried family memory and belonging. I noticed how the trees surrounded the place.';
 const tangent='Astronomers measure distant planets by observing orbital periods and stellar brightness. Telescope instruments detect wavelengths emitted by galaxies. Calculations estimate planetary mass, atmospheric composition, temperature, radiation, and gravity across vast distances.';
 const last='The garden and belonging return through family memory and our shared place.';
 const draft=[first,tangent,last].join('\n\n');
 await seed(page,{...fixture,step:25,question:'How does garden memory shape belonging?',workingThesis:'Garden memory shapes belonging.',strengthenedThesis:'',reconsideredThesis:'',essayDraft:draft});
 await expect(page.getByRole('heading',{name:'Check one change of direction',exact:true})).toBeVisible();
 await page.getByText('More revision tools',{exact:true}).click();
 await page.getByText('Follow my central inquiry',{exact:true}).click();
 await page.getByLabel('My critical lens (optional)',{exact:true}).fill('Cultural studies and family belonging');
 await page.getByLabel('My critical lens (optional)',{exact:true}).blur();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
 await click(page,'Save this review and continue →');
 await expect(page.getByRole('heading',{name:'Revise for braiding',exact:true})).toBeVisible();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.criticalLens).toBe('Cultural studies and family belonging');
 expect(saved.essayDraft).toBe(draft);
});

test('conceptual connections are not confused with a repeated original thesis',async({page})=>{
 const draft=['Ancestry and kinship helped shape belonging in our family.','Displacement, migration and cultural memory shaped heritage. Across the generations, people crossed borders, carried traditions, shared meals, taught children their songs, kept letters, remembered rituals, and maintained ties to distant homelands despite economic hardship.','Ancestry and kinship still shape belonging in the family.'].join('\n\n');
 await seed(page,{...fixture,step:25,question:'How do ancestry and kinship shape belonging?',workingThesis:'Ancestry and kinship sustain belonging.',strengthenedThesis:'',reconsideredThesis:'',essayDraft:draft});
 await expect(page.getByRole('heading',{name:'A possible conceptual relationship',exact:true})).toBeVisible();
 await page.getByText('More revision tools',{exact:true}).click();
 await page.getByText('Follow my central inquiry',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'Cultural memory, kinship and belonging',exact:true})).toBeVisible();
 await expect(page.getByText('Second set of wording: cultural memory, heritage, displacement, migration',{exact:true})).toBeVisible();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
});

test('conceptual translation offers editable searches and preserves student voice',async({page})=>{
 const question='Why do loud sounds overwhelm me, but walking in the woods helps me notice things?';
 const encounter='I heard loud sounds in the city and felt overwhelmed. Walking in the woods helped me notice the birds.';
 await seed(page,{...fixture,step:3,question,encounter,words:['loud sounds','woods'],keywords:[],history:[],search:''});
 await expect(page.getByText('sensory regulation: How a person manages or responds to sensory input.',{exact:false}).first()).toBeVisible();
 await page.getByText('Explore other search combinations',{exact:true}).click();
 await expect(page.getByText('phenomenology: A philosophical approach to describing and examining lived experience.',{exact:false}).first()).toBeVisible();
 await expect(page.getByLabel('My research question',{exact:true})).toHaveValue(question);
 await page.getByLabel('Search words (you can edit these)',{exact:true}).fill('woods AND sensory regulation');
 await click(page,'Use this search →');
 let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.search).toBe('woods AND sensory regulation');expect(saved.question).toBe(question);expect(saved.encounter).toBe(encounter);
 const draft='Phenomenology helps me describe this walk. I notice the birds.';
 await seed(page,{...fixture,step:27,essayDraft:draft});
 await page.getByText('More revision tools',{exact:true}).click();
 await page.getByText('Make academic language my own',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'phenomenology',exact:true})).toBeVisible();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
});

test('conceptual integration invites interpretation without changing the draft',async({page})=>{
 const draft='Sensory regulation and phenomenology offer perspectives on my walk. I noticed the creek in the woods.';
 await seed(page,{...fixture,step:26,essayDraft:draft});
 await expect(page.getByRole('heading',{name:'Bring two concepts into conversation',exact:true})).toBeVisible();
 await expect(page.getByText('Consider the difference between explaining a sensory response',{exact:false})).toBeVisible();
 await page.getByText('More revision tools',{exact:true}).click();
 await page.getByText('What did my encounters teach me?',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'sensory regulation',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'phenomenology',exact:true})).toBeVisible();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
 await click(page,'Save this review and continue →');
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.essayDraft).toBe(draft);expect(saved.step).toBe(27);
});

test('a vague encounter invites attention without requiring private disclosure or an environmental lens',async({page})=>{
 const opening='I had a conversation with my grandfather at Waffle House. It was important to me.';
 await seed(page,{...fixture,step:1,encounter:opening,firstEncounter:'',words:[],question:'',notes:[],workingThesis:'',initialThesis:''});
 await click(page,'Discover my words →');
 await expect(page.getByRole('heading',{name:'Return to the moment',exact:true})).toBeVisible();
 await expect(page.getByText('What did the person say, do or share',{exact:false})).toBeVisible();
 const expanded=opening+' I remember how he gave me advice about listening to others.';
 await page.getByLabel('My experience',{exact:true}).fill(expanded);
 await click(page,'Continue with what I remember →');
 await expect(page.getByRole('heading',{name:'Discover my words',exact:true})).toBeVisible();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.encounter).toBe(expanded);
 await seed(page,{...fixture,step:3,encounter:expanded,question:'How do advice and stories from my grandfather help me learn?',words:['grandfather','advice'],keywords:[],notes:[]});
 await expect(page.getByText('intergenerational learning: Learning through exchanges',{exact:false}).first()).toBeVisible();
 await expect(page.getByText('environmental justice:',{exact:false})).toHaveCount(0);
});

test('bounded follow-up preserves original experience and permits a student-selected lens',async({page})=>{
 const opening='I had a conversation with my grandfather at Waffle House. It was important to me.';
 await seed(page,{...fixture,step:1,encounter:opening,firstEncounter:'',words:[],question:'',notes:[],workingThesis:'',initialThesis:'',criticalLens:''});
 await click(page,'Discover my words →');
 await page.getByLabel('My experience',{exact:true}).fill(opening+' It was very nice.');
 await click(page,'Continue with what I remember →');
 await expect(page.getByText('You have added to the encounter.',{exact:false})).toBeVisible();
 const expanded=opening+' I remember how he gave me advice about listening to others.';
 await page.getByLabel('My experience',{exact:true}).fill(expanded);
 await click(page,'Continue with what I remember →');
 let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.firstEncounter).toBe(opening);expect(saved.encounter).toBe(expanded);
 await seed(page,{...fixture,step:3,firstEncounter:opening,encounter:expanded,question:'How do advice and stories from my grandfather help me learn?',words:['grandfather','advice'],keywords:[],notes:[],criticalLens:''});
 await page.getByText('My working critical lens (optional)',{exact:true}).click();
 await expect(page.getByLabel('My working lens',{exact:true})).toHaveValue('');
 await click(page,'Explore Intergenerational learning');
 await expect(page.getByLabel('My working lens',{exact:true})).toHaveValue('Intergenerational learning · intergenerational learning');
 await click(page,'Use this search →');
 saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.criticalLens).toContain('Intergenerational learning');expect(saved.encounter).toBe(expanded);
});

test('third story supports earned significance without forcing a universal claim',async({page})=>{
 const one='I spoke with my grandfather at Waffle House.';
 const two='Listening to my grandfather helped me notice his perspective.';
 await seed(page,{...fixture,step:15,storyOne:one,storyTwo:two,storyThree:'',workingThesis:'',question:'How does listening shape relationships?'});
 await expect(page.getByText('Possible direction: Listening and attention',{exact:true})).toBeVisible();
 const third=page.getByLabel('The larger significance',{exact:true});
 await third.fill('Everyone must listen the same way.');await third.blur();
 await expect(page.getByRole('heading',{name:'Check how far the claim travels',exact:true})).toBeVisible();
 await third.fill('Listening can make room for my grandfather’s perspective.');await third.blur();
 await expect(page.getByRole('heading',{name:'Examine the significance you have earned',exact:true})).toBeVisible();
 await click(page,'Bring my three stories together →');
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.storyThree).toBe('Listening can make room for my grandfather’s perspective.');
 expect(saved.workingThesis).toContain(two);
});

test('particularity guides observation and abstract prose without changing student writing',async({page})=>{
 const encounter='I sat across from my grandfather at Waffle House. He poured coffee and told me to listen.';
 await seed(page,{...fixture,step:13,encounter,storyOne:'Family relationships are important.'});
 await expect(page.getByRole('heading',{name:'Make the observation more particular',exact:true})).toBeVisible();
 const observation=page.getByLabel('My observation',{exact:true});
 await observation.fill('At Waffle House, my grandfather told me that listening was more important than speaking.');
 await observation.blur();
 await expect(page.getByRole('heading',{name:'Keep observation and interpretation distinct',exact:true})).toBeVisible();
 await click(page,'Continue to Story Two →');
 const draft='Intergenerational communication is essential for the preservation of cultural knowledge.';
 await seed(page,{...fixture,step:27,encounter,storyOne:'',essayDraft:draft});
 await expect(page.getByRole('heading',{name:'Reconnect the idea with a particular',exact:true})).toBeVisible();
 await page.getByText('More revision tools',{exact:true}).click();
 await page.getByText('Keep my experience and evidence particular',{exact:true}).click();
 await page.getByText('Revisit a saved particular',{exact:true}).click();
 await expect(page.getByText(encounter,{exact:true}).last()).toBeVisible();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
});

test('intellectual presence prompts interpretation without judging authorship or rewriting',async({page})=>{
 const draft='Smith (2020) discusses family learning and cultural knowledge.\n\nJones (2021) describes family learning and cultural knowledge.';
 const interpretation='Family learning and cultural knowledge can shape how I listen.';
 await seed(page,{...fixture,step:27,essayDraft:draft,storyTwo:interpretation});
 await expect(page.getByRole('heading',{name:'Make room for your interpretation',exact:true})).toBeVisible();
 await page.getByText('More revision tools',{exact:true}).click();
 await page.getByText('Where is my thinking visible?',{exact:true}).click();
 const panel=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Where is my thinking visible?'})});
 await expect(panel.getByText(interpretation,{exact:true})).toBeVisible();
 await expect(panel.getByText('This is a revision prompt based on wording, not a judgment of authorship',{exact:false})).toBeVisible();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
 await click(page,'Save and check assignment completeness →');
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.essayDraft).toBe(draft);expect(saved.storyTwo).toBe(interpretation);
});

test('students may decline a revision suggestion and retain their own reasoning',async({page})=>{
 const draft='The garden carries family memory and belonging.\n\nThe garden and belonging return through family memory.';
 await seed(page,{...fixture,step:25,essayDraft:draft,agencyDecisions:[]});
 await page.getByText('Decide how to use this suggestion',{exact:true}).click();
 await page.getByRole('radio',{name:'This suggestion does not fit my intention',exact:true}).check();
 await page.getByLabel('My reason (optional)',{exact:true}).fill('The recurrence is deliberate.');
 await expect(page.getByText('Your decision: This suggestion does not fit my intention. You can continue.',{exact:true})).toBeVisible();
 await page.reload();
 await page.getByText('Suggestion already considered · revisit if useful',{exact:true}).click();
 await page.getByText('My decision about this suggestion · saved',{exact:true}).click();
 await expect(page.getByLabel('My reason (optional)',{exact:true})).toHaveValue('The recurrence is deliberate.');
 await expect(page.getByRole('radio',{name:'This suggestion does not fit my intention',exact:true})).toBeChecked();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
 await click(page,'Save this review and continue →');
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.step).toBe(26);expect(saved.essayDraft).toBe(draft);
 expect(saved.agencyDecisions[0].choice).toBe('decline');expect(saved.agencyDecisions[0].reason).toBe('The recurrence is deliberate.');
});

test('quiet revision and grouped tools preserve student control and required checks',async({page})=>{
 await seed(page,{...fixture,step:20,quietRevision:false});
 const drawer=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Writing tools and research'})});
 await expect(drawer).not.toHaveAttribute('open','');
 await expect(page.getByRole('button',{name:'Save draft and reconsider my working thesis →',exact:true})).toBeVisible();
 await page.getByText('Writing tools and research',{exact:true}).click();
 await expect(page.getByRole('button',{name:'Find evidence connections for this paragraph',exact:true})).toBeVisible();
 await seed(page,{...fixture,step:25,quietRevision:false});
 await page.getByRole('checkbox',{name:'Quiet revision · show suggestions only when I open them'}).check();
 await expect(page.getByText('Open revision guidance when needed',{exact:true})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('checkbox',{name:'Quiet revision · show suggestions only when I open them'})).toBeChecked();
 await page.getByText('Open revision guidance when needed',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'One next revision move',exact:true})).toBeVisible();
 await click(page,'Save this review and continue →');
 await expect(page.getByText('Open revision guidance when needed',{exact:true})).toBeVisible();
 await click(page,'Save this review and continue →');await click(page,'Save and check assignment completeness →');
 await expect(page.getByText('Check your submission document yourself',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Save my revision review →',exact:true})).toBeVisible();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);expect(saved.essayDraft).toBe(essay);
});

test('complete notebook backup restores writing and attachment bytes in a fresh browser',async({page,browser})=>{
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n%%EOF\n');
 const initial={...fixture,step:20,pdfId:'backup-pdf',pdfName:'source.pdf',notes:[{...fixture.notes[0],pdfId:'backup-pdf',pdfName:'source.pdf'}],figures:[{id:'backup-image',number:1,ext:'png',name:'original.png',width:2,height:2,title:'Original figure',alt:'A green square',note:''}]};
 await seed(page,initial);
 const png=await page.evaluate(async({pdf})=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=2;const c=canvas.getContext('2d');c.fillStyle='green';c.fillRect(0,0,2,2);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png')),bytes=await blob.arrayBuffer();
  const write=record=>new Promise((resolve,reject)=>{
   const req=indexedDB.open('eng112-guided-journey-example-v1-pdf-shelf',1);
   req.onupgradeneeded=()=>req.result.createObjectStore('files',{keyPath:'id'});
   req.onerror=()=>reject(req.error);
   req.onsuccess=()=>{const db=req.result,tx=db.transaction('files','readwrite');tx.objectStore('files').put(record);tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>{db.close();reject(tx.error);};};
  });
  await write({id:'backup-pdf',name:'source.pdf',mime:'application/pdf',bytes:new Uint8Array(pdf).buffer});
  await write({id:'backup-image',name:'original.png',mime:'image/png',bytes});
  return Array.from(new Uint8Array(bytes));
 },{pdf:[...pdf]});
 await page.getByText('Backup or restore my notebook',{exact:true}).click();
 const [download]=await Promise.all([page.waitForEvent('download'),click(page,'Download complete backup (.zip)')]);
 expect(download.suggestedFilename()).toBe('living-field-notebook-complete.zip');
 const bytes=await fs.readFile(await download.path());expect(bytes.subarray(0,4).toString('hex')).toBe('504b0304');
 const fresh=await browser.newContext({acceptDownloads:true});
 try{
  const target=await fresh.newPage();await target.goto(url);
  await target.getByText('Backup or restore my notebook',{exact:true}).click();
  target.once('dialog',d=>d.accept());
  await target.getByLabel('Restore a notebook backup (.zip or .json)',{exact:true}).setInputFiles({name:'backup.zip',mimeType:'application/zip',buffer:bytes});
  await expect(target.getByLabel('My essay draft',{exact:true})).toHaveValue(essay);
  const restored=await target.evaluate(async k=>{
   const st=JSON.parse(localStorage.getItem(k));
   const read=id=>new Promise((resolve,reject)=>{const req=indexedDB.open(k+'-pdf-shelf',1);req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result,tx=db.transaction('files','readonly'),get=tx.objectStore('files').get(id);get.onsuccess=()=>resolve(Array.from(new Uint8Array(get.result.bytes)));get.onerror=()=>reject(get.error);tx.oncomplete=()=>db.close();};});
   return {st,pdf:await read(st.notes[0].pdfId),image:await read(st.figures[0].id)};
  },KEY);
  expect(restored.st.notes[0].pdfId).not.toBe('backup-pdf');expect(restored.st.pdfId).toBe(restored.st.notes[0].pdfId);
  expect(restored.st.figures[0].id).not.toBe('backup-image');expect(restored.pdf).toEqual([...pdf]);expect(restored.image).toEqual(png);
  expect(restored.st.figures[0].alt).toBe('A green square');
  await target.getByText('Backup or restore my notebook',{exact:true}).click();
  const corrupt=Buffer.from(bytes);corrupt[60]^=1;
  await target.getByLabel('Restore a notebook backup (.zip or .json)',{exact:true}).setInputFiles({name:'corrupt.zip',mimeType:'application/zip',buffer:corrupt});
  await expect(target.getByText('Backup checksum failed.',{exact:false})).toBeVisible();
  await expect(target.getByLabel('My essay draft',{exact:true})).toHaveValue(essay);
  await target.reload();await expect(target.getByLabel('My essay draft',{exact:true})).toHaveValue(essay);
 }finally{await fresh.close();}
});
test('legacy text-only backup can be restored without attachments',async({page})=>{
 await page.goto(url);await page.getByText('Backup or restore my notebook',{exact:true}).click();
 page.once('dialog',d=>d.accept());
 const legacy={prototype:'guided-journey-v1',step:1,encounter:'My earlier freewrite.'};
 await page.getByLabel('Restore a notebook backup (.zip or .json)',{exact:true}).setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
 await expect(page.getByLabel('My experience',{exact:true})).toHaveValue(legacy.encounter);
});

test('research review edits an earlier note without losing its context or essay',async({page})=>{
 const first={...fixture.notes[0],question:'My earlier question',search:'my earlier search'};
 const second={id:'n2',title:'Second study',author:'Jones',year:'2021',passage:'Another passage',reflection:'Another reflection',sourceOrigin:'book'};
 await seed(page,{...fixture,step:9,thesisStep:20,notes:[first,second],criticalLens:'Cultural memory'});
 await expect(page.getByRole('button',{name:'Continue my writing journey →',exact:true})).toHaveCount(1);
 await page.getByText('Review my research materials',{exact:true}).click();
 await page.getByText('Garden study',{exact:true}).first().click();
 await click(page,'Edit this saved note');
 await expect(page.getByLabel('What does it help you understand?',{exact:true})).toHaveValue(first.reflection);
 await page.getByLabel('What does it help you understand?',{exact:true}).fill('A revised reflection on the encounter.');
 await click(page,'Save my reading note →');await click(page,'Return to my saved notes →');
 await expect(page.getByRole('heading',{name:'Review my research',exact:true})).toBeVisible();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.notes.map(n=>n.id)).toEqual(['n1','n2']);expect(saved.notes[0].question).toBe(first.question);expect(saved.notes[0].search).toBe(first.search);expect(saved.notes[0].reflection).toBe('A revised reflection on the encounter.');
 expect(saved.essayDraft).toBe(essay);expect(saved.criticalLens).toBe('Cultural memory');
 await click(page,'Continue my writing journey →');
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(essay);
});
test('research detour without notes returns to question and starts a fresh source',async({page})=>{
 await seed(page,{...fixture,step:20,notes:[],activeNoteId:'',journalStage:'details',title:'',passage:'',reflection:'',researchReturn:0});
 await page.getByText('Writing tools and research',{exact:true}).click();
 await page.getByText('Need to revisit my plan or evidence?',{exact:true}).click();
 await click(page,'Find another source');
 await expect(page.getByLabel('My research question',{exact:true})).toHaveValue(fixture.question);
 await page.getByLabel('Search words (you can edit these)',{exact:true}).fill('family memory AND gardens');
 await click(page,'Use this search →');
 await click(page,'Already searched? Continue');
 await page.getByRole('button',{name:/^I found a source/}).click();await click(page,'Add my source →');
 await expect(page.getByLabel('Source title',{exact:true})).toHaveValue('');
 await click(page,'Return to my writing journey');
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(essay);
});
test('source comparison resumes existing writing instead of restarting thesis',async({page})=>{
 await seed(page,{...fixture,step:11,thesisStep:23,connectionReflection:'A comparison of perspectives.'});
 await click(page,'Continue my writing journey →');
 await expect(page.getByRole('heading',{name:'My Living Braiding Map',exact:true})).toBeVisible();
});

test('bibliography milestone preserves student annotations and carries selected sources into final essay',async({page})=>{
 const notes=Array.from({length:5},(_,i)=>({id:'ab'+i,title:'Research source '+i,author:'Author '+i,year:'2022',passage:'My saved passage '+i,reflection:'My saved reflection '+i,sourceOrigin:i<3?'database':'web'}));
 await seed(page,{...fixture,step:9,notes,criticalLens:'Cultural memory',courseSection:'ENG 112-02FX',bibInitialized:false});
 await click(page,'Work on my annotated bibliography');
 await expect(page.getByLabel('Primary critical lens',{exact:true})).toHaveValue('Cultural memory');
 await page.getByLabel('My Research Path Overview',{exact:true}).fill('My own overview of the inquiry.');
 await click(page,'Choose my outside sources →');
 await page.getByRole('checkbox',{name:/Research source 0/}).check();
 await page.getByLabel('My complete APA reference entry (use *italics* where needed)',{exact:true}).fill('Author, A. (2022). *A book*. Publisher.');
 await page.getByLabel('My annotation',{exact:true}).fill('My own annotation, not the reading note.');
 await page.getByLabel('Project role',{exact:true}).selectOption('Context');
 await page.getByRole('checkbox',{name:/I opened, read and evaluated/}).check();
 await page.getByRole('checkbox',{name:/Research source 1/}).check();
 await page.getByLabel('Source to annotate',{exact:true}).selectOption('ab0');
 await expect(page.getByLabel('My annotation',{exact:true})).toHaveValue('My own annotation, not the reading note.');
 await page.getByRole('checkbox',{name:/Research source 2/}).check();
 await click(page,'Continue to State of the Research Path →');
 for(let i=0;i<3;i++)await page.getByRole('checkbox',{name:'Research source '+i,exact:true}).check();
 await page.getByLabel('My State of the Research Path',{exact:true}).fill('My own account of the changed inquiry.');
 await click(page,'Review my bibliography →');
 await page.getByLabel('Your name',{exact:true}).fill('Sample Student');
 await page.getByLabel('Bibliography submission date',{exact:true}).fill('November 29, 2026');
 await page.getByLabel('My bibliography AI Use Disclosure',{exact:true}).fill('I did not use generative AI for this assignment.');
 page.once('dialog',d=>d.accept());
 const [download]=await Promise.all([page.waitForEvent('download'),click(page,'Download my annotated bibliography (.docx)')]);
 expect(download.suggestedFilename()).toBe('my-annotated-bibliography.docx');
 const bytes=await fs.readFile(await download.path()),xml=bytes.toString('utf8');
 expect(xml).toContain('My own annotation, not the reading note.');expect(xml).toContain('Research Path Overview');expect(xml).toContain('State of the Research Path');expect(xml).not.toContain('My saved passage 0');expect(xml).not.toContain('>Abstract</w:t>');expect(xml).not.toContain('>References</w:t>');
 await click(page,'Carry my inquiry into the final essay →');
 let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.bibCarry).toEqual(['ab0','ab1','ab2']);expect(saved.essayDraft).toBe(essay);expect(saved.notes[0].reflection).toBe(notes[0].reflection);
 await seed(page,{...saved,step:23});await expect(page.getByText('Selected for final essay',{exact:false}).first()).toBeVisible();
 await seed(page,{...saved,step:31,paperReferences:'Existing, A. (2020). *Existing book*. Publisher.'});
 await page.getByText('Reuse my selected bibliography references',{exact:true}).click();
 await page.getByRole('checkbox',{name:'Author, A. (2022). *A book*. Publisher.',exact:true}).check();
 await click(page,'Add my chosen reference entries');
 await expect(page.getByLabel('My References entries',{exact:true})).toHaveValue('Existing, A. (2020). *Existing book*. Publisher.\nAuthor, A. (2022). *A book*. Publisher.');
});

test('keyboard navigation, validation feedback and page focus on a narrow viewport',async({page})=>{
 await page.setViewportSize({width:320,height:640});
 await seed(page,{...fixture,step:0,encounter:'',courseSection:''});
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to notebook content'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
 await page.getByLabel('Course and section (for example, ENG 112-02FX)').fill('ENG 112-02FX');
 await page.getByRole('button',{name:'Start with my own experience',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'My freewrite',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Discover my words →',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByText('Write a little about your experience first.',{exact:true})).toBeFocused();
 await page.getByLabel('My experience',{exact:true}).fill('I watched fireflies near the creek.');
 await click(page,'Discover my words →');await expect(page.getByRole('heading',{name:'Discover my words',exact:true})).toBeFocused();
 await click(page,'← Previous page');await click(page,'← Previous page');await expect(page.getByRole('heading',{name:'Start here',exact:true})).toBeFocused();
});
test('narrow viewport reflow and unique accessible control IDs throughout the journey',async({page})=>{
 await page.setViewportSize({width:320,height:640});
 const long='VeryLongUnbrokenSourceTitle'.repeat(9);
 const notes=[{...fixture.notes[0],title:long,pdfId:'test-pdf'}];
 for(const step of [1,2,3,4,5,6,8,9,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34]){
  await seed(page,{...fixture,step,notes,journalStage:step===6?'details':'saved',bibPhase:1,bibEntries:[{id:'n1',reference:'Smith, A. (2020). *Garden study*. Publisher.',annotation:'My writing',role:'Context',link:'',verified:true}]});
  const result=await page.evaluate(()=>{
   const root=document.querySelector('main'),ids=[...root.querySelectorAll('[id]')].map(x=>x.id);
   const controls=[...root.querySelectorAll('input:not([type=hidden]),textarea,select')].filter(x=>x.getClientRects().length&&(!x.closest('details')||[...root.querySelectorAll('details')].filter(d=>d.contains(x)).every(d=>d.open)));
   return {width:document.documentElement.scrollWidth,viewport:innerWidth,duplicates:ids.filter((x,i)=>ids.indexOf(x)!==i),unnamed:controls.filter(x=>!(x.labels?.length||x.getAttribute('aria-label')||x.getAttribute('aria-labelledby'))).map(x=>x.id||x.outerHTML.slice(0,120)),headings:root.querySelectorAll('h1').length};
  });
  expect(result.width, 'horizontal reflow at step '+step).toBeLessThanOrEqual(result.viewport+1);
  expect(result.duplicates,'duplicate IDs at step '+step).toEqual([]);
  expect(result.unnamed,'unlabeled controls at step '+step).toEqual([]);
  expect(result.headings,'main heading at step '+step).toBe(1);
 }
});

test('six classroom inquiries remain distinct and preserve student choice',async({page})=>{
 const cases=[
 {encounter:'I had a conversation with my grandfather at Waffle House. It was important to me.',question:"How does listening to my grandfather's advice help me understand our relationship?",words:['grandfather','listening','advice'],lens:'Intergenerational learning',search:'"grandfather" AND "intergenerational learning"'},
 {encounter:'I watched fireflies flashing beside the creek as the porch light came on.',question:'How does artificial light affect communication between fireflies?',words:['fireflies','artificial light','communication'],lens:'Animal behavior and communication',search:'fireflies AND ("artificial light" OR "light pollution")'},
 {encounter:'Traffic stopped on my holiday trip. When I arrived, my family was still waiting.',question:'How might people interpret coincidences as miracles during holiday travel?',words:['holiday travel','miracles','coincidences'],lens:'Religious studies / meaning-making',search:'"holiday travel" AND "meaning-making"'},
 {encounter:'My grandmother showed me her handwritten recipe and told me how she learned it from her mother.',question:'How do family recipes and traditions preserve cultural memory across generations?',words:['family recipes','traditions','cultural memory'],lens:'Cultural memory / oral history',search:'"family recipes" AND "intergenerational memory"'},
 {encounter:'I heard the hand dryer in the school restroom and covered my ears.',question:'How do loud sounds affect sensory regulation and neurodiversity in public spaces?',words:['loud sounds','sensory regulation','public spaces'],lens:'Psychology / disability studies',search:'"public spaces" AND "sensory regulation"'},
 {encounter:'I felt happy and it was a really special experience that changed my life in a lot of ways.',question:'Why was this experience important?',words:['happy','special','experience'],lens:'',search:''}
 ];
 for(const c of cases){
  await seed(page,{...fixture,...c,step:3,criticalLens:'',notes:[],keywords:[],history:[],search:''});
  await expect(page.getByLabel('Search words (you can edit these)',{exact:true})).toHaveValue(c.search);
  await page.getByText('My working critical lens (optional)',{exact:true}).click();
  if(c.lens)await expect(page.getByRole('heading',{name:c.lens,exact:true})).toBeVisible();
  else await expect(page.getByText('No well-grounded lens suggestion yet.',{exact:false})).toBeVisible();
  await expect(page.getByLabel('My working lens',{exact:true})).toHaveValue('');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);expect(saved.question).toBe(c.question);expect(saved.encounter).toBe(c.encounter);
 }
 await seed(page,{...fixture,step:1,encounter:cases[5].encounter});
 await click(page,'Discover my words →');
 await expect(page.getByRole('heading',{name:'Return to the moment',exact:true})).toBeVisible();
 await click(page,'Continue with what I remember →');
 await expect(page.getByRole('heading',{name:'Discover my words',exact:true})).toBeVisible();
});


test('conversational filler does not masquerade as a remembered detail',async({page})=>{
 for(const phrase of ['stuff','different things','life in general','a lot of things']){
  const encounter='I talked with my grandfather about '+phrase+'. It was special.';
  await seed(page,{...fixture,step:1,encounter,firstEncounter:''});
  await click(page,'Discover my words →');
  await expect(page.getByRole('heading',{name:'Return to the moment',exact:true})).toBeVisible();
  await click(page,'Continue with what I remember →');
  await expect(page.getByRole('heading',{name:'Discover my words',exact:true})).toBeVisible();
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).encounter,KEY)).toBe(encounter);
 }
 for(const phrase of ['his childhood','losing his father']){
  await seed(page,{...fixture,step:1,encounter:'I talked with my grandfather about '+phrase+'.'});
  await click(page,'Discover my words →');
  await expect(page.getByRole('heading',{name:'Discover my words',exact:true})).toBeVisible();
 }
});

test('everyday phrases suggest bounded concepts without assigning a lens',async({page})=>{
 const cases=[
 ['Why did it matter that he waited until I finished talking?','Communication studies / relational ethics'],
 ['Why did nobody have to explain why we were there?','Anthropology / cultural studies'],
 ['Why did the room feel different when she was gone?','Place studies / memory'],
 ['How did my dog know before I said anything?','Animal behavior and communication'],
 ['Why did everyone know my name when I walked in?','Sociology / cultural studies'],
 ["Why couldn't I think with all the noise?",'Psychology / disability studies']
 ];
 for(const [question,lens] of cases){
  await seed(page,{...fixture,step:3,encounter:question,question,words:[],search:'',criticalLens:'',notes:[],history:[],keywords:[]});
  await page.getByText('My working critical lens (optional)',{exact:true}).click();
  await expect(page.getByRole('heading',{name:lens,exact:true})).toBeVisible();
  await expect(page.getByLabel('My working lens',{exact:true})).toHaveValue('');
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).question,KEY)).toBe(question);
 }
});

test('contextual discernment distinguishes silence and preserves unresolved meaning',async({page})=>{
 const cases=[
 ['Why did my grandfather sit quietly with me because he understood?','Communication studies / supportive relationships'],
 ['Why did my grandfather sit quietly because he was angry with me?','Communication studies / interpersonal conflict'],
 ['My grandfather sat quietly, and I never understood why.','Interpretation / interpersonal communication'],
 ['He sat quietly and I felt safe, but later I felt hurt.','Communication studies / relational complexity'],
 ['He sat quietly but I did not feel safe.','Communication studies / interpersonal conflict'],
 ['He sat quietly and was not angry.','Interpretation / interpersonal communication']
 ];
 for(const [question,lens] of cases){
  await seed(page,{...fixture,step:3,encounter:question,question,words:[],search:'',criticalLens:'',notes:[],history:[],keywords:[]});
  await page.getByText('My working critical lens (optional)',{exact:true}).click();
  await expect(page.getByRole('heading',{name:lens,exact:true})).toBeVisible();
  if(!lens.includes('supportive'))await expect(page.getByRole('heading',{name:'Phenomenology / relational ethics',exact:true})).toHaveCount(0);
  await expect(page.getByLabel('My working lens',{exact:true})).toHaveValue('');
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).question,KEY)).toBe(question);
 }
});

test('diachronic trail distinguishes possible growth from mere wording changes',async({page})=>{
 const cases=[
 ['Older generations teach younger ones.','We learn from each other.','','one-directional relationship'],
 ['Nature always calms us.','Nature may not calm everyone.','','condition, exception or limit'],
 ['Gardens carry memory.','Gardens carry memory.','The reading deepened my understanding.','specific evidence deepened'],
 ['Silence means care.','Silence means care.','I still do not know why he was silent.','What remains unresolved'],
 ['Silence means care.','Silence can mean conflict.','I initially assumed silence was supportive.','earlier assumption'],
 ['Gardens carry memory.','Gardens carry memory!','','unchanged or nearly identical']
 ];
 for(const [before,after,reflection,prompt] of cases){
  await seed(page,{...fixture,step:21,initialThesis:before,workingThesis:before,strengthenedThesis:'An intermediate formulation.',reconsideredThesis:after,thesisReflection:reflection,notes:[{id:'n1',title:'Unrelated astronomy',reflection:'Telescopes measure orbital periods.'}],connections:[],strands:[],assumptionPlan:'',alternativePlan:''});
  await page.getByText('How my thinking changed',{exact:true}).click();
  await expect(page.getByText(prompt,{exact:false}).first()).toBeVisible();
  await expect(page.getByText('No reflection or material selected yet',{exact:true})).toBeVisible();
  await page.getByText('Compare my intermediate thesis',{exact:true}).click();
  await expect(page.getByText('An intermediate formulation.',{exact:true})).toBeVisible();
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  expect(saved.initialThesis).toBe(before);expect(saved.reconsideredThesis).toBe(after);expect(saved.thesisReflection).toBe(reflection);
 }
});

test('intellectual provenance separates saved material from interpretation and respects interview permission',async({page})=>{
 const reflection='The Listening Across Generations article helped me think about mutual learning.';
 const notes=[{id:'n1',title:'Listening Across Generations',passage:'Mutual learning develops through conversation.',reflection:'Grandfather and I learn through conversation.'},{id:'n2',title:'Astronomy research',passage:'Stars orbit galaxies.',reflection:'Telescopes measure orbital periods.'}];
 const strands=[{id:'p',type:'interview',permission:false,title:'Private interview',passage:'Mutual learning through conversation.'},{id:'c',type:'course',title:'Course text',passage:'Mutual learning through conversation.'}];
 await seed(page,{...fixture,step:21,firstEncounter:'My grandfather gave advice at Waffle House.',initialThesis:'Grandfather gives advice.',workingThesis:'Grandfather gives advice.',reconsideredThesis:'Mutual learning develops through conversation.',thesisReflection:reflection,notes,strands,connections:[]});
 await page.getByText('How my thinking changed',{exact:true}).click();
 await page.getByText('Where did my insight come from?',{exact:true}).click();
 const panel=page.locator('details').filter({has:page.getByText('Where did my insight come from?',{exact:true})}).last();
 await expect(panel.getByRole('heading',{name:'Listening Across Generations',exact:true})).toBeVisible();
 await expect(panel.getByText('My own saved interpretation',{exact:true})).toBeVisible();
 await expect(panel.getByText('Grandfather and I learn through conversation.',{exact:true})).toBeVisible();
 await expect(panel.getByRole('heading',{name:'Course text',exact:true})).toBeVisible();
 await expect(panel.getByRole('heading',{name:'Private interview',exact:true})).toHaveCount(0);
 await expect(panel.getByRole('heading',{name:'Astronomy research',exact:true})).toHaveCount(0);
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).thesisReflection,KEY)).toBe(reflection);
});
test('intellectual provenance does not invent a connection when evidence is absent',async({page})=>{
 await seed(page,{...fixture,step:21,firstEncounter:'I watered a seedling.',encounter:'I watered a seedling.',initialThesis:'Gardens grow.',workingThesis:'Gardens grow.',reconsideredThesis:'Gardens carry heritage.',thesisReflection:'',notes:[{id:'x',title:'Astronomy research',passage:'Stars orbit galaxies.'}],strands:[],connections:[]});
 await page.getByText('How my thinking changed',{exact:true}).click();
 await page.getByText('Where did my insight come from?',{exact:true}).click();
 await expect(page.getByText('Can you name one particular encounter, reading or conversation',{exact:false})).toBeVisible();
});

test('intellectual agency distinguishes student moves from source reporting and quoted language',async({page})=>{
 const cases=[
 ['According to the study, family conversations transmit wisdom. In my experience, family conversations involved questions from both generations.','A possible application of knowledge'],
 ['According to the study, family conversations transmit wisdom. This does not fully explain the family conversations I observed.','A possible complication'],
 ['According to the study, family conversations transmit wisdom. Taken together, these family conversations and interviews suggest reciprocal learning.','A possible contribution through synthesis'],
 ['According to the study, family conversations transmit wisdom. This raises a question about family conversations and silence.','An inquiry you are opening'],
 ['According to the study, the author argues that this raises a question about family conversations.','Make a place for your response'],
 ['According to the study, “Taken together, these findings matter.”','Make a place for your response'],
 ['My grandfather sat beside me in the diner.','Recognize your own contribution']
 ];
 for(const [draft,label] of cases){
  await seed(page,{...fixture,step:27,essayDraft:draft});
  await page.getByText('More revision tools',{exact:true}).click();
  await page.getByText('Where is my thinking visible?',{exact:true}).click();
  await page.getByText('How am I contributing to this conversation?',{exact:true}).click();
  const panel=page.getByText('How am I contributing to this conversation?',{exact:true}).locator('..');
  await expect(panel.getByRole('heading',{name:label,exact:true})).toBeVisible();
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).essayDraft,KEY)).toBe(draft);
 }
});

test('independent revision is reversible and never marks optional reviews complete',async({page})=>{
 const draft='My grandfather listened to my account. I reconsidered what listening means.';
 await seed(page,{...fixture,step:24,essayDraft:draft,quietRevision:false,independentRevision:false,revisionPasses:{},revisionFinished:false,revisionChecks:{}});
 const quiet=page.getByRole('checkbox',{name:'Quiet revision · show suggestions only when I open them'});
 const independent=page.getByRole('button',{name:'Continue independently to assignment check →',exact:true});
 await expect(independent).toBeHidden();
 await quiet.check();
 await expect(independent).toBeVisible();
 await independent.click();
 await expect(page.getByText('You chose to review independently.',{exact:false})).toBeVisible();
 let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.step).toBe(28);expect(saved.independentRevision).toBe(true);
 expect(saved.revisionPasses).toEqual({});expect(saved.essayDraft).toBe(draft);
 await page.reload();
 await expect(page.getByRole('button',{name:'Return to guided revision',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Return to guided revision',exact:true}).click();
 saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.step).toBe(24);expect(saved.independentRevision).toBe(false);
 expect(saved.essayDraft).toBe(draft);
 await quiet.check();await independent.click();
 await page.getByRole('button',{name:'Save my revision review →',exact:true}).click();
 saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.step).toBe(29);expect(Object.keys(saved.revisionPasses)).toEqual(['completeness']);
 expect(saved.revisionChecks).toEqual({});
 await expect(page.getByText('1 of 5 revision lenses reviewed in the notebook.',{exact:false})).toBeVisible();
});

test('revised inquiry preserves intellectual history without automatically recycling stale directions',async({page})=>{
 const old='How do urban trees provide shade?',question='How does listening shape family relationships?';
 const notes=[{id:'a',question:old,title:'Urban trees and shade',passage:'Urban canopy and shade.',reflection:'Trees provide shade.'},{id:'b',question:old,title:'Family listening and communication',passage:'Family listening and communication.',reflection:'Listening helps family relationships.'}];
 await seed(page,{...fixture,step:5,outcome:'question',question:old,words:['urban trees','shade'],keywords:['light pollution'],search:'urban trees AND shade',nextSearch:'trees AND shade',criticalLens:'Urban ecology',activeNoteId:'a',notes});
 await page.getByLabel('My revised question',{exact:true}).fill(question);
 await page.reload();
 await expect(page.getByLabel('My revised question',{exact:true})).toHaveValue(question);
 await click(page,'Explore my revised question →');
 await page.getByText('My working critical lens (optional)',{exact:true}).click();
 await expect(page.getByText('Your question has changed since you recorded this lens.',{exact:false})).toBeVisible();
 await expect(page.getByLabel('My working lens',{exact:true})).toHaveValue('Urban ecology');
 await expect(page.getByLabel('Search words (you can edit these)',{exact:true})).not.toHaveValue(/urban trees|light pollution/i);
 let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.notes).toEqual(notes);expect(saved.essayDraft).toBe(essay);expect(saved.nextSearch).toBe('');
});

test('guidance orchestration respects related prior decisions without suppressing new writing',async({page})=>{
 await seed(page,{...fixture,step:27,quietRevision:false,independentRevision:false,agencyDecisions:[]});
 const results=await page.evaluate(()=>{
  const a={label:'Make room for your interpretation',question:'What do the sources reveal?',excerpt:'The same paragraph.',context:''};
  const b={label:'Think with another voice',question:'What does the author reveal?',excerpt:'The same paragraph.',context:''};
  const c={label:'A possible complication',question:'What does your evidence complicate?',excerpt:'The same paragraph.',context:''};
  const st={agencyDecisions:agencyRecord({},'braiding',a,'decline')};
  return {
   distinct:orchestrateGuidance(st,'voice',[{priority:90,model:b},{priority:80,model:c}]).label,
   repeat:restraintMode(st,'voice',b).open,
   changed:restraintMode(st,'voice',{...b,excerpt:'A revised paragraph.'}).open,
   quiet:restraintMode({...st,quietRevision:true},'voice',c).open,
   required:restraintMode({...st,quietRevision:true},'completeness',b).open,
   preserved:orchestrateGuidance(st,'braiding',[{priority:90,model:a},{priority:80,model:c}]).label
  };
 });
 expect(results).toEqual({distinct:'A possible complication',repeat:false,changed:true,quiet:false,required:true,preserved:'Make room for your interpretation'});
});

test('research detours from thesis stages return to the exact original stage',async({page})=>{
 for(const step of [16,17]){
  await seed(page,{...fixture,step,thesisStep:step,researchReturn:0,evidencePlan:'Consult family history.',assumptionPlan:'Check my assumptions.',alternativePlan:'Consider another account.'});
  await click(page,'Return to my research');
  await page.reload();
  await click(page,'Return to my writing journey');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  expect(saved.step).toBe(step);expect(saved.researchReturn).toBe(0);
  expect(saved.essayDraft).toBe(essay);expect(saved.notes).toEqual(fixture.notes);
  expect(saved.braidSections).toEqual(fixture.braidSections);expect(saved.evidencePlan).toBe('Consult family history.');
 }
});
test('bibliography carry-forward applies inquiry relevance without replacing later drafts',async({page})=>{
 const question='How does attentive listening shape family relationships?';
 await seed(page,{...fixture,step:34,bibInitialized:true,bibPhase:3,bibReturn:23,bibQuestion:question,bibLens:'Communication studies',bibThesis:'Listening shapes family relationships.',criticalLens:'Place studies',nextSearch:'garden AND memory',bibEntries:[{id:'n1',reference:'Smith (2020).',annotation:'My annotation.',role:'Context',link:'',verified:true}],bibCarry:['n1']});
 page.on('dialog',d=>d.accept());
 await click(page,'Carry my inquiry into the final essay →');
 let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.step).toBe(23);expect(saved.question).toBe(question);expect(saved.nextSearch).toBe('');
 expect(saved.criticalLens).toBe('Communication studies');expect(saved.lensNeedsReview).toBe(false);
 expect(saved.essayDraft).toBe(essay);expect(saved.reconsideredThesis).toBe(fixture.reconsideredThesis);
 expect(saved.bibCarry).toEqual(['n1']);expect(saved.notes).toEqual(fixture.notes);
 await click(page,'Begin drafting my essay →');
 await expect(page.getByText('Compare my bibliography thesis with my current thesis',{exact:true})).toBeVisible();
});

test('revised inquiry cannot revive unrelated fallback words',async({page})=>{
 await seed(page,{...fixture,step:3,question:'Why did this matter to me?',words:['urban trees','shade'],keywords:[],notes:[],search:'urban trees AND shade',inquiryRevised:true});
 await expect(page.getByLabel('Search words (you can edit these)',{exact:true})).toHaveValue('');
});

test('visual hierarchy keeps optional planning and formatting tools collapsed',async({page})=>{
 await seed(page,{...fixture,step:23});
 await expect(page.getByRole('button',{name:'Begin drafting my essay →',exact:true})).toBeVisible();
 const support=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Review my plan and evidence'})}).first();
 await expect(support).not.toHaveAttribute('open','');
 await page.getByText('What remains to explore? (optional)',{exact:true}).click();
 await page.getByLabel('My remaining question or gap',{exact:true}).fill('A question about family memory.');
 await page.reload();
 await page.getByText('What remains to explore? (optional)',{exact:true}).click();
 await expect(page.getByLabel('My remaining question or gap',{exact:true})).toHaveValue('A question about family memory.');
 await seed(page,{...fixture,step:33});
 await expect(page.getByRole('button',{name:'Download my Word document (.docx)',exact:true})).toBeVisible();
 const format=page.getByText('Word document formatting',{exact:true}).locator('..');
 await expect(format).not.toHaveAttribute('open','');
});

test('visual journey and braid reflect saved work without altering it',async({page})=>{
 await seed(page,{...fixture,step:23});
 await page.getByText('My Journey',{exact:true}).click();
 const current=page.locator('.journey-node[aria-current="step"]');
 await expect(current).toContainText('Braiding Map');
 await page.getByText('See my selected strands as a braid',{exact:true}).click();
 await expect(page.locator('.braid-strands')).toContainText('Garden study');
 await expect(page.locator('.braid-center')).toContainText('Garden memory');
 await page.getByLabel('What is this section really about?',{exact:true}).fill('Family belonging');
 await expect(page.locator('.braid-center')).toContainText('Family belonging');
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.essayDraft).toBe(essay);
 expect(saved.notes).toEqual(fixture.notes);
 await seed(page,{...fixture,step:12,storyOne:'My observation',storyTwo:'',storyThree:''});
 await expect(page.locator('.floor-1')).toContainText('Draft recorded');
 await expect(page.locator('.floor-2')).toContainText('Still to explore');
 await expect(page.locator('.floor-3')).toContainText('Still to explore');
});
