export const THRESHOLD=.95;
const blocked=new Set(['__proto__','constructor','prototype']);
export function cleanField(f,i=0){
 if(!f||typeof f!=='object'||typeof f.key!=='string'||!f.key||blocked.has(f.key)||f.key.length>150)throw Error('Ungültiger Feldschlüssel.');
 const str=x=>x==null?'':String(x).slice(0,5000);
 const confidence=typeof f.confidence==='number'&&Number.isFinite(f.confidence)&&f.confidence>=0&&f.confidence<=1?f.confidence:null;
 return {id:`f${i}`,key:f.key,label:str(f.label||f.key),group:str(f.group||'Dokument'),value:str(f.value),raw:str(f.raw??f.value),confidence,reason:str(f.reason),handwritten:f.handwritten===true,page:Number.isInteger(f.page)&&f.page>=1?f.page:1,bbox:Array.isArray(f.bbox)&&f.bbox.length===4&&f.bbox.every(n=>Number.isFinite(n)&&n>=0&&n<=1000)&&f.bbox[2]>f.bbox[0]&&f.bbox[3]>f.bbox[1]?f.bbox:null,reviewed:false,reviewedAt:null,edited:str(f.value)!==str(f.raw??f.value)};
}
export function normalizeFields(fields){if(!Array.isArray(fields)||fields.length>2000)throw Error('Ungültige Feldliste (maximal 2’000 Felder).');const result=fields.map(cleanField);if(new Set(result.map(f=>f.key)).size!==result.length)throw Error('Doppelte Feldschlüssel sind nicht erlaubt.');return result;}
export function issues(f,fields=[]){
 const out=[];if(f.confidence===null)out.push('Keine KI-Einschätzung vorhanden');else if(f.confidence<THRESHOLD)out.push('KI-Einschätzung unter 95 %');
 if(f.handwritten)out.push('Handschrift prüfen');if(f.reason)out.push(f.reason);if(f.edited)out.push('Wert wurde geändert');
 if(/tvd_nummer$/.test(f.key)&&f.value&&!/^CH\s?\d{3}\.\d{4}\.\d{4}\.\d$/.test(f.value))out.push('TVD-Nummer hat ein ungewöhnliches Format');
 if(/(?:datum|date)$/.test(f.key)&&f.value){const match=f.value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);if(!match)out.push('Datum muss TT.MM.JJJJ sein');else{const [,dd,mm,yy]=match;const date=new Date(+yy,+mm-1,+dd);if(date.getDate()!==+dd||date.getMonth()!==+mm-1)out.push('Ungültiges Kalenderdatum');}}
 if(f.key==='datum_probe'){const date=s=>{const m=s?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?+new Date(+m[3],+m[2]-1,+m[1]):NaN;};const v=date(f.value),a=date(fields.find(x=>x.key==='naechste_probe_von')?.value),b=date(fields.find(x=>x.key==='naechste_probe_bis')?.value);if(Number.isFinite(v)&&Number.isFinite(a)&&Number.isFinite(b)&&(v<a||v>b))out.push('Probedatum liegt ausserhalb des Zeitfensters');}
 return [...new Set(out)];
}
export function pending(fields){return fields.filter(f=>!f.reviewed&&issues(f,fields).length>0);}
export function editField(f,value){f.value=String(value);f.edited=f.value!==f.raw;f.reviewed=false;f.reviewedAt=null;}
export function confirmField(f){f.reviewed=true;f.reviewedAt=new Date().toISOString();}
export function exportData(fields,meta={}){
 if(!fields.length)throw Error('Es sind keine Daten vorhanden.');if(pending(fields).length)throw Error('Bitte zuerst alle markierten Angaben prüfen.');
 const document=Object.create(null),animals=new Map();for(const f of fields){const m=f.key.match(/^tiere\.(\d+)\.(.+)$/);if(m){if(blocked.has(m[2]))throw Error('Ungültiger Schlüssel');if(!animals.has(+m[1]))animals.set(+m[1],Object.create(null));animals.get(+m[1])[m[2]]=f.value===''?null:f.value;}else document[f.key]=f.value===''?null:f.value;}
 return {schema_version:'1.0',source:meta.source||null,exported_at:new Date().toISOString(),confidence_note:'Modell-Selbsteinschätzung; keine kalibrierte Wahrscheinlichkeit. Handschrift, Prüfhinweise und Änderungen erfordern Bestätigung.',threshold:THRESHOLD,document,animals:[...animals.entries()].sort((a,b)=>a[0]-b[0]).map(x=>x[1]),usage:meta.usage||null,model:meta.model||null,audit:fields.map(f=>({key:f.key,raw:f.raw,value:f.value,confidence:f.confidence,handwritten:f.handwritten,reviewed:f.reviewed,reviewed_at:f.reviewedAt,edited:f.edited,page:f.page,notes:issues(f,fields)}))};
}
export function importData(data){
 if(data.fields)return normalizeFields(data.fields);const fields=[];
 const flatten=(o,prefix='',group='Dokument')=>{for(const [k,v]of Object.entries(o||{})){if(blocked.has(k))continue;const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,group);else fields.push({key,label:k.replaceAll('_',' '),value:v==null?'':typeof v==='object'?JSON.stringify(v):String(v),group,confidence:null,reason:'Import ohne verifizierte KI-Einschätzung'});}};
 if(data.document||data.dokument){flatten(data.document||data.dokument);(data.animals||data.tiere||[]).forEach((a,i)=>flatten(a,`tiere.${i}`,`Tier ${i+1} · ${a.name||''}`));}else flatten(data);
 return normalizeFields(fields);
}
