const clubs=[
["Persib Bandung","Bandung",76],["Persija Jakarta","Jakarta",75],["Persebaya Surabaya","Surabaya",73],["Arema FC","Malang",70],
["Bali United","Bali",74],["PSM Makassar","Makassar",71],["Borneo FC","Samarinda",74],["Madura United","Madura",68],
["Dewa United","Tangerang",72],["Persis Solo","Solo",67],["PSBS Biak","Biak",64],["Semen Padang","Padang",63],
["Malut United","Ternate",65],["Barito Putera","Banjarmasin",65],["Persita Tangerang","Tangerang",67],["PSS Sleman","Sleman",66],
["Persik Kediri","Kediri",66],["Bhayangkara FC","Bekasi",64]
].map((x,i)=>({id:i,name:x[0],city:x[1],rating:x[2]}));

const firstNames=["Rizky","Dimas","Fajar","Rafi","Bagas","Raka","Ilham","Ardi","Rizal","Eko","Andika","Yoga","Fikri","Alif","Reza","Hendra","Adit","Naufal","Bima","Galang"];
const lastNames=["Pratama","Saputra","Ramadhan","Nugraha","Firmansyah","Maulana","Wijaya","Santoso","Kurniawan","Setiawan","Hidayat","Permana","Putra","Siregar","Hakim"];
const positions=["GK","DF","DF","DF","DF","MF","MF","MF","MF","FW","FW","FW"];

let players=[], state={page:"home",club:null,manager:"Manajer",season:2026,matchday:1, money:35000000000, tactics:{formation:"4-3-3",style:"Penguasaan Bola"}, standings:[], schedule:[]};

