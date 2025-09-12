// Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div style={{ maxWidth:900, margin:"40px auto", padding:20, fontFamily:"system-ui, sans-serif" }}>
      <header style={{textAlign:"left"}}>
        <h1 style={{margin:0}}>HalalCoin</h1>
        <p style={{color:"#444", marginTop:6}}>Gold-backed, Shariah-compliant payment system — demo & vision.</p>
      </header>

      <section style={{marginTop:30, lineHeight:1.6}}>
        <h2>Why HalalCoin?</h2>
        <ul>
          <li>Gold-backed stable token for real value and trust.</li>
          <li>Shariah-compliant flows — avoid interest (riba).</li>
          <li>P2P payments, zakat features, and merchant payments roadmap.</li>
        </ul>
      </section>

      <section style={{marginTop:24, textAlign:"center"}}>
        <Link to="/demo">
          <button style={{padding:"12px 22px", fontSize:16, borderRadius:8, cursor:"pointer"}}>
            🚀 Try the Demo
          </button>
        </Link>
      </section>

      <footer style={{marginTop:40, color:"#666", fontSize:13}}>
        <p>Contact: info@halalcoin.app</p>
      </footer>
    </div>
  );
}
