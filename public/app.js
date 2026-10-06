const $=s=>document.querySelector(s);
const workspace=$("#workspace"),form=$("#jobForm"),files=$("#files"),drop=$("#drop"),options=$("#options"),selected=$("#selected"),status=$("#status");
const titles={merge:"Merge PDF",split:"Split PDF",rotate:"Rotate PDF",compress:"Compress PDF","image-to-pdf":"Images to PDF"};
function openTool(tool){
 workspace.classList.remove("hidden"); $("#toolTitle").textContent=titles[tool]; $("#tool").value=tool;
 files.value=""; selected.textContent=""; status.className="status hidden";
 options.innerHTML=tool==="split"?'<div class="option"><label>Page number <input name="page" type="number" min="1" value="1"></label></div>':tool==="rotate"?'<div class="option"><label>Rotation <select name="angle"><option>90</option><option>180</option><option>270</option></select></label></div>':"";
 workspace.scrollIntoView({behavior:"smooth",block:"start"});
}
document.querySelectorAll(".tool").forEach(b=>b.addEventListener("click",()=>openTool(b.dataset.tool)));
$("#close").onclick=()=>workspace.classList.add("hidden");
drop.onclick=()=>files.click();
drop.ondragover=e=>e.preventDefault();
drop.ondrop=e=>{e.preventDefault();files.files=e.dataTransfer.files;showFiles()};
files.onchange=showFiles;
function showFiles(){selected.textContent=[...files.files].map(f=>f.name).join(" • ")||"No files selected"}
form.onsubmit=async e=>{
 e.preventDefault(); if(!files.files.length)return show("Select at least one file.","error");
 const body=new FormData(form); show("Processing…");
 try{const r=await fetch("/api/jobs",{method:"POST",body});const d=await r.json();if(!r.ok)throw new Error(d.error||"Request failed");await poll(d.jobId)}
 catch(err){show(err.message,"error")}
};
async function poll(jobId){
 for(let i=0;i<120;i++){
  await new Promise(r=>setTimeout(r,500));
  const r=await fetch("/api/jobs/"+jobId); const d=await r.json();
  if(d.status==="completed"){status.innerHTML='Done. <a href="'+d.downloadUrl+'">Download your file →</a>';status.className="status";return}
  if(d.status==="failed"){show(d.error||"Processing failed.","error");return}
 }
 show("Processing timed out. Please try again.","error");
}
function show(message,type="ok"){status.textContent=message;status.className="status"+(type==="error"?" error":"")}