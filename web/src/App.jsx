import React, {useState, useEffect} from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App(){
  const [token, setToken] = useState(localStorage.getItem('hc_token')||'');
  const [user,setUser]=useState(null);
  const [balances,setBalances]=useState({});
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [amount,setAmount]=useState(10);
  const [toEmail,setToEmail]=useState('');
  const [txs,setTxs]=useState([]);

  async function register(){
    try{
      const res = await axios.post(API+'/api/register',{email,password});
      localStorage.setItem('hc_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await loadBalances(res.data.token);
      await loadTxs(res.data.token);
    }catch(e){ alert(e?.response?.data?.error || e.message) }
  }

  async function login(){
    try{
      const res = await axios.post(API+'/api/login',{email,password});
      localStorage.setItem('hc_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await loadBalances(res.data.token);
      await loadTxs(res.data.token);
    }catch(e){ alert(e?.response?.data?.error || e.message) }
  }

  async function loadBalances(t){
    const res = await axios.get(API+'/api/balances',{headers:{Authorization:'Bearer '+t}});
    setBalances(res.data.balances);
  }
  async function loadTxs(t){
    const res = await axios.get(API+'/api/txs',{headers:{Authorization:'Bearer '+t}});
    setTxs(res.data.txs || []);
  }

  async function buy(){
    try{
      await axios.post(API+'/api/buy',{amount:+amount},{headers:{Authorization:'Bearer '+token}});
      await loadBalances(token);
      await loadTxs(token);
    }catch(e){ alert(e?.response?.data?.error || e.message) }
  }

  async function send(){
    try{
      await axios.post(API+'/api/transfer',{to_email:toEmail, amount:+amount, token:'HALALPAY'},{headers:{Authorization:'Bearer '+token}});
      await loadBalances(token);
      await loadTxs(token);
    }catch(e){ alert(e?.response?.data?.error || e.message) }
  }

  async function payZakat(){
    try{
      await axios.post(API+'/api/zakat',{token:'HALALPAY'},{headers:{Authorization:'Bearer '+token}});
      await loadBalances(token);
      await loadTxs(token);
    }catch(e){ alert(e?.response?.data?.error || e.message) }
  }

  useEffect(()=>{ if(token) { loadBalances(token); loadTxs(token);} }, [token]);

  if(!token) return (
    <div style={{maxWidth:600,margin:'20px auto',padding:20}}>
      <h2>HalalCoin Demo - Register or Login</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}} /><br/>
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8,margin:'8px 0'}} /><br/>
      <button onClick={register} style={{marginRight:10}}>Register</button>
      <button onClick={login}>Login</button>
    </div>
  );

  return (
    <div style={{maxWidth:900,margin:'20px auto',padding:20}}>
      <h1>HalalCoin Dashboard (Demo)</h1>

      <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:250,background:'#fff',padding:16,borderRadius:8,boxShadow:'0 6px 20px rgba(0,0,0,.06)'}}>
          <h3>Balances</h3>
          <p>HalalPay: {balances.HALALPAY || 0}</p>
          <p>HalalCoin: {balances.HALALCOIN || 0}</p>
        </div>

        <div style={{flex:1,minWidth:250}}>
          <h3>Buy HalalPay (demo)</h3>
          <input value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:8,width:'60%'}} /> <button onClick={buy}>Buy</button>

          <h3 style={{marginTop:20}}>Send</h3>
          <input placeholder="Recipient email" value={toEmail} onChange={e=>setToEmail(e.target.value)} style={{padding:8,width:'60%'}} />
          <input value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:8,width:'20%',marginLeft:8}} />
          <div><button onClick={send}>Send</button></div>

          <h3 style={{marginTop:20}}>Zakat (2.5%)</h3>
          <button onClick={payZakat}>Pay Zakat</button>
        </div>
      </div>

      <section style={{marginTop:30}}>
        <h3>Transaction History</h3>
        <div style={{background:'#fff',padding:12,borderRadius:8}}>
          {txs.length===0 ? <p>No transactions</p> :
            txs.map(t=> <div key={t.id} style={{padding:8,borderBottom:'1px solid #eee'}}>{t.type} — {t.token} {t.amount} — {t.created_at}</div>)
          }
        </div>
      </section>
    </div>
  );
}

export default App;