function makePlayers(){
 players=[];
 clubs.forEach(c=>{
   for(let i=0;i<15;i++){
     let pos=positions[i%positions.length], name=firstNames[(i+c.id)%firstNames.length]+" "+lastNames[(i*2+c.id)%lastNames.length];
     let rating=Math.max(55,Math.min(82,c.rating-8+((i*7+c.id*3)%15)));
     players.push({id:`${c.id}-${i}`,club:c.id,name,pos,rating,age:18+((i+c.id)%15),value:Math.round((rating-50)*350000)});
   }
 });
}
function makeSchedule(){
 state.schedule=[];
 for(let r=0;r<17;r++){
   for(let i=0;i<clubs.length;i++){
     let a=clubs[i], b=clubs[(i+r+1)%clubs.length];
     if(i%2===0) state.schedule.push({round:r+1,home:a.id,away:b.id,played:false,hg:null,ag:null});
   }
 }
 // add second half reverse fixtures
 const first=[...state.schedule]; first.forEach(m=>state.schedule.push({round:m.round+17,home:m.away,away:m.home,played:false,hg:null,ag:null}));
}
function initStandings(){
 state.standings=clubs.map(c=>({club:c.id,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
}
function club(id){return clubs.find(c=>c.id===id)}
function myPlayers(){return players.filter(p=>p.club===state.club)}
function nextMatch(){
 return state.schedule.find(m=>!m.played && (m.home===state.club||m.away===state.club));
}
function simulateMatch(m){
 let h=club(m.home), a=club(m.away);
 let formBonus=state.tactics.style==="Serangan Cepat"?2:state.tactics.style==="Bertahan"?-1:1;
 let home=Math.max(0,Math.round((h.rating+formBonus+(Math.random()*12-6))/20));
 let away=Math.max(0,Math.round((a.rating+(Math.random()*12-6))/20));
 if(Math.random()<.2) home++; if(Math.random()<.18) away++;
 m.hg=home;m.ag=away;m.played=true;
 let hs=state.standings.find(x=>x.club===m.home), as=state.standings.find(x=>x.club===m.away);
 hs.p++;as.p++;hs.gf+=home;hs.ga+=away;as.gf+=away;as.ga+=home;
 if(home>away){hs.w++;hs.pts+=3;as.l++}else if(home<away){as.w++;as.pts+=3;hs.l++}else{hs.d++;as.d++;hs.pts++;as.pts++}
 state.money+=Math.round((home+away)*150000);
}
function sortTable(){state.standings.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 document.getElementById("managerName").textContent=state.manager;
 document.getElementById("clubName").textContent=state.club===null?"Belum memilih klub":club(state.club).name;
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
 const pages={home:homePage,squad:squadPage,tactics:tacticsPage,schedule:schedulePage,league:leaguePage,transfers:transferPage};
 document.getElementById("app").innerHTML=pages[state.page]();
}
function homePage(){
 if(state.club===null)return `<div class="hero"><div><div class="eyebrow">Karier baru</div><h1>Bangun dinastimu di Indonesia.</h1><p class="muted">Kelola klub, taktik, transfer dan jalani musim BRI Super League.</p><button class="btn" onclick="chooseClub()">Pilih Klub</button></div><div style="font-size:80px">🏟️</div></div><div class="panel"><h3>BRI Super League</h3><p class="muted">18 klub • 34 pertandingan per klub • sistem kandang/tandang</p></div>`;
 let c=club(state.club), m=nextMatch(), table=[...state.standings].sort((a,b)=>b.pts-a.pts), rank=table.findIndex(x=>x.club===state.club)+1;
 return `<div class="hero"><div><div class="eyebrow">Musim ${state.season}/${String(state.season+1).slice(-2)}</div><h1>${esc(c.name)}</h1><p class="muted">${c.city} • Reputasi ${c.rating}/100</p></div><button class="btn green" onclick="playNext()">⚽ Simulasikan Pertandingan</button></div>
 <div class="grid"><div class="stat"><small>Posisi Liga</small><strong>${rank}</strong></div><div class="stat"><small>Poin</small><strong>${table.find(x=>x.club===state.club)?.pts||0}</strong></div><div class="stat"><small>Budget</small><strong>Rp ${formatMoney(state.money)}</strong></div><div class="stat"><small>Formasi</small><strong>${state.tactics.formation}</strong></div></div>
 <div class="panel"><h2>Pertandingan Berikutnya</h2>${m?matchHTML(m):"<p>Musim selesai.</p>"}</div>
 <div class="panel"><h2>Berita Klub</h2><p>Manajemen menargetkan musim yang konsisten. Jaga kebugaran pemain dan manfaatkan bursa transfer.</p></div>`;
}
function matchHTML(m){
 let h=club(m.home),a=club(m.away);
 return `<div class="match row"><div><b>${esc(h.name)}</b> <span class="muted">vs</span> <b>${esc(a.name)}</b><div class="muted">Pekan ${m.round}</div></div><span class="badge">${m.played?m.hg+" - "+m.ag:"BELUM MAIN"}</span></div>`;
}
function squadPage(){
 if(state.club===null)return needClub();
 return `<div class="row"><div><div class="eyebrow">Skuad utama</div><h1>${esc(club(state.club).name)}</h1></div><span class="badge">${myPlayers().length} pemain</span></div>
 <div class="panel"><table class="table"><thead><tr><th>Pemain</th><th>Pos</th><th>Usia</th><th>Rating</th><th>Nilai</th></tr></thead><tbody>${myPlayers().map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${p.pos}</td><td>${p.age}</td><td><b>${p.rating}</b></td><td>Rp ${formatMoney(p.value)}</td></tr>`).join("")}</tbody></table></div>`;
}
function tacticsPage(){
 if(state.club===null)return needClub();
 return `<div class="eyebrow">Manajemen pertandingan</div><h1>Taktik</h1><div class="panel"><div class="form-grid">
 <label>Formasi<select id="formation"><option>4-3-3</option><option>4-2-3-1</option><option>4-4-2</option><option>3-5-2</option><option>5-3-2</option></select></label>
 <label>Gaya bermain<select id="style"><option>Penguasaan Bola</option><option>Serangan Cepat</option><option>Bertahan</option></select></label>
 </div><button class="btn" style="margin-top:14px" onclick="saveTactics()">Simpan Taktik</button></div>`;
}
function schedulePage(){
 if(state.club===null)return needClub();
 let ms=state.schedule.filter(m=>m.home===state.club||m.away===state.club).slice(0,20);
 return `<div class="eyebrow">Kalender kompetisi</div><h1>Jadwal</h1><div class="panel">${ms.map(matchHTML).join("")}</div>`;
}
function leaguePage(){
 sortTable();
 return `<div class="eyebrow">BRI Super League</div><h1>Klasemen</h1><div class="panel"><table class="table"><thead><tr><th>#</th><th>Klub</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>PTS</th></tr></thead><tbody>${state.standings.map((s,i)=>`<tr><td>${i+1}</td><td><b>${esc(club(s.club).name)}</b></td><td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td><td>${s.gf}</td><td>${s.ga}</td><td>${s.gf-s.ga}</td><td><b>${s.pts}</b></td></tr>`).join("")}</tbody></table></div>`;
}
function transferPage(){
 if(state.club===null)return needClub();
 let market=players.filter(p=>p.club!==state.club).sort((a,b)=>b.rating-a.rating).slice(0,30);
 return `<div class="eyebrow">Bursa transfer</div><h1>Transfer Pemain</h1><p class="muted">Budget: Rp ${formatMoney(state.money)}</p><div class="panel">${market.map(p=>`<div class="player"><div><b>${esc(p.name)}</b><div class="muted">${club(p.club).name} • ${p.pos} • Rating ${p.rating}</div></div><div><span class="pill">Rp ${formatMoney(p.value)}</span> <button class="btn light" onclick="buyPlayer('${p.id}')">Beli</button></div></div>`).join("")}</div>`;
}
function needClub(){return `<div class="hero"><div><h1>Pilih klub dulu</h1><p class="muted">Mulai karier dengan salah satu klub BRI Super League.</p><button class="btn" onclick="chooseClub()">Pilih Klub</button></div></div>`}
function chooseClub(){
 document.getElementById("modal").classList.remove("hidden");
 document.getElementById("modal").innerHTML=`<div class="modalbox"><div class="row"><h2>Pilih Klub</h2><button class="btn light" onclick="closeModal()">✕</button></div><p class="muted">Semua klub Indonesia tersedia.</p>${clubs.map(c=>`<div class="club-choice" onclick="selectClub(${c.id})"><div><b>${esc(c.name)}</b><small class="muted" style="display:block">${c.city}</small></div><span class="pill">${c.rating}</span></div>`).join("")}</div>`;
}
function selectClub(id){state.club=id;state.manager=prompt("Nama manajer:","Manajer")||"Manajer";closeModal();state.page="home";render();toast("Karier dimulai!")}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function playNext(){
 if(state.club===null)return chooseClub();
 let m=nextMatch(); if(!m)return toast("Tidak ada pertandingan berikutnya.");
 simulateMatch(m);sortTable();render();toast(`${club(m.home).name} ${m.hg}-${m.ag} ${club(m.away).name}`);
}
function saveTactics(){state.tactics.formation=document.getElementById("formation").value;state.tactics.style=document.getElementById("style").value;save();toast("Taktik disimpan");render()}
function buyPlayer(id){
 let p=players.find(x=>x.id===id); if(!p)return;
 if(state.money<p.value)return toast("Budget tidak cukup.");
 state.money-=p.value;p.club=state.club;toast(`${p.name} bergabung!`);render();
}
function formatMoney(n){return Math.round(n/1000000).toLocaleString("id-ID")+" jt"}
function toast(t){let x=document.createElement("div");x.className="toast";x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2200)}
function save(){localStorage.setItem("bsl_manager_save",JSON.stringify({state,players}))}
function load(){
 try{let x=JSON.parse(localStorage.getItem("bsl_manager_save"));if(x){state=x.state;players=x.players}}catch(e){}
}
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>{state.page=b.dataset.page;render()}));
document.getElementById("saveBtn").onclick=()=>{save();toast("Game tersimpan di browser.")};
makePlayers();makeSchedule();initStandings();load();render();