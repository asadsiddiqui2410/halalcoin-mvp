// Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth:900, margin:"40px auto", padding:20, fontFamily:"system-ui, sans-serif" }}>
      <header style={{textAlign:"center"}}>
        <h1>HalalCoin</h1>
        <p style={{color:"#444", fontSize:18}}>The world’s first gold-backed, Shariah-compliant payment system.</p>
      </header>

      <section style={{marginTop:30, lineHeight:1.6}}>
        <h2>Who We Are</h2>
        <p>
          HalalCoin is building a decentralized, Shariah-compliant alternative to
          riba-based banking. Our goal is to empower Muslims worldwide with a
          gold-backed stablecoin and utility coin for daily use, zakat, and commerce.
        </p>

        <h2>Our Vision</h2>
        <p>
          To create a trusted ecosystem where every transaction is free of riba, 
          backed by real assets, and accessible to Muslims everywhere — from Ajmer to America.
        </p>

        <h2>Why HalalCoin?</h2>
        <ul>
          <li>🌙 100% Shariah-compliant (no interest, no speculation).</li>
          <li>🪙 Gold-backed stablecoin for true value and trust.</li>
          <li>💸 Utility coin for P2P payments, zakat, and future merchant tie-ups.</li>
        </ul>
      </section>

      <section style={{marginTop:30, textAlign:"center"}}>
        <a href="/pitchdeck.pdf" download>
          <button style={{padding:"12px 22px", fontSize:16, borderRadius:8, cursor:"pointer", marginRight:12}}>
            📥 Download Pitch Deck
          </button>
        </a>
        <Link to="/demo">
          <button style={{padding:"12px 22px", fontSize:16, borderRadius:8, cursor:"pointer"}}>
            🚀 Try the Demo
          </button>
        </Link>
      </section>

      <footer style={{marginTop:40, color:"#666", fontSize:13, textAlign:"center"}}>
        <p>Contact: info@halalcoin.app</p>
      </footer>
    </div>
  );
}
