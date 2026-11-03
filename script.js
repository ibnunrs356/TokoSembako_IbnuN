var S={},db,user=null,page='dashboard',cart=[];
var $=s=>document.querySelector(s);
var rp=n=>'Rp '+Number(n).toLocaleString('id-ID');
var esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
var uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
var ld=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
var today=()=>ld(new Date());
var sum=a=>a.reduce((s,x)=>s+x.total,0);
var cn=id=>(db.cats.find(c=>c.id==id)||{}).nama||'-';
var cu=id=>id?(db.custs.find(c=>c.id==id)||{nama:'(dihapus)'}).nama:'Umum';
function tbl(h,r){return '<div class="tw"><table><tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+(r.length?r.map(x=>'<tr>'+x.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+h.length+'" style="color:var(--mu)">Belum ada data</td></tr>')+'</table></div>'}
function stat(p){return p.stok<=0?'<span class="tag bad">Habis</span>':p.stok<=10?'<span class="tag warn">Menipis</span>':'<span class="tag ok">Aman</span>'}
function seed(){
 const k=['Beras','Minyak','Gula & Tepung','Mie Instan','Bumbu & Lainnya'].map((n,i)=>({id:'k'+i,nama:n}));
 const pr=[['Beras Premium 5kg',0,68000,'sak',40],['Beras Medium',0,13500,'kg',80],['Minyak Goreng 1L',1,18000,'pouch',8],['Minyak Goreng 2L',1,35000,'pouch',25],['Gula Pasir',2,17000,'kg',50],['Tepung Terigu',2,12000,'kg',6],['Mie Instan Goreng',3,3200,'bks',120],['Telur Ayam',4,29000,'kg',15],['Kecap Manis 135ml',4,8500,'btl',30],['Garam Halus 250g',4,3500,'bks',40]].map((p,i)=>({id:'p'+i,nama:p[0],kat:'k'+p[1],harga:p[2],sat:p[3],stok:p[4]}));
 const c=[['Ibu Sari','081234567890','Jl. Melati No. 5'],['Pak Budi','085712345678','Jl. Anggrek No. 12'],['Warung Bu Tini','082198765432','Jl. Mawar No. 3']].map((c,i)=>({id:'c'+i,nama:c[0],telp:c[1],alamat:c[2]}));
 const mk=(n,d,cs,it)=>{const dt=new Date();dt.setDate(dt.getDate()-d);const items=it.map(([i,q])=>({pid:'p'+i,nama:pr[i].nama,qty:q,harga:pr[i].harga}));return{id:uid(),no:'TRX-'+String(n).padStart(4,'0'),tgl:ld(dt),cust:cs,items,total:items.reduce((s,x)=>s+x.qty*x.harga,0)}};
 return{users:[{nama:'Administrator',username:'admin',password:'admin123'}],cats:k,prods:pr,custs:c,trx:[mk(1,5,'c0',[[0,1],[4,2]]),mk(2,4,'',[[6,10],[9,2]]),mk(3,3,'c2',[[1,10],[3,2],[7,2]]),mk(4,2,'c1',[[2,3],[4,1]]),mk(5,1,'',[[0,2],[8,2]]),mk(6,0,'c0',[[7,1],[6,5]])]}
}
function save(){try{localStorage.setItem('sim_sembako',JSON.stringify(db))}catch(e){}}
try{db=JSON.parse(localStorage.getItem('sim_sembako'));user=localStorage.getItem('sim_user')}catch(e){}
if(!db||!db.users){db=seed();save()}
/* ---------- auth ---------- */
function authView(){
 const r=S.reg;
 return '<div class="card"><h3>🛒 SIM Toko Sembako</h3><p style="color:var(--mu);margin-top:0">'+(r?'Buat akun baru (demo)':'Masuk ke sistem')+'</p>'+
 (r?'<label>Nama lengkap<input id="rn"></label>':'')+
 '<label>Username<input id="lu" autocomplete="username"></label><label>Password<input id="lp" type="password" autocomplete="current-password"></label>'+
 '<div class="row" style="justify-content:space-between"><button class="btn ghost" onclick="S.reg=!S.reg;render()">'+(r?'Sudah punya akun':'Daftar')+'</button><button class="btn" onclick="'+(r?'doReg()':'doLogin()')+'">'+(r?'Daftar':'Masuk')+'</button></div>'+
 (r?'':'<p style="font-size:12px;color:var(--mu);margin-bottom:0">Akun demo: <b>admin</b> / <b>admin123</b></p>')+'</div>'
}
function setUser(u){user=u;try{localStorage.setItem('sim_user',u)}catch(e){}page='dashboard';render()}
function doLogin(){const u=db.users.find(x=>x.username==$('#lu').value.trim()&&x.password==$('#lp').value);u?setUser(u.username):alert('Username atau password salah.')}
function doReg(){const n=$('#rn').value.trim(),u=$('#lu').value.trim(),p=$('#lp').value;
 if(!n||!u||p.length<4)return alert('Lengkapi data (password minimal 4 karakter).');
 if(db.users.some(x=>x.username==u))return alert('Username sudah dipakai.');
 db.users.push({nama:n,username:u,password:p});save();S.reg=false;setUser(u)}
function logout(){user=null;try{localStorage.removeItem('sim_user')}catch(e){}render()}
/* ---------- helper form & hapus ---------- */
function modal(title,fields,vals,cb){
 const d=$('#dlg');
 d.innerHTML='<h3>'+title+'</h3>'+fields.map(f=>'<label>'+f.l+(f.t=='select'?'<select name="'+f.k+'">'+f.o.map(o=>'<option value="'+o[0]+'"'+(o[0]==vals[f.k]?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>':'<input name="'+f.k+'" type="'+(f.t||'text')+'"'+(f.t=='number'?' min="0"':'')+' value="'+esc(vals[f.k])+'">')+'</label>').join('')+'<div class="row"><button class="btn ghost" id="bc">Batal</button><button class="btn" id="bs">Simpan</button></div>';
 d.showModal();
 $('#bc').onclick=()=>d.close();
 $('#bs').onclick=()=>{const v={};fields.forEach(f=>{const x=d.querySelector('[name='+f.k+']').value.trim();v[f.k]=f.t=='number'?+x:x});
  if(fields.some(f=>f.t!='number'&&f.r!==0&&v[f.k]===''))return alert('Lengkapi data.');
  cb(v);d.close();save();render()}
}
function del(col,id){
 if(col=='cats'&&db.prods.some(p=>p.kat==id))return alert('Kategori masih dipakai produk.');
 if(confirm('Hapus data ini?')){db[col]=db[col].filter(x=>x.id!=id);save();render()}
}
var act=(f,col,id)=>'<button class="btn sm ghost" onclick="'+f+'(\''+id+'\')">Edit</button> <button class="btn sm red" onclick="del(\''+col+'\',\''+id+'\')">Hapus</button>';
function fProd(id){const p=db.prods.find(x=>x.id==id)||{kat:(db.cats[0]||{}).id,stok:0,sat:'pcs'};
 modal(id?'Edit produk':'Produk baru',[{k:'nama',l:'Nama produk'},{k:'kat',l:'Kategori',t:'select',o:db.cats.map(c=>[c.id,c.nama])},{k:'harga',l:'Harga jual (Rp)',t:'number'},{k:'sat',l:'Satuan'},{k:'stok',l:'Stok',t:'number'}],p,v=>id?Object.assign(p,v):db.prods.push({id:uid(),...v}))}
function fCat(id){const c=db.cats.find(x=>x.id==id)||{};modal(id?'Edit kategori':'Kategori baru',[{k:'nama',l:'Nama kategori'}],c,v=>id?Object.assign(c,v):db.cats.push({id:uid(),...v}))}
function fCust(id){const c=db.custs.find(x=>x.id==id)||{};modal(id?'Edit pelanggan':'Pelanggan baru',[{k:'nama',l:'Nama'},{k:'telp',l:'No. telepon',r:0},{k:'alamat',l:'Alamat',r:0}],c,v=>id?Object.assign(c,v):db.custs.push({id:uid(),...v}))}
function fStok(id){const p=db.prods.find(x=>x.id==id);modal('Tambah stok: '+esc(p.nama),[{k:'jml',l:'Jumlah masuk ('+esc(p.sat)+')',t:'number'}],{jml:0},v=>{p.stok+=v.jml})}
/* ---------- transaksi ---------- */
function addCart(){const id=$('#tp').value,q=+$('#tq').value,p=db.prods.find(x=>x.id==id);
 if(!p||q<1)return alert('Pilih produk dan jumlah.');
 const ex=cart.find(x=>x.pid==id),tot=(ex?ex.qty:0)+q;
 if(tot>p.stok)return alert('Stok tidak cukup (sisa '+p.stok+').');
 ex?ex.qty=tot:cart.push({pid:id,qty:q});render()}
function bayar(){
 if(!cart.length)return alert('Keranjang kosong.');
 const items=cart.map(c=>{const p=db.prods.find(x=>x.id==c.pid);p.stok-=c.qty;return{pid:p.id,nama:p.nama,qty:c.qty,harga:p.harga}});
 db.trx.push({id:uid(),no:'TRX-'+String(db.trx.length+1).padStart(4,'0'),tgl:today(),cust:S.tc||'',items,total:items.reduce((s,x)=>s+x.qty*x.harga,0)});
 cart=[];save();alert('Transaksi berhasil disimpan.');render()}
/* ---------- halaman ---------- */
var P={
dashboard(){
 const t=today(),tt=db.trx.filter(x=>x.tgl==t),low=db.prods.filter(p=>p.stok<=10);
 const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const k=ld(d);return{l:k.slice(8),v:sum(db.trx.filter(x=>x.tgl==k))}});
 const mx=Math.max(1,...days.map(d=>d.v));
 return '<div class="grid">'+[['Penjualan hari ini',rp(sum(tt))],['Transaksi hari ini',tt.length],['Total produk',db.prods.length],['Stok menipis',low.length],['Pelanggan',db.custs.length],['Total omzet',rp(sum(db.trx))]].map(s=>'<div class="card stat"><small>'+s[0]+'</small><b>'+s[1]+'</b></div>').join('')+'</div>'+
 '<div class="card"><h3>Penjualan 7 hari terakhir</h3><div class="bars">'+days.map(d=>'<div><i style="height:'+Math.round(d.v/mx*80)+'px"></i>'+d.l+'</div>').join('')+'</div></div>'+
 '<div class="card"><h3>Stok menipis</h3>'+tbl(['Produk','Stok','Status'],low.map(p=>[esc(p.nama),p.stok+' '+esc(p.sat),stat(p)]))+'</div>'+
 '<div class="card"><h3>Transaksi terakhir</h3>'+tbl(['No','Tanggal','Pelanggan','Total'],db.trx.slice(-5).reverse().map(x=>[x.no,x.tgl,esc(cu(x.cust)),rp(x.total)]))+'</div>'},
produk(){const q=(S.q||'').toLowerCase();
 return '<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:10px"><input placeholder="Cari produk..." value="'+esc(S.q)+'" oninput="S.q=this.value;render(1)" style="max-width:240px"><button class="btn" onclick="fProd()">+ Produk</button></div>'+
 tbl(['Produk','Kategori','Harga','Stok','Aksi'],db.prods.filter(p=>p.nama.toLowerCase().includes(q)).map(p=>[esc(p.nama),esc(cn(p.kat)),rp(p.harga)+'/'+esc(p.sat),p.stok,act('fProd','prods',p.id)]))+'</div>'},
kategori(){return '<div class="card"><div class="row" style="margin-bottom:10px"><button class="btn" onclick="fCat()">+ Kategori</button></div>'+
 tbl(['Kategori','Jumlah produk','Aksi'],db.cats.map(c=>[esc(c.nama),db.prods.filter(p=>p.kat==c.id).length,act('fCat','cats',c.id)]))+'</div>'},
persediaan(){return '<div class="card"><h3>Persediaan barang</h3>'+
 tbl(['Produk','Stok','Status','Aksi'],db.prods.map(p=>[esc(p.nama),p.stok+' '+esc(p.sat),stat(p),'<button class="btn sm" onclick="fStok(\''+p.id+'\')">+ Stok masuk</button>']))+'</div>'},
transaksi(){
 const tot=cart.reduce((s,c)=>s+c.qty*db.prods.find(p=>p.id==c.pid).harga,0);
 return '<div class="card"><h3>Transaksi baru</h3><label>Pelanggan<select onchange="S.tc=this.value">'+[['','Umum']].concat(db.custs.map(c=>[c.id,c.nama])).map(o=>'<option value="'+o[0]+'"'+((S.tc||'')==o[0]?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select></label>'+
 '<div class="row" style="justify-content:flex-start;align-items:flex-end"><label style="flex:3;min-width:180px">Produk<select id="tp">'+db.prods.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+' (stok '+p.stok+') - '+rp(p.harga)+'</option>').join('')+'</select></label><label style="flex:1;min-width:80px">Jumlah<input id="tq" type="number" min="1" value="1"></label><button class="btn" style="margin-bottom:10px" onclick="addCart()">Tambah</button></div></div>'+
 '<div class="card"><h3>Keranjang</h3>'+tbl(['Produk','Qty','Subtotal',''],cart.map((c,i)=>{const p=db.prods.find(x=>x.id==c.pid);return[esc(p.nama),c.qty,rp(c.qty*p.harga),'<button class="btn sm red" onclick="cart.splice('+i+',1);render()">x</button>']}))+
 '<div class="row" style="justify-content:space-between;align-items:center;margin-top:12px"><b style="font-size:18px">Total: '+rp(tot)+'</b><button class="btn" onclick="bayar()">Bayar</button></div></div>'},
pelanggan(){return '<div class="card"><div class="row" style="margin-bottom:10px"><button class="btn" onclick="fCust()">+ Pelanggan</button></div>'+
 tbl(['Nama','Telepon','Alamat','Total belanja','Aksi'],db.custs.map(c=>[esc(c.nama),esc(c.telp),esc(c.alamat),rp(sum(db.trx.filter(x=>x.cust==c.id))),act('fCust','custs',c.id)]))+'</div>'},
laporan(){
 const f=S.f||'',t=S.t||'9999',L=db.trx.filter(x=>x.tgl>=f&&x.tgl<=t),top={};
 L.forEach(x=>x.items.forEach(i=>top[i.nama]=(top[i.nama]||0)+i.qty));
 return '<div class="card np"><h3>Laporan penjualan</h3><div class="row" style="justify-content:flex-start;align-items:flex-end"><label>Dari<input type="date" value="'+f+'" onchange="S.f=this.value;render()"></label><label>Sampai<input type="date" value="'+(S.t||'')+'" onchange="S.t=this.value;render()"></label><button class="btn ghost" style="margin-bottom:10px" onclick="window.print()">Cetak</button></div></div>'+
 '<div class="grid"><div class="card stat"><small>Jumlah transaksi</small><b>'+L.length+'</b></div><div class="card stat"><small>Total penjualan</small><b>'+rp(sum(L))+'</b></div></div>'+
 '<div class="card">'+tbl(['No','Tanggal','Pelanggan','Item','Total'],L.slice().reverse().map(x=>[x.no,x.tgl,esc(cu(x.cust)),esc(x.items.map(i=>i.nama+' x'+i.qty).join(', ')),rp(x.total)]))+'</div>'+
 '<div class="card"><h3>Produk terlaris</h3>'+tbl(['Produk','Terjual'],Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>[esc(e[0]),e[1]]))+'</div>'}
};
var NAV=[['dashboard','Dashboard'],['produk','Produk'],['kategori','Kategori'],['persediaan','Persediaan'],['transaksi','Transaksi'],['pelanggan','Pelanggan'],['laporan','Laporan']];
function render(keep){
 if(!user||!db.users.some(u=>u.username==user)){user=null;$('#app').classList.add('hide');$('#login').classList.remove('hide');$('#login').innerHTML=authView();return}
 $('#login').classList.add('hide');$('#app').classList.remove('hide');
 $('#who').textContent=user;
 $('#nav').innerHTML=NAV.map(n=>'<button class="'+(n[0]==page?'on':'')+'" onclick="page=\''+n[0]+'\';render()">'+n[1]+'</button>').join('');
 $('#main').innerHTML=P[page]();
 if(keep){const i=$('#main input');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}}
}
render();
