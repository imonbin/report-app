import { useState, useRef, useEffect, useCallback } from "react";
import { Store } from "./store.js";

const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => { const d=new Date(); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; };

/* ══════════════════════════════════════════
   画像圧縮（自動でJPEG圧縮・最大800px）
══════════════════════════════════════════ */
async function compressImage(dataUrl, maxPx=800, quality=0.7) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      res(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => res(dataUrl);
    img.src = dataUrl;
  });
}


/* ══════════════════════════════════════════
   TEMPLATES
══════════════════════════════════════════ */
const TEMPLATES = [
  {id:"t01",cat:"集中厨房",name:"グリスフィルター清掃（定期）",coverType:"A",photoType:"β"},
  {id:"t02",cat:"集中厨房",name:"フード整備（スポット）",coverType:"A",photoType:"ζ"},
  {id:"t03",cat:"集中厨房",name:"フード整備（定期）",coverType:"A",photoType:"ζ"},
  {id:"t04",cat:"三越 A型",name:"アウトドア・ジョアン・お得意様サロン",coverType:"A",photoType:"β"},
  {id:"t05",cat:"三越 A型",name:"いつもや",coverType:"A",photoType:"β"},
  {id:"t06",cat:"三越 A型",name:"フードコレクション",coverType:"A",photoType:"β"},
  {id:"t07",cat:"三越 A型",name:"宮越屋フード",coverType:"A",photoType:"β"},
  {id:"t08",cat:"三越 A型",name:"三越銀座",coverType:"A",photoType:"β"},
  {id:"t09",cat:"三越 A型",name:"山の上",coverType:"A",photoType:"β"},
  {id:"t10",cat:"三越 A型",name:"新館10F 紫苑",coverType:"A",photoType:"β"},
  {id:"t11",cat:"三越 B型",name:"新館9階 グリル満天星",coverType:"B",photoType:"β"},
  {id:"t12",cat:"三越 B型",name:"特別食堂客席 PACフィルター",coverType:"B",photoType:"β"},
  {id:"t13",cat:"三越 B型",name:"三越劇場",coverType:"B",photoType:"β"},
  {id:"t14",cat:"三越 B型",name:"本館シャンデリア清掃",coverType:"B",photoType:"β"},
  {id:"t15",cat:"三越 B型",name:"新館・本館 給排気口清掃",coverType:"B",photoType:"α"},
  {id:"t16",cat:"三越 B型",name:"本館西北喫煙所 高圧洗浄",coverType:"B",photoType:"β"},
  {id:"t17",cat:"三越 B型",name:"明治神宮",coverType:"B",photoType:"β"},
  {id:"t18",cat:"三越 B型",name:"更には",coverType:"B",photoType:"β"},
  {id:"t19",cat:"三越 B型",name:"新宿大塚家具",coverType:"B",photoType:"β"},
  {id:"t20",cat:"三越 C型",name:"天女の像 除塵作業",coverType:"C",photoType:"γ"},
  {id:"t21",cat:"三越 C型",name:"本館 樹冠除座清掃",coverType:"C",photoType:"ε"},
  {id:"t22",cat:"三越 C型",name:"本館制気口清掃",coverType:"C2",photoType:"α"},
  {id:"t23",cat:"城南信用金庫",name:"現地調査報告書",coverType:"D",photoType:"δ"},
  {id:"t24",cat:"城南信用金庫",name:"作業完了報告書",coverType:"E",photoType:"δ"},
];

/* ══════════════════════════════════════════
   COVER & PHOTO FACTORIES
══════════════════════════════════════════ */
const base3=(o={})=>({senderPostal:"〒141-0031",senderAddress:"東京都品川区西五反田5-5-7",senderBuilding:"ケーエムビル5階",senderCompany:"日都産業株式会社",...o});
const mkCoverA=(n="")=>base3({id:"cover",type:"cover",coverType:"A",date:today(),clientCompany:"株式会社三越伊勢丹アイムファシリティーズ",clientDept:"日本橋営業所　設備部御中",responsible:"吉田 朗人",workers:"玉岡 弘成",workDate:"",requester:"設備部　野口 様",workTime:"",workPlace:n,workItemsTitle:"各厨房グリスフィルター清掃",workItems:[],notes:"施工実施範囲別紙参照"});
const mkCoverB=(n="")=>base3({id:"cover",type:"cover",coverType:"B",date:today(),clientCompany:"株式会社三越伊勢丹アイムファシリティーズ",clientDept:"日本橋営業所　設備部御中",responsible:"吉田 朗人",workers:"玉岡 弘成",workDate:"",requester:"設備部　野口 様",workTime:"",workPlace:n,workItemsTitle:"",workItems:[],notes:"施工実施範囲別紙参照"});
const mkCoverC=(n="")=>base3({id:"cover",type:"cover",coverType:"C",date:today(),clientCompany:"三越伊勢丹アイムファシリティーズ株式会社",clientDept:"",responsible:"吉田 真生",workResponsible:"杉山 暁",requester:"三越伊勢丹アイムファシリティーズ　溝田様",clientWorkDate:"",workPlace:n,workTime:"",requestContent:n,workLines:["作業手順","①道具準備","","②","","③","","④","",""],notes:""});
const mkCoverC2=()=>base3({id:"cover",type:"cover",coverType:"C2",date:today(),clientCompany:"三越伊勢丹アイムファシリティーズ株式会社",clientDept:"日本橋営業所　設備部御中",responsible:"吉田 朗人",workResponsible:"玉岡 弘成",requester:"三越伊勢丹アイムファシリティーズ　清水様",workDate:"",workPlace:"本館制気口清掃",workTime:"19：30〜23：00",requestContent:"・本館制気口清掃\n\n・PACエアコングリル、フィルター清掃",workContent:"従業員遠方制気口メンテナンス\n①グリルを外す\n②掃除機で埃を除去する\n③内部シャッターの埃を掃除機で吸い込む\n④グリルを拭き上げる\n⑤グリルを取り付ける\n⑥作業場所に埃がないか確認し道具の置き忘れがないか確認して終了",notes:""});
const mkCoverD=()=>base3({id:"cover",type:"cover",coverType:"D",date:"令和8年　3月　12日",client:"城南信用金庫　御中",responsible:"吉田 朗人",workResponsible:"相澤 良頼",requester:"管財部　野村様　伊藤様",workDate:"",workPlace:"銀座支店",workTime:"",requestContent:"2〜3階階段立ち上がり、2・3階営業室壁\n\n2・3階ロビー、2・3階バックヤード",contentRows:["","",""],notes:"詳細は別紙参照"});
const mkCoverE=()=>base3({id:"cover",type:"cover",coverType:"E",date:"令和8年　4月　1日",client:"城南信用金庫　御中",responsible:"吉田 朗人",workResponsible:"吉田 朗人",requester:"管財部　野村様　伊藤様",workDate:"",workPlace:"淵野辺支店",workTime:"09：00〜14：00",requestPlace:"1階男女トイレ、駐車場",workContent:"■床面特別洗浄　保護剤塗布作業\n\n　ポリッシャーにて水洗いし、拭き上げ、ワックス仕上げ。\n\n■駐車場苔取り作業\n\n　高圧洗浄機と手作業での苔取り作業。",notes:"詳細は別紙参照"});
const mkPα=(o={})=>({id:uid(),type:"photo",photoType:"α",title:o.title||"制気口清掃対象箇所画像一覧",floor:o.floor||"",sections:[{id:uid(),location:"",size:"",beforeImg:null,afterImg:null},{id:uid(),location:"",size:"",beforeImg:null,afterImg:null},{id:uid(),location:"",size:"",beforeImg:null,afterImg:null}]});
const mkPβ=()=>({id:uid(),type:"photo",photoType:"β",location:"",area:"",dateStr:"",dayOfWeek:"",sections:[{id:uid(),title:"",count:"",beforeImg:null,afterImg:null},{id:uid(),title:"",count:"",beforeImg:null,afterImg:null},{id:uid(),title:"",count:"",beforeImg:null,afterImg:null}]});
const mkPγ=()=>({id:uid(),type:"photo",photoType:"γ",headerTitle:"本館　1階　天女の像　除塵作業",rows:[{id:uid(),leftLabel:"作業中",rightLabel:"作業中",leftImg:null,rightImg:null},{id:uid(),leftLabel:"台座部分作業前",rightLabel:"台座部分作業後",leftImg:null,rightImg:null},{id:uid(),leftLabel:"台座ガラス作業前",rightLabel:"台座ガラス作業後",leftImg:null,rightImg:null}]});
const mkPδ=()=>({id:uid(),type:"photo",photoType:"δ",headerTitle:"施工（前・後）写真",rows:[{id:uid(),beforeImg:null,afterImg:null},{id:uid(),beforeImg:null,afterImg:null}]});
const mkPε=()=>({id:uid(),type:"photo",photoType:"ε",location:"日本橋三越本館1階",area:"",dateStr:"",dayOfWeek:"",sections:[{id:uid(),title:"アネモ",img1:null,img2:null,img3:null},{id:uid(),title:"ダウンライト",img1:null,img2:null,img3:null},{id:uid(),title:"樹冠",img1:null,img2:null,img3:null},{id:uid(),title:"VHS",img1:null,img2:null,img3:null}],extraLabel:"その他、養生など",extraImgs:[null,null]});
const mkPζ=()=>({id:uid(),type:"photo",photoType:"ζ",location:"日本橋三越本館B1階",area:"厨房",dateStr:"",dayOfWeek:"",sections:[{id:uid(),title:"",img1:null,img2:null,img3:null,img4:null},{id:uid(),title:"",img1:null,img2:null,img3:null,img4:null}]});

const PFACT={"α":mkPα,"β":mkPβ,"γ":mkPγ,"δ":mkPδ,"ε":mkPε,"ζ":mkPζ};
const CFACT={A:mkCoverA,B:mkCoverB,C:mkCoverC,C2:mkCoverC2,D:mkCoverD,E:mkCoverE};
const PHOTO_LABELS={"α":"場所+サイズ","β":"通常3段","γ":"矢印式","δ":"城南式","ε":"樹冠3列","ζ":"フード2×2"};

