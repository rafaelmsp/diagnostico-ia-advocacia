import { mkdir, writeFile } from 'node:fs/promises';
const token=process.env.GOOGLE_SHEETS_COORD_TOKEN;
if(!token)throw Error('Segredo ausente.');
const cb='aggregate_'+Date.now(),url=new URL('https://script.google.com/macros/s/AKfycbxSNOFnMmhJPmutMEEOmFtkFeXH2FyUQlSR6OcFn1jsZcas7G8-I39HiQtm1qPYcrM/exec');
for(const [k,v] of [['action','dashboard_coord'],['token',token],['callback',cb],['_',String(Date.now())]])url.searchParams.set(k,v);
const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
let response;
try{const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('Erro HTTP '+r.status);response=(await r.text()).trim()}finally{clearTimeout(timeout)}
if(!response.startsWith(cb+'('))throw Error('JSONP inesperado');
const data=JSON.parse(response.slice(cb.length+1,response.lastIndexOf(')')));
if(data.ok!==true||!Array.isArray(data.respondents))throw Error('Estrutura inesperada');
const total=data.respondents.length;
const num=x=>Number.isFinite(+x)?+x:0;
const scores=['adoptionPct','maturityAvg','governanceAvg','digitalCompetenceAvg','interestAvg','highRiskPct','trainingNeedPct','toolsAvg','usesAvg'];
const kpis=Object.fromEntries(scores.map(k=>[k,num(data.kpis?.[k])]));
const category=(obj,values)=>Object.fromEntries(values.map(k=>[k,num(obj?.[k])]));
const distributions={
 maturity:category(data.distributions?.maturity,['Avançada','Intermediária','Em desenvolvimento','Inicial']),
 risk:category(data.distributions?.risk,['Alto','Moderado','Baixo'])
};
const safe=x=>{
 const s=String(x??'').trim();
 return !!s&&s.length<=90&&!/[@\n\r<>]|\b(?:OAB|CPF|CNPJ|telefone|celular|whatsapp|e-mail|email)\b|https?:|(?:\d[\s.-]?){7,}/i.test(s);
};
const rank=arr=>(Array.isArray(arr)?arr:[]).filter(x=>safe(x?.label)&&num(x.value)>=3).slice(0,8).map(x=>({label:String(x.label).trim(),value:num(x.value),pct:total?Math.round(num(x.value)/total*1000)/10:0}));
const rankings=Object.fromEntries(['tools','uses','training','governance','systems'].map(k=>[k,rank(data.rankings?.[k])]));
const summary={ok:true,type:'aggregated-only',generatedAt:String(data.generatedAt||new Date().toISOString()),publishedAt:new Date().toISOString(),total,minimumGroupSize:3,kpis:total>=5?kpis:{},distributions:total>=5?distributions:{},rankings:total>=5?rankings:{}};
if('respondents' in summary||'token' in summary)throw Error('Dados indevidos');
await mkdir('data',{recursive:true});
await writeFile('data/resumo-anonimo.json',JSON.stringify(summary,null,2)+'\n','utf8');
console.log('Indicadores atualizados; total de respostas: '+total+'.');
