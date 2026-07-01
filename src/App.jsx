import { useState, useEffect, useCallback } from "react";

const C = { P:'#700c14', S:'#92263f', BG:'#faf7f0', BG2:'#f2ebd9', BD:'#ddd0bb', T:'#1a0508', TM:'#7a3040' };
const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);
const fmtN = v => new Intl.NumberFormat('pt-BR').format(v||0);
const uid = () => Math.random().toString(36).slice(2,9)+Date.now().toString(36);
const todayStr = () => new Date().toISOString().split('T')[0];
const n = v => parseFloat(v)||0;

const TAXAS = {
  mesmo_dia:{pix:0,debito:2.29,credito_1x:5.49,credito_2x:10.89,credito_3x:11.99,credito_4x:12.59,credito_5x:13.29,credito_6x:13.99},
  um_dia:{pix:0,debito:1.37,credito_1x:3.15,credito_2x:5.39,credito_3x:6.12,credito_4x:6.85,credito_5x:7.57,credito_6x:8.28},
  sem_antecipacao:{credito_1x:2.22,credito_2x:2.75,credito_3x:2.75,credito_4x:2.75,credito_5x:2.75,credito_6x:2.75}
};
const PGTO_LABELS = {pix:'Pix',debito:'Débito',credito_1x:'Crédito à Vista',credito_2x:'Crédito 2x',credito_3x:'Crédito 3x',credito_4x:'Crédito 4x',credito_5x:'Crédito 5x',credito_6x:'Crédito 6x'};
const TIPOS_BASE = ['Botton','Copo Americano','Caneca','Garrafa Térmica','Copo Térmico','Copo de Vidro'];
const LOGO_URL = "https://res.cloudinary.com/djnerbs5w/image/upload/f_auto,q_auto/F2EBD9_qgv2cw";

const NAV = [
  {id:'dashboard',l:'Dashboard',ico:'◈'},
  {id:'financeiro',l:'Financeiro',ico:'💰'},
  {id:'contas',l:'Contas',ico:'📋'},
  {id:'compras',l:'Compras',ico:'🛒'},
  {id:'vendas',l:'Vendas',ico:'🛍️'},
  {id:'clientes',l:'Clientes',ico:'👤'},
  {id:'estoque',l:'Estoque de Produtos',ico:'📦'},
  {id:'custo',l:'Custo de Produto',ico:'🏷️'},
  {id:'precificacao',l:'Precificação',ico:'💲'},
  {id:'antecipacao',l:'Antecipação',ico:'⚡'},
  {id:'fornecedores',l:'Fornecedores',ico:'🏭'},
  {id:'materiais',l:'Matéria-Prima',ico:'🧵'},
  {id:'relatorios',l:'Relatórios',ico:'📊'},
];

// ── localStorage hook ─────────────────────────────────────────────────────────
function useStore(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(`orlae-${key}`); return s ? JSON.parse(s) : init; }
    catch(e) { return init; }
  });
  const save = useCallback(fn => {
    setVal(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      try { localStorage.setItem(`orlae-${key}`, JSON.stringify(next)); } catch(e) {}
      return next;
    });
  }, [key]);
  return [val, save];
}