/* ══════════════════════════════════════════
   ET
══════════════════════════════════════════ */
function ET({value,onChange,style={},placeholder="タップして編集",multiline=false,em,rows=3}){
  const [on,setOn]=useState(false);
  const [v,setV]=useState(value??"");
  const ref=useRef();
  useEffect(()=>setV(value??""),[value]);
  useEffect(()=>{if(on&&ref.current){ref.current.focus();if(!multiline)ref.current.select();}},[on]);
  const done=()=>{setOn(false);onChange(v);};
  const base={fontFamily:"'Noto Serif JP','Noto Sans JP',serif",...style,outline:"none"};
  if(on){
    const s={...base,background:"#fffde7",border:"2px solid #f59f00",borderRadius:4,padding:"4px 8px",width:"100%",resize:multiline?"vertical":"none",boxSizing:"border-box",fontSize:style.fontSize||12};
    return multiline?<textarea ref={ref} value={v} onChange={e=>setV(e.target.value)} onBlur={done} style={s} rows={rows}/>
      :<input ref={ref} value={v} onChange={e=>setV(e.target.value)} onBlur={done} style={s}/>;
  }
  const empty=!value||value==="";
  return <span onClick={()=>em&&setOn(true)} style={{...base,display:"inline-block",minWidth:10,borderBottom:em?"1px dashed #bbb":"none",padding:"1px 2px",background:em?"rgba(245,159,0,.05)":"transparent",borderRadius:2,color:empty?"#aaa":(style.color||"#111"),cursor:em?"text":"default",WebkitUserSelect:"none"}}>{empty?(em?placeholder:""):value}</span>;
}

/* ══════════════════════════════════════════
   PS (Photo Slot)
══════════════════════════════════════════ */
function PS({img,onChange,label,em,h=140}){
  const ref=useRef();
  const read=async f=>{if(!f||!f.type.startsWith("image/"))return;const r=new FileReader();r.onload=async e=>{const compressed=await compressImage(e.target.result);onChange(compressed);};r.readAsDataURL(f);};
  return(
    <div style={{position:"relative",height:h}}>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>read(e.target.files[0])}/>
      {img?(
        <div style={{position:"relative",height:"100%"}}>
          <img src={img} alt={label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          {em&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,.6)",display:"flex",gap:4,padding:4,justifyContent:"center"}}>
            <button onClick={()=>ref.current.click()} style={MB2("#2563eb")}>変更</button>
            <button onClick={()=>onChange(null)} style={MB2("#dc2626")}>削除</button>
          </div>}
        </div>
      ):(
        <div onClick={()=>em&&ref.current.click()} style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:em?"2px dashed #94a3b8":"1px solid #e2e8f0",background:em?"#f8fafc":"#f9fafb",cursor:em?"pointer":"default",WebkitTapHighlightColor:"rgba(0,0,0,0)"}}>
          {em?<><div style={{fontSize:28}}>📷</div><div style={{fontSize:10,color:"#64748b",fontWeight:600,marginTop:4}}>{label}</div><div style={{fontSize:9,color:"#94a3b8"}}>タップして追加</div></>
            :<div style={{fontSize:10,color:"#cbd5e1"}}>写真なし</div>}
        </div>
      )}
    </div>
  );
}
const MB2=bg=>({background:bg,color:"#fff",border:"none",borderRadius:4,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",fontWeight:600,minHeight:32});

/* ══════════════════════════════════════════
   TABLE HELPERS
══════════════════════════════════════════ */
const T={width:"100%",borderCollapse:"collapse",fontSize:11};
const TS={border:"1px solid #aaa",padding:"5px 8px",background:"#f5f5f5",fontWeight:700,textAlign:"center",whiteSpace:"nowrap",fontSize:10};
const DS={border:"1px solid #aaa",padding:"5px 8px"};
const Th=({c,s={}})=><td style={{...TS,...s}}>{c}</td>;
const Td=({c,n,s={}})=><td colSpan={n||1} style={{...DS,...s}}>{c}</td>;
const PW={width:"100%",background:"#fff",padding:"24px 20px",fontFamily:"'Noto Serif JP','Noto Sans JP',serif",fontSize:11,color:"#111",minHeight:"auto",boxSizing:"border-box"};

/* ══════════════════════════════════════════
   COVER PAGES (mobile-adjusted padding)
══════════════════════════════════════════ */
function CoverA({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=(k,s={},o={})=><ET value={page[k]} onChange={u(k)} style={s} em={em} {...o}/>;
  const wi=page.workItems||[];
  const ui=(id,k,v)=>onChange({...page,workItems:wi.map(x=>x.id===id?{...x,[k]:v}:x)});
  return(
    <div style={PW}>
      <div style={{textAlign:"right",fontSize:10,marginBottom:10}}>{et("date",{fontSize:10})}</div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,gap:8}}>
        <div style={{lineHeight:1.8,fontSize:10}}><div>{et("clientCompany",{fontSize:10})}</div><div>{et("clientDept",{fontSize:10})}</div></div>
        <div style={{textAlign:"right",lineHeight:1.7,fontSize:9}}>
          <div>{et("senderPostal",{fontSize:9})}</div><div>{et("senderAddress",{fontSize:9})}</div><div>{et("senderBuilding",{fontSize:9})}</div>
          <div style={{marginTop:2,fontWeight:700,fontSize:11,letterSpacing:2}}>{et("senderCompany",{fontSize:11,fontWeight:700})}</div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:16,fontWeight:700,letterSpacing:5,borderTop:"2px solid #111",borderBottom:"2px solid #111",padding:"5px 0",marginBottom:0}}>作 業 完 了 報 告 書</div>
      <table style={T}><tbody>
        <tr><Th c="責任者" s={{fontSize:9}}/><Td c={et("responsible",{fontSize:10})} /><td style={{...TS,width:22,fontSize:9}}>㊞</td><Th c="作業者" s={{fontSize:9}}/><Td c={et("workers",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td></tr>
        <tr><Th c="作業日" s={{fontSize:9}}/><Td c={et("workDate",{fontSize:10})} n={2}/><Th c="ご依頼者" s={{fontSize:9}}/><Td c={et("requester",{fontSize:10})} n={2}/></tr>
        <tr><Th c="作業時間" s={{fontSize:9}}/><Td c={et("workTime",{fontSize:10})} n={2}/><Th c="作業場所" s={{fontSize:9}}/><Td c={et("workPlace",{fontSize:10})} n={2}/></tr>
      </tbody></table>
      <table style={{...T,borderTop:"none",marginTop:0}}>
        <colgroup><col style={{width:36}}/><col/><col style={{width:36}}/><col style={{width:36}}/></colgroup>
        <tbody>
          <tr>
            <td rowSpan={wi.length+(em?4:3)} style={{border:"1px solid #aaa",background:"#f5f5f5",fontWeight:700,textAlign:"center",verticalAlign:"middle",fontSize:9,writingMode:"vertical-rl",letterSpacing:3,padding:"4px 2px"}}>作業内容</td>
            <td style={{border:"1px solid #aaa",padding:"3px 6px",background:"#fafafa",fontSize:9}}>{et("workItemsTitle",{fontSize:10,fontWeight:700})}</td>
            <td colSpan={2} style={{border:"1px solid #aaa",textAlign:"center",fontWeight:700,fontSize:9,padding:"2px",background:"#fafafa"}}>フィルター寸法</td>
          </tr>
          <tr>
            <td style={{border:"1px solid #aaa",background:"#f0f0f0"}}></td>
            <td style={{border:"1px solid #aaa",background:"#f0f0f0",textAlign:"center",fontWeight:700,fontSize:9}}>H</td>
            <td style={{border:"1px solid #aaa",background:"#f0f0f0",textAlign:"center",fontWeight:700,fontSize:9}}>W</td>
          </tr>
          {wi.map(x=>(
            <tr key={x.id}>
              <td style={{border:"1px solid #aaa",padding:"1px 5px"}}><div style={{display:"flex",alignItems:"center",gap:1}}>
                <ET value={x.name} onChange={v=>ui(x.id,"name",v)} style={{fontSize:10}} em={em} placeholder="内容"/>
                {em&&<button onClick={()=>onChange({...page,workItems:wi.filter(w=>w.id!==x.id)})} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:2,width:16,height:16,fontSize:8,cursor:"pointer",padding:0,flexShrink:0}}>✕</button>}
              </div></td>
              <td style={{border:"1px solid #aaa",padding:"1px 2px",textAlign:"center"}}><ET value={x.h} onChange={v=>ui(x.id,"h",v)} style={{fontSize:10,textAlign:"center"}} em={em}/></td>
              <td style={{border:"1px solid #aaa",padding:"1px 2px",textAlign:"center"}}><ET value={x.w} onChange={v=>ui(x.id,"w",v)} style={{fontSize:10,textAlign:"center"}} em={em}/></td>
            </tr>
          ))}
          {em&&<tr><td colSpan={3} style={{border:"1px solid #aaa",padding:0}}><button onClick={()=>onChange({...page,workItems:[...wi,{id:uid(),name:"",h:"",w:""}]})} style={{width:"100%",padding:"6px 0",background:"#f0fdf4",border:"none",color:"#16a34a",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:36}}>＋ 行を追加</button></td></tr>}
          <tr><Th c="備考" s={{fontSize:9}}/><td colSpan={2} style={{border:"1px solid #aaa",padding:"4px 6px",fontSize:10}}>{et("notes",{fontSize:10})}</td></tr>
        </tbody>
      </table>
      <div style={{marginTop:12,fontSize:9,lineHeight:2,color:"#444"}}>
        <div>1．作業記録として、本紙を大切に保管頂きますようお願い致します。</div>
        <div>2．もし、ご不明な点がございましたら本紙にてお問合せをお願い致します。</div>
      </div>
    </div>
  );
}

