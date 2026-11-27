/* Synthetic, report-only accessibility audit for the experimental notebook.
 * Automated checks do not establish WCAG conformance or usability.
 * Never point this audit at a student project or import actual student work.
 */
'use strict';
const {chromium}=require('@playwright/test');
const axe=require('axe-core');
const fs=require('node:fs');
const url=process.env.NOTEBOOK_URL||'http://localhost:8765/field-notebook-next-preview.html';
if(!/^http:\/\/(?:localhost|127\.0\.0\.1):\d+\/field-notebook-next-preview\.html$/.test(url))throw Error('Use the isolated local experimental notebook');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const report=[];
 try{
  for(const viewport of [{width:320,height:760},{width:1440,height:900}]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await context.newPage();
   await page.goto(url,{waitUntil:'domcontentloaded'});
   async function inspect(name){
    if(!(await page.evaluate(()=>!!window.axe)))await page.addScriptTag({content:axe.source});
    const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']},resultTypes:['violations','incomplete']}));
    const slim=list=>list.map(v=>({id:v.id,impact:v.impact,description:v.description,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
    const reflow=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
    report.push({viewport,name,reflow,violations:slim(result.violations),manualReview:slim(result.incomplete)});
   }
   await inspect('welcome');
   if(await page.locator('#field-workspace').isHidden())await page.locator('#field-welcome-start').click();
   await page.locator('[data-field-space="discover"]').click();await inspect('freewrite');
   await page.locator('#field-subnav').getByRole('button',{name:'Explore concepts',exact:true}).click();await inspect('concept exploration');
   await page.locator('[data-field-space="research"]').click();await page.locator('#field-subnav').getByRole('button',{name:'Build a search',exact:true}).click();await inspect('research search');
   await page.locator('#field-subnav').getByRole('button',{name:'Find sources',exact:true}).click();await inspect('source discovery');
   await page.locator('#field-subnav').getByRole('button',{name:'Reading Journal',exact:true}).click();await inspect('reading journal');
   await page.locator('#field-subnav').getByRole('button',{name:'Annotated bibliography',exact:true}).click();await inspect('annotated bibliography');
   await page.locator('[data-field-space="thesis"]').click();await inspect('thesis');
   await page.locator('[data-field-space="write"]').click();await inspect('essay');
   await context.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync('notebook-accessibility-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report.map(r=>({viewport:r.viewport.width,screen:r.name,horizontalOverflow:r.reflow.scrollWidth>r.reflow.viewport+1,rules:r.violations.map(v=>({id:v.id,nodes:v.nodes,impact:v.impact})),manualReview:r.manualReview.map(v=>({id:v.id,nodes:v.nodes}))})),null,2));
 console.log('Report only: successful execution does not mean accessibility conformance.');
})().catch(e=>{console.error(e);process.exitCode=1;});
