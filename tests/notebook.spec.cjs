const {test,expect}=require('@playwright/test');
test.use({actionTimeout:10000,navigationTimeout:15000,trace:'retain-on-failure',screenshot:'only-on-failure'});
const url=process.env.NOTEBOOK_URL || 'https://professortemple.github.io/eng112-research-as-encounter/field-notebook-next-preview.html';
for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
test.describe('Notebook '+viewport.width,()=>{
test.use({viewport});
test('search, refinement, discovery and persistence',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));page.on('requestfailed',r=>console.log('REQUEST FAILED:',r.url(),r.failure()?.errorText));console.log('Opening notebook');await page.goto(url,{waitUntil:'domcontentloaded'});console.log('DOM ready',await page.title());
console.log('Opening research');await page.locator('#tab-search').evaluate(e=>e.click());console.log('Research tab clicked');
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
console.log('Opening journal');await page.locator('#tab-journal').evaluate(e=>e.click());console.log('Journal tab clicked');
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
await page.locator('#save-source-note').click();
await expect(page.locator('#note-list')).toContainText('Synthetic observation');
await page.reload({waitUntil:'domcontentloaded'});console.log('Opening journal');await page.locator('#tab-journal').evaluate(e=>e.click());console.log('Journal tab clicked');
await expect(page.locator('#note-list')).toContainText('Synthetic observation');
expect(errors).toEqual([]);
});
});
}