function CoverB({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=(k,s={})=><ET value={page[k]} onChange={u(k)} style={s} em={em}/>;
  const wi=page.workItems||[];
  const ui=(id,k,v)=>onChange({...page,workItems:wi.map(x=>x.id===id?{...x,[k]:v}:x)});
  return(
    <div style={PW}>
      <div style={{textAlign:"right",fontSize:10,marginBottom:10}}>{et("date",{fontSize:10})}</div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,gap:8}}>
        <div style={{lineHeight:1.8,fontSize:10}}><div>{et("clientCompany",{fontSize:10})}</div><div>{et("clientDept",{fontSize:10})}</div></div>
        <div style={{textAlign:"right",lineHeight:1.7,fontSize:9}}>
          <div>{et("senderPostal",{fontSize:9})}</div><div>{et("senderAddress",{fontSize:9})}</div><div>{et("senderBuilding",{fontSize:9})}</div>
          <div style={{marginTop:2,fontWeight:700,fontSize:11,letterSpacing:2}}>{et("senderCompany",{fontSize:11,fontWeight:700})}</div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:16,fontWeight:700,letterSpacing:5,borderTop:"2px solid #111",borderBottom:"2px solid #111",padding:"5px 0",marginBottom:0}}>作 業 完 了 報 告 書</div>
      <table style={T}><tbody>
        <tr><Th c="責任者" s={{fontSize:9}}/><Td c={et("responsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td><Th c="作業者" s={{fontSize:9}}/><Td c={et("workers",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td></tr>
        <tr><Th c="作業日" s={{fontSize:9}}/><Td c={et("workDate",{fontSize:10})} n={2}/><Th c="ご依頼者" s={{fontSize:9}}/><Td c={et("requester",{fontSize:10})} n={2}/></tr>
        <tr><Th c="作業時間" s={{fontSize:9}}/><Td c={et("workTime",{fontSize:10})} n={2}/><Th c="作業場所" s={{fontSize:9}}/><Td c={et("workPlace",{fontSize:10})} n={2}/></tr>
      </tbody></table>
      <table style={{...T,borderTop:"none",marginTop:0}}>
        <colgroup><col style={{width:36}}/><col/><col style={{width:40}}/><col style={{width:36}}/></colgroup>
        <tbody>
          <tr>
            <td rowSpan={wi.length+(em?3:2)} style={{border:"1px solid #aaa",background:"#f5f5f5",fontWeight:700,textAlign:"center",verticalAlign:"middle",fontSize:9,writingMode:"vertical-rl",letterSpacing:3,padding:"4px 2px"}}>作業内容</td>
            <td style={{border:"1px solid #aaa",padding:"2px 6px",background:"#fafafa"}}></td>
            <td style={{border:"1px solid #aaa",textAlign:"center",fontWeight:700,fontSize:9,padding:"2px",background:"#fafafa"}}>数量</td>
            <td style={{border:"1px solid #aaa",textAlign:"center",fontWeight:700,fontSize:9,padding:"2px",background:"#fafafa"}}>単位</td>
          </tr>
          {wi.map(x=>(
            <tr key={x.id}>
              <td style={{border:"1px solid #aaa",padding:"1px 5px"}}><div style={{display:"flex",alignItems:"center",gap:1}}>
                <ET value={x.name} onChange={v=>ui(x.id,"name",v)} style={{fontSize:10}} em={em} placeholder="内容"/>
                {em&&<button onClick={()=>onChange({...page,workItems:wi.filter(w=>w.id!==x.id)})} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:2,width:16,height:16,fontSize:8,cursor:"pointer",padding:0,flexShrink:0}}>✕</button>}
              </div></td>
              <td style={{border:"1px solid #aaa",padding:"1px 2px",textAlign:"center"}}><ET value={x.qty} onChange={v=>ui(x.id,"qty",v)} style={{fontSize:10,textAlign:"center"}} em={em}/></td>
              <td style={{border:"1px solid #aaa",padding:"1px 2px",textAlign:"center"}}><ET value={x.unit} onChange={v=>ui(x.id,"unit",v)} style={{fontSize:10,textAlign:"center"}} em={em}/></td>
            </tr>
          ))}
          {em&&<tr><td colSpan={3} style={{border:"1px solid #aaa",padding:0}}><button onClick={()=>onChange({...page,workItems:[...wi,{id:uid(),name:"",qty:"",unit:""}]})} style={{width:"100%",padding:"6px 0",background:"#f0fdf4",border:"none",color:"#16a34a",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:36}}>＋ 行を追加</button></td></tr>}
        </tbody>
      </table>
      <table style={{...T,borderTop:"none",marginTop:0}}><tbody>
        <tr><Th c="備考" s={{fontSize:9,width:36}}/><td style={{border:"1px solid #aaa",padding:"4px 6px",fontSize:10}}>{et("notes",{fontSize:10})}</td></tr>
      </tbody></table>
      <div style={{marginTop:12,fontSize:9,lineHeight:2,color:"#444"}}><div>1．作業記録として、本紙を大切に保管頂きますようお願い致します。</div><div>2．もし、ご不明な点がございましたら本紙にてお問合せをお願い致します。</div></div>
    </div>
  );
}

function CoverC({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=(k,s={},o={})=><ET value={page[k]} onChange={u(k)} style={s} em={em} {...o}/>;
  const lines=page.workLines||[];
  const ul=(i,v)=>{const a=[...lines];a[i]=v;onChange({...page,workLines:a});};
  return(
    <div style={PW}>
      <div style={{textAlign:"right",fontSize:10,marginBottom:8}}>{et("date",{fontSize:10})}</div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,gap:8}}>
        <div style={{fontSize:10}}>{et("clientCompany",{fontSize:10})}</div>
        <div style={{textAlign:"right",fontSize:9,lineHeight:1.7}}>
          <div>{et("senderPostal",{fontSize:9})}</div><div>{et("senderAddress",{fontSize:9})}</div><div>{et("senderBuilding",{fontSize:9})}</div>
          <div style={{fontWeight:700,fontSize:10,letterSpacing:2,marginTop:2}}>{et("senderCompany",{fontSize:10,fontWeight:700})}</div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:15,fontWeight:700,letterSpacing:5,marginBottom:10}}>作 業 完 了 報 告 書</div>
      <table style={{...T,marginBottom:0}}><tbody>
        <tr><Th c="責任者" s={{fontSize:9}}/><Td c={et("responsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td><Th c="作業責任者" s={{fontSize:9}}/><Td c={et("workResponsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td></tr>
        <tr><Th c="依頼者" s={{fontSize:9,width:50}}/><Td c={et("requester",{fontSize:10})} n={5}/></tr>
        <tr><Th c="作業日｜場所" s={{fontSize:8}}/><Td c={et("clientWorkDate",{fontSize:10})}/><Td c={et("workPlace",{fontSize:10})}/><Th c="作業時間" s={{fontSize:9}}/><Td c={et("workTime",{fontSize:10})} n={2}/></tr>
      </tbody></table>
      <table style={{...T,borderTop:"none",marginTop:0}}><tbody>
        <tr><td style={{...TS,width:50,verticalAlign:"middle",fontSize:9}}>依頼内容</td><td style={{border:"1px solid #aaa",padding:"8px",fontSize:11,textAlign:"center",height:60,verticalAlign:"middle"}}>{et("requestContent",{fontSize:11})}</td></tr>
        {lines.map((l,i)=>(
          <tr key={i}>
            {i===0&&<td rowSpan={lines.length+(em?1:0)} style={{...TS,verticalAlign:"top",paddingTop:8,fontSize:9}}>作業内容</td>}
            <td style={{border:"1px solid #aaa",padding:"1px 8px",fontSize:10,minHeight:18}}>
              <div style={{display:"flex",alignItems:"center",gap:2}}>
                <ET value={l} onChange={v=>ul(i,v)} style={{fontSize:10,width:"100%"}} em={em} placeholder=""/>
                {em&&<button onClick={()=>onChange({...page,workLines:lines.filter((_,j)=>j!==i)})} style={{flexShrink:0,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:2,width:16,height:16,fontSize:8,cursor:"pointer",padding:0}}>✕</button>}
              </div>
            </td>
          </tr>
        ))}
        {em&&<tr><td style={{border:"1px solid #aaa",padding:0}}><button onClick={()=>onChange({...page,workLines:[...lines,""]})} style={{width:"100%",padding:"6px 0",background:"#f0fdf4",border:"none",color:"#16a34a",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:36}}>＋ 行を追加</button></td></tr>}
        <tr><Th c="備考" s={{fontSize:9}}/><td style={{border:"1px solid #aaa",padding:"4px 8px",fontSize:10}}>{et("notes",{fontSize:10})}</td></tr>
      </tbody></table>
      <div style={{marginTop:12,fontSize:9,lineHeight:2,color:"#444"}}><div>1．作業記録として、本紙を大切に保管頂きますようお願い致します。</div><div>2．もし、ご不明な点がございましたら本紙にてお問合せをお願い致します。</div></div>
    </div>
  );
}

