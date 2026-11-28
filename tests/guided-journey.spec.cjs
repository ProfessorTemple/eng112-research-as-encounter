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
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGUlEQVR4nGPUiHdkIAUwkaR6VMOohiGlAQCXBQDo6OntngAAAABJRU5ErkJggg==','base64');
 await page.getByLabel('Choose image for Figure 1').setInputFiles({name:'sample.png',mimeType:'image/png',buffer:png});
 await expect(page.getByLabel('Figure title',{exact:true})).toBeVisible();
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
 await click(page,'Start with my own experience');
 await page.getByLabel('My experience',{exact:true}).fill('I watched fireflies near the creek.');
 await click(page,'Discover my words →');
 await expect(page.getByRole('heading',{name:'Discover my words',exact:true})).toBeVisible();
 await click(page,'← Previous page');
 await expect(page.getByLabel('My experience',{exact:true})).toHaveValue('I watched fireflies near the creek.');
 await page.reload();
 await expect(page.getByLabel('My experience',{exact:true})).toHaveValue('I watched fireflies near the creek.');
});
