// Free to Race: risultati di una sessione (tabelle e grafici), dai JSON di strumenti/risultati.py.
// Lo usano la pagina /risultati/ e l'app del telefono: FTRRis.render(elemento, dati, 'it'|'en', {replay: url}).
// Colori dal tema della pagina che lo ospita (--panel, --line, --text, --dim); barre in un solo colore.
(function(){
const T = {
 it:{best:'Miglior giro', gap:'Distacco', tyre:'Gomma', laps:'Giri', driver:'Pilota', team:'Squadra', pos:'Pos',
  practice:{h1:'Classifica', n1:'Ordine ufficiale per miglior giro. Gomma: mescola ed età (giri) nel giro migliore.',
   h2:'Passo gara (simulazioni di gara)', n2:'Media dei giri di una serie lunga con la stessa gomma (almeno 5 giri, a benzina alta). Si confronta solo fra piloti sulla stessa mescola; i carichi di benzina non sono noti, il confronto è indicativo.',
   h3:'Squadre: distacco dal migliore', n3:'Miglior giro della squadra e distacco in % dal più veloce. S1-S2-S3: posizione della squadra nel miglior settore (1 = la più veloce in quel tratto).',
   h4:'Degrado delle gomme', n4:'Secondi persi in media a ogni giro di vita della gomma, sulle serie di almeno 8 giri. Non corretto per la benzina che si consuma (che fa guadagnare qualche centesimo a giro).',
   h5:'Velocità massima', n5:'Velocità più alta al rilevamento sul rettilineo (speed trap), in km/h. Dipende anche dalla scia.'},
  quali:{h1:'Griglia', n1:'Ordine ufficiale. Tempo migliore in ciascuna parte; distacco dalla pole per chi è arrivato in Q3.',
   h2:'Chi è passato e chi no', n2:'Il tempo da battere è quello del più lento fra chi è passato. Negativo = sotto il taglio di tanto così; positivo = quanto è mancato.',
   h3:'Giro ideale', n3:'Somma dei migliori settori di ciascun pilota: quanto avrebbe potuto fare mettendoli insieme nello stesso giro. Tempo lasciato = miglior giro − giro ideale.',
   h4:'Settori: dove va forte ciascuno', n4:'Miglior tempo in ogni settore e posizione fra tutti (1 = il più veloce in quel tratto).',
   h5:'Squadre: distacco dal migliore', n5:'Miglior giro della squadra e distacco in % dal più veloce.', pole:'Pole', passes:'passa', out:'fuori', cut:'Tempo da battere', toCut:'Dal taglio', ideal:'Ideale', left:'Tempo lasciato'},
  race:{h1:'Ordine d’arrivo', n1:'Ordine al traguardo dal cronometraggio ufficiale; eventuali penalità date dopo la gara non sono comprese. Posizioni: guadagnate (▲) o perse (▼) rispetto alla partenza.',
   h2:'Strategie', n2:'Ogni barra è la gara di un pilota divisa negli stint: lettera = mescola (S morbida, M media, H dura, I intermedia, W bagnato), lunghezza = giri.',
   h3:'Soste ai box', n3:'Giro di ogni sosta e tempo da fermi (cambio gomme), quando il cronometraggio lo fornisce.',
   h4:'Passo di gara', n4:'Mediana dei giri «puliti» di ciascuno (senza primo giro, soste, Safety Car e VSC): il ritmo tipico in gara, al netto degli episodi.',
   h5:'Passo per squadra', n5:'Il passo migliore fra i due piloti della squadra.', grid:'Partenza', change:'Posizioni', pts:'Punti', notCl:'Non classificato', stops:'Soste', fl:'Giro più veloce', median:'Passo'},
  replay:'▶ Rivedi la sessione', lapOf:'giro'},
 en:{best:'Best lap', gap:'Gap', tyre:'Tyre', laps:'Laps', driver:'Driver', team:'Team', pos:'Pos',
  practice:{h1:'Classification', n1:'Official order by best lap. Tyre: compound and age (laps) on the best lap.',
   h2:'Race pace (long runs)', n2:'Average of a long run on the same tyre (at least 5 laps, high fuel). Compare only drivers on the same compound; fuel loads are unknown, so it is indicative.',
   h3:'Teams: gap to the fastest', n3:'Team best lap and gap in % to the fastest. S1-S2-S3: team rank in each best sector (1 = fastest there).',
   h4:'Tyre degradation', n4:'Seconds lost on average for every lap of tyre life, on runs of at least 8 laps. Not corrected for the fuel burnt (worth a few hundredths per lap).',
   h5:'Top speed', n5:'Highest speed at the straight-line speed trap, km/h. Slipstream counts too.'},
  quali:{h1:'Grid', n1:'Official order. Best time in each part; gap to pole for the Q3 drivers.',
   h2:'Who made the cut', n2:'The time to beat is the slowest among those who went through. Negative = how far under the cut; positive = how much was missing.',
   h3:'Ideal lap', n3:'Sum of each driver’s best sectors: what was possible putting them in one lap. Time left = best lap − ideal lap.',
   h4:'Sectors: where each driver is fast', n4:'Best time in each sector and rank among all (1 = fastest there).',
   h5:'Teams: gap to the fastest', n5:'Team best lap and gap in % to the fastest.', pole:'Pole', passes:'through', out:'out', cut:'Time to beat', toCut:'To the cut', ideal:'Ideal', left:'Time left'},
  race:{h1:'Finishing order', n1:'Order at the flag from the official timing; penalties given after the race are not included. Positions gained (▲) or lost (▼) from the start.',
   h2:'Strategies', n2:'Each bar is one driver’s race split into stints: letter = compound (S soft, M medium, H hard, I intermediate, W wet), length = laps.',
   h3:'Pit stops', n3:'Lap of each stop and stationary time (tyre change), when the timing provides it.',
   h4:'Race pace', n4:'Median of each driver’s clean laps (no first lap, pit stops, Safety Car or VSC): the typical race rhythm.',
   h5:'Pace by team', n5:'The better of the two drivers’ pace.', grid:'Start', change:'Places', pts:'Points', notCl:'Not classified', stops:'Stops', fl:'Fastest lap', median:'Pace'},
  replay:'▶ Watch the session again', lapOf:'lap'}};
const TYRE = {SOFT:['#ff3b3b','S','#111'],MEDIUM:['#ffd12e','M','#111'],HARD:['#f2f2f2','H','#111'],INTERMEDIATE:['#43b047','I','#fff'],WET:['#2f7fd1','W','#fff']};
const CSS = `.ris{--rbar:#5b8def}.ris h3{font-size:16px;margin:22px 0 2px}.ris .rn{color:var(--dim);font-size:12.5px;margin:0 0 8px;line-height:1.35}
.ris .rw{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--panel)}
.ris table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;font-size:14px}
.ris th,.ris td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}.ris tr:last-child td{border-bottom:0}
.ris th{font-size:11px;color:var(--dim);font-weight:700;text-transform:uppercase;letter-spacing:.4px}.ris .l{text-align:left}
.ris .sw{display:inline-block;width:4px;height:15px;border-radius:2px;vertical-align:-3px;margin-right:6px}
.ris .tm{color:var(--dim);font-size:12px;margin-left:4px}.ris .b{font-weight:800}.ris .dim{color:var(--dim)}
.ris .bar{display:inline-block;height:9px;border-radius:0 4px 4px 0;background:var(--rbar);vertical-align:middle}.ris td.bc{text-align:left;width:34%;min-width:70px}
.ris .ty{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;font-size:10px;font-weight:900;margin-right:3px;vertical-align:-3px}
.ris .st{display:flex;gap:2px;min-width:160px}.ris .st span{height:18px;border-radius:3px;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;overflow:hidden}
.ris .up{color:#22b35a}.ris .dn{color:#e5484d}.ris .cut td{border-top:2px solid var(--text)}
.ris .rh{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:4px 0 6px}.ris .rh b{font-size:18px}.ris .rh a{margin-left:auto;font-weight:700;color:var(--text)}
@media (max-width:520px){.ris th,.ris td{padding:6px 5px}.ris td.bc{min-width:34px;width:16%}.ris table{font-size:13.5px}}
.ris .tile{display:inline-block;border:1px solid var(--line);border-radius:10px;padding:8px 12px;background:var(--panel);margin:4px 0}`;
function css(){ if(document.getElementById('risCss')) return; const s=document.createElement('style'); s.id='risCss'; s.textContent=CSS; document.head.appendChild(s); }
const esc = s => String(s??'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = t => { if(t==null) return '—'; const m=Math.floor(t/60), s=t-m*60; return m ? `${m}:${s.toFixed(3).padStart(6,'0')}` : s.toFixed(3); };
const plus = (g, d=3) => g==null ? '' : g===0 ? '' : (g>0?'+':'') + g.toFixed(d);
const bar = (v, max) => v==null || !max ? '<td class="bc"></td>' : `<td class="bc"><span class="bar" style="width:${Math.max(2, Math.round(100*v/max))}%"></span></td>`;
const tyre = (c, age) => { const y=TYRE[c]; return y ? `<span class="ty" style="background:${y[0]};color:${y[2]}" title="${esc(c)}">${y[1]}</span>${age??''}` : esc(c||''); };
function table(head, rows){ return `<div class="rw"><table><tr>${head.map(h=>`<th class="${h[1]||''}">${h[0]}</th>`).join('')}</tr>${rows.join('')}</table></div>`; }
function sec(h, n, body){ return `<h3>${h}</h3><p class="rn">${n}</p>${body}`; }

function render(el, doc, lang, opt){
  css(); opt = opt || {};
  const L = T[lang] || T.it, D = doc.drivers || {}, K = L[doc.kind] || L.practice;
  const who = (n, full) => { const d = D[n] || {tla:n}; return `<td class="l"><span class="sw" style="background:${esc(d.color)}"></span><span class="b">${esc(d.tla)}</span>${full?`<span class="tm">${esc((d.team||'').replace(/ F1 Team$/,''))}</span>`:''}</td>`; };
  const wide = el.clientWidth > 520;
  let h = `<div class="ris">`;
  if(opt.title !== false) h += `<div class="rh"><b>${esc(doc.meeting)} ${esc(doc.year)} · ${esc(opt.sessName || doc.session)}</b>${opt.replay?`<a href="${esc(opt.replay)}">${L.replay}</a>`:''}</div>`;
  if(doc.kind === 'practice'){
    const c = doc.classifica || [], gmax = Math.max(...c.map(x=>x.gap||0).filter(g=>g<5), 0.001);
    h += sec(K.h1, K.n1, table([[L.pos],[L.driver,'l'],[L.best],[L.gap],['','l'],[L.tyre],[L.laps]],
      c.map(x=>`<tr><td>${x.pos}</td>${who(x.n, wide)}<td class="b">${fmt(x.best)}</td><td>${plus(x.gap)}</td>${bar(x.gap!=null&&x.gap<5?x.gap:null, gmax)}<td>${tyre(x.tyre, x.age)}</td><td>${x.laps}</td></tr>`)));
    const comps = Object.keys(doc.passo||{}).sort((a,b)=>['SOFT','MEDIUM','HARD','INTERMEDIATE','WET'].indexOf(a)-['SOFT','MEDIUM','HARD','INTERMEDIATE','WET'].indexOf(b));
    if(comps.length) h += sec(K.h2, K.n2, comps.map(cc => { const lst = doc.passo[cc], m = Math.max(...lst.map(x=>x.gap), 0.001);
      return `<p class="rn" style="margin:10px 0 4px">${tyre(cc)} <b style="color:var(--text)">${esc(cc)}</b></p>` + table([[L.driver,'l'],[K.h2.split(' (')[0]],[L.gap],['','l'],[L.laps]],
        lst.map(x=>`<tr>${who(x.n, wide)}<td class="b">${fmt(x.avg)}</td><td>${plus(x.gap)}</td>${bar(x.gap||null, m)}<td>${x.laps}</td></tr>`)); }).join(''));
    h += teams(doc.squadre, K.h3, K.n3);
    const dg = Object.entries(doc.degrado||{});
    if(dg.length) h += sec(K.h4, K.n4, table([[L.tyre,'l'],['s/'+L.lapOf],['n']], dg.map(([c,v])=>`<tr><td class="l">${tyre(c)} ${esc(c)}</td><td class="b">${v.median>0?'+':''}${v.median.toFixed(3)}</td><td class="dim">${v.runs}</td></tr>`)));
    const v = doc.velocita || [], vmax = Math.max(...v.map(x=>x.st), 1), vmin = Math.min(...v.map(x=>x.st), vmax) - 5;
    if(v.length) h += sec(K.h5, K.n5, table([[L.driver,'l'],['km/h'],['','l']], v.map(x=>`<tr>${who(x.n, wide)}<td class="b">${x.st}</td>${bar(x.st - vmin, vmax - vmin)}</tr>`)));
  } else if(doc.kind === 'quali'){
    const g = doc.griglia || [];
    h += sec(K.h1, K.n1, table([[L.pos],[L.driver,'l'],['Q1'],['Q2'],['Q3'],[L.gap]],
      g.map(x=>`<tr><td>${x.pos}</td>${who(x.n, wide)}<td>${fmt(x.q1)}</td><td>${fmt(x.q2)}</td><td class="${x.pos===1?'b':''}">${fmt(x.q3)}</td><td>${x.pos===1?K.pole:plus(x.gap)}</td></tr>`)));
    for(const c of doc.tagli || []){
      h += sec(`${K.h2} · ${esc(c.part)}`, `${K.cut}: <b style="color:var(--text)">${fmt(c.cut)}</b>. ${K.n2}`, table([[L.pos],[L.driver,'l'],[c.part],[K.toCut],['','l']],
        c.rows.map((x,i)=>`<tr class="${x.out && (i===0 || !c.rows[i-1].out) ? 'cut' : ''}"><td>${x.pos}</td>${who(x.n, wide)}<td>${fmt(x.t)}</td><td class="b">${x.toCut==null?'—':plus(x.toCut)||'0.000'}</td><td class="l ${x.out?'dn':'up'}">${x.out?K.out:K.passes}</td></tr>`)));
    }
    const id = doc.ideale || [], lmax = Math.max(...id.map(x=>x.left||0), 0.001);
    if(id.length) h += sec(K.h3, K.n3, table([[L.driver,'l'],[L.best],[K.ideal],[K.left],['','l']], id.map(x=>`<tr>${who(x.n, wide)}<td>${fmt(x.best)}</td><td class="b">${fmt(x.ideal)}</td><td>${x.left?x.left.toFixed(3):''}</td>${bar(x.left||null, lmax)}</tr>`)));
    const s = doc.settori || [];
    if(s.length) h += sec(K.h4, K.n4, table([[L.driver,'l'],['S1'],['S2'],['S3']], s.map(x=>`<tr>${who(x.n, wide)}${['s1','s2','s3'].map(k=>`<td class="${(x.rank||{})[k]===1?'b':''}">${x[k]!=null?x[k].toFixed(3):'—'} <span class="dim">${(x.rank||{})[k]??''}°</span></td>`).join('')}</tr>`)));
    h += teams(doc.squadre, K.h5, K.n5);
  } else {
    const a = doc.arrivo || [];
    if(doc.giroVeloce){ const f = doc.giroVeloce, d = D[f.n] || {}; h += `<div class="tile">${K.fl}: <b>${esc(d.tla)}</b> ${fmt(f.t)} <span class="dim">· ${L.lapOf} ${f.lap??''}</span></div>`; }
    h += sec(K.h1, K.n1, table([[L.pos],[L.driver,'l'],[K.grid],[K.change],[L.gap],[K.pts]],
      a.map(x=>`<tr><td>${x.out?'—':x.pos}</td>${who(x.n, wide)}<td>${x.grid??'—'}</td><td class="${x.delta>0?'up':x.delta<0?'dn':'dim'}">${x.delta==null?'':x.delta>0?'▲'+x.delta:x.delta<0?'▼'+(-x.delta):'='}</td><td>${x.out?`<span class="dim">${K.notCl}</span>`:esc(x.gap)}</td><td>${x.pts||''}</td></tr>`)));
    const maxL = Math.max(...(doc.strategie||[]).map(s=>s.stints.reduce((t,x)=>t+(x.laps||0),0)), 1);
    h += sec(K.h2, K.n2, table([[L.driver,'l'],['','l']], (doc.strategie||[]).map(s=>`<tr>${who(s.n, false)}<td class="l"><div class="st" style="width:${Math.max(8, Math.round((wide?420:200) * s.stints.reduce((t,x)=>t+(x.laps||0),0) / maxL))}px;min-width:0">${s.stints.map(x=>{ const y=TYRE[x.c]||['#777','?','#fff']; return `<span title="${esc(x.c)} · ${x.laps} ${L.laps.toLowerCase()}" style="flex:${x.laps||1};background:${y[0]};color:${y[2]}">${y[1]}${(x.laps||0)>=6?' '+x.laps:''}</span>`; }).join('')}</div></td></tr>`)));
    h += sec(K.h3, K.n3, table([[L.driver,'l'],[K.stops],[L.laps,'l'],['s','l']], (doc.soste||[]).filter(s=>s.stops.length).map(s=>`<tr>${who(s.n, false)}<td class="b">${s.stops.length}</td><td class="l">${s.stops.map(x=>x.lap).join(', ')}</td><td class="l">${s.stops.map(x=>x.stop!=null?x.stop.toFixed(1):'—').join(' · ')}</td></tr>`)));
    const p = doc.passo || [], pm = Math.max(...p.map(x=>x.gap), 0.001);
    if(p.length) h += sec(K.h4, K.n4, table([[L.pos],[L.driver,'l'],[K.median],[L.gap],['','l'],[L.laps]], p.map((x,i)=>`<tr><td>${i+1}</td>${who(x.n, wide)}<td class="b">${fmt(x.median)}</td><td>${plus(x.gap)}</td>${bar(x.gap||null, pm)}<td class="dim">${x.laps}</td></tr>`)));
    const ps = doc.passoSquadre || [], psm = Math.max(...ps.map(x=>x.gap), 0.001);
    if(ps.length) h += sec(K.h5, K.n5, table([[L.team,'l'],[K.median],[L.gap],['','l']], ps.map(t=>`<tr><td class="l"><span class="sw" style="background:${esc(t.color)}"></span><span class="b">${esc(t.team)}</span></td><td class="b">${fmt(t.median)}</td><td>${plus(t.gap)}</td>${bar(t.gap||null, psm)}</tr>`)));
  }
  el.innerHTML = h + `</div>`;
  function teams(list, title, note){
    if(!list || !list.length) return '';
    const m = Math.max(...list.map(t=>t.gapPct||0), 0.001);
    return sec(title, note, table([[L.team,'l'],[L.best],['%'],['','l'],['S1'],['S2'],['S3']],
      list.map(t=>`<tr><td class="l"><span class="sw" style="background:${esc(t.color)}"></span><span class="b">${esc(t.team)}</span></td><td>${fmt(t.best)}</td><td>${t.gapPct?'+'+t.gapPct.toFixed(2):''}</td>${bar(t.gapPct||null, m)}${['s1','s2','s3'].map(k=>`<td class="${(t.secRank||{})[k]===1?'b':''}">${(t.secRank||{})[k]??''}°</td>`).join('')}</tr>`)));
  }
}
window.FTRRis = {render, T};
})();