function CoverC2({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=(k,s={},o={})=><ET value={page[k]} onChange={u(k)} style={s} em={em} {...o}/>;
  return(
    <div style={PW}>
      <div style={{textAlign:"right",fontSize:10,marginBottom:8}}>{et("date",{fontSize:10})}</div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,gap:8}}>
        <div style={{fontSize:10}}><div>{et("clientCompany",{fontSize:10})}</div><div>{et("clientDept",{fontSize:10})}</div></div>
        <div style={{textAlign:"right",fontSize:9,lineHeight:1.7}}>
          <div>{et("senderPostal",{fontSize:9})}</div><div>{et("senderAddress",{fontSize:9})}</div><div>{et("senderBuilding",{fontSize:9})}</div>
          <div style={{fontWeight:700,fontSize:10,letterSpacing:2,marginTop:2}}>{et("senderCompany",{fontSize:10,fontWeight:700})}</div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:15,fontWeight:700,letterSpacing:5,marginBottom:10}}>作 業 完 了 報 告 書</div>
      <table style={{...T,marginBottom:0}}><tbody>
        <tr><Th c="責任者" s={{fontSize:9}}/><Td c={et("responsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td><Th c="作業責任者" s={{fontSize:9}}/><Td c={et("workResponsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td></tr>
        <tr><Th c="依頼者" s={{fontSize:9,width:50}}/><Td c={et("requester",{fontSize:10})} n={5}/></tr>
        <tr><Th c="作業日｜場所" s={{fontSize:8}}/><Td c={et("workDate",{fontSize:10})}/><Td c={et("workPlace",{fontSize:10})}/><Th c="作業時間" s={{fontSize:9}}/><Td c={et("workTime",{fontSize:10})} n={2}/></tr>
      </tbody></table>
      <table style={{...T,borderTop:"none",marginTop:0}}><tbody>
        <tr><td style={{...TS,width:50,verticalAlign:"top",paddingTop:8,fontSize:9}}>依頼内容</td><td style={{border:"1px solid #aaa",padding:"8px",fontSize:10,minHeight:60,verticalAlign:"top"}}>{et("requestContent",{fontSize:10},{multiline:true,rows:4})}</td></tr>
        <tr><td style={{...TS,width:50,verticalAlign:"top",paddingTop:8,fontSize:9}}>作業内容</td><td style={{border:"1px solid #aaa",padding:"8px",fontSize:10,minHeight:120,verticalAlign:"top"}}>{et("workContent",{fontSize:10},{multiline:true,rows:8})}</td></tr>
        <tr><Th c="備考" s={{fontSize:9}}/><td style={{border:"1px solid #aaa",padding:"4px 8px",fontSize:10}}>{et("notes",{fontSize:10})}</td></tr>
      </tbody></table>
      <div style={{marginTop:12,fontSize:9,lineHeight:2,color:"#444"}}><div>1．作業記録として、本紙を大切に保管頂きますようお願い致します。</div><div>2．もし、ご不明な点がございましたら本紙にてお問合せをお願い致します。</div></div>
    </div>
  );
}

function CoverD({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=(k,s={},o={})=><ET value={page[k]} onChange={u(k)} style={s} em={em} {...o}/>;
  const rows=page.contentRows||["","",""];
  const ur=(i,v)=>{const a=[...rows];a[i]=v;onChange({...page,contentRows:a});};
  return(
    <div style={PW}>
      <div style={{textAlign:"right",fontSize:10,marginBottom:6}}>{et("date",{fontSize:10})}</div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,gap:8}}>
        <div style={{fontSize:10}}>{et("client",{fontSize:10})}</div>
        <div style={{textAlign:"right",fontSize:9,lineHeight:1.7}}>
          <div>{et("senderPostal",{fontSize:9})}</div><div>{et("senderAddress",{fontSize:9})}</div><div>{et("senderBuilding",{fontSize:9})}</div>
          <div style={{fontWeight:700,fontSize:10,letterSpacing:2,marginTop:2}}>{et("senderCompany",{fontSize:10,fontWeight:700})}</div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:15,fontWeight:700,letterSpacing:5,marginBottom:10}}>現 地 調 査 報 告 書</div>
      <table style={{...T,marginBottom:0}}><tbody>
        <tr><Th c="責任者" s={{fontSize:9}}/><Td c={et("responsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td><Th c="作業責任者" s={{fontSize:9}}/><Td c={et("workResponsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td></tr>
        <tr><Th c="依頼者" s={{fontSize:9,width:50}}/><Td c={et("requester",{fontSize:10})} n={5}/></tr>
        <tr><Th c="作業日｜場所" s={{fontSize:8}}/><td style={{...DS,fontSize:10}}>{et("workDate",{fontSize:10})}</td><td style={{...DS,fontSize:10}}>{et("workPlace",{fontSize:10})}</td><Th c="作業時間" s={{fontSize:9}}/><Td c={et("workTime",{fontSize:10})} n={2}/></tr>
      </tbody></table>
      <table style={{...T,borderTop:"none",marginTop:0}}><tbody>
        <tr><td style={{...TS,width:50,verticalAlign:"middle",fontSize:9}}>依頼内容</td><td style={{border:"1px solid #aaa",padding:"8px",fontSize:10,height:60,verticalAlign:"middle"}}>{et("requestContent",{fontSize:10},{multiline:true,rows:3})}</td></tr>
        {rows.map((r,i)=>(
          <tr key={i}>{i===0&&<td rowSpan={3} style={{...TS,verticalAlign:"middle",height:60,fontSize:9}}></td>}
            <td style={{border:"1px solid #aaa",padding:"2px 8px",minHeight:40}}><ET value={r} onChange={v=>ur(i,v)} style={{fontSize:10,width:"100%"}} em={em} multiline rows={2} placeholder=""/></td>
          </tr>
        ))}
        <tr><Th c="備考" s={{fontSize:9}}/><td style={{border:"1px solid #aaa",padding:"4px 8px",fontSize:10}}>{et("notes",{fontSize:10})}</td></tr>
        <tr><td colSpan={2} style={{border:"1px solid #aaa",padding:"3px 8px",textAlign:"right",fontSize:9,color:"#555"}}>詳細は別紙参照</td></tr>
      </tbody></table>
      <div style={{marginTop:12,fontSize:9,lineHeight:2,color:"#444"}}><div>1．作業記録として、本紙を大切に保管頂きますようお願い致します。</div><div>2．もし、ご不明な点がございましたら本紙にてお問合せをお願い致します。</div></div>
    </div>
  );
}

function CoverE({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=(k,s={},o={})=><ET value={page[k]} onChange={u(k)} style={s} em={em} {...o}/>;
  return(
    <div style={PW}>
      <div style={{textAlign:"right",fontSize:10,marginBottom:6}}>{et("date",{fontSize:10})}</div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,gap:8}}>
        <div style={{fontSize:10}}>{et("client",{fontSize:10})}</div>
        <div style={{textAlign:"right",fontSize:9,lineHeight:1.7}}>
          <div>{et("senderPostal",{fontSize:9})}</div><div>{et("senderAddress",{fontSize:9})}</div><div>{et("senderBuilding",{fontSize:9})}</div>
          <div style={{fontWeight:700,fontSize:10,letterSpacing:2,marginTop:2}}>{et("senderCompany",{fontSize:10,fontWeight:700})}</div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:15,fontWeight:700,letterSpacing:5,marginBottom:10}}>作 業 完 了 報 告 書</div>
      <table style={{...T,marginBottom:0}}><tbody>
        <tr><Th c="責任者" s={{fontSize:9}}/><Td c={et("responsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td><Th c="作業責任者" s={{fontSize:9}}/><Td c={et("workResponsible",{fontSize:10})}/><td style={{...TS,width:22,fontSize:9}}>㊞</td></tr>
        <tr><Th c="依頼者" s={{fontSize:9,width:50}}/><Td c={et("requester",{fontSize:10})} n={5}/></tr>
        <tr><Th c="作業日｜場所" s={{fontSize:8}}/><td style={{...DS,fontSize:10}}>{et("workDate",{fontSize:10})}</td><td style={{...DS,fontSize:10}}>{et("workPlace",{fontSize:10})}</td><Th c="作業時間" s={{fontSize:9}}/><Td c={et("workTime",{fontSize:10})} n={2}/></tr>
      </tbody></table>
      <table style={{...T,borderTop:"none",marginTop:0}}><tbody>
        <tr><td style={{...TS,width:50,verticalAlign:"top",paddingTop:8,fontSize:9}}>依頼場所</td><td style={{border:"1px solid #aaa",padding:"8px",fontSize:10,minHeight:40}}>{et("requestPlace",{fontSize:10},{multiline:true,rows:2})}</td></tr>
        <tr><td style={{...TS,width:50,verticalAlign:"top",paddingTop:8,fontSize:9}}>作業内容</td><td style={{border:"1px solid #aaa",padding:"8px",fontSize:10,minHeight:100}}>{et("workContent",{fontSize:10},{multiline:true,rows:7})}</td></tr>
        <tr><td colSpan={2} style={{border:"1px solid #aaa",padding:"3px 8px",textAlign:"right",fontSize:9,color:"#555"}}>詳細は別紙参照</td></tr>
      </tbody></table>
      <div style={{marginTop:12,fontSize:9,lineHeight:2,color:"#444"}}><div>1．作業記録として、本紙を大切に保管頂きますようお願い致します。</div><div>2．もし、ご不明な点がございましたら本紙にてお問合せをお願い致します。</div></div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PHOTO PAGES
══════════════════════════════════════════ */
function PhotoAlpha({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const ss=page.sections||[];
  const us=(id,k,v)=>onChange({...page,sections:ss.map(s=>s.id===id?{...s,[k]:v}:s)});
  return(
    <div style={PW}>
      <div style={{fontSize:11,marginBottom:3}}><ET value={page.title} onChange={u("title")} style={{fontSize:11}} em={em}/></div>
      <div style={{fontSize:11,marginBottom:10}}>フロア：<ET value={page.floor} onChange={u("floor")} style={{fontSize:11}} em={em} placeholder="階"/></div>
      {ss.map((s,i)=>(
        <div key={s.id} style={{border:"1px solid #333",marginBottom:6}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"1px solid #333"}}>
            {["before","after"].map(side=>(
              <div key={side} style={{borderRight:side==="before"?"1px solid #333":"none",padding:"2px 5px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:9}}>場所：<ET value={s.location} onChange={v=>us(s.id,"location",v)} style={{fontSize:9}} em={em} placeholder="場所名"/>　{side==="before"?"作業前":"作業後"}</span>
                  {side==="before"&&em&&<button onClick={()=>onChange({...page,sections:ss.filter(x=>x.id!==s.id)})} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:2,padding:"1px 4px",fontSize:8,cursor:"pointer"}}>削除</button>}
                </div>
                <div style={{fontSize:9}}>サイズ：<ET value={s.size} onChange={v=>us(s.id,"size",v)} style={{fontSize:9}} em={em} placeholder="000×000"/></div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
            <div style={{borderRight:"1px solid #333"}}><PS img={s.beforeImg} onChange={v=>us(s.id,"beforeImg",v)} label="作業前" em={em} h={120}/></div>
            <div><PS img={s.afterImg} onChange={v=>us(s.id,"afterImg",v)} label="作業後" em={em} h={120}/></div>
          </div>
        </div>
      ))}
      {em&&<button onClick={()=>onChange({...page,sections:[...ss,{id:uid(),location:"",size:"",beforeImg:null,afterImg:null}]})} style={AddBtn}>＋ 箇所を追加</button>}
    </div>
  );
}

function PhotoBeta({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=(k)=><ET value={page[k]} onChange={u(k)} style={{fontSize:11}} em={em}/>;
  const ss=page.sections||[];
  const us=(id,k,v)=>onChange({...page,sections:ss.map(s=>s.id===id?{...s,[k]:v}:s)});
  return(
    <div style={PW}>
      <table style={{...T,marginBottom:14,fontSize:10}}><tbody>
        <tr><td style={{...TS,padding:"3px 6px",fontSize:9}}>場所</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc",fontSize:10}}>：　{et("location")}</td><td style={{...TS,padding:"3px 6px",fontSize:9}}>施工エリア</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc",fontSize:10}}>：　{et("area")}</td></tr>
        <tr><td style={{...TS,padding:"3px 6px",fontSize:9}}>日時</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc",fontSize:10}}>：　{et("dateStr")}</td><td style={{...TS,padding:"3px 6px",fontSize:9}}>曜日</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc",fontSize:10}}>：　{et("dayOfWeek")}</td></tr>
      </tbody></table>
      {ss.map((s,i)=>(
        <div key={s.id} style={{marginBottom:12,border:"1px solid #ccc",borderRadius:4,overflow:"hidden"}}>
          <div style={{background:"#2c3e50",color:"#fff",display:"flex",alignItems:"center",padding:"0 8px",minHeight:34}}>
            <div style={{flex:1,textAlign:"center",fontWeight:700,fontSize:11}}>
              <ET value={s.title} onChange={v=>us(s.id,"title",v)} style={{color:"#fff",fontSize:11,fontWeight:700}} em={em} placeholder="箇所名"/>
              {em&&<ET value={s.count} onChange={v=>us(s.id,"count",v)} style={{fontSize:9,color:"#94a3b8",marginLeft:6,width:40}} em={em} placeholder="枚数"/>}
            </div>
            {em&&<button onClick={()=>onChange({...page,sections:ss.filter(x=>x.id!==s.id)})} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:3,padding:"3px 8px",fontSize:10,cursor:"pointer",minHeight:28}}>削除</button>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
            {["before","after"].map(side=>(
              <div key={side} style={{borderRight:side==="before"?"1px solid #ccc":"none"}}>
                <div style={{background:"#f3f4f6",textAlign:"center",padding:"3px 0",fontSize:10,fontWeight:600,borderBottom:"1px solid #ccc"}}>{side==="before"?"作業前":"作業後"}</div>
                <PS img={s[side+"Img"]} onChange={v=>us(s.id,side+"Img",v)} label={side==="before"?"作業前":"作業後"} em={em} h={130}/>
              </div>
            ))}
          </div>
        </div>
      ))}
      {em&&<button onClick={()=>onChange({...page,sections:[...ss,{id:uid(),title:"",count:"",beforeImg:null,afterImg:null}]})} style={AddBtn}>＋ 箇所を追加</button>}
    </div>
  );
}

function PhotoGamma({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const rows=page.rows||[];
  const ur=(id,k,v)=>onChange({...page,rows:rows.map(r=>r.id===id?{...r,[k]:v}:r)});
  return(
    <div style={PW}>
      <div style={{textAlign:"center",fontSize:11,fontWeight:700,marginBottom:10,borderBottom:"1px solid #ccc",paddingBottom:5}}><ET value={page.headerTitle} onChange={u("headerTitle")} style={{fontSize:11,fontWeight:700}} em={em}/></div>
      {rows.map(r=>(
        <div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr 32px 1fr",marginBottom:10,alignItems:"stretch"}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,marginBottom:2,display:"flex",gap:3,alignItems:"center"}}>
              <ET value={r.leftLabel} onChange={v=>ur(r.id,"leftLabel",v)} style={{fontSize:10,fontWeight:600}} em={em} placeholder="ラベル"/>
              {em&&<button onClick={()=>onChange({...page,rows:rows.filter(x=>x.id!==r.id)})} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:2,padding:"1px 4px",fontSize:8,cursor:"pointer"}}>削除</button>}
            </div>
            <PS img={r.leftImg} onChange={v=>ur(r.id,"leftImg",v)} label={r.leftLabel||"左"} em={em} h={130}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>→</div>
          <div>
            <div style={{fontSize:10,fontWeight:600,marginBottom:2}}><ET value={r.rightLabel} onChange={v=>ur(r.id,"rightLabel",v)} style={{fontSize:10,fontWeight:600}} em={em} placeholder="ラベル"/></div>
            <PS img={r.rightImg} onChange={v=>ur(r.id,"rightImg",v)} label={r.rightLabel||"右"} em={em} h={130}/>
          </div>
        </div>
      ))}
      {em&&<button onClick={()=>onChange({...page,rows:[...rows,{id:uid(),leftLabel:"",rightLabel:"",leftImg:null,rightImg:null}]})} style={AddBtn}>＋ 行を追加</button>}
    </div>
  );
}

