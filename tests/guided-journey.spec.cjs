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
 await page.getByText('Follow my central inquiry',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'Cultural memory, kinship and belonging',exact:true})).toBeVisible();
 await expect(page.getByText('Second set of wording: cultural memory, heritage, displacement, migration',{exact:true})).toBeVisible();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
});

test('conceptual translation offers editable searches and preserves student voice',async({page})=>{
 const question='Why do loud sounds overwhelm me, but walking in the woods helps me notice things?';
 const encounter='I heard loud sounds in the city and felt overwhelmed. Walking in the woods helped me notice the birds.';
 await seed(page,{...fixture,step:3,question,encounter,words:['loud sounds','woods'],keywords:[],history:[],search:''});
 await expect(page.getByText('sensory regulation: How a person manages or responds to sensory input.',{exact:false})).toBeVisible();
 await expect(page.getByText('phenomenology: A philosophical approach to describing and examining lived experience.',{exact:false})).toBeVisible();
 await expect(page.getByLabel('My research question',{exact:true})).toHaveValue(question);
 await page.getByLabel('Search words (you can edit these)',{exact:true}).fill('woods AND sensory regulation');
 await click(page,'Use this search →');
 let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 expect(saved.search).toBe('woods AND sensory regulation');expect(saved.question).toBe(question);expect(saved.encounter).toBe(encounter);
 const draft='Phenomenology helps me describe this walk. I notice the birds.';
 await seed(page,{...fixture,step:27,essayDraft:draft});
 await page.getByText('Make academic language my own',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'phenomenology',exact:true})).toBeVisible();
 await expect(page.getByLabel('My essay draft',{exact:true})).toHaveValue(draft);
});

test('conceptual integration invites interpretation without changing the draft',async({page})=>{
 const draft='Sensory regulation and phenomenology offer perspectives on my walk. I noticed the creek in the woods.';
 await seed(page,{...fixture,step:26,essayDraft:draft});
 await expect(page.getByRole('heading',{name:'Bring two concepts into conversation',exact:true})).toBeVisible();
 await expect(page.getByText('Consider the difference between explaining a sensory response',{exact:false})).toBeVisible();
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
 await expect(page.locator('fieldset').getByText('intergenerational learning: Learning through exchanges',{exact:false})).toBeVisible();
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