// ── Logo ──────────────────────────────────────────────────────────────────────
const OrlaeLogo = ({collapsed})=> collapsed
  ? <div style={{width:38,height:38,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <img src={LOGO_URL} alt="Orlaê" style={{width:38,height:38,objectFit:'contain'}}/>
    </div>
  : <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <img src={LOGO_URL} alt="Orlaê" style={{width:130,objectFit:'contain',display:'block'}}/>
      <div style={{color:'rgba(255,255,255,.38)',fontSize:9,whiteSpace:'nowrap',letterSpacing:2.5,textTransform:'uppercase',fontWeight:500}}>Brand Management</div>
    </div>;

// ── UI Primitives ──────────────────────────────────────────────────────────────
const inp = {width:'100%',padding:'9px 12px',border:`1px solid ${C.BD}`,borderRadius:8,background:'#fff',fontSize:13,fontFamily:'inherit',boxSizing:'border-box',outline:'none'};
const inpRO = {...inp,background:C.BG2,color:C.S,fontWeight:800};
const lbl = {display:'block',fontSize:11,fontWeight:700,color:C.TM,marginBottom:4,letterSpacing:0.3};
const F = ({label,children,style={}})=><div style={{marginBottom:14,...style}}>{label&&<label style={lbl}>{label}</label>}{children}</div>;
const TI = ({label,value,onChange,type='text',placeholder='',readOnly=false,style={},...r})=>(
  <F label={label} style={style}><input value={value??''} onChange={e=>onChange&&onChange(e.target.value)} type={type} placeholder={placeholder} readOnly={readOnly} style={readOnly?inpRO:inp} {...r}/></F>
);
const SI = ({label,value,onChange,options=[],style={}})=>(
  <F label={label} style={style}><select value={value??''} onChange={e=>onChange(e.target.value)} style={inp}><option value=''>— Selecionar —</option>{options.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}</select></F>
);
const DI = ({label,value,onChange,options=[],listId,placeholder='',style={}})=>(
  <F label={label} style={style}><input value={value??''} onChange={e=>onChange(e.target.value)} list={listId} placeholder={placeholder} style={inp}/><datalist id={listId}>{options.map(o=><option key={o} value={o}/>)}</datalist></F>
);
const Btn = ({children,onClick,color=C.P,outline=false,sm=false,style={}})=>(
  <button onClick={onClick} style={{background:outline?'transparent':color,color:outline?color:'#fff',border:`1.5px solid ${color}`,borderRadius:8,padding:sm?'5px 12px':'9px 22px',fontSize:sm?11:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',...style}}>{children}</button>
);
const Bdg = ({children,type='default'})=>{
  const m={default:{bg:`${C.P}18`,c:C.P},success:{bg:'#dcfce7',c:'#166534'},warning:{bg:'#fef9c3',c:'#713f12'},danger:{bg:'#fee2e2',c:'#991b1b'},info:{bg:'#e0f2fe',c:'#0369a1'}};
  const s=m[type]||m.default;
  return <span style={{background:s.bg,color:s.c,borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{children}</span>;
};
const Card = ({children,style={}})=><div style={{background:'#fff',border:`1px solid ${C.BD}`,borderRadius:12,padding:20,...style}}>{children}</div>;
const SC = ({title,value,sub,icon,color=C.P})=>(
  <div style={{background:'#fff',border:`1px solid ${C.BD}`,borderRadius:12,padding:'16px 20px',display:'flex',alignItems:'center',gap:14}}>
    <div style={{width:46,height:46,borderRadius:12,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{icon}</div>
    <div><div style={{fontSize:10,fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:1}}>{title}</div>
    <div style={{fontSize:20,fontWeight:800,color}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:'#bbb',marginTop:1}}>{sub}</div>}</div>
  </div>
);
const PH = ({title,action,sub})=>(
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
    <div><h2 style={{margin:0,color:C.P,fontSize:20,fontWeight:800}}>{title}</h2>{sub&&<p style={{margin:'2px 0 0',color:'#bbb',fontSize:12}}>{sub}</p>}</div>{action}
  </div>
);
const Tbl = ({cols,rows,empty='Nenhum registro.'})=>(
  <div style={{overflowX:'auto'}}>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr>{cols.map(c=><th key={c.k||c.l} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.TM,borderBottom:`2px solid ${C.BD}`,background:C.BG2,whiteSpace:'nowrap'}}>{c.l}</th>)}</tr></thead>
      <tbody>{rows.length===0?<tr><td colSpan={cols.length} style={{padding:32,textAlign:'center',color:'#bbb',fontSize:13}}>{empty}</td></tr>
        :rows.map((r,i)=><tr key={r.id||i} style={{background:i%2===1?C.BG:'#fff'}}>
          {cols.map(c=><td key={c.k||c.l} style={{padding:'9px 14px',fontSize:13,borderBottom:`1px solid ${C.BD}`,verticalAlign:'middle'}}>{c.render?c.render(r):r[c.k]}</td>)}
        </tr>)}
      </tbody>
    </table>
  </div>
);
const Modal = ({title,onClose,children,wide=false})=>(
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?760:560,maxHeight:'92vh',overflow:'auto',boxShadow:'0 24px 80px rgba(0,0,0,.2)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 24px',borderBottom:`1px solid ${C.BD}`,position:'sticky',top:0,background:'#fff',zIndex:1}}>
        <h3 style={{margin:0,color:C.P,fontSize:16,fontWeight:800}}>{title}</h3>
        <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#bbb',lineHeight:1}}>✕</button>
      </div>
      <div style={{padding:24}}>{children}</div>
    </div>
  </div>
);
const Grid = ({cols='1fr 1fr',children,gap=12})=><div style={{display:'grid',gridTemplateColumns:cols,gap}}>{children}</div>;
const Divider = ({label})=><div style={{margin:'16px 0 12px',fontSize:11,fontWeight:800,color:C.TM,textTransform:'uppercase',letterSpacing:1,borderBottom:`1px solid ${C.BD}`,paddingBottom:6}}>{label}</div>;
const stEst = q => q===0?{t:'default',l:'Sem Estoque'}:q<25?{t:'danger',l:'Ruim (<25)'}:q<=50?{t:'warning',l:'Mínimo (≤50)'}:{t:'success',l:'Bom (>50)'};

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({fin,contas,estoque,vendas}){
  const saldo=fin.reduce((s,f)=>f.tipo==='entrada'?s+f.valor:s-f.valor,0);
  const aPagar=contas.filter(c=>c.status!=='pago'&&c.tipo==='pagar').reduce((s,c)=>s+c.valor,0);
  const aReceber=contas.filter(c=>c.status!=='pago'&&c.tipo==='receber').reduce((s,c)=>s+c.valor,0);
  const mesAtual=todayStr().slice(0,7);
  const vendasMes=vendas.filter(v=>v.data?.startsWith(mesAtual)).reduce((s,v)=>s+v.valorTotal,0);
  const criticos=estoque.filter(e=>e.quantidade>0&&e.quantidade<25).length;
  const semEst=estoque.filter(e=>e.quantidade===0).length;
  const ultMov=[...fin].sort((a,b)=>b.data?.localeCompare(a.data)).slice(0,6);
  return(
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{margin:'0 0 4px',color:C.P,fontWeight:900,fontSize:22}}>Orlaê — Visão Geral</h2>
        <p style={{margin:0,color:C.TM,fontSize:13}}>{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:24}}>
        <SC title="Saldo em Caixa" value={fmt(saldo)} icon="💰" color={saldo>=0?'#166534':C.P}/>
        <SC title="A Pagar" value={fmt(aPagar)} icon="📤" color={C.P}/>
        <SC title="A Receber" value={fmt(aReceber)} icon="📥" color="#0369a1"/>
        <SC title="Vendas do Mês" value={fmt(vendasMes)} icon="🛍️" color={C.S}/>
        <SC title="Estoque Crítico" value={criticos} sub={`${semEst} sem estoque`} icon="⚠️" color="#c47f17"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        <Card>
          <h4 style={{margin:'0 0 14px',color:C.P,fontWeight:800}}>Últimas Movimentações</h4>
          {ultMov.length===0?<p style={{color:'#bbb',fontSize:13,margin:0}}>Nenhuma movimentação registrada.</p>
          :ultMov.map(m=>(
            <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`1px solid ${C.BD}`}}>
              <div><div style={{fontSize:13,fontWeight:600}}>{m.descricao}</div><div style={{fontSize:11,color:'#bbb'}}>{m.data} · {m.categoria||'-'}</div></div>
              <span style={{fontWeight:800,color:m.tipo==='entrada'?'#166534':C.P}}>{m.tipo==='entrada'?'+':'-'}{fmt(m.valor)}</span>
            </div>
          ))}
        </Card>
        <Card>
          <h4 style={{margin:'0 0 14px',color:C.P,fontWeight:800}}>Status do Estoque</h4>
          {[{l:'Bom (>50)',f:e=>e.quantidade>50,t:'success'},{l:'Mínimo (≤50)',f:e=>e.quantidade>25&&e.quantidade<=50,t:'warning'},{l:'Ruim (<25)',f:e=>e.quantidade>0&&e.quantidade<25,t:'danger'},{l:'Sem Estoque',f:e=>e.quantidade===0,t:'default'}].map(s=>(
            <div key={s.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontSize:13}}>{s.l}</span><Bdg type={s.t}>{estoque.filter(s.f).length} itens</Bdg>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── FINANCEIRO ────────────────────────────────────────────────────────────────
function Financeiro({fin,setFin}){
  const [modal,setModal]=useState(false);
  const [f,setF]=useState({tipo:'entrada',descricao:'',valor:'',data:todayStr(),categoria:''});
  const [filtTipo,setFiltTipo]=useState('');
  const [filtMes,setFiltMes]=useState('');
  const cats={entrada:['Venda','Transferência','Devolução','Outro'],saida:['Fornecedor','Frete','Marketing','Operacional','Impostos','Embalagem','Outro']};
  const rows=fin.filter(x=>(filtTipo?x.tipo===filtTipo:true)&&(filtMes?x.data?.startsWith(filtMes):true)).sort((a,b)=>b.data?.localeCompare(a.data));
  const ent=rows.filter(x=>x.tipo==='entrada').reduce((s,x)=>s+x.valor,0);
  const sai=rows.filter(x=>x.tipo==='saida').reduce((s,x)=>s+x.valor,0);
  const save=()=>{if(!f.descricao||!f.valor)return;setFin(p=>[{...f,id:uid(),valor:parseFloat(f.valor)},...p]);setModal(false);setF({tipo:'entrada',descricao:'',valor:'',data:todayStr(),categoria:''});};
  return(
    <div>
      <PH title="Financeiro" action={<Btn onClick={()=>setModal(true)}>+ Lançamento</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
        <SC title="Entradas" value={fmt(ent)} icon="📥" color="#166534"/>
        <SC title="Saídas" value={fmt(sai)} icon="📤" color={C.P}/>
        <SC title="Saldo" value={fmt(ent-sai)} icon="💰" color={(ent-sai)>=0?'#166534':C.P}/>
      </div>
      <Card style={{marginBottom:14,display:'flex',gap:12,flexWrap:'wrap'}}>
        <SI label="Filtrar Tipo" value={filtTipo} onChange={setFiltTipo} options={[{v:'',l:'Todos'},{v:'entrada',l:'Entradas'},{v:'saida',l:'Saídas'}]} style={{marginBottom:0,flex:1,minWidth:160}}/>
        <TI label="Mês (AAAA-MM)" value={filtMes} onChange={setFiltMes} placeholder="2025-06" style={{marginBottom:0,flex:1,minWidth:160}}/>
      </Card>
      <Card><Tbl cols={[
        {l:'Data',k:'data'},{l:'Descrição',k:'descricao'},{l:'Categoria',k:'categoria'},
        {l:'Tipo',k:'tipo',render:r=><Bdg type={r.tipo==='entrada'?'success':'danger'}>{r.tipo==='entrada'?'Entrada':'Saída'}</Bdg>},
        {l:'Valor',k:'valor',render:r=><span style={{fontWeight:800,color:r.tipo==='entrada'?'#166534':C.P}}>{r.tipo==='entrada'?'+':'-'}{fmt(r.valor)}</span>},
        {l:'',k:'_',render:r=><Btn sm outline color={C.P} onClick={()=>setFin(p=>p.filter(x=>x.id!==r.id))}>✕</Btn>},
      ]} rows={rows}/></Card>
      {modal&&<Modal title="Novo Lançamento" onClose={()=>setModal(false)}>
        <SI label="Tipo" value={f.tipo} onChange={v=>setF(p=>({...p,tipo:v,categoria:''}))} options={[{v:'entrada',l:'Entrada'},{v:'saida',l:'Saída'}]}/>
        <TI label="Descrição *" value={f.descricao} onChange={v=>setF(p=>({...p,descricao:v}))}/>
        <TI label="Valor (R$) *" value={f.valor} onChange={v=>setF(p=>({...p,valor:v}))} type="number"/>
        <TI label="Data" value={f.data} onChange={v=>setF(p=>({...p,data:v}))} type="date"/>
        <SI label="Categoria" value={f.categoria} onChange={v=>setF(p=>({...p,categoria:v}))} options={(cats[f.tipo]||[]).map(c=>({v:c,l:c}))}/>
        <Btn onClick={save}>Salvar Lançamento</Btn>
      </Modal>}
    </div>
  );
}

// ── CONTAS ────────────────────────────────────────────────────────────────────
function Contas({contas,setContas}){
  const [modal,setModal]=useState(false);
  const [tab,setTab]=useState('todos');
  const [f,setF]=useState({tipo:'pagar',descricao:'',valor:'',vencimento:todayStr(),status:'a_vencer',categoria:''});
  const rows=contas.filter(c=>tab==='todos'||c.tipo===tab).sort((a,b)=>a.vencimento?.localeCompare(b.vencimento));
  const totPag=contas.filter(c=>c.tipo==='pagar'&&c.status!=='pago').reduce((s,c)=>s+c.valor,0);
  const totRec=contas.filter(c=>c.tipo==='receber'&&c.status!=='pago').reduce((s,c)=>s+c.valor,0);
  const stB=s=>({a_vencer:{t:'warning',l:'A Vencer'},vencida:{t:'danger',l:'Vencida'},pago:{t:'success',l:'Pago'}}[s]||{t:'default',l:s});
  const save=()=>{if(!f.descricao||!f.valor)return;setContas(p=>[{...f,id:uid(),valor:parseFloat(f.valor)},...p]);setModal(false);setF({tipo:'pagar',descricao:'',valor:'',vencimento:todayStr(),status:'a_vencer',categoria:''});};
  const TabBtn=({v,l})=><button onClick={()=>setTab(v)} style={{padding:'7px 18px',borderRadius:8,border:`1.5px solid ${tab===v?C.P:C.BD}`,background:tab===v?C.P:'#fff',color:tab===v?'#fff':C.T,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{l}</button>;
  return(
    <div>
      <PH title="Contas a Pagar / Receber" action={<Btn onClick={()=>setModal(true)}>+ Nova Conta</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
        <SC title="Total a Pagar" value={fmt(totPag)} icon="📤" color={C.P}/>
        <SC title="Total a Receber" value={fmt(totRec)} icon="📥" color="#0369a1"/>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:14}}><TabBtn v="todos" l="Todos"/><TabBtn v="pagar" l="A Pagar"/><TabBtn v="receber" l="A Receber"/></div>
      <Card><Tbl cols={[
        {l:'Descrição',k:'descricao'},{l:'Tipo',k:'tipo',render:r=><Bdg type={r.tipo==='pagar'?'danger':'success'}>{r.tipo==='pagar'?'Pagar':'Receber'}</Bdg>},
        {l:'Categoria',k:'categoria'},{l:'Vencimento',k:'vencimento'},{l:'Valor',k:'valor',render:r=>fmt(r.valor)},
        {l:'Status',k:'status',render:r=>{const s=stB(r.status);return<Bdg type={s.t}>{s.l}</Bdg>;}},
        {l:'Ação',k:'_',render:r=><div style={{display:'flex',gap:5}}>
          {r.status!=='pago'&&<Btn sm onClick={()=>setContas(p=>p.map(x=>x.id===r.id?{...x,status:'pago'}:x))}>✓ Pago</Btn>}
          <Btn sm outline color={C.P} onClick={()=>setContas(p=>p.filter(x=>x.id!==r.id))}>✕</Btn>
        </div>},
      ]} rows={rows}/></Card>
      {modal&&<Modal title="Nova Conta" onClose={()=>setModal(false)}>
        <SI label="Tipo" value={f.tipo} onChange={v=>setF(p=>({...p,tipo:v}))} options={[{v:'pagar',l:'A Pagar'},{v:'receber',l:'A Receber'}]}/>
        <TI label="Descrição *" value={f.descricao} onChange={v=>setF(p=>({...p,descricao:v}))}/>
        <TI label="Valor (R$) *" value={f.valor} onChange={v=>setF(p=>({...p,valor:v}))} type="number"/>
        <TI label="Vencimento" value={f.vencimento} onChange={v=>setF(p=>({...p,vencimento:v}))} type="date"/>
        <SI label="Status" value={f.status} onChange={v=>setF(p=>({...p,status:v}))} options={[{v:'a_vencer',l:'A Vencer'},{v:'vencida',l:'Vencida'},{v:'pago',l:'Pago'}]}/>
        <TI label="Categoria" value={f.categoria} onChange={v=>setF(p=>({...p,categoria:v}))} placeholder="ex: Fornecedor, Aluguel..."/>
        <Btn onClick={save}>Salvar</Btn>
      </Modal>}
    </div>
  );
}

// ── COMPRAS ───────────────────────────────────────────────────────────────────
function Compras({compras,setCompras,fornecedores}){
  const [modal,setModal]=useState(false);
  const [f,setF]=useState({fornecedor:'',descricao:'',valor:'',data:todayStr(),dataEntrega:'',status:'em_andamento',obs:''});
  const stB={em_andamento:{t:'info',l:'Em Andamento'},recebida:{t:'success',l:'Recebida'},cancelada:{t:'danger',l:'Cancelada'}};
  const save=()=>{if(!f.fornecedor||!f.valor)return;setCompras(p=>[{...f,id:uid(),valor:parseFloat(f.valor)},...p]);setModal(false);setF({fornecedor:'',descricao:'',valor:'',data:todayStr(),dataEntrega:'',status:'em_andamento',obs:''});};
  return(
    <div>
      <PH title="Ordens de Compra" action={<Btn onClick={()=>setModal(true)}>+ Nova Compra</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
        <SC title="Em Andamento" value={compras.filter(c=>c.status==='em_andamento').length} icon="🔄" color="#0369a1"/>
        <SC title="Recebidas" value={compras.filter(c=>c.status==='recebida').length} icon="✅" color="#166534"/>
        <SC title="Total Investido" value={fmt(compras.filter(c=>c.status!=='cancelada').reduce((s,c)=>s+c.valor,0))} icon="💳" color={C.P}/>
      </div>
      <Card><Tbl cols={[
        {l:'Data',k:'data'},{l:'Fornecedor',k:'fornecedor'},{l:'Descrição',k:'descricao'},{l:'Entrega Prevista',k:'dataEntrega'},
        {l:'Valor',k:'valor',render:r=>fmt(r.valor)},
        {l:'Status',k:'status',render:r=>{const s=stB[r.status]||{t:'default',l:r.status};return<Bdg type={s.t}>{s.l}</Bdg>;}},
        {l:'Ação',k:'_',render:r=><div style={{display:'flex',gap:4}}>
          {r.status==='em_andamento'&&<Btn sm onClick={()=>setCompras(p=>p.map(x=>x.id===r.id?{...x,status:'recebida'}:x))}>✓ Recebida</Btn>}
          {r.status!=='cancelada'&&<Btn sm outline color={C.P} onClick={()=>setCompras(p=>p.map(x=>x.id===r.id?{...x,status:'cancelada'}:x))}>Cancelar</Btn>}
        </div>},
      ]} rows={[...compras].sort((a,b)=>b.data?.localeCompare(a.data))}/></Card>
      {modal&&<Modal title="Nova Ordem de Compra" onClose={()=>setModal(false)}>
        <DI label="Fornecedor *" value={f.fornecedor} onChange={v=>setF(p=>({...p,fornecedor:v}))} options={fornecedores.map(x=>x.nome)} listId="comp-forn" placeholder="Nome do fornecedor"/>
        <TI label="Descrição dos Itens" value={f.descricao} onChange={v=>setF(p=>({...p,descricao:v}))}/>
        <TI label="Valor Total (R$) *" value={f.valor} onChange={v=>setF(p=>({...p,valor:v}))} type="number"/>
        <Grid><TI label="Data do Pedido" value={f.data} onChange={v=>setF(p=>({...p,data:v}))} type="date"/><TI label="Entrega Prevista" value={f.dataEntrega} onChange={v=>setF(p=>({...p,dataEntrega:v}))} type="date"/></Grid>
        <SI label="Status" value={f.status} onChange={v=>setF(p=>({...p,status:v}))} options={[{v:'em_andamento',l:'Em Andamento'},{v:'recebida',l:'Recebida'},{v:'cancelada',l:'Cancelada'}]}/>
        <F label="Observações"><textarea value={f.obs} onChange={e=>setF(p=>({...p,obs:e.target.value}))} style={{...inp,height:60,resize:'vertical'}}/></F>
        <Btn onClick={save}>Salvar Compra</Btn>
      </Modal>}
    </div>
  );
}

// ── CLIENTES ──────────────────────────────────────────────────────────────────
function Clientes({clientes,setClientes}){
  const [modal,setModal]=useState(false);
  const [f,setF]=useState({nome:'',email:'',telefone:''});
  const save=()=>{if(!f.nome)return;setClientes(p=>[{...f,id:uid()},...p]);setModal(false);setF({nome:'',email:'',telefone:''});};
  return(
    <div>
      <PH title="Clientes" action={<Btn onClick={()=>setModal(true)}>+ Novo Cliente</Btn>}/>
      <Card><Tbl cols={[{l:'Nome',k:'nome'},{l:'E-mail',k:'email'},{l:'Telefone',k:'telefone'},{l:'',k:'_',render:r=><Btn sm outline color={C.P} onClick={()=>setClientes(p=>p.filter(x=>x.id!==r.id))}>✕</Btn>}]} rows={clientes}/></Card>
      {modal&&<Modal title="Novo Cliente" onClose={()=>setModal(false)}>
        <TI label="Nome *" value={f.nome} onChange={v=>setF(p=>({...p,nome:v}))}/>
        <TI label="E-mail" value={f.email} onChange={v=>setF(p=>({...p,email:v}))} type="email"/>
        <TI label="Telefone" value={f.telefone} onChange={v=>setF(p=>({...p,telefone:v}))} placeholder="(21) 99999-9999"/>
        <Btn onClick={save}>Salvar Cliente</Btn>
      </Modal>}
    </div>
  );
}

// ── VENDAS ────────────────────────────────────────────────────────────────────
function Vendas({vendas,setVendas,clientes,estoque,setEstoque,tipos,precificacoes}){
  const [modal,setModal]=useState(false);
  const EF={clienteNome:'',data:todayStr(),formaPagamento:'pix',tipoEntrega:'retirada',freteValor:'',formaEnvio:'pac',transportadora:'',desconto:''};
  const [f,setF]=useState(EF);
  const [itens,setItens]=useState([]);
  const [itemAtual,setItemAtual]=useState({tipoProduto:'',sku:'',quantidade:'1'});
  const pgtos=[{v:'pix',l:'Pix'},{v:'debito',l:'Cartão de Débito'},{v:'credito_1x',l:'Crédito à Vista'},{v:'credito_2x',l:'Crédito 2x'},{v:'credito_3x',l:'Crédito 3x'},{v:'credito_4x',l:'Crédito 4x'},{v:'credito_5x',l:'Crédito 5x'},{v:'credito_6x',l:'Crédito 6x'}];

  const buscarPreco=(tipoProduto,sku)=>{
    let p = sku ? precificacoes.find(x=>x.sku && x.sku===sku) : null;
    if(!p) p = precificacoes.find(x=>x.tipoProduto===tipoProduto);
    return p ? p.precoVenda : 0;
  };

  const addItem=()=>{
    if(!itemAtual.tipoProduto||!itemAtual.quantidade)return;
    const valorUnit = buscarPreco(itemAtual.tipoProduto, itemAtual.sku);
    const qtd = parseInt(itemAtual.quantidade||1);
    setItens(p=>[...p,{id:uid(),tipoProduto:itemAtual.tipoProduto,sku:itemAtual.sku,quantidade:qtd,valorUnitario:valorUnit,subtotal:valorUnit*qtd}]);
    setItemAtual({tipoProduto:'',sku:'',quantidade:'1'});
  };
  const removeItem=id=>setItens(p=>p.filter(x=>x.id!==id));

  const subtotalGeral=itens.reduce((s,i)=>s+i.subtotal,0);
  const valorTotal=Math.max(0,subtotalGeral-n(f.desconto));

  const save=()=>{
    if(!f.clienteNome||itens.length===0)return;
    const venda={...f,id:uid(),itens,subtotal:subtotalGeral,desconto:n(f.desconto),valorTotal,freteValor:n(f.freteValor)};
    setVendas(p=>[venda,...p]);
    setEstoque(prev=>{
      let next=[...prev];
      itens.forEach(it=>{ if(it.sku) next=next.map(e=>e.sku===it.sku?{...e,quantidade:Math.max(0,e.quantidade-it.quantidade)}:e); });
      return next;
    });
    setModal(false);setF(EF);setItens([]);setItemAtual({tipoProduto:'',sku:'',quantidade:'1'});
  };
  return(
    <div>
      <PH title="Vendas" action={<Btn onClick={()=>setModal(true)}>+ Nova Venda</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
        <SC title="Total Vendido" value={fmt(vendas.reduce((s,v)=>s+v.valorTotal,0))} icon="💰" color={C.P}/>
        <SC title="Nº de Vendas" value={vendas.length} icon="🛍️" color={C.S}/>
        <SC title="Ticket Médio" value={fmt(vendas.length?vendas.reduce((s,v)=>s+v.valorTotal,0)/vendas.length:0)} icon="📊" color="#0369a1"/>
      </div>
      <Card><Tbl cols={[
        {l:'Data',k:'data'},{l:'Cliente',k:'clienteNome'},
        {l:'Itens',k:'itens',render:r=><span style={{fontSize:12,color:'#888'}}>{r.itens?.map(i=>`${i.quantidade}x ${i.tipoProduto}`).join(', ')}</span>},
        {l:'Pagamento',k:'formaPagamento',render:r=>PGTO_LABELS[r.formaPagamento]||r.formaPagamento},
        {l:'Entrega',k:'tipoEntrega',render:r=><Bdg type={r.tipoEntrega==='retirada'?'default':'info'}>{r.tipoEntrega==='retirada'?'Retirada':'Envio'}</Bdg>},
        {l:'Desconto',k:'desconto',render:r=>r.desconto?fmt(r.desconto):'-'},
        {l:'Total',k:'valorTotal',render:r=><span style={{fontWeight:800,color:C.P}}>{fmt(r.valorTotal)}</span>},
        {l:'',k:'_',render:r=><Btn sm outline color={C.P} onClick={()=>setVendas(p=>p.filter(x=>x.id!==r.id))}>✕</Btn>},
      ]} rows={[...vendas].sort((a,b)=>b.data?.localeCompare(a.data))}/></Card>
      {modal&&<Modal title="Nova Venda" onClose={()=>setModal(false)} wide>
        <DI label="Cliente *" value={f.clienteNome} onChange={v=>setF(p=>({...p,clienteNome:v}))} options={clientes.map(c=>c.nome)} listId="vnd-cli" placeholder="Nome do cliente"/>
        <TI label="Data *" value={f.data} onChange={v=>setF(p=>({...p,data:v}))} type="date"/>

        <Divider label="Produtos da Venda"/>
        <div style={{background:C.BG2,borderRadius:10,padding:14,marginBottom:14}}>
          <Grid cols="2fr 1.4fr 0.8fr auto">
            <DI label="Tipo de Produto" value={itemAtual.tipoProduto} onChange={v=>setItemAtual(p=>({...p,tipoProduto:v}))} options={tipos} listId="vnd-tipo" placeholder="Selecionar ou digitar"/>
            <DI label="SKU" value={itemAtual.sku} onChange={v=>setItemAtual(p=>({...p,sku:v}))} options={estoque.map(e=>e.sku)} listId="vnd-sku" placeholder="Código (opcional)"/>
            <TI label="Qtde" value={itemAtual.quantidade} onChange={v=>setItemAtual(p=>({...p,quantidade:v}))} type="number"/>
            <div style={{marginBottom:14,display:'flex',alignItems:'flex-end'}}><Btn sm onClick={addItem}>+ Adicionar</Btn></div>
          </Grid>
          {itemAtual.tipoProduto&&<div style={{fontSize:11,color:C.TM}}>💲 Preço unitário encontrado: <strong>{fmt(buscarPreco(itemAtual.tipoProduto,itemAtual.sku))}</strong> {buscarPreco(itemAtual.tipoProduto,itemAtual.sku)===0&&'(nenhuma precificação salva para este produto — cadastre em Precificação)'}</div>}
        </div>

        {itens.length>0&&<div style={{marginBottom:14}}>
          <Tbl cols={[
            {l:'Produto',k:'tipoProduto'},{l:'SKU',k:'sku',render:r=>r.sku||'-'},{l:'Qtde',k:'quantidade'},
            {l:'V. Unit.',k:'valorUnitario',render:r=>fmt(r.valorUnitario)},
            {l:'Subtotal',k:'subtotal',render:r=><span style={{fontWeight:700}}>{fmt(r.subtotal)}</span>},
            {l:'',k:'_',render:r=><Btn sm outline color={C.P} onClick={()=>removeItem(r.id)}>✕</Btn>},
          ]} rows={itens}/>
        </div>}

        <Divider label="Pagamento e Entrega"/>
        <SI label="Forma de Pagamento" value={f.formaPagamento} onChange={v=>setF(p=>({...p,formaPagamento:v}))} options={pgtos}/>
        <TI label="Desconto (R$)" value={f.desconto} onChange={v=>setF(p=>({...p,desconto:v}))} type="number" placeholder="0.00"/>
        <SI label="Tipo de Entrega" value={f.tipoEntrega} onChange={v=>setF(p=>({...p,tipoEntrega:v,freteValor:'',formaEnvio:'pac'}))} options={[{v:'retirada',l:'Retirada (sem custo)'},{v:'envio',l:'Envio'}]}/>
        {f.tipoEntrega==='envio'&&<>
          <TI label="Valor do Frete (R$)" value={f.freteValor} onChange={v=>setF(p=>({...p,freteValor:v}))} type="number"/>
          <SI label="Forma de Envio" value={f.formaEnvio} onChange={v=>setF(p=>({...p,formaEnvio:v,transportadora:''}))} options={[{v:'pac',l:'Correios PAC'},{v:'sedex',l:'Correios Sedex'},{v:'transportadora',l:'Transportadora'}]}/>
          {f.formaEnvio==='transportadora'&&<TI label="Nome da Transportadora" value={f.transportadora} onChange={v=>setF(p=>({...p,transportadora:v}))} placeholder="Nome da transportadora"/>}
        </>}

        <div style={{background:C.P,borderRadius:10,padding:16,marginTop:8}}>
          {[['Subtotal',fmt(subtotalGeral)],['Desconto',`- ${fmt(n(f.desconto))}`],['Total da Venda',fmt(valorTotal)]].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',color:'#fff'}}>
              <span style={{opacity:.8,fontSize:13}}>{l}</span><span style={{fontWeight:900,fontSize:l==='Total da Venda'?20:14}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}><Btn onClick={save}>Registrar Venda</Btn></div>
      </Modal>}
    </div>
  );
}

// ── ESTOQUE DE PRODUTOS ACABADOS ──────────────────────────────────────────────
function Estoque({estoque,setEstoque,tipos}){
  const [modal,setModal]=useState(false);
  const EF={sku:'',nome:'',tipoProduto:'',cor:'',tamanho:'',quantidade:'0',custoTotal:'',frete:''};
  const [f,setF]=useState(EF);
  const custoUnit=n(f.quantidade)>0?(n(f.custoTotal)+n(f.frete))/n(f.quantidade):0;
  const save=()=>{
    if(!f.sku||!f.nome)return;
    const item={...f,id:uid(),quantidade:parseInt(f.quantidade||0),custoTotal:n(f.custoTotal),frete:n(f.frete),custoUnitario:custoUnit};
    setEstoque(p=>{const ex=p.find(x=>x.sku===f.sku);return ex?p.map(x=>x.sku===f.sku?{...item,id:x.id}:x):[item,...p];});
    setModal(false);setF(EF);
  };
  const adj=(r,delta)=>{
    const q=parseInt(prompt(`${delta>0?'Adicionar':'Remover'} quantas unidades?`,'1')||0);
    if(q>0)setEstoque(p=>p.map(x=>x.id===r.id?{...x,quantidade:Math.max(0,x.quantidade+(delta>0?q:-q))}:x));
  };
  return(
    <div>
      <PH title="Estoque de Produtos Acabados" sub="Produtos prontos, disponíveis para venda" action={<Btn onClick={()=>setModal(true)}>+ Novo Item</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
        <SC title="Total SKUs" value={estoque.length} icon="📦" color={C.P}/>
        <SC title="Bom (>50)" value={estoque.filter(e=>e.quantidade>50).length} icon="✅" color="#166534"/>
        <SC title="Críticos (<25)" value={estoque.filter(e=>e.quantidade>0&&e.quantidade<25).length} icon="⚠️" color="#c47f17"/>
        <SC title="Sem Estoque" value={estoque.filter(e=>e.quantidade===0).length} icon="🚫" color="#999"/>
      </div>
      <Card><Tbl cols={[
        {l:'SKU',k:'sku'},{l:'Nome',k:'nome'},{l:'Tipo',k:'tipoProduto'},{l:'Cor',k:'cor'},{l:'Tamanho',k:'tamanho'},
        {l:'Custo Total',k:'custoTotal',render:r=>r.custoTotal?fmt(r.custoTotal):'-'},
        {l:'Frete',k:'frete',render:r=>r.frete?fmt(r.frete):'-'},
        {l:'Custo Unit.',k:'custoUnitario',render:r=>r.custoUnitario?<span style={{fontWeight:700,color:C.S}}>{fmt(r.custoUnitario)}</span>:'-'},
        {l:'Qtde',k:'quantidade',render:r=><span style={{fontWeight:800,fontSize:15}}>{r.quantidade}</span>},
        {l:'Status',k:'_',render:r=>{const s=stEst(r.quantidade);return<Bdg type={s.t}>{s.l}</Bdg>;}},
        {l:'Ações',k:'__',render:r=><div style={{display:'flex',gap:4}}>
          <Btn sm onClick={()=>adj(r,1)} color="#166534">+ Entrada</Btn>
          <Btn sm onClick={()=>adj(r,-1)} color="#c47f17">− Saída</Btn>
          <Btn sm outline color={C.P} onClick={()=>setEstoque(p=>p.filter(x=>x.id!==r.id))}>✕</Btn>
        </div>},
      ]} rows={estoque}/></Card>
      {modal&&<Modal title="Novo Item de Estoque" onClose={()=>setModal(false)} wide>
        <Divider label="Identificação"/>
        <Grid><TI label="SKU *" value={f.sku} onChange={v=>setF(p=>({...p,sku:v}))} placeholder="EX: CAN-BRN-1"/><TI label="Nome *" value={f.nome} onChange={v=>setF(p=>({...p,nome:v}))}/></Grid>
        <DI label="Tipo de Produto" value={f.tipoProduto} onChange={v=>setF(p=>({...p,tipoProduto:v}))} options={tipos} listId="est-tipo" placeholder="Selecionar ou digitar"/>
        <Grid><TI label="Cor" value={f.cor} onChange={v=>setF(p=>({...p,cor:v}))}/><TI label="Tamanho / Variação" value={f.tamanho} onChange={v=>setF(p=>({...p,tamanho:v}))}/></Grid>
        <TI label="Quantidade em Estoque" value={f.quantidade} onChange={v=>setF(p=>({...p,quantidade:v}))} type="number"/>
        <Divider label="Custos"/>
        <Grid cols="1fr 1fr 1fr">
          <TI label="Custo Total do Lote (R$)" value={f.custoTotal} onChange={v=>setF(p=>({...p,custoTotal:v}))} type="number" placeholder="0.00"/>
          <TI label="Frete (R$)" value={f.frete} onChange={v=>setF(p=>({...p,frete:v}))} type="number" placeholder="0.00"/>
          <div style={{marginBottom:14}}>
            <label style={lbl}>Custo Unitário (auto)</label>
            <div style={{...inpRO,display:'flex',alignItems:'center',borderRadius:8,padding:'9px 12px',fontSize:13}}>{fmt(custoUnit)}</div>
          </div>
        </Grid>
        <Btn onClick={save}>Salvar Item</Btn>
      </Modal>}
    </div>
  );
}

// ── CUSTO DE PRODUTO ──────────────────────────────────────────────────────────
function CustoProduto({custos,setCustos,fornecedores,tipos,setTipos}){
  const [modal,setModal]=useState(false);
  const E={tipoProduto:'',sku:'',colecao:'',fornecedor:'',custoTotal:'',frete:'',quantidade:'',cor:'',tamanho:'',tipoTecido:'',arteEstampa:'',etiqueta:'',embalagem:'',tag:'',lacre:'',cartao:'',papelEmbrulho:'',adesivo:'',caixa:'',sacola:'',outros:'',obs:''};
  const [f,setF]=useState(E);
  const custoUnit=n(f.quantidade)>0?(n(f.custoTotal)+n(f.frete))/n(f.quantidade):0;
  const adicionais=n(f.arteEstampa)+n(f.etiqueta)+n(f.embalagem)+n(f.tag)+n(f.lacre)+n(f.cartao)+n(f.papelEmbrulho)+n(f.adesivo)+n(f.caixa)+n(f.sacola)+n(f.outros);
  const cuTot=n(f.custoTotal)+n(f.frete)+adicionais;
  const save=()=>{
    if(!f.tipoProduto)return;
    if(!tipos.includes(f.tipoProduto))setTipos(p=>[...p,f.tipoProduto]);
    setCustos(p=>[{...f,id:uid(),custoTotal:n(f.custoTotal),frete:n(f.frete),quantidade:n(f.quantidade),custoUnitario:custoUnit,custoFinal:cuTot},...p]);
    setModal(false);setF(E);
  };
  return(
    <div>
      <PH title="Custo de Produto" action={<Btn onClick={()=>setModal(true)}>+ Nova Ficha</Btn>}/>
      <Card><Tbl cols={[
        {l:'Tipo',k:'tipoProduto'},{l:'SKU',k:'sku'},{l:'Coleção/Drop',k:'colecao'},{l:'Fornecedor',k:'fornecedor'},
        {l:'Custo Total Lote',k:'custoTotal',render:r=>fmt(r.custoTotal)},
        {l:'Frete',k:'frete',render:r=>fmt(r.frete)},
        {l:'Qtde',k:'quantidade'},
        {l:'Custo Unit.',k:'custoUnitario',render:r=><span style={{fontWeight:800,color:C.S}}>{fmt(r.custoUnitario)}</span>},
        {l:'Total c/ Adicionais',k:'custoFinal',render:r=><span style={{fontWeight:800,color:C.P}}>{fmt(r.custoFinal)}</span>},
        {l:'Obs',k:'obs',render:r=>r.obs?<span title={r.obs} style={{cursor:'help',fontSize:16}}>📝</span>:'-'},
        {l:'',k:'_',render:r=><Btn sm outline color={C.P} onClick={()=>setCustos(p=>p.filter(x=>x.id!==r.id))}>✕</Btn>},
      ]} rows={custos}/></Card>
      {modal&&<Modal title="Nova Ficha de Custo" onClose={()=>setModal(false)} wide>
        <Divider label="Identificação"/>
        <Grid cols="1fr 1fr 1fr">
          <DI label="Tipo de Produto *" value={f.tipoProduto} onChange={v=>setF(p=>({...p,tipoProduto:v}))} options={tipos} listId="cp-tipo" placeholder="Selecionar ou digitar"/>
          <TI label="SKU" value={f.sku} onChange={v=>setF(p=>({...p,sku:v}))} placeholder="EX: CAN-BRN-1"/>
          <TI label="Coleção / Drop" value={f.colecao} onChange={v=>setF(p=>({...p,colecao:v}))} placeholder="ex: Vol.01"/>
        </Grid>
        <DI label="Fornecedor" value={f.fornecedor} onChange={v=>setF(p=>({...p,fornecedor:v}))} options={fornecedores.map(x=>x.nome)} listId="cp-forn" placeholder="Buscar fornecedor"/>
        <Grid><TI label="Cor" value={f.cor} onChange={v=>setF(p=>({...p,cor:v}))}/><TI label="Tamanho" value={f.tamanho} onChange={v=>setF(p=>({...p,tamanho:v}))}/></Grid>
        <TI label="Tipo de Tecido / Material" value={f.tipoTecido} onChange={v=>setF(p=>({...p,tipoTecido:v}))}/>

        <Divider label="Custo do Lote"/>
        <Grid cols="1fr 1fr 1fr 1fr">
          <TI label="Custo Total do Lote (R$) *" value={f.custoTotal} onChange={v=>setF(p=>({...p,custoTotal:v}))} type="number" placeholder="0.00"/>
          <TI label="Frete (R$)" value={f.frete} onChange={v=>setF(p=>({...p,frete:v}))} type="number" placeholder="0.00"/>
          <TI label="Quantidade *" value={f.quantidade} onChange={v=>setF(p=>({...p,quantidade:v}))} type="number" placeholder="0"/>
          <div style={{marginBottom:14}}>
            <label style={lbl}>Custo Unitário (auto)</label>
            <div style={{...inpRO,display:'flex',alignItems:'center',borderRadius:8,padding:'9px 12px',fontSize:13}}>{fmt(custoUnit)}</div>
          </div>
        </Grid>
        <div style={{background:C.BG2,borderRadius:8,padding:'10px 14px',fontSize:12,color:C.TM,marginBottom:8}}>
          📌 Custo unitário = (Custo Total + Frete) ÷ Quantidade
        </div>

        <Divider label="Itens Adicionais / Embalagem (R$)"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[['arteEstampa','Arte Estampa'],['etiqueta','Etiqueta'],['embalagem','Embalagem'],['tag','Tag'],['lacre','Lacre'],['cartao','Cartão'],['papelEmbrulho','Papel Embrulho'],['adesivo','Adesivo'],['caixa','Caixa'],['sacola','Sacola'],['outros','Outros']].map(([k,l])=>(
            <TI key={k} label={`${l} (R$)`} value={f[k]} onChange={v=>setF(p=>({...p,[k]:v}))} type="number" placeholder="0.00" style={{marginBottom:0}}/>
          ))}
        </div>
        <div style={{background:C.P,borderRadius:10,padding:14,margin:'16px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontWeight:700,color:'rgba(255,255,255,.8)',fontSize:13}}>Custo Total (lote + frete + adicionais):</span>
          <span style={{fontWeight:900,color:'#fff',fontSize:22}}>{fmt(cuTot)}</span>
        </div>

        <Divider label="Anotações em Destaque"/>
        <F label="Observações / Informações Relevantes">
          <textarea value={f.obs} onChange={e=>setF(p=>({...p,obs:e.target.value}))} placeholder="Inserir informações relevantes..." style={{...inp,height:72,resize:'vertical'}}/>
        </F>
        <Btn onClick={save}>Salvar Ficha</Btn>
      </Modal>}
    </div>
  );
}

// ── PRECIFICAÇÃO ──────────────────────────────────────────────────────────────
function Precificacao({tipos,precificacoes,setPrecificacoes,custos}){
  const PARC_OPC=[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,7,8,9,10];
  const EE={caixa:'',papelEmbrulho:'',sacola:'',tag:'',lacre:'',adesivo:'',estampa:'',caixaEnvio:'',outros:''};
  const EF={tipoProduto:'',sku:'',custoProduto:'',custoFrete:'',imposto:'',impostoFrete:'',taxaPlataforma:'',taxaGateway:'',taxaParcelamento:'',custoMarketing:'',markup:'100',emb:EE};
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [f,setF]=useState(EF);
  const setE=(k,v)=>setF(p=>({...p,emb:{...p.emb,[k]:v}}));
  const fatorMarkup = n(f.markup) > 0 ? n(f.markup) : 1;
  const markupValorCalc = custoBase * (fatorMarkup - 1);
  const markupValorAtivo = f.markupValor !== '' ? n(f.markupValor) : markupValorCalc;
  const precoVenda = f.markupValor !== '' ? custoBase + markupValorAtivo : custoBase * fatorMarkup;
  const margem=precoVenda>0?(lucroBruto/precoVenda)*100:0;

  const puxarCusto=(tipoProduto)=>{
    const c=custos.find(x=>x.tipoProduto===tipoProduto);
    if(c)setF(p=>({...p,custoProduto:String(c.custoUnitario.toFixed(2))}));
  };

  const abrirNovo=()=>{setEditId(null);setF(EF);setModal(true);};
  const abrirEdicao=(p)=>{setEditId(p.id);setF({tipoProduto:p.tipoProduto,sku:p.sku||'',custoProduto:String(p.custoProduto||''),custoFrete:String(p.custoFrete||''),imposto:String(p.imposto||''),impostoFrete:String(p.impostoFrete||''),taxaPlataforma:String(p.taxaPlataforma||''),taxaGateway:String(p.taxaGateway||''),taxaParcelamento:String(p.taxaParcelamento||''),custoMarketing:String(p.custoMarketing||''),markup:String(p.markup||'100'),emb:p.emb||EE});setModal(true);};

  const save=()=>{
    if(!f.tipoProduto)return;
    const registro={id:editId||uid(),tipoProduto:f.tipoProduto,sku:f.sku,custoProduto:n(f.custoProduto),custoFrete:n(f.custoFrete),imposto:n(f.imposto),impostoFrete:n(f.impostoFrete),taxaPlataforma:n(f.taxaPlataforma),taxaGateway:n(f.taxaGateway),taxaParcelamento:n(f.taxaParcelamento),custoMarketing:n(f.custoMarketing),custoEmbalagem:custoEmb,emb:f.emb,markup:n(f.markup),custoBase,precoVenda,lucroBruto,margem,atualizadoEm:new Date().toISOString()};
    setPrecificacoes(p=>editId?p.map(x=>x.id===editId?registro:x):[registro,...p]);
    setModal(false);
  };

  return(
    <div>
      <PH title="Precificação" sub="Calcule e salve o preço de venda de cada produto — usado automaticamente no módulo Vendas" action={<Btn onClick={abrirNovo}>+ Nova Precificação</Btn>}/>
      <Card><Tbl cols={[
        {l:'Produto',k:'tipoProduto'},{l:'SKU',k:'sku',render:r=>r.sku||'-'},
        {l:'Custo Total',k:'custoBase',render:r=>fmt(r.custoBase)},
        {l:'Markup',k:'markup',render:r=>`${r.markup}%`},
        {l:'Preço de Venda',k:'precoVenda',render:r=><span style={{fontWeight:900,color:C.P}}>{fmt(r.precoVenda)}</span>},
        {l:'Margem',k:'margem',render:r=>`${r.margem.toFixed(1)}%`},
        {l:'Ações',k:'_',render:r=><div style={{display:'flex',gap:4}}>
          <Btn sm onClick={()=>abrirEdicao(r)}>Editar</Btn>
          <Btn sm outline color={C.P} onClick={()=>setPrecificacoes(p=>p.filter(x=>x.id!==r.id))}>✕</Btn>
        </div>},
      ]} rows={precificacoes} empty="Nenhuma precificação salva ainda. Clique em '+ Nova Precificação' para começar."/></Card>

      {modal&&<Modal title={editId?'Editar Precificação':'Nova Precificação'} onClose={()=>setModal(false)} wide>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <Card style={{marginBottom:12}}>
              <Divider label="Produto"/>
              <DI label="Tipo de Produto *" value={f.tipoProduto} onChange={v=>{setF(p=>({...p,tipoProduto:v}));puxarCusto(v);}} options={tipos} listId="pr-tipo"/>
              <TI label="SKU (opcional)" value={f.sku} onChange={v=>setF(p=>({...p,sku:v}))} placeholder="Vincula a um item específico do estoque"/>
              <TI label="Custo do Produto (R$)" value={f.custoProduto} onChange={v=>setF(p=>({...p,custoProduto:v}))} type="number"/>
              <div style={{fontSize:11,color:'#bbb'}}>💡 Preenchido automaticamente a partir da última ficha de Custo de Produto deste tipo, se existir.</div>
            </Card>
            <Card style={{marginBottom:12}}>
              <Divider label="Logística"/>
              <TI label="Custo de Frete (R$)" value={f.custoFrete} onChange={v=>setF(p=>({...p,custoFrete:v}))} type="number"/>
              <TI label="Imposto sobre Frete (R$)" value={f.impostoFrete} onChange={v=>setF(p=>({...p,impostoFrete:v}))} type="number"/>
            </Card>
            <Card>
              <Divider label="Custo de Embalagem"/>
              {[['caixa','Caixa de Envio'],['papelEmbrulho','Papel de Embrulho'],['sacola','Sacola'],['tag','Tag'],['lacre','Lacre'],['adesivo','Adesivo'],['estampa','Estampa'],['caixaEnvio','Caixa'],['outros','Outros']].map(([k,l])=>(
                <TI key={k} label={`${l} (R$)`} value={f.emb[k]} onChange={v=>setE(k,v)} type="number" placeholder="0.00"/>
              ))}
              <div style={{background:C.BG2,borderRadius:8,padding:10,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontWeight:700,fontSize:13}}>Total Embalagem:</span><span style={{fontWeight:800,color:C.S}}>{fmt(custoEmb)}</span>
              </div>
            </Card>
          </div>
          <div>
            <Card style={{marginBottom:12}}>
              <Divider label="Taxas e Impostos"/>
              <TI label="Imposto do Produto (R$)" value={f.imposto} onChange={v=>setF(p=>({...p,imposto:v}))} type="number"/>
              <TI label="Taxa de Plataforma (R$)" value={f.taxaPlataforma} onChange={v=>setF(p=>({...p,taxaPlataforma:v}))} type="number"/>
              <TI label="Taxa de Gateway (R$)" value={f.taxaGateway} onChange={v=>setF(p=>({...p,taxaGateway:v}))} type="number"/>
              <F label="Taxa de Parcelamento (%)">
                <input value={f.taxaParcelamento??''} onChange={e=>setF(p=>({...p,taxaParcelamento:e.target.value}))} type="number" step="0.1" list="pr-parc" style={inp} placeholder="0.00"/>
                <datalist id="pr-parc">{PARC_OPC.map(t=><option key={t} value={t}/>)}</datalist>
              </F>
              <TI label="Custo de Marketing (R$)" value={f.custoMarketing} onChange={v=>setF(p=>({...p,custoMarketing:v}))} type="number"/>
            </Card>
            <Card style={{marginBottom:12}}>
              <Divider label="Markup"/>
              <TI label="Fator de Multiplicação (ex: 2 = dobro do custo)" value={f.markup} onChange={onMarkupPctChange} type="number" placeholder="ex: 2"/>
              <div style={{background:C.BG2,borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:C.TM}}>
                Preço = Custo Total × {n(f.markup)||1} = <strong>{fmt(custoBase * (n(f.markup)||1))}</strong>
              </div>
              <TI label="Valor do Markup (R$) — editável para ajuste fino" value={f.markupValor!==''?f.markupValor:markupValorCalc.toFixed(2)} onChange={onMarkupValorChange} type="number"/>
              <div style={{fontSize:11,color:'#bbb'}}>💡 Edite este campo para ajustar o valor final sem alterar o fator.</div>            </Card>
            <div style={{background:C.P,borderRadius:12,padding:20,color:'#fff',marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:12,opacity:.7,textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>Resultado</div>
              {[['Custo Total',fmt(custoBase),14],['Preço de Venda',fmt(precoVenda),22],['Lucro Bruto',fmt(lucroBruto),14],['Margem de Lucro',`${margem.toFixed(1)}%`,14]].map(([l,v,sz])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.15)'}}>
                  <span style={{opacity:.8,fontSize:13}}>{l}</span><span style={{fontWeight:900,fontSize:sz}}>{v}</span>
                </div>
              ))}
            </div>
            <Btn onClick={save} style={{width:'100%'}}>{editId?'Atualizar Precificação':'💾 Salvar Precificação'}</Btn>
          </div>
        </div>
      </Modal>}
    </div>
  );
}

// ── ANTECIPAÇÃO ───────────────────────────────────────────────────────────────
function Antecipacao(){
  const [f,setF]=useState({modalidade:'mesmo_dia',pagamento:'pix',valor:''});
  const pgtosPorMod={
    mesmo_dia:[{v:'pix',l:'Pix'},{v:'debito',l:'Cartão de Débito'},{v:'credito_1x',l:'Crédito à Vista'},{v:'credito_2x',l:'Crédito 2x'},{v:'credito_3x',l:'Crédito 3x'},{v:'credito_4x',l:'Crédito 4x'},{v:'credito_5x',l:'Crédito 5x'},{v:'credito_6x',l:'Crédito 6x'}],
    um_dia:[{v:'pix',l:'Pix'},{v:'debito',l:'Cartão de Débito'},{v:'credito_1x',l:'Crédito à Vista'},{v:'credito_2x',l:'Crédito 2x'},{v:'credito_3x',l:'Crédito 3x'},{v:'credito_4x',l:'Crédito 4x'},{v:'credito_5x',l:'Crédito 5x'},{v:'credito_6x',l:'Crédito 6x'}],
    sem_antecipacao:[{v:'credito_1x',l:'Crédito à Vista'},{v:'credito_2x',l:'Crédito 2x'},{v:'credito_3x',l:'Crédito 3x'},{v:'credito_4x',l:'Crédito 4x'},{v:'credito_5x',l:'Crédito 5x'},{v:'credito_6x',l:'Crédito 6x'}],
  };
  const taxa=TAXAS[f.modalidade]?.[f.pagamento]??0;
  const vBruto=n(f.valor);const desconto=vBruto*(taxa/100);const vLiq=vBruto-desconto;
  const modLabel={mesmo_dia:'Mesmo Dia',um_dia:'1 Dia Útil',sem_antecipacao:'Sem Antecipação (30+ dias)'};
  return(
    <div>
      <PH title="Antecipação de Recebíveis"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <Divider label="Simulador"/>
          <SI label="Modalidade de Antecipação" value={f.modalidade} onChange={v=>setF(p=>({...p,modalidade:v,pagamento:pgtosPorMod[v][0].v}))} options={[{v:'mesmo_dia',l:'Mesmo Dia'},{v:'um_dia',l:'1 Dia Útil'},{v:'sem_antecipacao',l:'Sem Antecipação (30+ dias)'}]}/>
          <SI label="Forma de Pagamento" value={f.pagamento} onChange={v=>setF(p=>({...p,pagamento:v}))} options={pgtosPorMod[f.modalidade]}/>
          <TI label="Valor Bruto (R$)" value={f.valor} onChange={v=>setF(p=>({...p,valor:v}))} type="number" placeholder="0.00"/>
          {f.valor&&<div style={{background:C.P,borderRadius:12,padding:18,color:'#fff',marginTop:8}}>
            <div style={{fontWeight:800,fontSize:12,opacity:.7,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Resultado</div>
            {[['Taxa Aplicada',`${taxa}%`],['Valor Bruto',fmt(vBruto)],['Desconto (taxa)',`- ${fmt(desconto)}`],['Valor Líquido',fmt(vLiq)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.15)'}}>
                <span style={{opacity:.8,fontSize:13}}>{l}</span><span style={{fontWeight:900,fontSize:l==='Valor Líquido'?20:14}}>{v}</span>
              </div>
            ))}
          </div>}
        </Card>
        <div>
          {Object.entries(TAXAS).map(([mod,taxas])=>(
            <Card key={mod} style={{marginBottom:12,opacity:mod===f.modalidade?1:.7}}>
              <div style={{fontWeight:800,color:C.P,fontSize:13,marginBottom:10}}>{modLabel[mod]}</div>
              {Object.entries(taxas).map(([k,t])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 4px',borderBottom:`1px solid ${C.BD}`,background:f.modalidade===mod&&f.pagamento===k?`${C.P}10`:undefined,borderRadius:4}}>
                  <span style={{fontSize:12}}>{PGTO_LABELS[k]||k}</span><span style={{fontWeight:800,color:t===0?'#166534':C.P,fontSize:12}}>{t===0?'Grátis':`${t}%`}</span>
                </div>
              ))}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FORNECEDORES ──────────────────────────────────────────────────────────────
function Fornecedores({fornecedores,setFornecedores}){
  const [modal,setModal]=useState(false);
  const E={nome:'',cnpj:'',email:'',telefone:'',endereco:'',site:''};
  const [f,setF]=useState(E);
  const save=()=>{if(!f.nome)return;setFornecedores(p=>[{...f,id:uid()},...p]);setModal(false);setF(E);};
  return(
    <div>
      <PH title="Fornecedores" action={<Btn onClick={()=>setModal(true)}>+ Novo Fornecedor</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
        {fornecedores.length===0&&<p style={{color:'#bbb',gridColumn:'1/-1'}}>Nenhum fornecedor cadastrado.</p>}
        {fornecedores.map(f=>(
          <Card key={f.id}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
              <div style={{width:42,height:42,borderRadius:10,background:`${C.P}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🏭</div>
              <button onClick={()=>setFornecedores(p=>p.filter(x=>x.id!==f.id))} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:16}}>✕</button>
            </div>
            <h4 style={{margin:'0 0 8px',color:C.P,fontWeight:800}}>{f.nome}</h4>
            {f.cnpj&&<p style={{margin:'3px 0',fontSize:12,color:'#888'}}>CNPJ: {f.cnpj}</p>}
            {f.email&&<p style={{margin:'3px 0',fontSize:12,color:'#888'}}>✉ {f.email}</p>}
            {f.telefone&&<p style={{margin:'3px 0',fontSize:12,color:'#888'}}>☎ {f.telefone}</p>}
            {f.endereco&&<p style={{margin:'3px 0',fontSize:12,color:'#888'}}>📍 {f.endereco}</p>}
            {f.site&&<a href={f.site} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.S,textDecoration:'none'}}>🌐 {f.site}</a>}
          </Card>
        ))}
      </div>
      {modal&&<Modal title="Novo Fornecedor" onClose={()=>setModal(false)}>
        <TI label="Nome *" value={f.nome} onChange={v=>setF(p=>({...p,nome:v}))}/>
        <TI label="CNPJ" value={f.cnpj} onChange={v=>setF(p=>({...p,cnpj:v}))} placeholder="00.000.000/0001-00"/>
        <TI label="E-mail" value={f.email} onChange={v=>setF(p=>({...p,email:v}))} type="email"/>
        <TI label="Telefone" value={f.telefone} onChange={v=>setF(p=>({...p,telefone:v}))} placeholder="(21) 99999-9999"/>
        <TI label="Endereço" value={f.endereco} onChange={v=>setF(p=>({...p,endereco:v}))} placeholder="Rua, número, cidade — UF"/>
        <TI label="Site" value={f.site} onChange={v=>setF(p=>({...p,site:v}))} placeholder="https://"/>
        <Btn onClick={save}>Salvar Fornecedor</Btn>
      </Modal>}
    </div>
  );
}

// ── MATÉRIA-PRIMA ─────────────────────────────────────────────────────────────
function Materiais({materiais,setMateriais,fornecedores,tipos,setTipos}){
  const [modal,setModal]=useState(false);
  const E={tipoProduto:'',fornecedor:'',quantidade:'',custoUnitario:'',frete:'',data:todayStr(),obs:''};
  const [f,setF]=useState(E);
  const custoLote=n(f.custoUnitario)*n(f.quantidade);
  const totFrete=materiais.reduce((s,m)=>s+n(m.frete),0);
  const totCusto=materiais.reduce((s,m)=>s+n(m.custoTotal),0);
  const totEst=materiais.reduce((s,m)=>s+parseInt(m.quantidade||0),0);
  const save=()=>{
    if(!f.tipoProduto||!f.quantidade)return;
    if(!tipos.includes(f.tipoProduto))setTipos(p=>[...p,f.tipoProduto]);
    setMateriais(p=>[{...f,id:uid(),custoTotal:custoLote,quantidade:parseInt(f.quantidade),custoUnitario:n(f.custoUnitario),frete:n(f.frete)},...p]);
    setModal(false);setF(E);
  };
  return(
    <div>
      <PH title="Matéria-Prima" sub="Insumos comprados para produção — controle separado do estoque de produtos prontos" action={<Btn onClick={()=>setModal(true)}>+ Novo Material</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
        <SC title="Itens Cadastrados" value={materiais.length} icon="🧵" color={C.P}/>
        <SC title="Total em Estoque" value={fmtN(totEst)} icon="📦" color={C.S}/>
        <SC title="Custo do Inventário" value={fmt(totCusto)} icon="💰" color="#0369a1"/>
        <SC title="Total em Frete" value={fmt(totFrete)} icon="🚚" color="#c47f17"/>
      </div>
      <Card><Tbl cols={[
        {l:'Data',k:'data'},{l:'Tipo de Produto',k:'tipoProduto'},{l:'Fornecedor',k:'fornecedor'},
        {l:'Qtde',k:'quantidade'},{l:'Custo Unit.',k:'custoUnitario',render:r=>fmt(r.custoUnitario)},
        {l:'Frete',k:'frete',render:r=>fmt(r.frete)},
        {l:'Custo Total',k:'custoTotal',render:r=><span style={{fontWeight:800,color:C.P}}>{fmt(r.custoTotal)}</span>},
        {l:'Obs',k:'obs',render:r=>r.obs?<span title={r.obs} style={{cursor:'help'}}>📝</span>:'-'},
        {l:'',k:'_',render:r=><Btn sm outline color={C.P} onClick={()=>setMateriais(p=>p.filter(x=>x.id!==r.id))}>✕</Btn>},
      ]} rows={[...materiais].sort((a,b)=>b.data?.localeCompare(a.data))}/></Card>
      {modal&&<Modal title="Novo Material" onClose={()=>setModal(false)}>
        <DI label="Tipo de Produto *" value={f.tipoProduto} onChange={v=>setF(p=>({...p,tipoProduto:v}))} options={tipos} listId="mat-tipo" placeholder="Selecionar ou digitar"/>
        <DI label="Fornecedor" value={f.fornecedor} onChange={v=>setF(p=>({...p,fornecedor:v}))} options={fornecedores.map(x=>x.nome)} listId="mat-forn" placeholder="Buscar fornecedor cadastrado"/>
        <Grid>
          <TI label="Quantidade *" value={f.quantidade} onChange={v=>setF(p=>({...p,quantidade:v}))} type="number"/>
          <TI label="Custo Unitário (R$)" value={f.custoUnitario} onChange={v=>setF(p=>({...p,custoUnitario:v}))} type="number"/>
        </Grid>
        <div style={{background:C.BG2,borderRadius:10,padding:14,marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontWeight:700,fontSize:13}}>Custo Total do Lote:</span><span style={{fontWeight:900,color:C.P,fontSize:20}}>{fmt(custoLote)}</span>
        </div>
        <TI label="Frete (R$)" value={f.frete} onChange={v=>setF(p=>({...p,frete:v}))} type="number" placeholder="0.00"/>
        <TI label="Data" value={f.data} onChange={v=>setF(p=>({...p,data:v}))} type="date"/>
        <F label="Observações"><textarea value={f.obs} onChange={e=>setF(p=>({...p,obs:e.target.value}))} style={{...inp,height:60,resize:'vertical'}} placeholder="Informações adicionais..."/></F>
        <Btn onClick={save}>Salvar Material</Btn>
      </Modal>}
    </div>
  );
}

// ── RELATÓRIOS ────────────────────────────────────────────────────────────────
function Relatorios({vendas,fin,contas,estoque}){
  const [tipo,setTipo]=useState('completo');
  const [ini,setIni]=useState(todayStr().slice(0,8)+'01');
  const [fim,setFim]=useState(todayStr());
  const filtra=arr=>arr.filter(x=>x.data>=ini&&x.data<=fim);
  const vF=filtra(vendas);const finF=filtra(fin);
  const totV=vF.reduce((s,v)=>s+v.valorTotal,0);
  const ent=finF.filter(x=>x.tipo==='entrada').reduce((s,x)=>s+x.valor,0);
  const sai=finF.filter(x=>x.tipo==='saida').reduce((s,x)=>s+x.valor,0);
  const byPgto=vF.reduce((a,v)=>{a[v.formaPagamento]=(a[v.formaPagamento]||0)+v.valorTotal;return a;},{});
  const byDia=vF.reduce((a,v)=>{a[v.data]=(a[v.data]||0)+v.valorTotal;return a;},{});
  const byCliente=vF.reduce((a,v)=>{a[v.clienteNome]=(a[v.clienteNome]||0)+v.valorTotal;return a;},{});
  const tipos=[{v:'completo',l:'Relatório Completo'},{v:'vendas',l:'Vendas por Período'},{v:'vendas_diario',l:'Vendas Diárias'},{v:'fluxo',l:'Fluxo de Caixa'},{v:'contas_pagar',l:'Contas a Pagar'},{v:'contas_receber',l:'Contas a Receber'},{v:'estoque',l:'Estoque Completo'}];
  const show=k=>tipo==='completo'||tipo===k;
  return(
    <div>
      <PH title="Relatórios"/>
      <Card style={{marginBottom:16,display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
        <SI label="Tipo de Relatório" value={tipo} onChange={setTipo} options={tipos} style={{marginBottom:0,flex:'0 0 220px'}}/>
        <TI label="Data Inicial" value={ini} onChange={setIni} type="date" style={{marginBottom:0,flex:1}}/>
        <TI label="Data Final" value={fim} onChange={setFim} type="date" style={{marginBottom:0,flex:1}}/>
      </Card>
      {(show('vendas')||show('vendas_diario'))&&<Card style={{marginBottom:12}}>
        <Divider label="Resumo de Vendas"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
          <SC title="Total Vendido" value={fmt(totV)} icon="💰" color={C.P}/>
          <SC title="Nº de Vendas" value={vF.length} icon="🛍️" color={C.S}/>
          <SC title="Ticket Médio" value={fmt(vF.length?totV/vF.length:0)} icon="📈" color="#0369a1"/>
        </div>
        <h5 style={{color:C.S,margin:'0 0 8px',fontWeight:700}}>Por Forma de Pagamento</h5>
        <Tbl cols={[{l:'Pagamento',k:'p',render:r=>PGTO_LABELS[r.p]||r.p},{l:'Total',k:'t',render:r=>fmt(r.t)},{l:'%',k:'p',render:r=>`${totV>0?((r.t/totV)*100).toFixed(1):0}%`}]} rows={Object.entries(byPgto).map(([p,t])=>({p,t}))}/>
        <h5 style={{color:C.S,margin:'16px 0 8px',fontWeight:700}}>Por Cliente</h5>
        <Tbl cols={[{l:'Cliente',k:'c'},{l:'Total',k:'t',render:r=>fmt(r.t)}]} rows={Object.entries(byCliente).sort((a,b)=>b[1]-a[1]).map(([c,t])=>({c,t}))}/>
        {show('vendas_diario')&&<><h5 style={{color:C.S,margin:'16px 0 8px',fontWeight:700}}>Por Dia</h5>
        <Tbl cols={[{l:'Data',k:'d'},{l:'Total',k:'t',render:r=>fmt(r.t)},{l:'Nº Vendas',k:'q'}]} rows={Object.entries(byDia).sort((a,b)=>b[0].localeCompare(a[0])).map(([d,t])=>({d,t,q:vF.filter(v=>v.data===d).length}))}/></>}
      </Card>}
      {show('fluxo')&&<Card style={{marginBottom:12}}>
        <Divider label="Fluxo de Caixa"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
          <SC title="Entradas" value={fmt(ent)} icon="📥" color="#166534"/>
          <SC title="Saídas" value={fmt(sai)} icon="📤" color={C.P}/>
          <SC title="Saldo" value={fmt(ent-sai)} icon="⚖️" color={(ent-sai)>=0?'#166534':C.P}/>
        </div>
        <Tbl cols={[{l:'Data',k:'data'},{l:'Descrição',k:'descricao'},{l:'Categoria',k:'categoria'},{l:'Tipo',k:'tipo',render:r=><Bdg type={r.tipo==='entrada'?'success':'danger'}>{r.tipo==='entrada'?'Entrada':'Saída'}</Bdg>},{l:'Valor',k:'valor',render:r=><span style={{fontWeight:700,color:r.tipo==='entrada'?'#166534':C.P}}>{r.tipo==='entrada'?'+':'-'}{fmt(r.valor)}</span>}]} rows={[...finF].sort((a,b)=>b.data?.localeCompare(a.data))}/>
      </Card>}
      {show('contas_pagar')&&<Card style={{marginBottom:12}}>
        <Divider label="Contas a Pagar"/>
        <Tbl cols={[{l:'Descrição',k:'descricao'},{l:'Vencimento',k:'vencimento'},{l:'Valor',k:'valor',render:r=>fmt(r.valor)},{l:'Status',k:'status',render:r=><Bdg type={r.status==='pago'?'success':r.status==='vencida'?'danger':'warning'}>{r.status==='pago'?'Pago':r.status==='vencida'?'Vencida':'A Vencer'}</Bdg>}]} rows={contas.filter(c=>c.tipo==='pagar')}/>
      </Card>}
      {show('contas_receber')&&<Card style={{marginBottom:12}}>
        <Divider label="Contas a Receber"/>
        <Tbl cols={[{l:'Descrição',k:'descricao'},{l:'Vencimento',k:'vencimento'},{l:'Valor',k:'valor',render:r=>fmt(r.valor)},{l:'Status',k:'status',render:r=><Bdg type={r.status==='pago'?'success':r.status==='vencida'?'danger':'warning'}>{r.status==='pago'?'Pago':r.status==='vencida'?'Vencida':'A Vencer'}</Bdg>}]} rows={contas.filter(c=>c.tipo==='receber')}/>
      </Card>}
      {show('estoque')&&<Card>
        <Divider label="Estoque Completo"/>
        <Tbl cols={[{l:'SKU',k:'sku'},{l:'Nome',k:'nome'},{l:'Tipo',k:'tipoProduto'},{l:'Cor',k:'cor'},{l:'Tamanho',k:'tamanho'},{l:'Custo Total',k:'custoTotal',render:r=>r.custoTotal?fmt(r.custoTotal):'-'},{l:'Frete',k:'frete',render:r=>r.frete?fmt(r.frete):'-'},{l:'Custo Unit.',k:'custoUnitario',render:r=>r.custoUnitario?fmt(r.custoUnitario):'-'},{l:'Qtde',k:'quantidade',render:r=><span style={{fontWeight:800}}>{r.quantidade}</span>},{l:'Status',k:'_',render:r=>{const s=stEst(r.quantidade);return<Bdg type={s.t}>{s.l}</Bdg>;}}]} rows={estoque}/>
      </Card>}
    </div>
  );
}

// ── EXPORTAR ──────────────────────────────────────────────────────────────────
function ExportModal({onClose,fin,contas,compras,vendas,clientes,estoque,custos,fornecedores,materiais,precificacoes}){
  const toCSV=(rows,cols)=>{
    if(!rows.length)return'Sem dados';
    const header=cols.join(';');
    const body=rows.map(r=>cols.map(c=>{const v=r[c]??'';return typeof v==='string'&&v.includes(';')?`"${v}"`:v;}).join(';'));
    return[header,...body].join('\n');
  };
  const download=(content,filename,type='text/plain')=>{
    const blob=new Blob(['\ufeff'+content],{type});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=filename;
    a.click();
  };
  const exportJSON=()=>{
    const data={fin,contas,compras,vendas,clientes,estoque,custos,fornecedores,materiais,precificacoes,exportadoEm:new Date().toISOString()};
    download(JSON.stringify(data,null,2),`orlae-backup-${todayStr()}.json`,'application/json');
  };
  const sheets=[
    {l:'Financeiro',fn:`orlae-financeiro-${todayStr()}.csv`,rows:fin,cols:['data','tipo','categoria','descricao','valor']},
    {l:'Contas',fn:`orlae-contas-${todayStr()}.csv`,rows:contas,cols:['tipo','descricao','categoria','vencimento','valor','status']},
    {l:'Compras',fn:`orlae-compras-${todayStr()}.csv`,rows:compras,cols:['data','fornecedor','descricao','valor','dataEntrega','status']},
    {l:'Vendas',fn:`orlae-vendas-${todayStr()}.csv`,rows:vendas,cols:['data','clienteNome','formaPagamento','desconto','valorTotal']},
    {l:'Clientes',fn:`orlae-clientes-${todayStr()}.csv`,rows:clientes,cols:['nome','email','telefone']},
    {l:'Estoque',fn:`orlae-estoque-${todayStr()}.csv`,rows:estoque,cols:['sku','nome','tipoProduto','cor','tamanho','quantidade','custoTotal','frete','custoUnitario']},
    {l:'Custo de Produto',fn:`orlae-custos-${todayStr()}.csv`,rows:custos,cols:['tipoProduto','sku','colecao','fornecedor','custoTotal','frete','quantidade','custoUnitario','custoFinal']},
    {l:'Precificação',fn:`orlae-precificacao-${todayStr()}.csv`,rows:precificacoes,cols:['tipoProduto','sku','custoBase','markup','precoVenda','margem']},
    {l:'Fornecedores',fn:`orlae-fornecedores-${todayStr()}.csv`,rows:fornecedores,cols:['nome','cnpj','email','telefone','endereco','site']},
    {l:'Matéria-Prima',fn:`orlae-materiais-${todayStr()}.csv`,rows:materiais,cols:['data','tipoProduto','fornecedor','quantidade','custoUnitario','frete','custoTotal']},
  ];
  return(
    <Modal title="Exportar Dados" onClose={onClose}>
      <div style={{background:C.BG2,borderRadius:10,padding:14,marginBottom:20}}>
        <div style={{fontWeight:700,color:C.P,fontSize:13,marginBottom:4}}>📦 Backup Completo (JSON)</div>
        <p style={{margin:'0 0 10px',fontSize:12,color:C.TM}}>Exporta todos os módulos em um único arquivo. Ideal para backup e restauração futura.</p>
        <Btn onClick={exportJSON}>⬇ Baixar Backup Completo (.json)</Btn>
      </div>
      <Divider label="Exportar por módulo (CSV)"/>
      <p style={{margin:'0 0 14px',fontSize:12,color:'#aaa'}}>Cada arquivo abre direto no Excel ou Google Sheets.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {sheets.map(s=>(
          <button key={s.l} onClick={()=>download(toCSV(s.rows,s.cols),s.fn,'text/csv')}
            style={{background:'#fff',border:`1.5px solid ${C.BD}`,borderRadius:8,padding:'10px 12px',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
            <div style={{fontSize:12,fontWeight:700,color:C.P}}>⬇ {s.l}</div>
            <div style={{fontSize:10,color:'#bbb',marginTop:2}}>{s.rows.length} {s.rows.length===1?'registro':'registros'}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState('dashboard');
  const [open, setOpen] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  const [fin, setFin] = useStore('fin', []);
  const [contas, setContas] = useStore('contas', []);
  const [compras, setCompras] = useStore('compras', []);
  const [vendas, setVendas] = useStore('vendas', []);
  const [clientes, setClientes] = useStore('clientes', []);
  const [estoque, setEstoque] = useStore('estoque', []);
  const [custos, setCustos] = useStore('custos', []);
  const [fornecedores, setFornecedores] = useStore('fornecedores', []);
  const [materiais, setMateriais] = useStore('materiais', []);
  const [precificacoes, setPrecificacoes] = useStore('precificacoes', []);
  const [tipos, setTipos] = useStore('tipos', TIPOS_BASE);

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
      * { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }
      body { margin: 0; background: ${C.BG}; }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-thumb { background: ${C.BD}; border-radius: 4px; }
      input, select, textarea { font-family: inherit !important; }
    `;
    document.head.appendChild(s);
  }, []);

  const pages = {
    dashboard: <Dashboard fin={fin} contas={contas} estoque={estoque} vendas={vendas}/>,
    financeiro: <Financeiro fin={fin} setFin={setFin}/>,
    contas: <Contas contas={contas} setContas={setContas}/>,
    compras: <Compras compras={compras} setCompras={setCompras} fornecedores={fornecedores}/>,
    vendas: <Vendas vendas={vendas} setVendas={setVendas} clientes={clientes} estoque={estoque} setEstoque={setEstoque} tipos={tipos} precificacoes={precificacoes}/>,
    clientes: <Clientes clientes={clientes} setClientes={setClientes}/>,
    estoque: <Estoque estoque={estoque} setEstoque={setEstoque} tipos={tipos}/>,
    custo: <CustoProduto custos={custos} setCustos={setCustos} fornecedores={fornecedores} tipos={tipos} setTipos={setTipos}/>,
    precificacao: <Precificacao tipos={tipos} precificacoes={precificacoes} setPrecificacoes={setPrecificacoes} custos={custos}/>,
    antecipacao: <Antecipacao/>,
    fornecedores: <Fornecedores fornecedores={fornecedores} setFornecedores={setFornecedores}/>,
    materiais: <Materiais materiais={materiais} setMateriais={setMateriais} fornecedores={fornecedores} tipos={tipos} setTipos={setTipos}/>,
    relatorios: <Relatorios vendas={vendas} fin={fin} contas={contas} estoque={estoque}/>,
  };

  return (
    <div style={{display:'flex',height:'100vh',background:C.BG,overflow:'hidden'}}>
      <div style={{width:open?238:60,background:C.P,flexShrink:0,display:'flex',flexDirection:'column',transition:'width .25s',overflow:'hidden'}}>
        <div style={{padding:open?'18px 18px 14px':'16px 11px',borderBottom:'1px solid rgba(255,255,255,.12)',flexShrink:0,minHeight:72,display:'flex',alignItems:'center'}}>
          <OrlaeLogo collapsed={!open}/>
        </div>
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden',padding:'6px 0'}}>
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>setActive(item.id)} title={!open?item.l:''} style={{display:'flex',alignItems:'center',gap:10,padding:open?'10px 14px':'10px 0',justifyContent:open?'flex-start':'center',width:'100%',background:active===item.id?'rgba(255,255,255,.14)':'transparent',color:'#fff',border:'none',borderLeft:`3px solid ${active===item.id?'rgba(255,255,255,.85)':'transparent'}`,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:active===item.id?800:400,transition:'all .15s',textAlign:'left'}}>
              <span style={{fontSize:15,flexShrink:0,width:20,textAlign:'center'}}>{item.ico}</span>
              {open&&<span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.l}</span>}
            </button>
          ))}
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,.1)',flexShrink:0}}>
          {open&&<button onClick={()=>setExportOpen(true)} style={{width:'100%',padding:'11px 14px',background:'rgba(242,235,217,.08)',border:'none',borderBottom:'1px solid rgba(255,255,255,.08)',color:'#f2ebd9',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,textAlign:'left',display:'flex',alignItems:'center',gap:8}}>
            <span>⬇</span> Exportar Dados
          </button>}
          <button onClick={()=>setOpen(v=>!v)} style={{width:'100%',padding:'12px',background:'rgba(0,0,0,.15)',border:'none',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>
            {open?'◀ Recolher':'▶'}
          </button>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',overflowX:'hidden',padding:28}}>
        {pages[active]}
      </div>
      {exportOpen&&<ExportModal onClose={()=>setExportOpen(false)} fin={fin} contas={contas} compras={compras} vendas={vendas} clientes={clientes} estoque={estoque} custos={custos} fornecedores={fornecedores} materiais={materiais} precificacoes={precificacoes}/>}
    </div>
  );
}