function PhotoDelta({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const rows=page.rows||[];
  const ur=(id,k,v)=>onChange({...page,rows:rows.map(r=>r.id===id?{...r,[k]:v}:r)});
  return(
    <div style={PW}>
      <div style={{textAlign:"center",fontSize:10,fontWeight:600,marginBottom:10,borderBottom:"1px solid #ccc",paddingBottom:4}}><ET value={page.headerTitle} onChange={u("headerTitle")} style={{fontSize:10,fontWeight:600}} em={em}/></div>
      {rows.map(r=>(
        <div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr 32px 1fr",marginBottom:10,alignItems:"stretch",border:"1px solid #ccc"}}>
          <div>
            <div style={{background:"#f3f4f6",textAlign:"center",padding:"3px 0",fontSize:10,fontWeight:600,borderBottom:"1px solid #ccc",display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:6,paddingRight:6}}>
              <span>施工前</span>{em&&<button onClick={()=>onChange({...page,rows:rows.filter(x=>x.id!==r.id)})} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:2,padding:"0 4px",fontSize:9,cursor:"pointer"}}>削除</button>}
            </div>
            <PS img={r.beforeImg} onChange={v=>ur(r.id,"beforeImg",v)} label="施工前" em={em} h={130}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:"#f9fafb",borderLeft:"1px solid #ccc",borderRight:"1px solid #ccc"}}>→</div>
          <div>
            <div style={{background:"#f3f4f6",textAlign:"center",padding:"3px 0",fontSize:10,fontWeight:600,borderBottom:"1px solid #ccc"}}>施工後</div>
            <PS img={r.afterImg} onChange={v=>ur(r.id,"afterImg",v)} label="施工後" em={em} h={130}/>
          </div>
        </div>
      ))}
      {em&&<button onClick={()=>onChange({...page,rows:[...rows,{id:uid(),beforeImg:null,afterImg:null}]})} style={AddBtn}>＋ 行を追加</button>}
    </div>
  );
}

function PhotoEpsilon({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=k=><ET value={page[k]} onChange={u(k)} style={{fontSize:10}} em={em}/>;
  const ss=page.sections||[];
  const us=(id,k,v)=>onChange({...page,sections:ss.map(s=>s.id===id?{...s,[k]:v}:s)});
  const ext=page.extraImgs||[null,null];
  const ue=(i,v)=>{const a=[...ext];a[i]=v;onChange({...page,extraImgs:a});};
  return(
    <div style={PW}>
      <table style={{...T,marginBottom:12,fontSize:10}}><tbody>
        <tr><td style={{...TS,padding:"3px 6px",fontSize:9}}>場所</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc"}}>：　{et("location")}</td><td style={{...TS,padding:"3px 6px",fontSize:9}}>施工エリア</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc"}}>：　{et("area")}</td></tr>
        <tr><td style={{...TS,padding:"3px 6px",fontSize:9}}>日時</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc"}}>：　{et("dateStr")}</td><td style={{...TS,padding:"3px 6px",fontSize:9}}>曜日</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc"}}>：　{et("dayOfWeek")}</td></tr>
      </tbody></table>
      {ss.map(s=>(
        <div key={s.id} style={{border:"1px solid #bbb",marginBottom:10,borderRadius:4,overflow:"hidden"}}>
          <div style={{background:"#374151",color:"#fff",padding:"5px 10px",textAlign:"center",fontWeight:700,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <ET value={s.title} onChange={v=>us(s.id,"title",v)} style={{color:"#fff",fontSize:11,fontWeight:700}} em={em} placeholder="設備名"/>
            {em&&<button onClick={()=>onChange({...page,sections:ss.filter(x=>x.id!==s.id)})} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:3,padding:"3px 8px",fontSize:9,cursor:"pointer"}}>削除</button>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
            {["img1","img2","img3"].map((k,i)=>(
              <div key={k} style={{borderRight:i<2?"1px solid #ccc":"none"}}>
                <div style={{background:"#f3f4f6",textAlign:"center",padding:"2px 0",fontSize:9,fontWeight:600,borderBottom:"1px solid #ccc"}}>{["作業前","作業中","作業後"][i]}</div>
                <PS img={s[k]} onChange={v=>us(s.id,k,v)} label={["作業前","作業中","作業後"][i]} em={em} h={100}/>
              </div>
            ))}
          </div>
        </div>
      ))}
      {em&&<button onClick={()=>onChange({...page,sections:[...ss,{id:uid(),title:"",img1:null,img2:null,img3:null}]})} style={{...AddBtn,marginBottom:12}}>＋ 設備を追加</button>}
      <div>
        <div style={{fontSize:10,fontWeight:600,marginBottom:6}}><ET value={page.extraLabel} onChange={u("extraLabel")} style={{fontSize:10,fontWeight:600}} em={em} placeholder="その他"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {ext.map((img,i)=><PS key={i} img={img} onChange={v=>ue(i,v)} label={`その他${i+1}`} em={em} h={100}/>)}
        </div>
      </div>
    </div>
  );
}

