const {test,expect}=require('@playwright/test');
test.use({actionTimeout:10000,navigationTimeout:15000,trace:'retain-on-failure',screenshot:'only-on-failure'});
const url=process.env.NOTEBOOK_URL || 'https://professortemple.github.io/eng112-research-as-encounter/field-notebook-next-preview.html';
for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
test.describe('Notebook '+viewport.width,()=>{
test.use({viewport});
test('search, refinement, discovery and persistence',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));page.on('requestfailed',r=>console.log('REQUEST FAILED:',r.url(),r.failure()?.errorText));console.log('Opening notebook');await page.goto(url,{waitUntil:'domcontentloaded'});console.log('DOM ready',await page.title());
console.log('Opening research');if(await page.locator('#field-workspace').isHidden()){await page.locator('#field-welcome-start').click();}await expect(page.locator('#field-workspace')).toBeVisible();await page.locator('[data-field-space="research"]').click();await page.locator('#field-subnav').getByRole('button',{name:'Build a search',exact:true}).click();console.log('Research tab clicked');
await page.locator('#rs-a').fill('human wildlife interactions');
await page.locator('#rs-b').fill('ecological interdependence');
await page.locator('#rs-build').click();
await expect(page.locator('#rs-query')).toHaveValue('human wildlife interactions');
await page.locator('#rs-save-query').click();
await expect(page.locator('#rs-local-status')).toContainText(/saved/i);
await page.locator('#rs-outcome').selectOption('none');
await expect(page.locator('#rs-refine')).toContainText('No results');
await page.locator('#rs-discovery').fill('agency');
await page.locator('#rs-add').click();
await expect(page.locator('#rs-discovery-status')).toContainText('agency');
const stored=()=>page.evaluate(()=>Object.values(localStorage).some(v=>v.includes('human wildlife interactions')&&v.includes('agency')));
expect(await stored()).toBeTruthy();
await page.reload({waitUntil:'domcontentloaded'});expect(await stored()).toBeTruthy();
expect(errors).toEqual([]);
});
test('custom source and reading evidence',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));page.on('requestfailed',r=>console.log('REQUEST FAILED:',r.url(),r.failure()?.errorText));console.log('Opening notebook');await page.goto(url,{waitUntil:'domcontentloaded'});console.log('DOM ready',await page.title());
console.log('Opening journal');if(await page.locator('#field-workspace').isHidden()){await page.locator('#field-welcome-start').click();}await expect(page.locator('#field-workspace')).toBeVisible();await page.locator('[data-field-space="research"]').click();await page.locator('#field-subnav').getByRole('button',{name:'Reading Journal',exact:true}).click();console.log('Journal tab clicked');
await page.locator('#custom-source-details summary').click();
await page.locator('#custom-title').fill('Synthetic test source');
await page.locator('#custom-creator').fill('Test author');
await page.locator('#custom-url').fill('https://example.com/');
await page.locator('#add-custom-source').click();
const card=page.locator('#source-shelf .shelf-item').filter({hasText:'Synthetic test source'});
await expect(card.locator('a')).toHaveAttribute('href','https://example.com/');
await card.getByRole('button',{name:'Take notes'}).click();
await expect(page.locator('#note-excerpt')).toBeFocused();
await page.locator('#note-locator').fill('p. 12');
await page.locator('#note-excerpt').fill('Synthetic observation for testing only.');
await page.locator('#note-author-idea').fill('A simulated idea.');
await page.locator('#note-connection').fill('A simulated connection.');
console.log('Before note save',await page.locator('#journal-source').inputValue(),await page.locator('#note-excerpt').inputValue());await page.locator('#save-source-note').click();console.log('Note status:',await page.locator('#note-status').textContent());console.log('Storage contains note:',await page.evaluate(()=>Object.values(localStorage).some(v=>v.includes('Synthetic observation'))));
await expect(page.locator('#note-list')).toContainText('Synthetic observation');
await page.reload({waitUntil:'domcontentloaded'});console.log('Opening journal');if(await page.locator('#field-workspace').isHidden()){await page.locator('#field-welcome-start').click();}await expect(page.locator('#field-workspace')).toBeVisible();await page.locator('[data-field-space="research"]').click();await page.locator('#field-subnav').getByRole('button',{name:'Reading Journal',exact:true}).click();console.log('Journal tab clicked');
await expect(page.locator('#note-list')).toContainText('Synthetic observation');
expect(errors).toEqual([]);
});
test('thesis and writing continuity',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="thesis"]').click();
await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
await page.locator('#lts-build').getByRole('button',{name:'1. Observation',exact:true}).click();
await page.locator('#what').fill('I observed fireflies flashing along a road but not near a deer.');
await page.locator('#lts-build').getByRole('button',{name:'Review my observation',exact:true}).click();
await expect(page.locator('.lts-floor-feedback')).not.toBeEmpty();
await page.locator('#lts-build').getByRole('button',{name:'2. Interpretation',exact:true}).click();
await page.locator('#soWhat').fill('The pattern may reflect responsiveness to nearby animals.');
await page.locator('#lts-build').getByRole('button',{name:'3. Significance',exact:true}).click();
await page.locator('#nowWhat').fill('This raises questions about agency in shared environments.');
await page.locator('[data-field-space="write"]').click();
await page.locator('#ws-abstract').fill('A synthetic abstract for browser testing.');
await page.locator('#ws-final-keywords').fill('agency, fireflies, responsiveness');
await page.locator('#ws-essay-rich').fill('I watched fireflies along the road. Their flashing raised questions about agency.');
await page.locator('#ws-review-btn').click();
await expect(page.locator('#ws-essay-review')).not.toBeEmpty();
await page.reload({waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="write"]').click();
await expect(page.locator('#ws-abstract')).toHaveValue('A synthetic abstract for browser testing.');
await expect(page.locator('#ws-final-keywords')).toHaveValue('agency, fireflies, responsiveness');
await expect(page.locator('#ws-essay-rich')).toContainText('I watched fireflies');
await page.locator('[data-field-space="thesis"]').click();
await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
await page.locator('#lts-build').getByRole('button',{name:'1. Observation',exact:true}).click();
await expect(page.locator('#what')).toHaveValue('I observed fireflies flashing along a road but not near a deer.');
expect(errors).toEqual([]);
});
test('pedagogical lenses across diverse inquiries',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="thesis"]').click();
await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
await page.locator('#lts-build').getByRole('button',{name:'1. Observation',exact:true}).click();
const feedback=page.locator('.lts-floor-feedback');
for(const [claim,lens] of [['Fireflies stop flashing near a possible threat.','Threat and perception'],['My grandmother tended the garden throughout my childhood.','Memory and inheritance'],['Weeds are unwanted plants.','Naming and value'],['Silence surrounded me beside the creek.','Attention and absence'],['Ownership gives people control over land.','Power and ownership'],['Reciprocity involves mutual exchange.','Reciprocity']]){
await page.locator('#what').fill(claim);
await page.locator('#lts-build').getByRole('button',{name:'Review my observation',exact:true}).click();
const panel=feedback.locator('details').filter({has:page.locator('summary').filter({hasText:'Beneath the familiar'})});
await expect(panel).toHaveCount(1);
await expect(panel).toContainText(lens);
expect(await panel.locator('strong').count()).toBeLessThanOrEqual(2);
const before=await panel.textContent();
await page.locator('#lts-build').getByRole('button',{name:'Review my observation',exact:true}).click();
await expect(panel).toContainText(lens);
expect(await panel.textContent()).toBe(before);
}
expect(errors).toEqual([]);
});
test('lexicon phrase refinement and export',async({page})=>{
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="research"]').click();
await page.locator('#field-subnav').getByRole('button',{name:'Build a search',exact:true}).click();
const lex=page.locator('#page-search .lex-panel');
await lex.locator('summary').first().click();
await lex.locator('#lex-add-search').fill('materialist theories of subjectivity, being and agency');
await lex.getByRole('button',{name:'Save word',exact:true}).click();
const phrase=lex.locator('details').filter({has:page.locator('summary').filter({hasText:'materialist theories of subjectivity, being and agency'})});
await phrase.locator('summary').click();
await expect(phrase).toContainText('Capacity to act');
await phrase.getByRole('button',{name:'Keep concept: agency',exact:true}).click();
await expect(lex.locator('summary').filter({hasText:/^agency ·/})).toBeVisible();
await page.locator('[data-field-space="write"]').click();
await page.locator('#ws-essay-title').fill('Synthetic firefly inquiry');
await page.locator('#ws-abstract').fill('Synthetic abstract for export.');
await page.locator('#ws-final-keywords').fill('agency, fireflies');
await page.locator('#ws-essay-rich').fill('Synthetic essay paragraph.');
const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=600;const x=c.getContext('2d');const d=x.createImageData(800,600);let seed=123;for(let i=0;i<d.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d.data[i]=seed>>>24;d.data[i+1]=seed>>>16;d.data[i+2]=seed>>>8;d.data[i+3]=255;}x.putImageData(d,0,0);return c.toDataURL('image/png').split(',')[1];});
for(let i=0;i<3;i++){await page.locator('#ws-visual-file-'+i).setInputFiles({name:'synthetic-'+i+'.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await expect(page.locator('#ws-visual-preview-'+i)).toBeVisible();await page.locator('#ws-visual-title-'+i).fill('Synthetic figure '+i);}
const wordPromise=page.waitForEvent('download');
await page.locator('#ws-essay-export').click();
const word=await wordPromise;
expect(word.suggestedFilename()).toMatch(/\.docx$/i);
expect(await word.failure()).toBeNull();
const xml=require('child_process').execFileSync('python3',['-c','import zipfile,sys,xml.etree.ElementTree as E; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; [E.fromstring(z.read(n)) for n in z.namelist() if n.endswith((".xml",".rels"))]; print(z.read("word/document.xml").decode())',await word.path()],{encoding:'utf8'});
for(const term of ['Synthetic firefly inquiry','Abstract','Synthetic abstract for export.','Keywords:','agency, fireflies','Synthetic essay paragraph.','References','w:top="1440"'])expect(xml).toContain(term);

const backupPromise=page.waitForEvent('download');
await page.locator('#page-writing [data-ws-backup]').first().click();
const backup=await backupPromise;
expect(backup.suggestedFilename()).toMatch(/\.json$/i);
const data=JSON.parse(require('fs').readFileSync(await backup.path(),'utf8'));
expect(JSON.stringify(data)).toContain('Synthetic essay paragraph.');expect(data.writing.visuals.filter(v=>v.dataUrl.startsWith('data:image/jpeg;base64,')).length).toBe(3);
expect(JSON.stringify(data)).toContain('materialist theories of subjectivity');
const fresh=await page.context().browser().newContext({viewport:page.viewportSize()});
try{
const restored=await fresh.newPage();
restored.on('dialog',d=>d.accept());
await restored.goto(url,{waitUntil:'domcontentloaded'});
const large={...data,auditPadding:'x'.repeat(1100000)};
await restored.locator('#import-file').setInputFiles({name:'large-synthetic-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(large))});
await expect.poll(async()=>restored.evaluate(()=>Object.values(localStorage).some(v=>v.includes('Synthetic essay paragraph.')))).toBeTruthy();
await restored.waitForLoadState('domcontentloaded');
if(await restored.locator('#field-workspace').isHidden())await restored.locator('#field-welcome-start').click();
await restored.locator('[data-field-space="write"]').click();
await expect(restored.locator('#ws-essay-rich')).toContainText('Synthetic essay paragraph.');
await expect(restored.locator('#ws-final-keywords')).toHaveValue('agency, fireflies');for(let i=0;i<3;i++){await expect(restored.locator('#ws-visual-preview-'+i)).toBeVisible();await expect(restored.locator('#ws-visual-title-'+i)).toHaveValue('Synthetic figure '+i);}
}finally{await fresh.close();}

});
});
}
