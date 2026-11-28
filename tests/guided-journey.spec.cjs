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