function PhotoZeta({page,onChange,em}){
  const u=k=>v=>onChange({...page,[k]:v});
  const et=k=><ET value={page[k]} onChange={u(k)} style={{fontSize:10}} em={em}/>;
  const ss=page.sections||[];
  const us=(id,k,v)=>onChange({...page,sections:ss.map(s=>s.id===id?{...s,[k]:v}:s)});
  return(
    <div style={PW}>
      <table style={{...T,marginBottom:14,fontSize:10}}><tbody>
        <tr><td style={{...TS,padding:"3px 6px",fontSize:9}}>場所</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc"}}>：　{et("location")}</td><td style={{...TS,padding:"3px 6px",fontSize:9}}>施工エリア</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc"}}>：　{et("area")}</td></tr>
        <tr><td style={{...TS,padding:"3px 6px",fontSize:9}}>日時</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc"}}>：　{et("dateStr")}</td><td style={{...TS,padding:"3px 6px",fontSize:9}}>曜日</td><td style={{padding:"3px 8px",borderBottom:"1px solid #ccc"}}>：　{et("dayOfWeek")}</td></tr>
      </tbody></table>
      {ss.map((s,i)=>(
        <div key={s.id} style={{border:"1px solid #bbb",marginBottom:12,borderRadius:4,overflow:"hidden"}}>
          <div style={{background:"#1e293b",color:"#fff",padding:"5px 10px",textAlign:"center",fontWeight:700,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <ET value={s.title} onChange={v=>us(s.id,"title",v)} style={{color:"#fff",fontSize:11,fontWeight:700}} em={em} placeholder="店名・箇所名"/>
            {em&&<button onClick={()=>onChange({...page,sections:ss.filter(x=>x.id!==s.id)})} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:3,padding:"3px 8px",fontSize:9,cursor:"pointer"}}>削除</button>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"1px solid #bbb"}}>
            <div style={{padding:"2px 0",textAlign:"center",fontSize:10,fontWeight:600,borderRight:"1px solid #bbb",background:"#f3f4f6"}}>作業前</div>
            <div style={{padding:"2px 0",textAlign:"center",fontSize:10,fontWeight:600,background:"#f3f4f6"}}>作業後</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"1px solid #bbb"}}>
            <div style={{borderRight:"1px solid #bbb"}}><PS img={s.img1} onChange={v=>us(s.id,"img1",v)} label="作業前①" em={em} h={120}/></div>
            <div><PS img={s.img2} onChange={v=>us(s.id,"img2",v)} label="作業後①" em={em} h={120}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
            <div style={{borderRight:"1px solid #bbb"}}><PS img={s.img3} onChange={v=>us(s.id,"img3",v)} label="作業前②" em={em} h={120}/></div>
            <div><PS img={s.img4} onChange={v=>us(s.id,"img4",v)} label="作業後②" em={em} h={120}/></div>
          </div>
        </div>
      ))}
      {em&&<button onClick={()=>onChange({...page,sections:[...ss,{id:uid(),title:"",img1:null,img2:null,img3:null,img4:null}]})} style={AddBtn}>＋ セクションを追加</button>}
    </div>
  );
}

const AddBtn={width:"100%",padding:"12px 0",background:"transparent",border:"2px dashed #475569",color:"#475569",fontSize:12,fontWeight:700,cursor:"pointer",borderRadius:6,fontFamily:"'Noto Sans JP',sans-serif",minHeight:44};

function PageRenderer({page,onChange,em}){
  if(!page)return null;
  const p={page,onChange,em};
  if(page.type==="cover"){
    const m={A:CoverA,B:CoverB,C:CoverC,C2:CoverC2,D:CoverD,E:CoverE};
    const C=m[page.coverType]; return C?<C {...p}/>:null;
  }
  const m={α:PhotoAlpha,β:PhotoBeta,γ:PhotoGamma,δ:PhotoDelta,ε:PhotoEpsilon,ζ:PhotoZeta};
  const P=m[page.photoType]; return P?<P {...p}/>:null;
}

