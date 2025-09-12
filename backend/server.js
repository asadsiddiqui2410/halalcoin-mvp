// server.js - minimal custodial ledger
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: './db.sqlite' },
  useNullAsDefault: true
});

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// DB init
async function init(){
  await knex.schema.hasTable('users').then(async exists=>{
    if(!exists){
      await knex.schema.createTable('users', t=>{
        t.increments('id');
        t.string('email').unique();
        t.string('password');
        t.string('wallet');
        t.timestamps(true, true);
      });
    }
  });

  await knex.schema.hasTable('balances').then(async exists=>{
    if(!exists){
      await knex.schema.createTable('balances', t=>{
        t.increments('id');
        t.integer('user_id').unsigned();
        t.string('token');
        t.float('amount').defaultTo(0);
      });
    }
  });

  await knex.schema.hasTable('txs').then(async exists=>{
    if(!exists){
      await knex.schema.createTable('txs', t=>{
        t.increments('id');
        t.integer('from_user').nullable();
        t.integer('to_user').nullable();
        t.string('to_address').nullable();
        t.string('token');
        t.float('amount');
        t.string('type');
        t.timestamp('created_at').defaultTo(knex.fn.now());
      });
    }
  });

  await knex.schema.hasTable('reserve').then(async exists=>{
    if(!exists){
      await knex.schema.createTable('reserve', t=>{
        t.increments('id');
        t.float('gold_kg').defaultTo(10);
        t.float('token_backed').defaultTo(10000);
        t.string('attestation_url').nullable();
      });
      await knex('reserve').insert({gold_kg:10, token_backed:10000});
    }
  });
}
init();

// helpers
async function findUserByEmail(email){ return await knex('users').where({email}).first(); }
async function createBalance(uid, token){ return knex('balances').insert({user_id:uid, token, amount:0}); }
async function getBalances(uid){
  const rows = await knex('balances').where({user_id:uid});
  const map = {};
  rows.forEach(r=> map[r.token]=r.amount);
  return map;
}

// auth middleware
function auth(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).send({error:'no auth'});
  const token = h.split(' ')[1];
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  }catch(e){ res.status(401).send({error:'invalid token'}); }
}

// endpoints

// register
app.post('/api/register', async (req,res)=>{
  const {email,password} = req.body;
  if(!email || !password) return res.status(400).send({error:'missing'});
  const existing = await findUserByEmail(email);
  if(existing) return res.status(400).send({error:'exists'});
  const hash = await bcrypt.hash(password,10);
  const walletId = 'WALLET_'+Date.now();
  const [id] = await knex('users').insert({email,password:hash,wallet:walletId});
  await createBalance(id,'HALALPAY');
  await createBalance(id,'HALALCOIN');
  const token = jwt.sign({id,email}, JWT_SECRET, {expiresIn:'7d'});
  res.send({token, user:{id,email,wallet:walletId}});
});

// login
app.post('/api/login', async (req,res)=>{
  const {email,password} = req.body;
  const user = await findUserByEmail(email);
  if(!user) return res.status(400).send({error:'no user'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).send({error:'bad pass'});
  const token = jwt.sign({id:user.id,email:user.email}, JWT_SECRET, {expiresIn:'7d'});
  res.send({token, user:{id:user.id,email:user.email,wallet:user.wallet}});
});

// get balances
app.get('/api/balances', auth, async (req,res)=>{
  const b = await getBalances(req.user.id);
  res.send({balances:b, reserve: await knex('reserve').first()});
});

// buy HalalPay (demo mint)
app.post('/api/buy', auth, async (req,res)=>{
  const {amount} = req.body;
  if(!amount || amount <=0) return res.status(400).send({error:'invalid amount'});
  await knex('balances').where({user_id:req.user.id, token:'HALALPAY'})
    .increment('amount', amount);
  await knex('txs').insert({from_user: null, to_user: req.user.id, token:'HALALPAY', amount, type:'buy'});
  res.send({ok:true});
});

// transfer
app.post('/api/transfer', auth, async (req,res)=>{
  const {to_email, amount, token} = req.body;
  if(!to_email || !amount || !token) return res.status(400).send({error:'missing'});
  const to = await findUserByEmail(to_email);
  if(!to) return res.status(400).send({error:'recipient not found'});
  const fromBal = await knex('balances').where({user_id:req.user.id, token}).first();
  if(!fromBal || fromBal.amount < amount) return res.status(400).send({error:'insufficient'});
  await knex('balances').where({user_id:req.user.id, token}).decrement('amount', amount);
  await knex('balances').where({user_id:to.id, token}).increment('amount', amount);
  await knex('txs').insert({from_user:req.user.id, to_user:to.id, token, amount, type:'transfer'});
  res.send({ok:true});
});

// zakat (2.5% of balance)
app.post('/api/zakat', auth, async (req,res)=>{
  const {token} = req.body;
  const bal = await knex('balances').where({user_id:req.user.id, token}).first();
  if(!bal) return res.status(400).send({error:'no balance'});
  const zakatAmount = +(bal.amount * 0.025).toFixed(6);
  if(zakatAmount <= 0) return res.status(400).send({error:'no zakat due'});
  const ngo = await findUserByEmail('ngo@halalcoin.app');
  if(!ngo){
    const [nid] = await knex('users').insert({email:'ngo@halalcoin.app', password:'', wallet:'NGO_WALLET'});
    await createBalance(nid,'HALALPAY'); await createBalance(nid,'HALALCOIN');
  }
  const ngoRow = await findUserByEmail('ngo@halalcoin.app');
  await knex('balances').where({user_id:req.user.id, token}).decrement('amount', zakatAmount);
  await knex('balances').where({user_id:ngoRow.id, token}).increment('amount', zakatAmount);
  await knex('txs').insert({from_user:req.user.id, to_user:ngoRow.id, token, amount:zakatAmount, type:'zakat'});
  res.send({ok:true, zakatAmount});
});

// txs
app.get('/api/txs', auth, async (req,res)=>{
  const txs = await knex('txs').where(function(){ this.where('from_user', req.user.id).orWhere('to_user', req.user.id)}).orderBy('created_at','desc');
  res.send({txs});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Server running on', PORT));
