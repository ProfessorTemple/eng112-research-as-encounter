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
test('interrupted thesis work resumes at the exact floor and returns there after an optional detour',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="thesis"]').click();
 await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
 await page.locator('#lts-build').getByRole('button',{name:'1. Observation',exact:true}).click();
 await page.locator('#what').fill('A particular scene beside the creek.');
 await page.locator('#lts-build').getByRole('button',{name:'3. Significance',exact:true}).click();
 const significance=page.locator('#nowWhat');await significance.fill('My unfinished wider implication.');
 await page.evaluate(()=>sessionStorage.removeItem('eng112-next-preview-workspace-open-v1'));
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#field-welcome-saved')).toContainText('Three-Story Thesis');
 await page.locator('#field-welcome-start').click();
 await expect(significance).toBeVisible();await expect(significance).toBeFocused();
 await expect(significance).toHaveValue('My unfinished wider implication.');
 await page.locator('#field-revisit-earlier').click();await page.locator('#field-return-current').click();
 await expect(significance).toBeFocused();
 await page.locator('#lts-nav').getByRole('button',{name:'Refine',exact:true}).click();
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#lts-refine')).toBeVisible();await expect(page.locator('#lts-build')).toBeHidden();
 await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
 await expect(significance).toBeVisible();await expect(significance).toHaveValue('My unfinished wider implication.');
 expect(errors).toEqual([]);
});
test('a complete student-led inquiry preserves evidence, authorship and reversible thesis handoffs',async({page})=>{
 test.setTimeout(60000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const encounter='As a child I watched the creek carry leaves past the footbridge.';
 const observation='I watched leaves collect at the bend after rain.';
 const response='I had noticed the leaves, but had not considered what changed upstream.';
 const passage='Synthetic reading note for browser testing: water movement connects different places.';
 const interpretation='The accumulation invites a question about how upstream conditions shape what I notice.';
 await page.locator('[data-field-space="discover"]').click();await page.locator('#encounter').fill(encounter);
 await page.locator('[data-field-space="research"]').click();
 const nav=page.locator('#field-subnav');
 await nav.getByRole('button',{name:'Build a search',exact:true}).click();
 await page.locator('#rs-a').fill('water movement');await page.locator('#rs-b').fill('watershed');
 await page.locator('#rs-build').click();await page.locator('#rs-save-query').click();
 await page.locator('#rs-outcome').selectOption('none');await expect(page.locator('#rs-refine')).toContainText('No results');
 await page.locator('[data-field-space="thesis"]').click();
 const thesisNav=page.locator('#lts-nav');
 await thesisNav.getByRole('button',{name:'Build',exact:true}).click();
 await page.locator('#lts-build').getByRole('button',{name:'1. Observation',exact:true}).click();await page.locator('#what').fill(observation);
 await page.locator('#lts-build').getByRole('button',{name:'2. Interpretation',exact:true}).click();
 await page.locator('[data-field-space="research"]').click();await nav.getByRole('button',{name:'Reading Journal',exact:true}).click();
 await page.locator('#custom-source-details summary').click();
 await page.locator('#custom-title').fill('Synthetic watershed reading');
 await page.locator('#custom-creator').fill('Synthetic author');await page.locator('#add-custom-source').click();
 await page.locator('#note-kind').selectOption('paraphrase');await page.locator('#note-locator').fill('p. 12');
 await page.locator('#note-excerpt').fill(passage);await page.locator('#note-author-idea').fill('Different parts of a watershed are connected.');
 await page.locator('#note-connection').fill(response);await page.locator('#save-source-note').click();
 const note=page.locator('#note-list .evidence-card').filter({hasText:'Synthetic watershed reading'});
 await expect(note).toContainText(passage);const id=await note.getAttribute('data-note-id');
 const carried=page.locator('#field-thesis-evidence');
 await note.getByRole('button',{name:'Consider in my thesis',exact:true}).click();
 await expect(carried).toBeVisible();await expect(carried.locator('h3')).toBeFocused();
 await expect(carried).toContainText('Synthetic watershed reading');await expect(carried).toContainText('p. 12');
 await expect(carried).toContainText(passage);await expect(carried).toContainText(response);
 await expect(page.locator('#soWhat')).toBeVisible();await expect(page.locator('#soWhat')).toHaveValue('');
 await expect(page.locator('#what')).toHaveValue(observation);
 await page.locator('#soWhat').fill(interpretation);
 await carried.getByRole('button',{name:'Return to this reading note',exact:true}).click();
 await expect(note).toBeFocused();await expect(note).toHaveAttribute('data-note-id',id);await expect(carried).toBeHidden();
 await note.getByRole('button',{name:'Consider in my thesis',exact:true}).click();
 await carried.getByRole('button',{name:'Set this note aside',exact:true}).click();await expect(carried).toBeHidden();
 await expect(page.locator('#soWhat')).toBeFocused();await expect(page.locator('#soWhat')).toHaveValue(interpretation);
 await page.locator('[data-field-space="discover"]').click();await expect(page.locator('#encounter')).toHaveValue(encounter);
 await page.locator('[data-field-space="write"]').click();
 const essay=page.locator('#ws-essay-rich');await expect(essay).toHaveText('');
 await essay.fill('I return to the bend in the creek with a different question.');
 await page.locator('#ws-draft-aids > summary').click();await page.locator('#ux-note-select').selectOption(id);
 await expect(page.locator('#ux-evidence')).toContainText(response);await expect(essay).toHaveText('I return to the bend in the creek with a different question.');
 await page.reload({waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await expect(essay).toHaveText('I return to the bend in the creek with a different question.');
 await expect(carried).toBeHidden();expect(errors).toEqual([]);
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
const before=await panel.locator('strong').allTextContents();
await page.locator('#lts-build').getByRole('button',{name:'Review my observation',exact:true}).click();
await expect(panel).toContainText(lens);
expect(await panel.locator('strong').allTextContents()).toEqual(before);
}
expect(errors).toEqual([]);
});
test('source synthesis archive and writing companion',async({page})=>{
test.setTimeout(60000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="research"]').click();
await page.locator('#field-subnav').getByRole('button',{name:'Reading Journal',exact:true}).click();
for(const [title,idea] of [['Audit source A','Firefly threat defense'],['Audit source B','Firefly sensory perception'],['Audit source C','Firefly observable response']]){
const details=page.locator('#custom-source-details');if(!(await details.evaluate(e=>e.open)))await details.locator('summary').click();
await page.locator('#custom-title').fill(title);await page.locator('#custom-creator').fill('Synthetic author');await page.locator('#custom-url').fill('https://example.com/');await page.locator('#add-custom-source').click();
await page.locator('#source-shelf .shelf-item').filter({hasText:title}).getByRole('button',{name:'Take notes'}).click();
await page.locator('#note-locator').fill('p. 12');await page.locator('#note-excerpt').fill(idea);await page.locator('#note-author-idea').fill(idea);await page.locator('#note-connection').fill(idea);await page.locator('#save-source-note').click();await expect(page.locator('#note-list')).toContainText(idea);
}
const c=page.locator('#sources-in-conversation');await c.locator('summary').click();
for(const title of ['Audit source A','Audit source B','Audit source C'])await expect(c.locator('#conversation-a option').filter({hasText:title})).toHaveCount(1);
const options=await c.locator('#conversation-a option').evaluateAll(es=>es.filter(e=>e.value).map(e=>({id:e.value,text:e.textContent})));
const id=title=>options.find(o=>o.text.includes(title)).id;
await c.locator('#conversation-a').selectOption(id('Audit source A'));await c.locator('#conversation-b').selectOption(id('Audit source B'));
await expect(c.locator('#conversation-evidence')).toContainText('Firefly sensory perception');
await c.locator('#conversation-relation').selectOption('complicate');await c.locator('#conversation-reflection').fill('Firefly defense and sensory perception may coexist.');await c.locator('#conversation-save').click();
await c.locator('#conversation-b').selectOption(id('Audit source C'));await c.locator('#conversation-reflection').fill('Observable response needs evidence.');await c.locator('#conversation-save').click();
await expect(c.locator('#conversation-archive')).toContainText('Firefly defense and sensory perception may coexist.');
await expect(c.locator('#conversation-archive')).toContainText('Observable response needs evidence.');
await page.reload({waitUntil:'domcontentloaded'});if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
if(!(await c.evaluate(e=>e.open)))await c.locator('summary').click();
await expect(c.locator('#conversation-archive')).toContainText('Observable response needs evidence.');
await page.locator('[data-field-space="write"]').click();
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await companion.getByText('Living Braid · Bring your discoveries into the draft',{exact:true}).click();
await expect(companion).toContainText('Observable response needs evidence.');
await companion.getByText('Attentive Reader · Revisit a passage',{exact:true}).click();
await page.locator('#attentive-passage').fill('Firefly defense and sensory perception may coexist.');
await companion.getByRole('button',{name:'Explore connections',exact:true}).click();
await expect(companion).toContainText('Shared language:');
expect(errors).toEqual([]);
});
test('inquiry working passages survive refresh and reload',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="write"]').click();
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await companion.getByText('Attentive Reader · Revisit a passage',{exact:true}).click();
const passage='The oak remembered me before I remembered myself.';
await page.locator('#attentive-passage').fill(passage);
await companion.getByRole('button',{name:'Save working passages',exact:true}).click();
await companion.getByRole('button',{name:'Refresh my inquiry companion',exact:true}).click();
await expect(page.locator('#attentive-passage')).toHaveValue(passage);
await page.reload({waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="write"]').click();
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await expect(page.locator('#attentive-passage')).toHaveValue(passage);
expect(errors).toEqual([]);
});
test('respect explicit disclosure boundaries without follow-up pressure',async({page})=>{
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="write"]').click();
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await companion.getByText('Review a paragraph without rewriting it',{exact:true}).click();
const input=page.locator('#ic-paragraph');
const result=input.locator('xpath=following-sibling::div[@role="status"][1]');
for(const passage of ['My family has a story, but I do not want to explain it.','I prefer not to share this memory.','We would rather not discuss this experience.']){
 await input.fill(passage);
 await companion.getByRole('button',{name:'Reflect on this paragraph',exact:true}).click();
 await expect(result).toContainText('Respecting a boundary');
 await expect(result).toContainText('Knowledge can remain private');
 await expect(result.locator('details')).toHaveCount(0);
}
await input.fill('I want to explain how my family remembers the creek.');
await companion.getByRole('button',{name:'Reflect on this paragraph',exact:true}).click();
await expect(result).not.toContainText('Respecting a boundary');
});
test('intellectual trail exports and restores across a fresh browser context',async({page,browser})=>{
await page.goto(url,{waitUntil:'domcontentloaded'});
const synthetic='I revised my account of the garden after talking with my aunt.';
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="thesis"]').click();
await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
await page.locator('#lts-build').getByRole('button',{name:'1. Observation',exact:true}).click();
await page.locator('#what').fill('Seeds saved in the garden');
await page.locator('[data-field-space="write"]').click();
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await companion.getByText('Review a paragraph without rewriting it',{exact:true}).click();
await page.locator('#ic-paragraph').fill('The garden holds many memories.');
await companion.getByText('Bring earlier discoveries into this reflection (optional)',{exact:true}).click();
await companion.getByRole('checkbox',{name:'Observation',exact:true}).check();
await companion.getByRole('button',{name:'Reflect on this paragraph',exact:true}).click();
await companion.getByText('Explore a relationship (optional)',{exact:true}).click();
await companion.getByRole('button',{name:'Complicates',exact:true}).click();
await companion.getByText('Keep a discovery in my intellectual trail (optional)',{exact:true}).click();
await page.locator('#ic-trail-entry').fill(synthetic);
await companion.getByRole('button',{name:'Keep this discovery',exact:true}).click();
await expect(companion).toContainText('Discovery saved in this browser');
await companion.getByRole('button',{name:'Refresh my inquiry companion',exact:true}).click();
await expect(companion.locator('details').filter({has:page.locator('summary').filter({hasText:'My living intellectual trail (optional)'})}).last()).toHaveAttribute('open','');
await expect(companion.getByText(synthetic,{exact:true})).toBeVisible();
for(const id of ['abstract','conclusion']){
 const panel=page.locator('#ws-trail-'+id);
 await panel.evaluate(el=>{el.open=true;});
 const choice=panel.locator('select');
 await expect(choice.locator('option')).toHaveCount(2);
 const before=await page.locator('#ws-abstract').inputValue();
 const essayBefore=await page.locator('#ws-essay-body').inputValue();
 await choice.evaluate(el=>{el.value='1';el.dispatchEvent(new Event('change',{bubbles:true}));});
 await expect(panel.locator('[data-trail-preview]')).toHaveText(synthetic);
 await expect(panel.locator('[data-trail-prompt]')).not.toHaveAttribute('hidden','');
 expect(await page.locator('#ws-abstract').inputValue()).toBe(before);
 expect(await page.locator('#ws-essay-body').inputValue()).toBe(essayBefore);
}
await page.locator('[data-field-space="thesis"]').click();
const thesisPanel=page.locator('#tc-trail');
await thesisPanel.evaluate(el=>{el.open=true;});
await expect(thesisPanel.locator('select option')).toHaveCount(2);
const originalThesis=await page.locator('#thesis-draft').inputValue();
await thesisPanel.locator('select').evaluate(el=>{el.value='1';el.dispatchEvent(new Event('change',{bubbles:true}));});
await expect(thesisPanel.locator('#tc-trail-text')).toHaveText(synthetic);
for(const [floor,phrase] of [['observation','previously overlooked'],['interpretation','complicate or challenge'],['significance','why your interpretation matters'],['none','keep your thesis']]){
 await thesisPanel.locator('[data-trail-floor="'+floor+'"]').evaluate(el=>el.click());
 await expect(thesisPanel.locator('#tc-trail-question')).toContainText(phrase);
}
const retainedQuestion=await thesisPanel.locator('#tc-trail-question').textContent();
await page.evaluate(()=>window.dispatchEvent(new Event('field:save')));
await expect(thesisPanel.locator('select')).toHaveValue('1');
await expect(thesisPanel.locator('#tc-trail-question')).toHaveText(retainedQuestion);
expect(await page.locator('#thesis-draft').inputValue()).toBe(originalThesis);
const downloadPromise=page.waitForEvent('download');
await page.locator('#download-txt').evaluate(el=>el.click());
const downloaded=await downloadPromise;
const stream=await downloaded.createReadStream();
const chunks=[];for await(const chunk of stream)chunks.push(chunk);
const journal=Buffer.concat(chunks).toString('utf8');
expect(journal).toContain('MY LIVING INTELLECTUAL TRAIL');
expect(journal).toContain(synthetic);
expect(journal).toContain('Complicates');
const backupPromise=page.waitForEvent('download');
await page.locator('#download-json').evaluate(el=>el.click());
const backup=await backupPromise;
const parts=[];for await(const part of await backup.createReadStream())parts.push(part);
const data=JSON.parse(Buffer.concat(parts).toString('utf8'));
expect(data.intellectualTrail).toHaveLength(1);
const entry=data.intellectualTrail[0];
expect(entry).toMatchObject({text:synthetic,relationship:'Complicates'});
expect(Number.isFinite(Date.parse(entry.created))).toBeTruthy();
const fresh=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:900}});
try{
 const restored=await fresh.newPage();
 restored.on('dialog',d=>d.accept());
 await restored.goto(url,{waitUntil:'domcontentloaded'});
 await restored.locator('#import-file').setInputFiles({name:'notebook-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...data,intellectualTrail:[entry,{text:'',relationship:'Extends'},{text:'oversized'.repeat(300),relationship:'Challenges'},{text:'A valid second discovery',relationship:'Forged',created:'invalid'}]}))});
 await expect.poll(async()=>restored.evaluate(text=>Object.values(localStorage).some(value=>value.includes(text)),synthetic)).toBeTruthy();
 await restored.reload({waitUntil:'domcontentloaded'});
 if(await restored.locator('#field-workspace').isHidden())await restored.locator('#field-welcome-start').click();
 await restored.locator('[data-field-space="write"]').click();
 const restoredCompanion=restored.locator('section[aria-label="My Inquiry Companion"]');
 await restoredCompanion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
 await restoredCompanion.getByText('My living intellectual trail (optional)',{exact:true}).click();
 await expect(restoredCompanion.getByText(synthetic,{exact:true})).toBeVisible();
 await expect(restoredCompanion.getByText('A valid second discovery',{exact:true})).toBeVisible();
 await expect(restoredCompanion.getByText('Forged',{exact:true})).toHaveCount(0);
 await expect(restoredCompanion.getByText('oversized'.repeat(300),{exact:true})).toHaveCount(0);
}finally{await fresh.close();}
});
test('failed backup storage does not announce success or reload',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="thesis"]').click();
 await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
 await page.locator('#lts-build').getByRole('button',{name:'1. Observation',exact:true}).click();
 await page.locator('#what').fill('Original student observation before failed import');
 const previous=await page.locator('#what').inputValue();
 await page.locator('[data-field-space="write"]').click();
 await page.locator('#ws-abstract').fill('Original abstract before failed import.');
 await page.locator('#ws-final-keywords').fill('garden, memory, reciprocity');
 await page.locator('#ws-essay-rich').fill('Original essay before failed import.');
 await page.locator('#ws-review-btn').click();
 await page.locator('#ws-source-ref-0').evaluate(el=>{el.value='Synthetic original source reference';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.locator('#ws-source-annotation-0').evaluate(el=>{el.value='Original research annotation about seed reciprocity.';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.locator('#ws-review-btn').click();
 const storageKey='eng112-living-field-notebook-next-preview-20261123';
 const savedBefore=await page.evaluate(key=>localStorage.getItem(key),storageKey);
 expect(savedBefore).toContain('Original essay before failed import.');
 expect(savedBefore).toContain('Original research annotation about seed reciprocity.');
 const messages=[];
 page.on('dialog',async d=>{messages.push(d.message());await d.accept();});
 await page.evaluate(()=>{
  window.__auditNoReload=true;
  const original=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
   if(this===localStorage&&key==='eng112-living-field-notebook-next-preview-20261123')throw new DOMException('Simulated storage failure','QuotaExceededError');
   return original.call(this,key,value);
  };
 });
 await page.locator('#import-file').setInputFiles({name:'failure-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({fields:{what:'Replacement observation'},writing:{fields:{'ws-abstract':'Replacement abstract','ws-essay-body':'Replacement essay','ws-final-keywords':'replacement'}},followed:[],savedBooks:[],intellectualTrail:[{text:'Synthetic restoration failure test',relationship:'Extends'}]}))});
 await expect.poll(()=>messages.some(m=>m.includes('Unable to restore this backup')&&m.includes('Browser storage could not save'))).toBeTruthy();
 expect(messages.some(m=>m.includes('Your research and writing backup has been restored')||m.includes('Backup restored into the preview'))).toBeFalsy();
 expect(await page.evaluate(()=>window.__auditNoReload)).toBe(true);
 await expect(page.locator('#what')).toHaveValue(previous);
 await expect(page.locator('#ws-abstract')).toHaveValue('Original abstract before failed import.');
 await expect(page.locator('#ws-final-keywords')).toHaveValue('garden, memory, reciprocity');
 await expect(page.locator('#ws-essay-rich')).toContainText('Original essay before failed import.');
 await expect(page.locator('#ws-source-ref-0')).toHaveValue('Synthetic original source reference');
 await expect(page.locator('#ws-source-annotation-0')).toHaveValue('Original research annotation about seed reciprocity.');
 expect(await page.evaluate(key=>localStorage.getItem(key),storageKey)).toBe(savedBefore);
});
test('legacy backup replaces rather than merges projects; invalid and cancelled imports preserve work',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 await page.locator('#ws-abstract').fill('Existing project abstract');
 await page.locator('#ws-essay-rich').fill('Existing project essay');
 await page.locator('#ws-review-btn').click();
 const messages=[];let cancel=false;
 page.on('dialog',async d=>{messages.push(d.message());if(cancel&&d.type()==='confirm')await d.dismiss();else await d.accept();});
 const upload=async data=>page.locator('#import-file').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 const legacy={version:3.2,fields:{what:'Legacy observation'},followed:[],savedBooks:[]};
 cancel=true;await upload(legacy);
 await expect.poll(()=>messages.length).toBeGreaterThan(0);
 await expect(page.locator('#ws-abstract')).toHaveValue('Existing project abstract');
 cancel=false;await upload({fields:{}});
 await expect.poll(()=>messages.some(m=>m.includes('Unable to restore this backup'))).toBeTruthy();
 await expect(page.locator('#ws-essay-rich')).toContainText('Existing project essay');
 await upload(legacy);
 await expect.poll(()=>messages.some(m=>m.includes('Your research and writing backup has been restored'))).toBeTruthy();
 await expect(page.locator('#what')).toHaveValue('Legacy observation');
 await expect(page.locator('#ws-abstract')).toHaveValue('');
 await expect(page.locator('#ws-essay-body')).toHaveValue('');
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#ws-abstract')).toHaveValue('');
 await expect(page.locator('#what')).toHaveValue('Legacy observation');
});
test('inquiry companion disclosure supports keyboard activation',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 const companion=page.locator('section[aria-label="My Inquiry Companion"]');
 const summary=companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true});
 await summary.focus();
 await expect(summary).toBeFocused();
 await page.keyboard.press('Enter');
 const paragraph=companion.getByText('Review a paragraph without rewriting it',{exact:true});
 await expect(paragraph).toBeVisible();
 await paragraph.focus();
 await page.keyboard.press('Space');
 await expect(page.locator('#ic-paragraph')).toBeVisible();
 await page.locator('#ic-paragraph').focus();
 await page.keyboard.type('The garden holds many memories.');
 const reflect=companion.getByRole('button',{name:'Reflect on this paragraph',exact:true});
 await reflect.focus();
 await page.keyboard.press('Enter');
 const result=page.locator('#ic-paragraph').locator('xpath=following-sibling::div[@role="status"][1]');
 await expect(result).not.toBeEmpty();
 await expect(reflect).toBeFocused();
});
test('student can stop guidance even when an intellectual movement is recognized',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 const companion=page.locator('section[aria-label="My Inquiry Companion"]');
 await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
 await companion.getByText('Review a paragraph without rewriting it',{exact:true}).click();
 const input=page.locator('#ic-paragraph');
 const result=input.locator('xpath=following-sibling::div[@role="status"][1]');
 const reflect=companion.getByRole('button',{name:'Reflect on this paragraph',exact:true});
 const passage='I used to think my grandmother owned her garden. Now I wonder whether the garden owned a part of her.';
 await input.fill(passage);
 await reflect.click();
 await expect(result).toContainText('Reconsidering an earlier view');
 const release=companion.getByRole('button',{name:'I am ready to continue',exact:true});
 await release.focus();await page.keyboard.press('Enter');
 await expect(release).toBeFocused();
 await expect(result.locator('h4')).toHaveText('Continue in your own direction');
 await expect(result.locator('details')).toHaveCount(0);
 await companion.getByRole('button',{name:'Refresh my inquiry companion',exact:true}).click();
 await expect(result.locator('h4')).toHaveText('Continue in your own direction');
 await result.getByRole('button',{name:'Explore another direction',exact:true}).click();
 await expect(reflect).toBeFocused();
 await expect(result).toContainText('Reconsidering an earlier view');
 const boundary=companion.getByRole('button',{name:'A boundary on what I can share',exact:true});
 await boundary.click();
 await expect(result.locator('h4')).toHaveText('Respect your boundary');
 await expect(result).toContainText('does not erase saved notebook material');
 await expect(result.locator('details')).toHaveCount(0);
 await expect(input).toHaveValue(passage);
 await input.fill('A line of ants crossed the pavement.');
 await reflect.click();
 await expect(result.locator('h4').first()).toHaveText('A question to explore');
});
test('intellectual trail can be used without paragraph review or selected notes',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 const companion=page.locator('section[aria-label="My Inquiry Companion"]');
 await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
 await companion.getByText('My living intellectual trail (optional)',{exact:true}).click();
 const entry=page.locator('#ic-trail-entry'),relation=page.locator('#ic-trail-relationship');
 const text='I noticed that the same path connects one habitat and divides another.';
 await entry.fill(text);await relation.selectOption('Complicates');
 await companion.getByRole('button',{name:'Refresh my inquiry companion',exact:true}).click();
 await expect(entry).toHaveValue(text);await expect(relation).toHaveValue('Complicates');
 await companion.getByRole('button',{name:'Keep this discovery',exact:true}).click();
 await expect(entry).toHaveValue('');await expect(relation).toHaveValue('');
 await expect(companion.getByText(text,{exact:true})).toBeVisible();
 await expect(companion.getByText('Discovery saved in this browser.',{exact:true})).toBeVisible();
 await expect(page.locator('#ic-paragraph')).toHaveValue('');
 await companion.getByRole('button',{name:'Remove discovery 1',exact:true}).click();
 await expect(companion.getByText(text,{exact:true})).toHaveCount(0);
 await expect(companion.getByRole('button',{name:'Keep this discovery',exact:true})).toBeFocused();
});
test('selected context and relational reflection remain student directed',async({page})=>{
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="thesis"]').click();
await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
for(const [name,id,value] of [['1. Observation','what','Audit observation of seeds'],['2. Interpretation','soWhat','Audit interpretation of gifts'],['3. Significance','nowWhat','Audit significance of reciprocity']]){
 await page.locator('#lts-build').getByRole('button',{name,exact:true}).click();
 await page.locator('#'+id).fill(value);
}
await page.locator('[data-field-space="write"]').click();
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await companion.getByText('Review a paragraph without rewriting it',{exact:true}).click();
const input=page.locator('#ic-paragraph');
const result=input.locator('xpath=following-sibling::div[@role="status"][1]');
await input.fill('The garden holds many memories.');
await companion.getByText('Bring earlier discoveries into this reflection (optional)',{exact:true}).click();
const panel=companion.locator('details').filter({has:page.locator('summary').filter({hasText:'Bring earlier discoveries into this reflection (optional)'})}).last();
const observation=panel.getByRole('checkbox',{name:'Observation',exact:true});
await expect(observation).not.toBeChecked();
await observation.check();
await panel.getByRole('checkbox',{name:'Interpretation',exact:true}).check();
await companion.getByRole('button',{name:'Reflect on this paragraph',exact:true}).click();
await expect(result).toContainText('Audit observation of seeds');
await expect(result).not.toContainText('Audit significance of reciprocity');
const thesisLink=result.locator('details').filter({has:page.locator('summary').filter({hasText:'Does this discovery change my thesis? (optional)'})}).last();
await expect(thesisLink).not.toHaveAttribute('open','');
await thesisLink.locator('summary').click();
for(const [name,value,phrase] of [['Observation','Audit observation of seeds','notice differently'],['Interpretation','Audit interpretation of gifts','would you reconsider'],['Significance','Audit significance of reciprocity','why this matters'],['No change needed','','keep your current thesis']]){
 await thesisLink.getByRole('button',{name,exact:true}).click();
 await expect(thesisLink.locator('[role="status"]')).toContainText(phrase);
 if(value)await expect(thesisLink.locator('[role="status"]')).toContainText(value);
}
for(const [id,value] of [['what','Audit observation of seeds'],['soWhat','Audit interpretation of gifts'],['nowWhat','Audit significance of reciprocity']])await expect(page.locator('#'+id)).toHaveValue(value);
await thesisLink.locator('summary').click();
await result.getByText('Explore a relationship (optional)',{exact:true}).click();
for(const [name,phrase] of [['Extends','new dimension'],['Complicates','qualification or tension'],['Challenges','earlier assumption'],['Transforms','understanding changed'],['Connects','specific detail links'],['Does not belong','leave this discovery out']]){
 await result.getByRole('button',{name,exact:true}).click();
 await expect(result).toContainText(phrase);
}
await companion.getByRole('button',{name:'Refresh my inquiry companion',exact:true}).click();
await expect(observation).toBeChecked();
await expect(result).toContainText('leave this discovery out');
await result.getByText('Keep a discovery in my intellectual trail (optional)',{exact:true}).click();
const trailText='Audit discovery: seed saving can sustain relationships.';
await companion.getByRole('button',{name:'Keep this discovery',exact:true}).click();
await expect(companion).toContainText('Write your own reflection first.');
await page.locator('#ic-trail-entry').fill(trailText);
await companion.getByRole('button',{name:'Keep this discovery',exact:true}).click();
await expect(companion).toContainText('Discovery saved in this browser');
await companion.getByRole('button',{name:'Refresh my inquiry companion',exact:true}).click();
await expect(companion.locator('details').filter({has:page.locator('summary').filter({hasText:'My living intellectual trail (optional)'})}).last()).toHaveAttribute('open','');
await expect(companion.getByText(trailText,{exact:true})).toBeVisible();
await observation.uncheck();
await expect(result).toBeEmpty();
await input.fill('I prefer not to share this memory.');
await companion.getByRole('button',{name:'Reflect on this paragraph',exact:true}).click();
await expect(result).toContainText('Respecting a boundary');
await expect(result).not.toContainText('Audit interpretation of gifts');
await expect(result.getByText('Does this discovery change my thesis? (optional)',{exact:true})).toHaveCount(0);
await page.reload({waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="write"]').click();
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await companion.getByText('My living intellectual trail (optional)',{exact:true}).click();
await expect(companion.getByText(trailText,{exact:true})).toBeVisible();
await companion.getByRole('button',{name:'Remove discovery 1',exact:true}).click();
await expect(companion.getByText(trailText,{exact:true})).toHaveCount(0);
await page.reload({waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="write"]').click();
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await expect(companion.getByText(trailText,{exact:true})).toHaveCount(0);

});
test('unfinished trail is durable but never a saved discovery until chosen',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
async function openTrail(){
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 const outer=companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true});
 if(!(await outer.evaluate(e=>e.parentElement.open)))await outer.click();
 const history=companion.getByText('My living intellectual trail (optional)',{exact:true});
 if(!(await history.evaluate(e=>e.parentElement.open)))await history.click();
}
const reflection='Synthetic unfinished reflection about the creek.';
const input=page.locator('#ic-trail-entry'),relation=page.locator('#ic-trail-relationship');
const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('eng112-living-field-notebook-next-preview-20261123')||'{}'));
await page.goto(url,{waitUntil:'domcontentloaded'});await openTrail();
await input.fill(reflection);await relation.selectOption('Complicates');
expect((await stored()).inquiryWorkingDrafts.trail).toBe(reflection);
expect((await stored()).intellectualTrail||[]).toHaveLength(0);
await companion.getByRole('button',{name:'Refresh my inquiry companion',exact:true}).click();
await expect(input).toHaveValue(reflection);await expect(relation).toHaveValue('Complicates');
await page.reload({waitUntil:'domcontentloaded'});await openTrail();
await expect(input).toHaveValue(reflection);await expect(relation).toHaveValue('Complicates');
await companion.getByRole('button',{name:'Keep this discovery',exact:true}).click();
await expect(input).toHaveValue('');await expect(relation).toHaveValue('');
let data=await stored();expect(data.intellectualTrail).toHaveLength(1);expect(data.intellectualTrail[0].text).toBe(reflection);expect(data.inquiryWorkingDrafts.trail).toBe('');
await page.reload({waitUntil:'domcontentloaded'});await openTrail();
await expect(input).toHaveValue('');await expect(relation).toHaveValue('');
await expect(companion.getByText(reflection,{exact:true})).toHaveCount(1);
await input.fill('Synthetic draft from the current project');
const imported='Synthetic draft from the restored project';
await page.locator('#import-file').setInputFiles({name:'restored-project.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...data,intellectualTrail:[],inquiryWorkingDrafts:{trail:imported,trailRelationship:'Connects'}}))});
await expect.poll(async()=>(await stored()).inquiryWorkingDrafts?.trail).toBe(imported);
await openTrail();await expect(input).toHaveValue(imported);await expect(relation).toHaveValue('Connects');
await expect(companion.getByText(reflection,{exact:true})).toHaveCount(0);
await input.fill('');await relation.selectOption('');
await page.reload({waitUntil:'domcontentloaded'});await openTrail();
await expect(input).toHaveValue('');await expect(relation).toHaveValue('');
expect((await stored()).intellectualTrail||[]).toHaveLength(0);
expect(errors).toEqual([]);
});
test('explicit intention is respected and optional depth follows the primary question',async({page})=>{
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="write"]').click();
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await companion.getByText('Review a paragraph without rewriting it',{exact:true}).click();
const input=page.locator('#ic-paragraph'),result=input.locator('xpath=following-sibling::div[@role="status"][1]');
const reflect=companion.getByRole('button',{name:'Reflect on this paragraph',exact:true});
for(const [passage,heading] of [
 ['I have permission to describe the interview but not to reproduce her words.','Reflection focus: Respecting a boundary'],
 ['My next step is to verify the location of the nesting site.','Continue in your own direction'],
 ['I use this as a metaphor, not a literal description of the river.','Room for figurative language']
]){
 await input.fill(passage);await reflect.click();
 await expect(result.locator('h4')).toHaveText(heading);
 await expect(result.locator('details')).toHaveCount(0);
 await expect(result.locator(':scope > p')).toHaveCount(1);
 await expect(input).toHaveValue(passage);
}
for(const passage of [
 'The author writes, "I do not want to disclose the source." I am investigating the history of the creek.',
 "The interviewee said, 'My next step is to compare the maps.' I watched the creek.",
 'The author writes, “I cannot tell whether the soil is recovering or changing.” My notes concern another field.'
]){
 await input.fill(passage);await reflect.click();
 await expect(result.locator('h4').first()).toHaveText('A question to explore');
 await expect(result.locator(':scope > p')).toHaveCount(1);
 await expect(result.getByRole('button',{name:'Return to my essay',exact:true})).toBeVisible();
 expect(await result.evaluate(e=>{const b=[...e.children].find(n=>n.tagName==='BUTTON'&&n.textContent==='Return to my essay');return !!b&&[...e.children].indexOf(b)<[...e.children].findIndex(n=>n.tagName==='DETAILS');})).toBeTruthy();
 await expect(result.locator('details[open]')).toHaveCount(0);
 await expect(input).toHaveValue(passage);
}
});
test('a full writing session keeps the draft central and returns from reflection and research',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="research"]').click();
await page.locator('#field-subnav').getByRole('button',{name:'Reading Journal',exact:true}).click();
await page.locator('[data-field-space="write"]').click();
const editor=page.locator('#ws-essay-rich'),draft='The creek was quiet. I began to notice the birds.';
await expect(page.locator('#ws-draft-aids')).not.toHaveAttribute('open','');
expect(await page.evaluate(()=>!!(document.getElementById('ws-essay-rich').compareDocumentPosition(document.getElementById('ws-abstract'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBeTruthy();
await editor.fill(draft);
await editor.evaluate(e=>{e.focus();const r=document.createRange();r.selectNodeContents(e);const s=window.getSelection();s.removeAllRanges();s.addRange(r);});
await expect.poll(()=>page.evaluate(()=>window.getSelection().toString())).toBe(draft);
await page.locator('#ws-reflect-selected').click();
const input=page.locator('#ic-paragraph');await expect(input).toHaveValue(draft);await expect(input).toBeFocused();
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
await companion.getByRole('button',{name:'Reflect on this paragraph',exact:true}).click();
await companion.getByRole('button',{name:'Return to my essay',exact:true}).click();
await expect(editor).toBeFocused();await expect(editor).toHaveText(draft);
expect(await page.evaluate(()=>window.getSelection().isCollapsed)).toBeTruthy();
await page.locator('[data-field-space="research"]').click();
await expect(page.locator('#page-journal')).toBeVisible();
await page.locator('#field-resume-draft').click();await expect(editor).toBeFocused();await expect(editor).toHaveText(draft);
await page.locator('#ws-draft-aids summary').first().click();
await expect(page.locator('#ux-note-select')).toBeVisible();
await page.locator('#ws-draft-aids').getByRole('button',{name:'Return to my essay',exact:true}).click();
await expect(editor).toBeFocused();
await page.keyboard.type(' The current carried leaves.');
await expect(editor).toHaveText(draft+' The current carried leaves.');
await page.reload({waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await expect(editor).toBeVisible();await expect(editor).toHaveText(draft+' The current carried leaves.');
await page.locator('[data-field-space="research"]').click();await expect(page.locator('#page-journal')).toBeVisible();
await page.locator('#field-resume-draft').click();await expect(editor).toBeFocused();
expect(errors).toEqual([]);
});
test('the active writing space precedes optional earlier work and assignment help',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 const editor=page.locator('#ws-essay-rich'),support=page.locator('#field-earlier-work');
 await expect(editor).toBeVisible();
 expect(await page.evaluate(()=>!!(document.getElementById('page-writing').compareDocumentPosition(document.getElementById('field-earlier-work'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBeTruthy();
 await expect(support.locator('#living-inquiry-portrait')).not.toHaveAttribute('open','');
 await expect(support.locator('#sources-in-conversation')).not.toHaveAttribute('open','');
 const requirements=page.locator('#ws-assignment-requirements');
 await expect(requirements).not.toHaveAttribute('open','');
 await requirements.locator('summary').click();await expect(requirements).toContainText('three outside sources');await expect(requirements).toContainText('two community interviews');
 await requirements.locator('summary').click();
 await editor.fill('My own draft is the center of this writing session.');
 await page.locator('#field-revisit-earlier').click();await expect(page.locator('#field-earlier-title')).toBeFocused();
 await support.locator('#living-inquiry-portrait > summary').click();await expect(support.locator('#portrait-compare-thinking')).toBeVisible();
 await page.locator('#field-resume-draft').click();await expect(editor).toBeFocused();await expect(editor).toHaveText('My own draft is the center of this writing session.');
});
test('navigation offers only relevant destinations and does not redirect a writing session',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const nav=page.locator('#field-subnav'),next=page.locator('#field-next-invitation'),resume=page.locator('#field-resume-draft');
 await expect(page.locator('.ws-mobile-jumps')).toHaveCount(0);
 await page.locator('[data-field-space="discover"]').click();await expect(nav).toBeVisible();await expect(nav.locator('button')).toHaveCount(2);
 await page.locator('[data-field-space="research"]').click();await expect(nav).toBeVisible();await expect(nav.locator('button')).toHaveCount(4);
 await nav.getByRole('button',{name:'Annotated bibliography',exact:true}).click();await expect(next).toBeVisible();await expect(next.locator('button')).toContainText('Begin or continue my essay');
 await next.locator('button').click();await expect(page.locator('#page-writing')).toBeVisible();await expect(nav).toBeHidden();await expect(next).toBeHidden();await expect(resume).toHaveText('Start my draft');
 await resume.click();const editor=page.locator('#ws-essay-rich');await expect(editor).toBeFocused();await editor.fill('I can write without an optional prompt.');await expect(resume).toHaveText('Return to my draft');await expect(next).toBeHidden();
 await page.locator('[data-field-space="thesis"]').click();await expect(nav).toBeHidden();await expect(next).toBeVisible();
 await resume.click();await expect(editor).toBeFocused();await expect(editor).toHaveText('I can write without an optional prompt.');await expect(next).toBeHidden();
});
test('welcome and writing support stay quiet until deliberately requested',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 const entry=page.locator('#ux-entry-choices');
 if(!(await page.locator('#field-welcome').isHidden())){
  await expect(entry).not.toHaveAttribute('open','');await expect(entry.locator('#ux-entry button').first()).toBeHidden();
  await entry.locator(':scope > summary').click();await expect(entry.locator('#ux-entry button')).toHaveCount(5);
  await entry.locator(':scope > summary').click();
  await page.locator('#field-welcome-start').click();
 }
 await page.locator('[data-field-space="discover"]').click();
 const help=page.locator('#ux-start-help'),opt=page.locator('#enable-pause-invitations'),pause=page.locator('#pause-invitation'),question=page.locator('#nudge-question');
 await help.locator(':scope > summary').click();await expect(opt).not.toBeChecked();
 // Trigger only the existing 20-second pause callback promptly in this synthetic test.
 await page.evaluate(()=>{const original=window.setTimeout;window.setTimeout=(fn,ms,...args)=>original(fn,ms===20000?20:ms,...args);});
 const encounter=page.locator('#encounter');await encounter.fill('I watched the creek after the rain and noticed small changes in the current.');
 await page.waitForTimeout(120);await expect(pause).toBeHidden();
 await opt.check();await encounter.fill('I watched the creek after the rain and noticed small changes in the current today.');
 await expect(pause).toBeVisible();
 await pause.getByRole('button',{name:'Not now',exact:true}).click();await opt.uncheck();await expect(pause).toBeHidden();
 await page.locator('#ask-question-now').click();await expect(question).toBeVisible();
 await page.locator('#dismiss-nudge').click();await expect(encounter).toBeFocused();
 await page.locator('[data-field-space="write"]').click();const context=page.locator('#field-context-help');
 await expect(context).not.toHaveAttribute('open','');await expect(page.locator('#ux-context')).toBeHidden();
 await expect(page.locator('#page-writing #field-context-help')).toBeVisible();await context.locator(':scope > summary').click();
 await expect(context).toContainText('Synthesis means bringing your experience and sources into conversation');
 await page.locator('#field-resume-draft').click();await expect(page.locator('#ws-essay-rich')).toBeFocused();
});
test('activity-specific help stays optional and moves with the student without changing their words',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const help=page.locator('#field-context-help');
 await expect(help).toBeHidden();await expect(page.locator('#ux-start-help')).toBeVisible();
 const freewrite=page.locator('#encounter');await freewrite.fill('A synthetic observation of changing water.');
 await page.locator('[data-field-space="research"]').click();
 const nav=page.locator('#field-subnav');
 const summary=help.locator(':scope > summary');
 for(const [label,id,question,phrase] of [
 ['Build a search','search','Need help finding useful search terms?','Explore alternative searches'],
 ['Find sources','read','Not sure how to choose a source?','locate the full text'],
 ['Reading Journal','journal','Not sure what to do with a passage?','A PDF on your shelf'],
 ['Annotated bibliography','biblio','Not sure what belongs in an annotation?','Begin with one source']
 ]){
  await nav.getByRole('button',{name:label,exact:true}).click();
  await expect(page.locator('#page-'+id+' #field-context-help')).toBeVisible();
  await expect(help).not.toHaveAttribute('open','');await expect(summary).toHaveText(question);
  await summary.click();await expect(help).toContainText(phrase);
 }
 await page.locator('[data-field-space="thesis"]').click();
 await expect(page.locator('#page-return #field-context-help')).toBeVisible();
 await expect(help).not.toHaveAttribute('open','');await expect(summary).toHaveText('Need help developing your thesis?');
 await page.locator('[data-field-space="write"]').click();
 await expect(page.locator('#page-writing #field-context-help')).toBeVisible();
 await expect(help).not.toHaveAttribute('open','');await summary.click();
 await expect(help).toContainText('Reflect on a passage');
 const editor=page.locator('#ws-essay-rich');await editor.fill('My independent draft.');
 await page.locator('[data-field-space="discover"]').click();await expect(freewrite).toHaveValue('A synthetic observation of changing water.');
 await expect(help).toBeHidden();await expect(help).not.toHaveAttribute('open','');
 await page.locator('[data-field-space="write"]').click();await expect(editor).toHaveText('My independent draft.');
 await expect(help).not.toHaveAttribute('open','');await expect(help).toHaveCount(1);
 expect(errors).toEqual([]);
});
test('optional earlier work is a reversible detour and a resumed notebook identifies the activity',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 const draft=page.locator('#ws-essay-rich');
 await draft.fill('A synthetic paragraph that belongs to the student.');
 await page.locator('#field-revisit-earlier').click();
 await expect(page.locator('#field-earlier-title')).toBeFocused();
 await page.locator('#field-return-current').click();
 await expect(draft).toBeFocused();
 await expect(draft).toHaveText('A synthetic paragraph that belongs to the student.');
 await page.evaluate(()=>sessionStorage.removeItem('eng112-next-preview-workspace-open-v1'));
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#field-welcome-start')).toHaveText('Continue my notebook');
 await expect(page.locator('#field-welcome-saved')).toContainText('Return to Essay draft');
 await page.locator('#field-welcome-start').click();
 await expect(draft).toBeFocused();
 await expect(draft).toHaveText('A synthetic paragraph that belongs to the student.');
 await page.locator('[data-field-space="research"]').click();
 await page.locator('#field-subnav').getByRole('button',{name:'Build a search',exact:true}).click();
 await page.locator('#field-revisit-earlier').click();
 await page.locator('#field-return-current').click();
 await expect(page.locator('#page-search h2').first()).toBeFocused();
 await expect(page.locator('#page-search')).toBeVisible();
 expect(errors).toEqual([]);
});
test('keyboard access and quiet status feedback support uninterrupted writing',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(url,{waitUntil:'domcontentloaded'});
 const skip=page.locator('#skip-current-activity');
 if(!(await page.locator('#field-welcome').isHidden())){
  await skip.focus();await page.keyboard.press('Enter');await expect(page.locator('#field-welcome-start')).toBeFocused();
  await page.keyboard.press('Enter');
 }
 await page.locator('[data-field-space="discover"]').click();
 await skip.focus();await page.keyboard.press('Enter');await expect(page.locator('#page-begin h2').first()).toBeFocused();
 const encounter=page.locator('#encounter'),status=page.locator('#save-status');
 await expect(page.locator('#studio-meter')).not.toHaveAttribute('aria-live','polite');
 await expect(encounter).toHaveAttribute('aria-describedby','encounter-help');
 await encounter.fill('I noticed the creek.');
 await expect(status).toContainText('Saved in this browser');
 await page.evaluate(()=>{window.__saveMutations=0;new MutationObserver(()=>window.__saveMutations++).observe(document.getElementById('save-status'),{childList:true,characterData:true,subtree:true});});
 await encounter.fill('I noticed the creek and listened for the water.');
 await expect(page.locator('#word-counter')).toHaveText('9 words');
 expect(await page.evaluate(()=>window.__saveMutations)).toBe(0);
 await page.locator('[data-field-space="write"]').click();await skip.focus();await page.keyboard.press('Enter');await expect(page.locator('#page-writing h2').first()).toBeFocused();
 await page.locator('#field-resume-draft').click();await expect(page.locator('#ws-essay-rich')).toBeFocused();
 await page.setViewportSize({width:320,height:760});
 await page.locator('#ws-essay-rich').fill('My writing stays within the available space.');
 const geometry=await page.evaluate(()=>{const el=document.getElementById('ws-essay-rich'),r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:document.documentElement.clientWidth};});
 expect(geometry.left).toBeGreaterThanOrEqual(0);expect(geometry.right).toBeLessThanOrEqual(geometry.width+1);
 await expect(page.locator('#ws-essay-rich')).toHaveText('My writing stays within the available space.');
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
 await page.locator('#ws-bold').focus();
 expect(await page.locator('#ws-bold').evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
});
test('draft essentials stay visible and failed version saves never claim success or overwrite writing',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 const editor=page.locator('#ws-essay-rich'),status=page.locator('#ws-version-status'),quick=page.locator('.ws-lens-callout'),versions=page.locator('#ws-version-select');
 await expect(quick).not.toHaveAttribute('open','');await expect(page.locator('#ws-essay-count')).toBeVisible();
 expect(await page.evaluate(()=>!!(document.getElementById('ws-essay-count').compareDocumentPosition(document.getElementById('ws-draft-aids'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBeTruthy();
 await editor.fill('An earlier version of my own writing.');
 await page.locator('#ws-snapshot').click();await expect(status).toContainText('A version of your writing is saved');
 await expect(quick).not.toHaveAttribute('open','');await expect(versions.locator('option')).toHaveCount(2);
 await editor.fill('My current writing should remain intact.');
 await quick.locator('summary').click();await quick.getByRole('button',{name:'Return to the scene',exact:true}).click();
 await expect(status).toContainText('A version of your writing is saved');
 const key='eng112-living-field-notebook-next-preview-20261123';
 const before=await page.evaluate(k=>localStorage.getItem(k),key);
 await page.evaluate(k=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(this===localStorage&&name===k)throw new DOMException('Simulated storage failure','QuotaExceededError');return original.call(this,name,value);};},key);
 await page.locator('#ws-snapshot').click();await expect(status).toContainText('A version could not be saved');
 await expect(versions.locator('option')).toHaveCount(2);
 await versions.selectOption('0');await page.locator('#ws-restore-version').click();
 await expect(status).toContainText('A version could not be saved');await expect(editor).toHaveText('My current writing should remain intact.');
 expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(before);expect(errors).toEqual([]);
});
test('returning student may pick up a thread or continue without it',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const thread=page.locator('#field-resume-thread'),portrait=page.locator('#living-inquiry-portrait'),choice=page.locator('#field-resume-thread-choice');
 const threadText=thread.locator('.field-resume-thread-text'),question='What changes when I listen before interpreting the creek?';
 await expect(thread).toBeHidden();
 await portrait.locator(':scope > summary').click();await portrait.locator('#portrait-question').fill(question);await portrait.locator('#portrait-save').click();
 await expect(thread.locator('summary')).toBeVisible();await expect(thread).not.toHaveAttribute('open','');await expect(threadText).toBeEmpty();
 await thread.locator('summary').click();await expect(threadText).toHaveText(question);
 await thread.getByRole('button',{name:'Continue without this',exact:true}).click();await expect(thread).not.toHaveAttribute('open','');await expect(threadText).toBeEmpty();
 await expect(thread.locator('summary')).toBeFocused();
 await page.locator('[data-field-space="write"]').click();
 const editor=page.locator('#ws-essay-rich');await editor.fill('My synthetic draft.');
 const companion=page.locator('section[aria-label="My Inquiry Companion"]');
 await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
 await companion.getByText('My living intellectual trail (optional)',{exact:true}).click();
 const entry=page.locator('#ic-trail-entry');await entry.fill('An unfinished reflection about a bird.');
 await page.reload({waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await expect(thread).not.toHaveAttribute('open','');await expect(threadText).toBeEmpty();
 await thread.locator('summary').click();await expect(threadText).toHaveText(question);
 await choice.selectOption('unfinished');await expect(threadText).toHaveText('An unfinished reflection about a bird.');
 await thread.getByRole('button',{name:'Revisit in my notebook',exact:true}).click();await expect(entry).toBeFocused();await expect(entry).toHaveValue('An unfinished reflection about a bird.');
 await companion.getByRole('button',{name:'Keep this discovery',exact:true}).click();
 await thread.locator('summary').click();await choice.selectOption('discovery');await expect(threadText).toHaveText('An unfinished reflection about a bird.');
 await thread.getByRole('button',{name:'Revisit in my notebook',exact:true}).click();
 await expect(page.locator('#ic-trail-history')).toBeFocused();
 if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
 await portrait.locator('#portrait-status').selectOption('aside');await portrait.locator('#portrait-save').click();
 await thread.locator('summary').click();await expect(choice.locator('option[value="question"]')).toHaveCount(0);
 await expect(threadText).not.toHaveText(question);await expect(editor).toHaveText('My synthetic draft.');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('eng112-living-field-notebook-next-preview-20261123')));
 await page.locator('#import-file').setInputFiles({name:'other-notebook.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...stored,inquiryPortrait:{question:'A different notebook question',status:'exploring'},inquiryWorkingDrafts:{},intellectualTrail:[]}))});
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('eng112-living-field-notebook-next-preview-20261123')).inquiryPortrait.question)).toBe('A different notebook question');
 await expect(thread).not.toHaveAttribute('open','');await expect(threadText).toBeEmpty();
 await thread.locator('summary').click();await expect(threadText).toHaveText('A different notebook question');
 await thread.getByRole('button',{name:'Revisit in my notebook',exact:true}).click();await expect(portrait.locator('#portrait-question')).toBeFocused();await expect(portrait.locator('#portrait-question')).toHaveValue('A different notebook question');
 expect(errors).toEqual([]);
});
test('developmental comparison is voluntary, read-only, and grounded in student records',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const key='eng112-living-field-notebook-next-preview-20261123';
 const stored=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),key);
 const initial=await stored();
 const earlier='I assumed that a quiet creek meant nothing was happening.';
 const later='The quiet creek raised a question about my own ability to notice.';
 const data={...initial,fields:{...initial.fields,assumption:earlier,'thesis-draft':later},thesisVersions:[{story2:earlier,savedAt:'2026-11-20T12:00:00Z'}],intellectualTrail:[{text:'I noticed a heron beside the bank.',relationship:'Complicates',created:'2026-11-25T12:00:00Z'}],inquiryWorkingDrafts:{trail:'Unfinished private reflection'},inquiryPortrait:{question:'A question set aside',status:'aside'}};
 async function restore(obj){
  await page.locator('#import-file').setInputFiles({name:'synthetic-thinking.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(obj))});
  await expect.poll(async()=>(await stored()).fields?.assumption).toBe(obj.fields.assumption);
 }
 await restore(data);
 const portrait=page.locator('#living-inquiry-portrait'),panel=page.locator('#portrait-compare-thinking');
 if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
 await expect(panel).not.toHaveAttribute('open','');
 await panel.locator('summary').first().click();
 const a=page.locator('#thinking-piece-0'),b=page.locator('#thinking-piece-1');
 await expect(a).toHaveValue('');await expect(b).toHaveValue('');
 await expect(a).not.toContainText('Unfinished private reflection');
 await a.selectOption('version:0');await b.selectOption('current-thesis');
 await expect(panel.getByRole('article',{name:'First piece selected'})).toContainText(earlier);
 await expect(panel.getByRole('article',{name:'Second piece selected'})).toContainText(later);
 await expect(panel.getByRole('article',{name:'Second piece selected'})).toContainText('not a frozen historical record');
 await panel.getByText('A question if I want one',{exact:true}).click();
 await panel.getByRole('button',{name:'What persists?',exact:true}).click();
 await expect(panel).toContainText('still important in both pieces');
 await panel.getByRole('button',{name:'No meaningful connection',exact:true}).click();
 await expect(panel).toContainText('You do not need to connect these pieces');
 await page.evaluate(()=>window.dispatchEvent(new Event('field:save')));
 await expect(a).toHaveValue('version:0');await expect(b).toHaveValue('current-thesis');
 await expect(panel).toContainText('You do not need to connect these pieces');
 const after=await stored();expect(after.thesisVersions).toEqual(data.thesisVersions);expect(after.fields['thesis-draft']).toBe(later);expect(after.intellectualTrail).toEqual(data.intellectualTrail);
 await b.selectOption('version:0');await expect(panel).toContainText('Choose a different second piece');
 await b.selectOption('trail:0');await expect(panel.getByRole('article',{name:'Second piece selected'})).toContainText('I noticed a heron');
 await panel.getByRole('button',{name:'Done looking across my thinking',exact:true}).click();
 await expect(panel).not.toHaveAttribute('open','');await expect(panel.locator('summary').first()).toBeFocused();
 await panel.locator('summary').first().click();await expect(a).toHaveValue('');await expect(b).toHaveValue('');
 await a.selectOption('version:0');await b.selectOption('current-thesis');
 await restore({...data,fields:{...data.fields,assumption:'New notebook assumption','thesis-draft':'New notebook draft'},thesisVersions:[],intellectualTrail:[]});
 await expect(panel).not.toHaveAttribute('open','');
 if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
 await panel.locator('summary').first().click();await expect(a).toHaveValue('');await expect(b).toHaveValue('');
 await expect(a.locator('option[value="version:0"]')).toHaveCount(0);
 await a.selectOption('current-thesis');await expect(panel.getByRole('article',{name:'First piece selected'})).toContainText('New notebook draft');
 expect(errors).toEqual([]);
});
test('inquiry practices invite higher-order thinking without assigning a learner type',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const key='eng112-living-field-notebook-next-preview-20261123';
 const stored=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),key);
 const initial=await stored(),data={...initial,fields:{...initial.fields,encounter:'I watched the birds return to the tree.',assumption:'I had assumed the tree was empty.'},inquiryWorkingDrafts:{trail:'My earlier unfinished discovery'}};
 await page.locator('#import-file').setInputFiles({name:'practice-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await expect.poll(async()=>(await stored()).fields?.encounter).toBe(data.fields.encounter);
 const portrait=page.locator('#living-inquiry-portrait'),panel=page.locator('#portrait-compare-thinking'),bridge=page.locator('#thinking-practice-bridge');
 if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
 await panel.locator(':scope > summary').click();
 await expect(bridge).toBeHidden();
 await page.locator('#thinking-piece-0').selectOption('field:encounter');await page.locator('#thinking-piece-1').selectOption('field:assumption');
 await expect(bridge.locator(':scope > summary')).toBeVisible();await expect(bridge).not.toHaveAttribute('open','');
 await bridge.locator(':scope > summary').click();
 const choice=page.locator('#thinking-practice-choice'),stretch=bridge.getByRole('button',{name:'Try a different intellectual move',exact:true});
 await expect(choice).toHaveValue('');await expect(stretch).toBeHidden();
 const before=await stored();
 for(const [id,expected] of [['attention','Distinguish explanations'],['memory','Complicate an interpretation'],['dialogue','Compare perspectives and evidence'],['reading','Synthesize source and experience'],['imagery','Examine the limits of an analogy'],['tension','Evaluate competing interpretations'],['making','Turn discovery into supported meaning'],['language','Test a conceptual distinction'],['other','Experiment with another approach']]){
  await choice.selectOption(id);await expect(bridge).not.toContainText(expected);await stretch.click();await expect(bridge).toContainText(expected);
 }
 await page.evaluate(()=>window.dispatchEvent(new Event('field:save')));
 await expect(choice).toHaveValue('other');await expect(bridge).toContainText('Experiment with another approach');
 expect(await stored()).toEqual(before);
 await page.locator('#thinking-piece-1').selectOption('field:encounter');await expect(bridge).toBeHidden();
 await page.locator('#thinking-piece-1').selectOption('field:assumption');await bridge.locator(':scope > summary').click();
 await expect(choice).toHaveValue('');await choice.selectOption('reading');
 await bridge.getByRole('button',{name:'Record what I learned in my intellectual trail',exact:true}).click();
 await expect(page.locator('#ic-trail-entry')).toBeFocused();await expect(page.locator('#ic-trail-entry')).toHaveValue('My earlier unfinished discovery');
 expect((await stored()).intellectualTrail||[]).toEqual(data.intellectualTrail||[]);
 await page.reload({waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await expect(panel).not.toHaveAttribute('open','');
 expect(errors).toEqual([]);
});
test('a carried thinking invitation adapts only through explicit student decisions',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const key='eng112-living-field-notebook-next-preview-20261123';
 const stored=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),key);
 const initial=await stored(),data={...initial,fields:{...initial.fields,encounter:'The stones held my memories.',assumption:'I wondered whether the stones remembered.'}};
 await page.locator('#import-file').setInputFiles({name:'companion.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await expect.poll(async()=>(await stored()).fields?.encounter).toBe(data.fields.encounter);
 const portrait=page.locator('#living-inquiry-portrait'),compare=page.locator('#portrait-compare-thinking'),bridge=page.locator('#thinking-practice-bridge'),thread=page.locator('#field-resume-thread');
 const summary=thread.locator(':scope > summary'),text=thread.locator('.field-resume-thread-text');
 if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
 await compare.locator(':scope > summary').click();
 await page.locator('#thinking-piece-0').selectOption('field:encounter');await page.locator('#thinking-piece-1').selectOption('field:assumption');
 await bridge.locator(':scope > summary').click();await page.locator('#thinking-practice-choice').selectOption('imagery');
 await bridge.getByRole('button',{name:'Try a different intellectual move',exact:true}).click();
 expect((await stored()).carriedInquiryPractice).toBeUndefined();
 await bridge.getByRole('button',{name:'Keep this invitation for later',exact:true}).click();
 expect((await stored()).carriedInquiryPractice).toEqual({id:'imagery',phase:'try'});
 await expect(thread).not.toHaveAttribute('open','');
 await page.reload({waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();const editor=page.locator('#ws-essay-rich');await editor.fill('My own interpretation remains mine.');
 await expect(thread).not.toHaveAttribute('open','');await summary.click();
 const choices=page.locator('#field-resume-thread-choice');if(await choices.isVisible())await choices.selectOption('practice');
 await expect(text).toContainText('Examine the limits of an analogy');
 await thread.getByRole('button',{name:'Continue without this',exact:true}).click();
 expect((await stored()).carriedInquiryPractice.phase).toBe('try');await expect(editor).toBeFocused();await expect(editor).toHaveText('My own interpretation remains mine.');
 await summary.click();if(await choices.isVisible())await choices.selectOption('practice');
 await thread.getByRole('button',{name:'I tried this approach',exact:true}).click();
 await expect(text).toContainText('Where else might this way of thinking help');await expect(text).toContainText('What does my analogy reveal, and where does it stop working?');await expect(text).toContainText('There is no reflection to submit.');
 expect((await stored()).carriedInquiryPractice).toEqual({id:'imagery',phase:'reflect'});
 await expect(thread.getByRole('button',{name:'I tried this approach',exact:true})).toBeHidden();
 const before=await stored();
 await thread.getByRole('button',{name:'I can use this independently',exact:true}).click();
 await expect(editor).toBeFocused();await expect(editor).toHaveText('My own interpretation remains mine.');
 const after=await stored();expect(after.intellectualTrail).toEqual(before.intellectualTrail);expect(after.writing).toEqual(before.writing);
 expect(after.carriedInquiryPractice).toBeUndefined();
 expect((await stored()).fields.encounter).toBe(data.fields.encounter);
 await page.reload({waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await expect(thread).toBeHidden();await expect(editor).toHaveText('My own interpretation remains mine.');
 await page.locator('#import-file').setInputFiles({name:'invalid-practice.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...data,carriedInquiryPractice:{id:'unknown',phase:'mastered'}}))});
 await expect.poll(async()=>(await stored()).carriedInquiryPractice?.id).toBe('unknown');
 await expect(thread).toBeHidden();
 expect(errors).toEqual([]);
});
test('attentive reflection follows stated relationships and respects uncertainty',async({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();
 const companion=page.locator('section[aria-label="My Inquiry Companion"]');
 await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
 await companion.getByText('Review a paragraph without rewriting it',{exact:true}).click();
 const input=page.locator('#ic-paragraph'),result=input.locator('xpath=following-sibling::div[@role="status"][1]');
 const reflect=companion.getByRole('button',{name:'Reflect on this paragraph',exact:true});
 for(const [passage,focus,question] of [
  ["I always thought my grandmother's garden belonged to her, but I am beginning to wonder how much of her life belonged to the garden.",'Reconsidering an earlier view','belonging or ownership'],
  ['The marsh seemed empty until I sat long enough to hear the insects.','A shift in attention','what you could perceive at first'],
  ['The same hedge protects seedlings but limits access for rabbits.','Different consequences of one relationship','who or what experiences its different effects'],
  ['The article measured growth, while my grandfather spoke about patience. I am beginning to see that they answer different questions.','Different questions, different perspectives','preserve that distinction'],
  ['The marsh seemed empty until the rain began.','A question to explore','Which detail'],
  ['The same tree makes a shadow that stretches across the garden.','A question to explore','Which detail'],
  ['The author writes, “I always thought the garden belonged to me, but I am beginning to wonder whether I belonged to the garden.”','A question to explore','Which detail']
 ]){
  await input.fill(passage);await reflect.click();
  await expect(result.locator('h4').first()).toContainText(focus);
  await expect(result.locator(':scope > p')).toHaveCount(1);
  await expect(result.locator(':scope > p')).toContainText(question);
  await expect(input).toHaveValue(passage);
  if(focus==='Different questions, different perspectives')await expect(result.locator('details')).toHaveCount(0);
 }
 await input.fill('I always thought the orchard belonged to my family, but I am beginning to wonder what we owe the orchard. I have permission to describe the interview but not to reproduce her words.');
 await reflect.click();await expect(result.locator('h4')).toContainText('Respecting a boundary');
 await expect(result.locator('details')).toHaveCount(0);
});
test('relational suggestions show grounded clues and leave the choice to the student',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const key='eng112-living-field-notebook-next-preview-20261123';
 const stored=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),key);
 const initial=await stored(),data={...initial,fields:{...initial.fields,encounter:'I watched leaf litter accumulate beneath the oak seedlings.',assumption:'Nature changes relationships and meaning.'},intellectualTrail:[{text:'Leaf litter shelters insects and oak seedlings.',relationship:'Complicates',created:'2026-11-25T12:00:00Z'},{text:'Leaf litter and oak seedlings are unrelated to this essay.',relationship:'Does not belong',created:'2026-11-26T12:00:00Z'}],inquiryWorkingDrafts:{trail:'Leaf litter and oak seedlings in a private draft.'}};
 await page.locator('#import-file').setInputFiles({name:'relational.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await expect.poll(async()=>(await stored()).fields?.encounter).toBe(data.fields.encounter);
 const portrait=page.locator('#living-inquiry-portrait'),panel=page.locator('#portrait-compare-thinking'),connection=page.locator('#thinking-connection');
 if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
 await panel.locator(':scope > summary').click();
 const a=page.locator('#thinking-piece-0'),b=page.locator('#thinking-piece-1');
 await expect(connection).toBeHidden();await a.selectOption('field:encounter');
 const find=connection.getByRole('button',{name:'Look for a possible connection',exact:true});
 await expect(connection).not.toContainText('Shared wording');
 await find.click();await expect(connection).toContainText('Shared wording: leaf litter');
 await expect(connection).toContainText('Intellectual trail reflection 1');
 await expect(b).toHaveValue('');
 await connection.getByRole('button',{name:'This connection does not fit',exact:true}).click();
 await find.click();await expect(connection).toContainText('No clear shared wording found');
 await a.selectOption('field:assumption');await find.click();await expect(connection).toContainText('No clear shared wording found');
 await a.selectOption('field:encounter');await find.click();
 await connection.getByRole('button',{name:'Compare this piece',exact:true}).click();
 await expect(b).toHaveValue('trail:0');
 await expect(panel.getByRole('article',{name:'Second piece selected'})).toContainText(data.intellectualTrail[0].text);
 const after=await stored();expect(after.fields.encounter).toBe(data.fields.encounter);expect(after.intellectualTrail).toEqual(data.intellectualTrail);expect(after.inquiryWorkingDrafts.trail).toBe(data.inquiryWorkingDrafts.trail);
 await a.selectOption('trail:1');await expect(connection).toBeHidden();
 expect(errors).toEqual([]);
});
test('concept encounters start with a chosen question and never alter student writing',async({page})=>{
 page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const key='eng112-living-field-notebook-next-preview-20261123';
 const stored=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),key);
 const initial=await stored(),data={...initial,fields:{...initial.fields,encounter:'My dog paused at a patch of grass that looked ordinary to me.',assumption:'I wondered whether I had missed a signal.'}};
 await page.locator('#import-file').setInputFiles({name:'concept.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await expect.poll(async()=>(await stored()).fields?.encounter).toBe(data.fields.encounter);
 const portrait=page.locator('#living-inquiry-portrait'),panel=page.locator('#portrait-compare-thinking'),concept=page.locator('#thinking-concept-encounter'),choice=page.locator('#thinking-concept-choice');
 if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
 await panel.locator(':scope > summary').click();
 await expect(concept).toBeHidden();
 await page.locator('#thinking-piece-0').selectOption('field:encounter');
 await expect(concept).not.toHaveAttribute('open','');
 await concept.locator(':scope > summary').click();await expect(choice).toHaveValue('');
 const before=await stored();
 for(const [id,title,domain] of [['umwelt','Umwelt','pmc.ncbi.nlm.nih.gov'],['reciprocity','Reciprocity','simonandschuster.com'],['knowing-in-action','Knowing-in-action','routledge.com'],['consent','Informed consent','oralhistory.org']]){
  await choice.selectOption(id);await expect(concept.locator('h4')).toHaveText(title);await expect(concept.locator('a')).toHaveAttribute('href',new RegExp(domain));await expect(concept).toContainText('starting point for reading');
 }
 for(const [id,pairs] of [['umwelt',['perception-attention','response-intention','agency-intention']],['reciprocity',['gift-transaction','reciprocity-mutualism']],['knowing-in-action',['knowing-reflecting','practice-explanation']],['consent',['participation-permission','anonymous-confidential']]]){
  await choice.selectOption(id);
  const depth=concept.locator('#thinking-concept-depth'),distinction=concept.locator('#thinking-distinction-choice'),result=concept.locator('#thinking-distinction-result');
  await expect(depth).not.toHaveAttribute('open','');await depth.locator(':scope > summary').click();await expect(distinction).toHaveValue('');
  for(const pair of pairs){
   await distinction.selectOption(pair);await expect(result).toContainText('An illustrative encounter (not your writing)');await expect(result).toContainText('Return to your chosen piece');
   await expect(result.locator('.thinking-compare-grid > div')).toHaveCount(2);
  }
  if(id==='umwelt'){await distinction.selectOption('response-intention');await expect(result).toContainText('A response alone does not establish conscious purpose.');}
  await depth.locator(':scope > summary').click();await expect(distinction).toHaveValue('');await expect(result).toBeEmpty();
 }
 for(const [id,cases] of [['umwelt',['night-flight','missed-call']],['reciprocity',['shared-tools','paid-repair']],['knowing-in-action',['kitchen','instruction-card']],['consent',['community-photo','public-story']]]){
  await choice.selectOption(id);
  const transfer=concept.locator('#thinking-concept-transfer'),encounter=concept.locator('#thinking-transfer-choice'),result=concept.locator('#thinking-transfer-result');
  await expect(transfer).not.toHaveAttribute('open','');await transfer.locator(':scope > summary').click();await expect(encounter).toHaveValue('');
  for(const item of [...cases,'own']){
   await encounter.selectOption(item);
   await expect(result).toContainText('Try the idea in your own words');
   const hint=result.locator('details');await expect(hint).not.toHaveAttribute('open','');await hint.locator('summary').click();await expect(hint.locator('p')).toBeVisible();
   if(item==='own')await expect(result).toContainText('You do not need to enter it here');
   else await expect(result).toContainText('An illustrative encounter (not your writing)');
  }
  await transfer.locator(':scope > summary').click();await expect(encounter).toHaveValue('');await expect(result).toBeEmpty();
 }
 expect(await stored()).toEqual(before);
 await page.locator('#thinking-piece-0').selectOption('field:assumption');await expect(concept).not.toHaveAttribute('open','');
 await concept.locator(':scope > summary').click();await expect(choice).toHaveValue('');
 await choice.selectOption('umwelt');const transfer=concept.locator('#thinking-concept-transfer');await transfer.locator(':scope > summary').click();await transfer.locator('select').selectOption('own');
 await transfer.getByRole('button',{name:'Open my intellectual trail'}).click();
 await expect(page.locator('#ic-trail-entry')).toBeFocused();await expect(page.locator('#ic-trail-entry')).toHaveValue('');
 expect((await stored()).fields.encounter).toBe(data.fields.encounter);
});
test('concept integration returns to original writing fields without inserting or grading text',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const key='eng112-living-field-notebook-next-preview-20261123';
 const stored=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),key);
 const initial=await stored(),data={...initial,fields:{...initial.fields,encounter:'My dog stopped to investigate a scent.',what:'The dog paused beside a hedge.',soWhat:'I thought the dog was waiting for me.',nowWhat:'We perceive shared places differently.'},inquiryWorkingDrafts:{trail:'An unfinished discovery I want to keep.'}};
 await page.locator('#import-file').setInputFiles({name:'integration.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await expect.poll(async()=>(await stored()).fields?.encounter).toBe(data.fields.encounter);
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 await page.locator('[data-field-space="write"]').click();const editor=page.locator('#ws-essay-rich');
 await editor.fill('My draft remains my own.');
 await page.locator('[data-field-space="thesis"]').click();
 const portrait=page.locator('#living-inquiry-portrait'),panel=page.locator('#portrait-compare-thinking'),concept=page.locator('#thinking-concept-encounter');
 const invitation=page.locator('#thinking-writing-invitation');
 async function choose(target,distinction=false){
  if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
  if(!(await panel.evaluate(e=>e.open)))await panel.locator(':scope > summary').click();
  await page.locator('#thinking-piece-0').selectOption('field:encounter');
  await concept.locator(':scope > summary').click();
  await concept.locator('#thinking-concept-choice').selectOption('umwelt');
  if(distinction){const depth=concept.locator('#thinking-concept-depth');await depth.locator(':scope > summary').click();await depth.locator('select').selectOption('response-intention');}
  const integration=concept.locator('#thinking-concept-integration');await expect(integration).not.toHaveAttribute('open','');await integration.locator(':scope > summary').click();
  const select=integration.locator('#thinking-integration-target');await expect(select).toHaveValue('');
  const go=integration.getByRole('button',{name:'Bring my question to this writing space',exact:true});await expect(go).toBeDisabled();
  await select.selectOption(target);await go.click();await expect(invitation).toBeVisible();
  await expect(invitation).toBeFocused();await expect(invitation).toContainText('Umwelt');
  if(distinction)await expect(invitation).toContainText('Responsiveness and Intention');
  await expect(invitation).toContainText('Your draft is unchanged');
  await expect(invitation.locator('xpath=following-sibling::*[1]')).toHaveAttribute('id',target);
 }
 for(const [id,original] of [['what',data.fields.what],['soWhat',data.fields.soWhat],['nowWhat',data.fields.nowWhat],['thesis-draft',''],['ws-essay-rich','My draft remains my own.']]){
  const field=page.locator('#'+id);const before=id==='thesis-draft'?await field.inputValue():original;
  await choose(id,id==='soWhat');await expect(field).toBeVisible();
  if(id==='ws-essay-rich')await expect(field).toHaveText(before);else await expect(field).toHaveValue(before);
  await invitation.getByRole('button',{name:'Continue without this question',exact:true}).click();
  await expect(invitation).toHaveCount(0);await expect(field).toBeFocused();
 }
 await choose('soWhat',true);
 await invitation.getByRole('button',{name:'Record my discovery in the intellectual trail',exact:true}).click();
 await expect(invitation).toHaveCount(0);await expect(page.locator('#ic-trail-entry')).toBeFocused();
 await expect(page.locator('#ic-trail-entry')).toHaveValue(data.inquiryWorkingDrafts.trail);
 const final=await stored();expect(final.fields.what).toBe(data.fields.what);expect(final.fields.soWhat).toBe(data.fields.soWhat);expect(final.fields.nowWhat).toBe(data.fields.nowWhat);
 expect(errors).toEqual([]);
});
test('intellectual transformation is student-authored and may include continuity or uncertainty',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const key='eng112-living-field-notebook-next-preview-20261123';
 const stored=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),key);
 const initial=await stored(),earlier='I thought the quiet marsh held little life.',later='I began to wonder what my own attention excluded.';
 const data={...initial,fields:{...initial.fields,assumption:earlier,'thesis-draft':later},thesisVersions:[{story2:earlier,change:'My earlier explanation remains open.',savedAt:'2026-11-20T12:00:00Z'}],intellectualTrail:[{text:'The insects became audible when I stopped walking.',relationship:'Complicates',created:'2026-11-25T12:00:00Z'}],inquiryWorkingDrafts:{trail:'An unfinished reflection I want to retain.'}};
 await page.locator('#import-file').setInputFiles({name:'transformation.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await expect.poll(async()=>(await stored()).fields?.assumption).toBe(earlier);
 if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
 const portrait=page.locator('#living-inquiry-portrait'),panel=page.locator('#portrait-compare-thinking'),a=page.locator('#thinking-piece-0'),b=page.locator('#thinking-piece-1');
 const reflection=page.locator('#thinking-transformation'),choice=page.locator('#thinking-transformation-choice');
 async function compare(){
  if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
  if(!(await panel.evaluate(e=>e.open)))await panel.locator(':scope > summary').click();
  await a.selectOption('version:0');await b.selectOption('current-thesis');
  const prompt=panel.getByText('A question if I want one',{exact:true});
  if(!(await prompt.locator('..').evaluate(e=>e.open)))await prompt.click();
  await panel.getByRole('button',{name:'What has changed?',exact:true}).click();
  await expect(reflection).toBeVisible();await expect(choice).toHaveValue('');
 }
 await compare();await expect(panel.getByRole('article',{name:'First piece selected'})).toContainText('My earlier explanation remains open.');
 const before=await stored();
 for(const [id,phrase] of [['wording','underlying interpretation still the same'],['attention','particular detail became visible'],['interpretation','encounter, source or reasoning'],['significance','broader unsupported claim'],['uncertainty','responsibly leave open'],['continuity','no need to manufacture a change'],['unrelated','do not have to form a developmental story']]){
  await choice.selectOption(id);await expect(reflection).toContainText(phrase);
  const trail=reflection.getByRole('button',{name:'Open my existing intellectual trail',exact:true});
  if(['continuity','unrelated'].includes(id))await expect(trail).toBeHidden();else await expect(trail).toBeVisible();
 }
 expect(await stored()).toEqual(before);
 await b.selectOption('trail:0');await expect(reflection).toBeHidden();
 await panel.getByRole('button',{name:'What has changed?',exact:true}).click();await expect(choice).toHaveValue('');
 await choice.selectOption('uncertainty');await portrait.locator(':scope > summary').click();await expect(panel).not.toHaveAttribute('open','');
 await compare();await choice.selectOption('interpretation');
 const originalThesisReflection=await page.locator('#thesis-change').inputValue();
 await reflection.getByRole('button',{name:'Open my existing thesis reflection',exact:true}).click();
 await expect(page.locator('#thesis-change')).toBeVisible();await expect(page.locator('#thesis-change')).toBeFocused();await expect(page.locator('#thesis-change')).toHaveValue(originalThesisReflection);
 await compare();await choice.selectOption('uncertainty');await reflection.getByRole('button',{name:'Open my existing intellectual trail',exact:true}).click();
 await expect(page.locator('#ic-trail-entry')).toBeFocused();await expect(page.locator('#ic-trail-entry')).toHaveValue(data.inquiryWorkingDrafts.trail);
 const after=await stored();expect(after.fields.assumption).toBe(earlier);expect(after.fields['thesis-draft']).toBe(later);expect(after.thesisVersions).toEqual(data.thesisVersions);expect(after.intellectualTrail).toEqual(data.intellectualTrail);
 expect(errors).toEqual([]);
});
test('capture intellectual challenge baseline',async({page},testInfo)=>{
test.setTimeout(90000);
const cases=[...require('./ai-inquiry-challenge-cases.json').cases,...require('./ai-inquiry-transfer-cases.json').cases,...require('./ai-inquiry-restraint-cases.json'),...require('./ai-inquiry-restraint-transfer-cases.json'),...require('./ai-inquiry-contextual-holdout.json')];
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="write"]').click();
const companion=page.locator('section[aria-label="My Inquiry Companion"]');
await companion.getByText('Open my inquiry, sources and paragraph directions',{exact:true}).click();
await companion.getByText('Review a paragraph without rewriting it',{exact:true}).click();
const result=page.locator('#ic-paragraph').locator('xpath=following-sibling::div[@role="status"][1]');
const records=[];
for(const c of cases){
 await page.locator('#ic-paragraph').fill(c.passage);
 await companion.getByRole('button',{name:'Reflect on this paragraph',exact:true}).click();
 await expect(result.locator('h4').first()).toBeVisible();
 const primary=await result.locator(':scope > p').allTextContents();
 expect(primary.length).toBeGreaterThan(0);
 records.push({id:c.id,passage:c.passage,focus:await result.locator('h4').first().textContent(),primary,full:await result.innerText()});
}
expect(records).toHaveLength(cases.length);
await testInfo.attach('local-inquiry-baseline-'+viewport.width,{body:JSON.stringify(records,null,2),contentType:'application/json'});
console.log('LOCAL_INQUIRY_BASELINE '+JSON.stringify(records));
});
test('living inquiry portrait continuity',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(url,{waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
await page.locator('[data-field-space="thesis"]').click();
await page.locator('#lts-nav').getByRole('button',{name:'Build',exact:true}).click();
await page.locator('#lts-build').getByRole('button',{name:'1. Observation',exact:true}).click();
await page.locator('#what').fill('Fireflies stop flashing near a possible threat.');
await page.locator('#lts-build').getByRole('button',{name:'Review my observation',exact:true}).click();
const portrait=page.locator('#living-inquiry-portrait');
await portrait.locator(':scope > summary').click();
await expect(portrait).toContainText('Fireflies stop flashing near a possible threat.');
await expect(portrait).toContainText('Threat and perception');
await portrait.locator('#portrait-question').fill('What distinguishes perception from intention?');
await portrait.locator('#portrait-status').selectOption('reconsidered');
await portrait.locator('#portrait-save').click();
await expect(portrait.locator('#portrait-message')).toContainText('saved');
for(const space of ['discover','research','write','thesis']){
await page.locator('[data-field-space="'+space+'"]').click();
await expect(portrait.locator(':scope > summary')).toBeVisible();
}
await page.reload({waitUntil:'domcontentloaded'});
if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
if(!(await portrait.evaluate(e=>e.open)))await portrait.locator(':scope > summary').click();
await expect(portrait.locator('#portrait-question')).toHaveValue('What distinguishes perception from intention?');
await expect(portrait.locator('#portrait-status')).toHaveValue('reconsidered');
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