/* ══════════════════════════════════════════
   DRAWING LIBRARY
══════════════════════════════════════════ */
function DrawingLibrary({drawings,onUpdate,onClose}){
  const [sel,setSel]=useState(null);
  const [name,setName]=useState("");
  const ref=useRef();
  const add=f=>{
    if(!f)return;
    const r=new FileReader();
    r.onload=e=>{
      const id=uid();
      onUpdate([...drawings,{id,name:name||f.name.replace(/\.[^.]+$/,""),src:e.target.result,type:f.type,added:new Date().toLocaleDateString("ja-JP")}]);
      setName(""); setSel(id);
    };
    r.readAsDataURL(f);
  };
  const del=id=>{onUpdate(drawings.filter(d=>d.id!==id));if(sel===id)setSel(null);};
  const cur=drawings.find(d=>d.id===sel);
  return(
    <div style={{position:"fixed",inset:0,background:"#0f172a",display:"flex",flexDirection:"column",zIndex:300}}>
      <div style={{background:"#1e293b",height:52,display:"flex",alignItems:"center",padding:"0 16px",gap:10,borderBottom:"1px solid #334155"}}>
        <button onClick={onClose} style={{...TB2,fontSize:20,padding:"0 10px"}}>←</button>
        <span style={{fontWeight:700,fontSize:14,color:"#f1f5f9",flex:1}}>🗺️ 図面・画像ライブラリ</span>
        <input ref={ref} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>add(e.target.files[0])}/>
        <button onClick={()=>ref.current.click()} style={{...TB2,background:"#16a34a",color:"#fff",fontWeight:700}}>＋ 追加</button>
      </div>
      {/* name input */}
      <div style={{padding:"8px 14px",background:"#1e293b",borderBottom:"1px solid #334155"}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="ファイル名（省略可）"
          style={{width:"100%",background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",borderRadius:6,padding:"8px 12px",fontSize:12,outline:"none",fontFamily:"'Noto Sans JP',sans-serif",boxSizing:"border-box"}}/>
      </div>
      {cur?(
        <div style={{flex:1,overflow:"auto",padding:12,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{background:"#fff",borderRadius:6,overflow:"hidden"}}>
            {cur.type?.includes("pdf")
              ?<iframe src={cur.src} style={{width:"100%",height:"70vh",border:"none",display:"block"}} title={cur.name}/>
              :<img src={cur.src} alt={cur.name} style={{width:"100%",display:"block"}}/>}
          </div>
          <div style={{background:"#1e293b",borderRadius:6,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13,color:"#f1f5f9",flex:1}}>{cur.name}</span>
            <button onClick={()=>{setSel(null);}} style={{...TB2}}>一覧に戻る</button>
            <button onClick={()=>del(cur.id)} style={{...TB2,background:"#dc2626",color:"#fff"}}>削除</button>
          </div>
        </div>
      ):(
        <div style={{flex:1,overflow:"auto"}}>
          {drawings.length===0?<div style={{textAlign:"center",padding:48,color:"#475569"}}><div style={{fontSize:48,marginBottom:12}}>🗂️</div><div style={{fontSize:14}}>「＋ 追加」ボタンで図面・画像を登録</div></div>
            :<div style={{padding:12,display:"flex",flexDirection:"column",gap:6}}>
              {drawings.map(d=>(
                <div key={d.id} onClick={()=>setSel(d.id)} style={{background:"#1e293b",borderRadius:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,border:"1px solid #334155",cursor:"pointer",minHeight:56}}>
                  <span style={{fontSize:20}}>{d.type?.includes("pdf")?"📄":"🖼️"}</span>
                  <div style={{flex:1,overflow:"hidden"}}>
                    <div style={{fontSize:13,color:"#f1f5f9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{d.added}</div>
                  </div>
                  <span style={{color:"#64748b",fontSize:14}}>›</span>
                </div>
              ))}
            </div>}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   DASHBOARD (mobile)
══════════════════════════════════════════ */
function Dashboard({reports,onOpen,onNew,onDelete,onDrawings,drawings,onLogout}){
  const [q,setQ]=useState("");
  const [del,setDel]=useState(null);
  const [tmplOpen,setTmplOpen]=useState(false);
  const cats=[...new Set(TEMPLATES.map(t=>t.cat))];
  const filtered=reports.filter(r=>(r.meta.title||"").includes(q)||(r.meta.workPlace||"").includes(q));
  return(
    <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"'Noto Sans JP',sans-serif",paddingBottom:80}}>
      {/* header */}
      <div style={{background:"#1e293b",borderBottom:"1px solid #334155",padding:"0 16px",height:54,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:100}}>
        <span style={{fontSize:18}}>📄</span>
        <span style={{fontWeight:700,fontSize:14,color:"#f1f5f9",flex:1,letterSpacing:.5}}>作業完了報告書</span>
        <button onClick={onDrawings} style={{...TB2,padding:"6px 10px"}}> 🗺️ 図面</button>
        <button onClick={onLogout} style={{...TB2,padding:"6px 10px"}}> 🔒 ログアウト</button>
      </div>
      {/* search */}
      <div style={{padding:"12px 16px",background:"#1e293b",borderBottom:"1px solid #334155"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 タイトル・場所で検索"
          style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #334155",background:"#0f172a",color:"#e2e8f0",fontSize:14,outline:"none",fontFamily:"'Noto Sans JP',sans-serif",boxSizing:"border-box"}}/>
      </div>
      {/* reports list */}
      <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {filtered.length===0&&<div style={{textAlign:"center",padding:48,color:"#475569"}}><div style={{fontSize:40,marginBottom:12}}>📂</div><div style={{fontSize:14}}>{reports.length===0?"下の「＋ 新規作成」から始めてください":"検索結果がありません"}</div></div>}
        {filtered.map(r=>(
          <div key={r.meta.id} style={{background:"#1e293b",borderRadius:12,border:"1px solid #334155",overflow:"hidden"}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid #334155"}}>
              <div style={{fontSize:10,color:"#64748b",marginBottom:2}}>{r.meta.date}　<span style={{background:"#334155",padding:"1px 4px",borderRadius:2,fontSize:9}}>{r.meta.coverType}型</span></div>
              <div style={{fontWeight:700,fontSize:15,color:"#f1f5f9"}}>{r.meta.title||"（タイトルなし）"}</div>
            </div>
            <div style={{padding:"10px 14px",fontSize:12,color:"#94a3b8",lineHeight:1.8}}>
              <div>🏢　{r.meta.clientCompany||"—"}</div>
              <div>📍　{r.meta.workPlace||"—"}</div>
              <div style={{fontSize:10,color:"#475569"}}>表紙 ＋ {r.meta.photoCount||0} ページ</div>
            </div>
            <div style={{padding:"8px 12px",display:"flex",gap:8,borderTop:"1px solid #334155",background:"#0f172a"}}>
              <button onClick={()=>onOpen(r.meta.id)} style={{flex:1,padding:"10px 0",background:"#1e40af",color:"#fff",border:"none",borderRadius:6,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:44}}>開く・編集</button>
              <button onClick={()=>setDel(r.meta.id)} style={{padding:"10px 16px",background:"transparent",color:"#64748b",border:"1px solid #334155",borderRadius:6,fontSize:14,cursor:"pointer",minHeight:44}}>🗑</button>
            </div>
          </div>
        ))}
      </div>
      {/* FAB */}
      <button onClick={()=>setTmplOpen(true)} style={{position:"fixed",bottom:24,right:20,width:60,height:60,borderRadius:30,background:"#16a34a",color:"#fff",border:"none",fontSize:28,cursor:"pointer",boxShadow:"0 4px 20px rgba(22,163,74,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans JP',sans-serif"}}>＋</button>
      {/* delete confirm */}
      {del&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:999,padding:16}}>
        <div style={{background:"#1e293b",borderRadius:16,padding:28,width:"100%",maxWidth:400,border:"1px solid #475569"}}>
          <div style={{fontWeight:700,fontSize:16,color:"#f1f5f9",marginBottom:8,textAlign:"center"}}>この報告書を削除しますか？</div>
          <div style={{color:"#94a3b8",fontSize:12,marginBottom:20,textAlign:"center"}}>この操作は取り消せません。</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setDel(null)} style={{flex:1,padding:"12px 0",background:"transparent",color:"#94a3b8",border:"1px solid #475569",borderRadius:8,fontSize:14,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:48}}>キャンセル</button>
            <button onClick={()=>{onDelete(del);setDel(null);}} style={{flex:1,padding:"12px 0",background:"#dc2626",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:48}}>削除する</button>
          </div>
        </div>
      </div>}
      {/* template sheet */}
      {tmplOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",zIndex:999}} onClick={()=>setTmplOpen(false)}>
        <div style={{background:"#1e293b",borderRadius:"16px 16px 0 0",padding:"16px 16px 32px",width:"100%",maxHeight:"80vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontWeight:700,fontSize:15,color:"#f1f5f9"}}>テンプレートを選択</span>
            <button onClick={()=>setTmplOpen(false)} style={{background:"transparent",border:"none",color:"#64748b",fontSize:20,cursor:"pointer",padding:4}}>✕</button>
          </div>
          <button onClick={()=>{setTmplOpen(false);onNew(null);}} style={{width:"100%",padding:"12px",background:"#334155",color:"#e2e8f0",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",marginBottom:10,minHeight:48}}>📄 空白から作成</button>
          {cats.map(cat=>(
            <div key={cat} style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"#64748b",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>{cat}</div>
              {TEMPLATES.filter(t=>t.cat===cat).map(t=>(
                <button key={t.id} onClick={()=>{setTmplOpen(false);onNew(t);}} style={{width:"100%",padding:"12px 14px",background:"#0f172a",color:"#e2e8f0",border:"1px solid #334155",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",marginBottom:6,textAlign:"left",display:"flex",alignItems:"center",gap:8,minHeight:48}}>
                  <span style={{fontSize:9,background:"#334155",padding:"2px 5px",borderRadius:3,color:"#94a3b8",flexShrink:0}}>{t.coverType}型</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   EDITOR (mobile)
══════════════════════════════════════════ */
function Editor({report,onSave,onBack}){
  const [pages,setPages]=useState(()=>JSON.parse(JSON.stringify(report.pages)));
  const [meta,setMeta]=useState(()=>({...report.meta}));
  const [activeId,setActiveId]=useState("cover");
  const [em,setEm]=useState(true);
  const [flash,setFlash]=useState(false);
  const [addOpen,setAddOpen]=useState(false);
  const [pagesOpen,setPagesOpen]=useState(false);
  const upd=useCallback((id,p)=>setPages(ps=>ps.map(x=>x.id===id?p:x)),[]);
  const addP=t=>{const p=PFACT[t]?PFACT[t]():mkPβ();setPages(ps=>[...ps,p]);setActiveId(p.id);setAddOpen(false);};
  const delP=id=>{setPages(ps=>ps.filter(x=>x.id!==id));setActiveId("cover");setPagesOpen(false);};
  const movP=(id,d)=>setPages(ps=>{
    const cv=ps.filter(x=>x.type==="cover"),ph=[...ps.filter(x=>x.type==="photo")];
    const i=ph.findIndex(x=>x.id===id),n=i+d;if(n<0||n>=ph.length)return ps;
    [ph[i],ph[n]]=[ph[n],ph[i]];return[...cv,...ph];
  });
  const save=()=>{
    const cv=pages.find(p=>p.type==="cover")||{};
    const m={...meta,title:meta.title||cv.clientCompany||cv.client||"無題",clientCompany:cv.clientCompany||cv.client||"",workPlace:cv.workPlace||"",workDate:cv.workDate||cv.clientWorkDate||"",coverType:cv.coverType||"A",photoCount:pages.filter(p=>p.type==="photo").length};
    setMeta(m);onSave(m,pages);setFlash(true);setTimeout(()=>setFlash(false),2200);
  };
  const active=pages.find(p=>p.id===activeId);
  const photos=pages.filter(p=>p.type==="photo");
  return(
    <>
      <style>{CSS}</style>
      {/* top bar */}
      <div className="no-print" style={{position:"sticky",top:0,zIndex:200,height:52,background:"#0f172a",display:"flex",alignItems:"center",gap:6,padding:"0 12px",boxShadow:"0 2px 10px rgba(0,0,0,.5)"}}>
        <button onClick={onBack} style={{...TB2,padding:"0 10px",fontSize:18}}>←</button>
        <span style={{flex:1,fontWeight:700,fontSize:13,color:"#f1f5f9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{meta.title||"タイトルなし"}</span>
        {flash&&<span style={{color:"#4ade80",fontSize:11,fontWeight:700,flexShrink:0}}>✓ 保存済み</span>}
        <button onClick={()=>setEm(x=>!x)} style={{...TB2,fontWeight:700,background:em?"#f59f00":"rgba(255,255,255,.1)",color:em?"#0f172a":"#fff",padding:"6px 10px"}}>{em?"✏️":"👁"}</button>
        <button onClick={save} style={{...TB2,background:"#16a34a",color:"#fff",fontWeight:700,padding:"6px 10px"}}>💾</button>
        <button onClick={()=>window.print()} style={{...TB2,background:"#0369a1",color:"#fff",fontWeight:700,padding:"6px 10px"}}>🖨</button>
      </div>
      {/* page tabs (horizontal scroll) */}
      <div className="no-print" style={{background:"#1e293b",borderBottom:"1px solid #334155",display:"flex",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
        {[{id:"cover",type:"cover",coverType:(pages.find(p=>p.type==="cover")||{}).coverType,label:"📋 表紙"},...photos.map((p,i)=>({...p,label:`📷 ${p.location||p.floor||p.area||`写真${i+1}`}`}))].map(p=>(
          <button key={p.id} onClick={()=>setActiveId(p.id)} style={{flexShrink:0,padding:"10px 14px",background:activeId===p.id?"#0f172a":"transparent",color:activeId===p.id?"#f59f00":"#94a3b8",border:"none",borderBottom:activeId===p.id?"2px solid #f59f00":"2px solid transparent",fontSize:12,fontWeight:activeId===p.id?700:400,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",whiteSpace:"nowrap",minHeight:44}}>
            {p.label}
            {p.photoType&&<span style={{fontSize:9,marginLeft:4,opacity:.7}}>{p.photoType}</span>}
          </button>
        ))}
        {em&&<button onClick={()=>setAddOpen(true)} style={{flexShrink:0,padding:"10px 14px",background:"transparent",color:"#4ade80",border:"none",borderBottom:"2px solid transparent",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",whiteSpace:"nowrap",minHeight:44}}>＋追加</button>}
        {em&&photos.length>0&&<button onClick={()=>setPagesOpen(true)} style={{flexShrink:0,padding:"10px 14px",background:"transparent",color:"#64748b",border:"none",borderBottom:"2px solid transparent",fontSize:12,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",whiteSpace:"nowrap",minHeight:44}}>⋯</button>}
      </div>
      {/* canvas */}
      <div style={{background:em?"#cdd5de":"#e8edf2",minHeight:"calc(100vh - 104px)",padding:"12px 0 80px"}}>
        {em&&<div className="no-print" style={{margin:"0 12px 10px",background:"#fef3c7",border:"1px solid #f59f00",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#92400e",fontWeight:600}}>
          ✏️ 編集モード — テキストをタップして編集 ／ 写真エリアをタップして追加
        </div>}
        <div className="print-page" style={{margin:"0 auto",background:"#fff",boxShadow:"0 2px 16px rgba(0,0,0,.2)",maxWidth:700}}>
          <PageRenderer page={active} onChange={p=>upd(active.id,p)} em={em}/>
        </div>
      </div>
      {/* add photo sheet */}
      {addOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",zIndex:999}}>
        <div style={{background:"#1e293b",borderRadius:"16px 16px 0 0",padding:"16px 16px 36px",width:"100%"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontWeight:700,fontSize:15,color:"#f1f5f9"}}>写真ページを追加</span>
            <button onClick={()=>setAddOpen(false)} style={{background:"transparent",border:"none",color:"#64748b",fontSize:20,cursor:"pointer",padding:4}}>✕</button>
          </div>
          {Object.entries(PHOTO_LABELS).map(([t,label])=>(
            <button key={t} onClick={()=>addP(t)} style={{width:"100%",padding:"12px 14px",background:"#0f172a",color:"#e2e8f0",border:"1px solid #334155",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",marginBottom:8,textAlign:"left",display:"flex",gap:10,alignItems:"center",minHeight:48}}>
              <span style={{fontSize:12,background:"#334155",padding:"2px 6px",borderRadius:4,color:"#f59f00",fontWeight:700,flexShrink:0}}>{t}型</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>}
      {/* pages manage sheet */}
      {pagesOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",zIndex:999}}>
        <div style={{background:"#1e293b",borderRadius:"16px 16px 0 0",padding:"16px 16px 36px",width:"100%",maxHeight:"70vh",overflow:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontWeight:700,fontSize:15,color:"#f1f5f9"}}>ページ管理</span>
            <button onClick={()=>setPagesOpen(false)} style={{background:"transparent",border:"none",color:"#64748b",fontSize:20,cursor:"pointer",padding:4}}>✕</button>
          </div>
          {photos.map((p,i)=>(
            <div key={p.id} style={{background:"#0f172a",borderRadius:8,padding:"10px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8,border:"1px solid #334155",minHeight:52}}>
              <span style={{fontSize:9,background:"#334155",padding:"2px 5px",borderRadius:3,color:"#f59f00",fontWeight:700}}>{p.photoType}</span>
              <span style={{flex:1,fontSize:12,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.location||p.floor||p.area||`写真${i+1}`}</span>
              <button onClick={()=>movP(p.id,-1)} disabled={i===0} style={{...TB2,padding:"4px 8px",opacity:i===0?.3:1}}>↑</button>
              <button onClick={()=>movP(p.id,1)} disabled={i===photos.length-1} style={{...TB2,padding:"4px 8px",opacity:i===photos.length-1?.3:1}}>↓</button>
              <button onClick={()=>delP(p.id)} style={{...TB2,background:"#dc2626",color:"#fff",padding:"4px 8px"}}>削除</button>
            </div>
          ))}
        </div>
      </div>}
    </>
  );
}

/* ══════════════════════════════════════════
   ログイン画面（共通パスワード）
══════════════════════════════════════════ */
const APP_PASSWORD = "nitto2026";

function LoginScreen({onSuccess}){
  const [pw,setPw]=useState("");
  const [err,setErr]=useState(false);
  const inputRef=useRef();

  useEffect(()=>{ inputRef.current?.focus(); },[]);

  const submit=()=>{
    if(pw===APP_PASSWORD){ setErr(false); onSuccess(); }
    else { setErr(true); setPw(""); inputRef.current?.focus(); }
  };

  return(
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,fontFamily:"'Noto Sans JP',sans-serif",padding:24}}>
      <div style={{fontSize:40}}>📄</div>
      <div style={{color:"#f1f5f9",fontSize:16,fontWeight:700}}>作業完了報告書管理システム</div>
      <div style={{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:12}}>
        <input
          ref={inputRef}
          type="password"
          value={pw}
          onChange={e=>{setPw(e.target.value); setErr(false);}}
          onKeyDown={e=>{if(e.key==="Enter")submit();}}
          placeholder="パスワードを入力"
          style={{width:"100%",background:"#1e293b",border:err?"1px solid #dc2626":"1px solid #475569",color:"#f1f5f9",borderRadius:8,padding:"14px 16px",fontSize:16,outline:"none",boxSizing:"border-box",fontFamily:"'Noto Sans JP',sans-serif"}}
        />
        {err&&<div style={{color:"#f87171",fontSize:12,textAlign:"center"}}>パスワードが違います</div>}
        <button onClick={submit} style={{width:"100%",padding:"14px 0",background:"#16a34a",color:"#fff",border:"none",borderRadius:8,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:48}}>
          ログイン
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
export default function App(){
  const [authed,setAuthed]=useState(false);
  const [view,setView]=useState("dashboard");
  const [reports,setReports]=useState([]);
  const [openId,setOpenId]=useState(null);
  const [drawings,setDrawings]=useState([]);
  const [newTmpl,setNewTmpl]=useState(undefined);
  const [loading,setLoading]=useState(true);
  const [storageErr,setStorageErr]=useState(false);

  /* ── 起動時にストレージから読み込む ── */
  useEffect(()=>{
    (async()=>{
      try {
        const [idx, drw] = await Promise.all([Store.loadIndex(), Store.loadDrawings()]);
        // インデックスだけ読んでおく（本文は開いた時に読み込む）
        setReports(idx.map(m=>({meta:m, pages:null})));
        setDrawings(drw);
      } catch(e) {
        console.error('load error:', e);
        setStorageErr(true);
      }
      setLoading(false);
    })();
  }, []);

  /* ── 報告書を開く（本文をストレージから読み込む） ── */
  const handleOpen = async id => {
    const r = reports.find(x=>x.meta.id===id);
    if(r && r.pages) { setOpenId(id); setView("editor"); return; }
    const pages = await Store.loadReport(id);
    if(pages) {
      setReports(prev=>prev.map(x=>x.meta.id===id?{...x,pages}:x));
    }
    setOpenId(id); setView("editor");
  };

  /* ── 保存 ── */
  const handleSave = async (meta, pages) => {
    setReports(prev=>prev.map(r=>r.meta.id===meta.id?{meta,pages}:r));
    const ok = await Store.saveReport(meta.id, pages, meta);
    if(!ok) { alert('保存に失敗しました。通信状態をご確認のうえ、もう一度お試しください。'); return; }
  };

  /* ── 新規作成 ── */
  const confirmNew = async title => {
    const tmpl=newTmpl;
    setNewTmpl(undefined);
    const id=uid();
    const F=CFACT[tmpl?.coverType||"A"]||mkCoverA;
    const cover=F(tmpl?.name||"");
    const photo=(PFACT[tmpl?.photoType||"β"]||mkPβ)();
    const meta={id,date:today(),title:title||tmpl?.name||"新しい報告書",clientCompany:cover.clientCompany||cover.client||"",workPlace:cover.workPlace||"",workDate:cover.workDate||"",coverType:cover.coverType||"A",photoCount:1};
    const pages=[cover,photo];
    const newReports=[{meta,pages},...reports];
    setReports(newReports);
    await Store.saveReport(id, pages, meta);
    setOpenId(id); setView("editor");
  };

  /* ── 削除 ── */
  const handleDelete = async id => {
    const newReports = reports.filter(r=>r.meta.id!==id);
    setReports(newReports);
    await Store.deleteReport(id);
  };

  /* ── 図面更新 ── */
  const handleDrawings = async list => {
    setDrawings(list);
    await Store.saveDrawings(list);
  };

  const current=reports.find(r=>r.meta.id===openId);

  /* ── 未ログイン ── */
  if(!authed) return <LoginScreen onSuccess={()=>setAuthed(true)}/>;

  /* ── ローディング ── */
  if(loading) return(
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'Noto Sans JP',sans-serif"}}>
      <div style={{fontSize:40}}>📄</div>
      <div style={{color:"#94a3b8",fontSize:14}}>データを読み込んでいます…</div>
    </div>
  );
  return(
    <>
      <style>{CSS}</style>
      {storageErr&&<div style={{position:"fixed",top:0,left:0,right:0,background:"#dc2626",color:"#fff",padding:"8px 16px",fontSize:12,zIndex:9999,textAlign:"center",fontFamily:"'Noto Sans JP',sans-serif"}}>⚠️ ストレージに接続できません。データは保存されません。</div>}
      {view==="editor"&&current&&current.pages?<Editor report={current} onSave={handleSave} onBack={()=>setView("dashboard")}/>
       :view==="editor"&&current&&!current.pages?<div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:"'Noto Sans JP',sans-serif",flexDirection:"column"}}><div style={{fontSize:32}}>📂</div><div style={{color:"#94a3b8",fontSize:14}}>読み込み中…</div></div>
       :view==="drawings"?<DrawingLibrary drawings={drawings} onUpdate={handleDrawings} onClose={()=>setView("dashboard")}/>
       :<Dashboard reports={reports} onOpen={handleOpen} onNew={t=>setNewTmpl(t===undefined?null:t)} onDelete={handleDelete} onDrawings={()=>setView("drawings")} drawings={drawings} onLogout={()=>setAuthed(false)}/>}
      {newTmpl!==undefined&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",zIndex:999}} onClick={()=>setNewTmpl(undefined)}>
          <div style={{background:"#1e293b",borderRadius:"16px 16px 0 0",padding:24,width:"100%",maxHeight:"70vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:15,color:"#f1f5f9",marginBottom:16}}>{newTmpl?`📋 ${newTmpl.name}`:"📄 新規報告書"}</div>
            {newTmpl&&<div style={{background:"#0f172a",borderRadius:6,padding:"8px 12px",marginBottom:14,fontSize:11,color:"#94a3b8"}}>
              表紙：<span style={{color:"#f59f00",fontWeight:700}}>{newTmpl.coverType}型</span>　写真：<span style={{color:"#4ade80",fontWeight:700}}>{newTmpl.photoType}型</span>
            </div>}
            <input autoFocus placeholder="タイトルを入力" defaultValue={newTmpl?.name||""} id="newTitle"
              style={{width:"100%",background:"#0f172a",border:"1px solid #475569",color:"#f1f5f9",borderRadius:8,padding:"12px 14px",fontSize:16,outline:"none",boxSizing:"border-box",fontFamily:"'Noto Sans JP',sans-serif",marginBottom:16}}
              onKeyDown={e=>{if(e.key==="Enter")confirmNew(e.target.value);}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setNewTmpl(undefined)} style={{flex:1,padding:"12px 0",background:"transparent",color:"#94a3b8",border:"1px solid #475569",borderRadius:8,fontSize:14,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:48}}>キャンセル</button>
              <button onClick={()=>confirmNew(document.getElementById("newTitle")?.value||"")} style={{flex:2,padding:"12px 0",background:"#16a34a",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",minHeight:48}}>作成する</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const TB2={background:"rgba(255,255,255,.1)",color:"#e2e8f0",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,padding:"6px 12px",fontSize:12,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",whiteSpace:"nowrap",minHeight:36};
const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@400;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;}
  html,body{margin:0;font-family:'Noto Sans JP',sans-serif;-webkit-text-size-adjust:100%;}
  input,textarea,button{font-family:'Noto Sans JP',sans-serif;-webkit-appearance:none;touch-action:manipulation;}
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-thumb{background:#475569;border-radius:99px;}
  @media print{.no-print{display:none!important;}.print-page{page-break-after:always;}body{background:#fff!important;}}
`;
