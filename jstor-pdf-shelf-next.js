/* Student-controlled JSTOR PDF shelf.
 * PDFs stay on this device in IndexedDB, never transmitted to notebook server.
 * Existing notebook localStorage and full JSON backup are untouched.
 */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const file=$('jstor-pdf'),title=$('jstor-title'),url=$('jstor-url'),list=$('jstor-list'),status=$('jstor-status');
 if(!file||!title||!list||!status)return;
 const DB='eng112-field-notebook-next-preview-pdfs-20261123'+(typeof NOTEBOOK_PRACTICE!=='undefined'&&NOTEBOOK_PRACTICE?'-practice':''),STORE='articles',MAX=20*1024*1024;
 const say=t=>{status.textContent=t;};
 function openDB(){
  return new Promise((resolve,reject)=>{
   if(!('indexedDB' in window))return reject(Error('This browser does not allow article storage.'));
   const req=indexedDB.open(DB,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'});};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Unable to open article shelf.'));
  });
 }
 async function transact(mode,operation){
  const db=await openDB();
  return new Promise((resolve,reject)=>{
   let finished=false,result;
   const tx=db.transaction(STORE,mode);
   const req=operation(tx.objectStore(STORE));
   req.onsuccess=()=>{result=req.result;};
   req.onerror=()=>{finished=true;reject(req.error||Error('Article operation failed.'));};
   tx.oncomplete=()=>{if(!finished)resolve(result);db.close();};
   tx.onerror=()=>{if(!finished)reject(tx.error||Error('Article storage failed.'));db.close();};
   tx.onabort=()=>{if(!finished)reject(tx.error||Error('Article storage was interrupted.'));db.close();};
  });
 }
 const all=()=>transact('readonly',store=>store.getAll());
 const get=id=>transact('readonly',store=>store.get(id));
 const put=record=>transact('readwrite',store=>store.put(record));
 const del=id=>transact('readwrite',store=>store.delete(id));
 function action(text,callback){
  const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=text;b.addEventListener('click',callback);return b;
 }
 function openPdf(record){
  const u=URL.createObjectURL(record.pdf);
  const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),60000);
  say('Article opened in a new tab where supported. Keep your own copy of the PDF.');
 }
 function downloadPdf(record){
  const u=URL.createObjectURL(record.pdf);const a=document.createElement('a');a.href=u;a.download=record.filename||'scholarly-article.pdf';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),60000);say('Article PDF download requested.');
 }
 async function render(){
  try{
   const records=(await all()).sort((a,b)=>b.created.localeCompare(a.created));
   const welcomeCount=$('jstor-welcome-count');
   if(welcomeCount)welcomeCount.textContent=records.length+' JSTOR PDF'+(records.length===1?'':'s')+' saved in this browser.';
   list.replaceChildren();
   if(!records.length){const p=document.createElement('p');p.className='hint';p.textContent='No PDFs added yet. Your article notes can still be saved without uploading a file.';list.append(p);return;}
   for(const record of records){
    const box=document.createElement('article');box.className='result';
    const strong=document.createElement('strong');strong.textContent=record.title;box.append(strong);
    const meta=document.createElement('p');meta.className='hint';meta.textContent=record.filename+' · Saved on this device';box.append(meta);
    if(record.url){const link=document.createElement('a');link.href=record.url;link.textContent='JSTOR article link';link.target='_blank';link.rel='noopener noreferrer';box.append(link);}
    const buttons=document.createElement('div');buttons.className='actions';
    buttons.append(action('Open PDF',()=>openPdf(record)),action('Download PDF',()=>downloadPdf(record)),
     action('Use title in Reading Journal',()=>{
      const t=$('custom-title'),kind=$('custom-kind'),link=$('custom-url'),details=$('custom-source-details');
      if(details)details.open=true;if(t)t.value=record.title;if(kind)kind.value='article';if(link&&record.url)link.value=record.url;
      tab('journal');t?.focus();
      say('Article details copied into the source form. Add it to your shelf, then save passages and reflections.');
     }),
     action('Remove PDF from this device',async()=>{
      if(!window.confirm('Remove this PDF from this browser? This does not delete your JSTOR article, Reading Journal notes, or separately saved PDF files.'))return;
      try{await del(record.id);say('PDF removed from this device; Reading Journal work is unchanged.');await render();}catch(e){say('Could not remove the PDF: '+e.message);}
     }));
    box.append(buttons);list.append(box);
   }
  }catch(e){say('PDF shelf unavailable: '+e.message);}
 }

 // The welcome screen and Reading Journal deliberately share one private PDF shelf.
 // Neither file chooser sends data to a server or changes the notebook's JSON backup.
 async function savePdfFrom(pdfInput,titleInput,urlInput,messageElement){
  const announce=message=>{messageElement.textContent=message;};
  const pdf=pdfInput.files?.[0],name=titleInput.value.trim();
  if(!pdf){announce('Choose a PDF that you downloaded from JSTOR first.');pdfInput.focus();return;}
  if(!name){announce('Enter the article title so you can recognize this PDF later.');titleInput.focus();return;}
  if(pdf.size>MAX){announce('This PDF is over 20 MB. Keep it in Files and add its citation in the Reading Journal.');return;}
  if(!pdf.size){announce('This file is empty. Please select the complete PDF.');return;}
  const link=urlInput.value.trim();
  if(link){try{const u=new URL(link);if(!['https:','http:'].includes(u.protocol))throw Error();}catch(error){announce('Use a valid https:// article link or leave the link blank.');urlInput.focus();return;}}
  try{
   const signature=new Uint8Array(await pdf.slice(0,5).arrayBuffer());
   if(String.fromCharCode(...signature)!=='%PDF-'){announce('This is not a valid PDF. Select the downloaded JSTOR article PDF.');return;}
   const id=(globalThis.crypto?.randomUUID?.()||'article-'+Date.now()+'-'+Math.random().toString(36).slice(2));
   await put({id,title:name,url:link,filename:pdf.name,created:new Date().toISOString(),pdf});
   pdfInput.value='';titleInput.value='';urlInput.value='';
   await render();
   announce(messageElement.id==='jstor-welcome-status'?'PDF saved privately in this browser. Choose Start Here, then Research → Reading Journal to find your article and record notes. Keep the original PDF in Files.':'PDF saved privately in this browser. Add its citation in the Reading Journal and keep the original file separately.');
  }catch(error){announce('PDF could not be saved: '+error.message+'. Keep your original PDF and try again.');}
 }
 $('jstor-save-pdf').addEventListener('click',()=>savePdfFrom(file,title,url,status));
 const welcomeFile=$('jstor-welcome-pdf'),welcomeTitle=$('jstor-welcome-title'),welcomeUrl=$('jstor-welcome-url');
 const welcomeButton=$('jstor-welcome-save'),welcomeStatus=$('jstor-welcome-status');
 if(welcomeFile&&welcomeTitle&&welcomeUrl&&welcomeButton&&welcomeStatus){
  welcomeButton.addEventListener('click',()=>savePdfFrom(welcomeFile,welcomeTitle,welcomeUrl,welcomeStatus));
  welcomeFile.addEventListener('change',()=>{
   const chosen=welcomeFile.files?.[0];
   welcomeStatus.textContent=chosen?'Selected '+chosen.name+'. Add its article title and choose Save PDF on this device.':'No file selected.';
  });
 }
 $('jstor-refresh-pdfs')?.addEventListener('click',render);
 render();
})();