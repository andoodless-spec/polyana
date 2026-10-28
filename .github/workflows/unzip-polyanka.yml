"use client";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Heart, Image as ImageIcon, Pencil, X, Check, Sun, Moon } from "lucide-react";
import { today, uid } from "@/lib/data";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const WD = ["пн","вт","ср","чт","пт","сб","вс"];
const STICKERS = [
  ["heart","Сердце"],["leaves","Листочки"],["stars","Звёзды"],["book","Книжка"],["pot-ladle","Кастрюля с половником"],["rain-cloud","Тучка с дождиком"],
];
const WORK_TONES = ["#93a681","#a3a071","#899b76","#91a36f","#9eaa76","#8da682","#a7a46a","#8b9a73","#b18b60","#b69265","#9f986b","#839bb0"];
const pad = (n:number) => String(n).padStart(2,"0");
const iso = (d:Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseIso = (s:string) => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d,12); };
const monthKey = (d:Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const daysInMonth = (y:number,m:number) => new Date(y,m+1,0).getDate();
const mondayIndex = (d:Date) => (d.getDay()+6)%7;
const diffDays = (a:string,b:string) => Math.round((parseIso(b).getTime()-parseIso(a).getTime())/86400000);

function PixelArrow({dir}:{dir:"left"|"right"}) { return <svg width="22" height="22" viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true"><path fill="currentColor" d={dir==="left"?"M8 3h5v4h4v3h4v4h-4v3h-4v4H8v-4H4v-3H1v-4h3v-3h4z":"M16 3h-5v4H7v3H3v4h4v3h4v4h5v-4h4v-3h3v-4h-3v-3h-4z"}/></svg>; }
function PixelMushroom(){return <svg width="23" height="23" viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true"><path d="M4 15V11h4V7h4V4h8v3h4v4h4v4H4zM10 15h12v4h-3v8h-6v-8h-3z" fill="currentColor"/><path d="M10 11h3v3h-3zm9-3h3v3h-3zm5 5h3v2h-3z" fill="var(--calendar-surface)"/></svg>;}
function PixelShovel(){return <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M10 1h4v3h3v3h-3v7h3v3h3v3h-4v3H8v-3H4v-3h3v-3h3V7H7V4h3z"/></svg>;}
function PixelPicture(){return <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M2 3h20v3h-2v12h2v3H2v-3h2V6H2zm5 3v3h3v3h3v-3h3V7h-3V6h-3v2H9V6zm-2 9v3h14v-3h-3v-2h-3v2h-2v-1h-3v1z"/></svg>;}
function PixelHeart(){return <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M4 3h5v2h2V3h5v2h3v5h2v4h-3v3h-3v3h-3v2h-2v-2H8v-3H5v-3H2v-4h2z"/></svg>;}
function Balloon({color}:{color:string}){return <svg className="calendar-balloon" width="17" height="22" viewBox="0 0 24 32" shapeRendering="crispEdges" aria-label="День рождения"><path d="M9 1h6v3h4v3h2v10h-3v3h-4v3h-4v-3H6v-3H3V7h2V4h4z" fill={color}/><path d="M11 23h2v3h-2zM12 26h2v4h-2z" fill="currentColor"/></svg>;}
function WorkMark({color}:{color:string}){return <span className="calendar-work-mark" style={{backgroundColor:color}}/>;}

export default function CalendarPage({data, mutate, tell=()=>{}, compact=false, onOpen, onSettings}:any) {
  const [monthDate,setMonthDate]=useState(()=>{const d=parseIso(today());return new Date(d.getFullYear(),d.getMonth(),1,12);});
  const [editing,setEditing]=useState(false), [tool,setTool]=useState(""), [toolPhase,setToolPhase]=useState("anchor"), [stickerTray,setStickerTray]=useState(false), [pickedSticker,setPickedSticker]=useState("");
  const [selected,setSelected]=useState(""); const [entryDraft,setEntryDraft]=useState<any>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const y=monthDate.getFullYear(), m=monthDate.getMonth(), key=monthKey(monthDate), first=new Date(y,m,1,12), days=daysInMonth(y,m);
  const lead=mondayIndex(first), cells=Math.ceil((lead+days)/7)*7;
  const dates=Array.from({length:cells},(_,i)=>new Date(y,m,1-lead+i,12));
  const calMode=data.settings.calendarMode||"day", workColor=WORK_TONES[m];
  const firstShifts=data.settings.calendarFirstShifts||{}; const overrides=data.settings.calendarWorkOverrides||{};
  const entries=data.calendarEntries||[]; const stickers=data.calendarStickers||[];
  const header=data.settings.calendarHeaders?.[key]||`/calendar-headers/${pad(m+1)}.jpg`;
  const shiftStart=firstShifts[key];
  function anchorFor(dateStr:string){ return firstShifts[monthKey(parseIso(dateStr))]; }
  function autoWork(dateStr:string){ const anchor=anchorFor(dateStr); if(!anchor||dateStr<anchor)return false; const delta=diffDays(anchor,dateStr); return delta>=0 && delta%4<2; }
  function isWork(dateStr:string){ return Object.prototype.hasOwnProperty.call(overrides,dateStr)?!!overrides[dateStr]:autoWork(dateStr); }
  function entryOn(dateStr:string){ const exact=entries.find((e:any)=>e.date===dateStr); if(exact)return exact; const d=parseIso(dateStr); return entries.find((e:any)=>{if(!e.repeat)return false;const r=parseIso(e.date);return r.getMonth()===d.getMonth()&&r.getDate()===d.getDate();}); }
  function birthdayOn(dateStr:string){const d=parseIso(dateStr);return (data.birthdays||[]).filter((b:any)=>{const bd=parseIso(b.date);return bd.getMonth()===d.getMonth()&&bd.getDate()===d.getDate();});}
  function stickerFor(dateStr:string){return stickers.find((s:any)=>s.date===dateStr);}
  function shiftMonth(delta:number){setMonthDate(new Date(y,m+delta,1,12));setTool("");setStickerTray(false);}
  function saveEntry(){ if(!selected||!entryDraft)return; mutate((d:any)=>{d.calendarEntries=Array.isArray(d.calendarEntries)?d.calendarEntries:[];const i=d.calendarEntries.findIndex((e:any)=>e.date===selected);const row={...entryDraft,date:selected,shortText:String(entryDraft.shortText||"").slice(0,24),menuIds:entryDraft.menuIds||[],shoppingIds:entryDraft.shoppingIds||[]};if(i<0)d.calendarEntries.push(row);else d.calendarEntries[i]={...d.calendarEntries[i],...row};});setSelected("");setEntryDraft(null); }
  function openDay(dateStr:string){setSelected(dateStr);const found=entryOn(dateStr);setEntryDraft(found?{...found,menuIds:[...(found.menuIds||[])],shoppingIds:[...(found.shoppingIds||[])]}:{shortText:"",note:"",repeat:false,menuIds:[],shoppingIds:[]});}
  function chooseDay(dateStr:string){
    if(editing&&tool==="shovel"){
      mutate((d:any)=>{d.settings.calendarFirstShifts=d.settings.calendarFirstShifts||{};d.settings.calendarWorkOverrides=d.settings.calendarWorkOverrides||{};if(toolPhase==="anchor"){d.settings.calendarFirstShifts[monthKey(parseIso(dateStr))]=dateStr;delete d.settings.calendarWorkOverrides[dateStr];}else{const auto=(()=>{const a=d.settings.calendarFirstShifts[monthKey(parseIso(dateStr))];if(!a||dateStr<a)return false;return diffDays(a,dateStr)%4<2;})();if(Object.prototype.hasOwnProperty.call(d.settings.calendarWorkOverrides,dateStr))delete d.settings.calendarWorkOverrides[dateStr];else d.settings.calendarWorkOverrides[dateStr]=!auto;}});
      if(toolPhase==="anchor")setToolPhase("manual");return;
    }
    if(editing&&tool==="heart"&&pickedSticker){mutate((d:any)=>{d.calendarStickers=(d.calendarStickers||[]).filter((s:any)=>s.date!==dateStr);d.calendarStickers.push({id:uid(),date:dateStr,sticker:pickedSticker});});return;}
    openDay(dateStr);
  }
  function toggleTool(next:string){
    if(next==="picture"){fileRef.current?.click();return;}
    if(tool===next){setTool("");setStickerTray(false);return;}
    setTool(next);
    if(next==="shovel"){setToolPhase(shiftStart?"manual":"anchor");setStickerTray(false);}
    else if(next==="heart"){setStickerTray(true);}
  }
  function loadHeader(file?:File){ if(!file)return;const img=new Image();img.onload=()=>{const c=document.createElement("canvas"),ctx=c.getContext("2d")!;c.width=1000;c.height=250;const scale=Math.max(c.width/img.width,c.height/img.height);const w=img.width*scale,h=img.height*scale;ctx.drawImage(img,(c.width-w)/2,(c.height-h)/2,w,h);const dataUrl=c.toDataURL("image/jpeg",.78);mutate((d:any)=>{d.settings.calendarHeaders=d.settings.calendarHeaders||{};d.settings.calendarHeaders[key]=dataUrl;});tell("Шапка календаря обновлена");};img.src=URL.createObjectURL(file); }
  function exportImage(){
    const c=document.createElement("canvas"),ctx=c.getContext("2d")!;c.width=900;c.height=1200;
    const root=getComputedStyle(document.querySelector(".calendar-surface")||document.documentElement);const surface=root.getPropertyValue("--calendar-surface").trim()||"#f6f5eb",ink=root.getPropertyValue("--calendar-ink").trim()||"#354730",line=root.getPropertyValue("--calendar-line").trim()||"#dce1d1";
    ctx.fillStyle=surface;ctx.fillRect(0,0,c.width,c.height);
    const img=new Image();img.onload=()=>{ctx.drawImage(img,30,30,840,205);ctx.fillStyle=ink;ctx.textAlign="center";ctx.font='bold 52px "Brand Pixel"';ctx.fillText(`${MONTHS[m]} ${y}`,450,290);ctx.font='20px "Brand Pixel"';WD.forEach((wd,i)=>ctx.fillText(wd,90+i*120,335));
      const top=360,cw=116,rh=116,gap=4;dates.forEach((day,i)=>{const row=Math.floor(i/7),col=i%7,x=30+col*120,yy=top+row*120,ds=iso(day);const wd=isWork(ds);ctx.fillStyle=wd?workColor:surface;ctx.strokeStyle=line;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,yy,cw,rh,14);ctx.fill();ctx.stroke();ctx.textAlign="left";ctx.fillStyle=day.getMonth()===m?ink:"#a6aa9f";ctx.font='20px "Brand Pixel"';ctx.fillText(String(day.getDate()),x+10,yy+28);const en=entryOn(ds);if(en?.shortText){ctx.font='13px "Brand Pixel"';ctx.fillText(en.shortText.slice(0,24),x+9,yy+55);}if(birthdayOn(ds).length){ctx.fillStyle=birthdayOn(ds)[0].color||"#c98189";ctx.fillRect(x+cw-22,yy+10,10,10);}});
      const a=document.createElement("a");a.download=`calendar-${y}-${pad(m+1)}.png`;a.href=c.toDataURL("image/png");a.click();};img.onerror=()=>tell("Не удалось подготовить изображение");img.src=header;
  }
  function updateDraft(patch:any){setEntryDraft((old:any)=>({...old,...patch}));}
  const dateLabel=(ds:string)=>parseIso(ds).toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const itemsInMenu=(data.menu||[]).map((x:any)=>({...x,dish:(data.dishes||[]).find((d:any)=>d.id===x.dishId)})).filter((x:any)=>x.dish);
  const classes=`calendar-surface ${compact?"calendar-compact":""} ${calMode==="night"?"calendar-night":""}`;
  return <section className={classes} data-theme={data.settings.theme||"sage"}>
    {!compact&&<div className="calendar-page-heading"><div><span className="eyebrow">ПЛАНЫ, ЗАМЕТКИ И ВАЖНЫЕ ДАТЫ</span><h1>Календарь<span>.</span></h1></div><button className="icon-btn" title="Оформление календаря" aria-label="Оформление календаря" onClick={()=>onSettings?.()}><Sun size={17}/><span className="sr-only">Оформление</span></button></div>}
    <div className="calendar-main-card">
      <div className="calendar-season-header" style={{backgroundImage:`url(${header})`}} aria-label={`${MONTHS[m]} ${y}`}/>
      <div className="calendar-title-row">
        <h2>{MONTHS[m]} <span>{y}</span></h2>
        {compact&&<button className="calendar-open-link" onClick={()=>onOpen?.()}>Открыть</button>}
      </div>
      <div className={`calendar-weekdays ${compact?"mini":""}`}>{WD.map((w,i)=><span key={w} className={i>4?"weekend":""}>{w}</span>)}</div>
      <div className={`calendar-grid ${compact?"mini":""}`}>
        {dates.map((day,i)=>{const ds=iso(day),inside=day.getMonth()===m,en=entryOn(ds),bds=birthdayOn(ds),st=stickerFor(ds),work=isWork(ds),anchor=anchorFor(ds)===ds;
          return <button type="button" key={ds} className={`calendar-cell ${inside?"":"outside"} ${work?"is-work":""} ${ds===today()?"today":""} ${anchor?"shift-anchor":""}`} style={{"--month-work":workColor} as any} onClick={()=>chooseDay(ds)} title={dateLabel(ds)}>
            <span className="calendar-date-number">{day.getDate()}</span>
            {bds.slice(0,2).map((b:any)=><Balloon key={b.id} color={b.color||"#c98189"}/>)}
            {st&&<img className="calendar-cell-sticker" src={`/calendar-stickers/${st.sticker}.png`} alt="Стикер"/>}
            {en?.shortText&&<span className="calendar-short-note">{en.shortText}</span>}
            {work&&<WorkMark color={workColor}/>}
          </button>;
        })}
      </div>
      {stickerTray&&editing&&<div className="calendar-sticker-tray">{STICKERS.map(([id,label])=><button key={id} className={pickedSticker===id?"selected":""} title={label} aria-label={label} onClick={()=>setPickedSticker(id)}><img src={`/calendar-stickers/${id}.png`} alt=""/></button>)}</div>}
      <div className={`calendar-toolbar ${editing?"editing":""}`}>
        {!editing&&<><button className="calendar-tool" aria-label="Предыдущий месяц" title="Предыдущий месяц" onClick={()=>shiftMonth(-1)}><PixelArrow dir="left"/></button><span className="calendar-toolbar-sep"/><button className="calendar-tool" aria-label="Редактировать календарь" title="Редактировать" onClick={()=>setEditing(true)}><Pencil size={19}/></button><button className="calendar-tool" aria-label="Скачать календарь" title="Скачать" onClick={exportImage}><PixelMushroom/></button><span className="calendar-toolbar-sep"/><button className="calendar-tool" aria-label="Следующий месяц" title="Следующий месяц" onClick={()=>shiftMonth(1)}><PixelArrow dir="right"/></button></>}
        {editing&&<><button className={`calendar-tool ${tool==="shovel"?"active":""}`} aria-label="Отметить рабочие дни" title={toolPhase==="anchor"?"Выбрать первую смену месяца":"Добавить или снять рабочие дни"} onClick={()=>toggleTool("shovel")}><PixelShovel/></button><button className="calendar-tool" aria-label="Сменить шапку календаря" title="Сменить шапку" onClick={()=>toggleTool("picture")}><PixelPicture/></button><button className={`calendar-tool ${tool==="heart"?"active":""}`} aria-label="Стикеры" title="Стикеры" onClick={()=>toggleTool("heart")}><PixelHeart/></button><button className="calendar-tool calendar-done" aria-label="Готово" title="Готово" onClick={()=>{setEditing(false);setTool("");setStickerTray(false);}}><Check size={18}/></button></>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={e=>{loadHeader(e.target.files?.[0]);e.currentTarget.value="";}}/>
    </div>
    {selected&&entryDraft&&<div className="calendar-modal-backdrop" onClick={()=>{setSelected("");setEntryDraft(null);}}><section className="calendar-day-modal" role="dialog" aria-modal="true" aria-label={dateLabel(selected)} onClick={e=>e.stopPropagation()}>
      <header><h2>{dateLabel(selected)}</h2><button className="icon-btn" aria-label="Закрыть" onClick={()=>{setSelected("");setEntryDraft(null);}}><X size={18}/></button></header>
      {birthdayOn(selected).map((b:any)=><div className="calendar-birthday-info" key={b.id}><Balloon color={b.color||"#c98189"}/><span><strong>День рождения · {b.name}</strong><small>Цвет шарика выбран во вкладке дней рождения</small></span></div>)}
      <label className="calendar-field"><span>Короткая запись · максимум 24 символа</span><div className="calendar-short-input"><input maxLength={24} value={entryDraft.shortText||""} onChange={e=>updateDraft({shortText:e.target.value.slice(0,24)})}/><small>{(entryDraft.shortText||"").length}/24</small></div></label>
      <label className="calendar-repeat"><input type="checkbox" checked={!!entryDraft.repeat} onChange={e=>updateDraft({repeat:e.target.checked})}/><span>Повторять ежегодно</span></label>
      <label className="calendar-field"><span>Подробности дня</span><textarea rows={3} value={entryDraft.note||""} onChange={e=>updateDraft({note:e.target.value})} placeholder="Добавить заметку…"/></label>
      <div className="calendar-linked-title">Подключить из других вкладок</div>
      <div className="calendar-linked-grid">
        <fieldset><legend>Меню</legend>{itemsInMenu.length?itemsInMenu.map((x:any)=><label key={x.id}><input type="checkbox" checked={(entryDraft.menuIds||[]).includes(x.id)} onChange={e=>updateDraft({menuIds:e.target.checked?[...(entryDraft.menuIds||[]),x.id]:(entryDraft.menuIds||[]).filter((id:string)=>id!==x.id)})}/><span>{x.dish.title}</span></label>):<small>Пока нет блюд в меню</small>}</fieldset>
        <fieldset><legend>Список продуктов</legend>{(data.shopping||[]).length?(data.shopping||[]).map((x:any)=><label key={x.id}><input type="checkbox" checked={(entryDraft.shoppingIds||[]).includes(x.id)} onChange={e=>updateDraft({shoppingIds:e.target.checked?[...(entryDraft.shoppingIds||[]),x.id]:(entryDraft.shoppingIds||[]).filter((id:string)=>id!==x.id)})}/><span>{x.name}</span></label>):<small>Пока нет продуктов в списке</small>}</fieldset>
      </div>
      <footer><button className="btn soft" onClick={()=>{setSelected("");setEntryDraft(null);}}>Отмена</button><button className="btn primary" onClick={saveEntry}><Check size={15}/>Сохранить</button></footer>
    </section></div>}
  </section>;
}
