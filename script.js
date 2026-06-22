  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // preloader
  addEventListener('load',()=>setTimeout(()=>document.getElementById('loader').classList.add('done'),900));
  setTimeout(()=>document.getElementById('loader').classList.add('done'),2600);

  // scroll progress + nav
  const nav=document.getElementById('nav'),prog=document.getElementById('progress');
  addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled',scrollY>40);
    const max=document.documentElement.scrollHeight-innerHeight;
    prog.style.width=(max>0?scrollY/max*100:0)+'%';
  });

  // mobile menu
  const hamb=document.getElementById('hamb'),links=document.getElementById('navlinks');
  hamb.addEventListener('click',()=>links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));

  // staggered reveals within grids
  document.querySelectorAll('.feat-grid,.svc-grid,.proj-grid,.ind-grid').forEach(g=>{
    [...g.children].forEach((c,i)=>c.style.transitionDelay=(i*0.07)+'s');
  });
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  const tl=document.getElementById('timeline');
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){tl.classList.add('in');o.disconnect();}}),{threshold:.4}).observe(tl);

  // industries slide-in animation
  const indGrid = document.querySelector('.ind-grid');
  if(indGrid){
    const indItems = [...indGrid.querySelectorAll('.ind')];
    // set staggered delay: each group of 4 gets 0, 120, 240, 360ms
    indItems.forEach((item, i) => {
      item.style.transitionDelay = ((i % 4) * 0.13) + 's';
    });
    new IntersectionObserver((es, o) => {
      es.forEach(e => {
        if(e.isIntersecting){
          indItems.forEach(item => item.classList.add('in'));
          o.disconnect();
        }
      });
    }, {threshold: 0.15}).observe(indGrid);
  }

  // service glow follow (mobile grid only)
  document.querySelectorAll('.svc-mob .svc').forEach(c=>c.addEventListener('pointermove',ev=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(ev.clientX-r.left)+'px');c.style.setProperty('--my',(ev.clientY-r.top)+'px');}));

  // ---- RADIAL ORBITAL SERVICES ----
  (function(){
    const wrap = document.getElementById('svcOrbWrap');
    const center = document.getElementById('svcOrbCenter');
    if(!wrap || !center || reduce) return;

    const SVC = [
      {title:'Web Development', short:'Web\nDev', desc:'Fast, responsive, modern websites built to look great and convert visitors into customers — from business sites to ecommerce stores.', energy:92, icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'},
      {title:'Web & Mobile Applications', short:'Apps', desc:'Custom web and mobile applications built around your workflows — secure, scalable, and easy to use.', energy:88, icon:'<path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/>'},
      {title:'Digital Marketing', short:'Digital\nMarketing', desc:'Targeted campaigns that reach the right audience — paid ads, email, and strategy that turns clicks into customers.', energy:86, icon:'<path d="M3 17l6-6 4 4 8-8M21 7v6M21 7h-6"/>'},
      {title:'SEO & Content', short:'SEO', desc:'Search engine optimisation and content that helps your business rank higher on Google and attract steady, organic traffic.', energy:90, icon:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6M11 8v6"/>'},
      {title:'Social Media Management', short:'Social\nMedia', desc:'Consistent, on-brand social media — content, scheduling, and engagement that builds your audience and presence.', energy:84, icon:'<path d="M4 12a8 8 0 0116 0M4 12v5a2 2 0 002 2h2M20 12v5a2 2 0 01-2 2h-2"/><path d="M8 13h.01M12 13h.01M16 13h.01"/>'},
      {title:'AI Chatbots & Automation', short:'AI &\nAutomation', desc:'When your business needs it, we build AI chatbots for 24/7 support and automate repetitive processes to save your team time.', energy:82, icon:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'},
    ];

    // Connections between related services [indexA, indexB]
    const CONNS = [[0,4],[1,2],[3,5],[0,1],[2,3],[4,5]];

    let rotAngle = 0, autoRot = true, activeIdx = -1, animRaf = null;
    let cSize = wrap.offsetWidth, cx, cy, r;

    function resize(){
      cSize = wrap.offsetWidth;
      cx = cSize / 2; cy = cSize / 2;
      r = cSize * 0.34;
    }
    resize();
    window.addEventListener('resize', resize);

    // SVG for connection lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('svc-orb-svg');
    const connEls = CONNS.map(([a,b])=>{
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.classList.add('orb-conn');
      svg.appendChild(line);
      return {line,a,b};
    });
    wrap.insertBefore(svg, wrap.firstChild);

    // Create node elements
    const nodeEls = SVC.map((s,i)=>{
      const nd = document.createElement('div');
      nd.className = 'svc-orb-node';
      nd.innerHTML = `<div class="orb-node-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${s.icon}</svg>
        <span class="orb-nlbl">${s.short.replace('\n','<br>')}</span>
        <span class="orb-live"></span>
      </div>`;
      wrap.appendChild(nd);
      return nd;
    });

    // Create expanded card elements
    const cardEls = SVC.map((s,i)=>{
      const cd = document.createElement('div');
      cd.className = 'svc-orb-card';
      cd.innerHTML = `
        <button class="ocd-close" aria-label="close">✕</button>
        <div class="ocd-head">
          <div class="ocd-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${s.icon}</svg></div>
          <h4>${s.title}</h4>
        </div>
        <p class="ocd-desc">${s.desc}</p>
        <div class="ocd-bar-row"><span>Efficiency</span><span>${s.energy}%</span></div>
        <div class="ocd-bar"><div class="ocd-fill"></div></div>
        <div class="ocd-badge"><span class="dot"></span>Active Service</div>`;
      cd.querySelector('.ocd-close').addEventListener('click', e => {
        e.stopPropagation(); deselect();
      });
      wrap.appendChild(cd);
      return cd;
    });

    function nodePos(i){
      const angle = (i/6)*Math.PI*2 + rotAngle - Math.PI/2;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        depth: Math.sin(angle + Math.PI/2)
      };
    }

    function placeCard(i, nx, ny){
      const CARD_W = 192, CARD_H = 185;
      const left = nx > cx
        ? Math.min(cSize - CARD_W - 6, nx - 54 - CARD_W)
        : Math.max(6, nx + 54);
      const top = Math.max(6, Math.min(cSize - CARD_H - 6, ny - 70));
      cardEls[i].style.left = left + 'px';
      cardEls[i].style.top  = top  + 'px';
    }

    function tick(){
      if(autoRot) { rotAngle += 0.005; if(rotAngle > Math.PI*2) rotAngle -= Math.PI*2; }
      svg.setAttribute('viewBox',`0 0 ${cSize} ${cSize}`);
      nodeEls.forEach((nd,i)=>{
        const {x,y,depth} = nodePos(i);
        const sc  = 0.78 + 0.22 * (depth+1)/2;
        const op  = 0.52 + 0.48 * (depth+1)/2;
        const ndW = nd.offsetWidth || cSize*0.14;
        nd.style.left      = (x - ndW/2) + 'px';
        nd.style.top       = (y - ndW/2) + 'px';
        nd.style.transform = `scale(${sc.toFixed(3)})`;
        nd.style.opacity   = op.toFixed(3);
        nd.style.zIndex    = Math.round((depth+1)*4+1);
        if(activeIdx === i) placeCard(i, x, y);
      });
      connEls.forEach(({line,a,b})=>{
        const pa=nodePos(a), pb=nodePos(b);
        line.setAttribute('x1',pa.x.toFixed(1));line.setAttribute('y1',pa.y.toFixed(1));
        line.setAttribute('x2',pb.x.toFixed(1));line.setAttribute('y2',pb.y.toFixed(1));
      });
      animRaf = requestAnimationFrame(tick);
    }

    function select(i){
      if(activeIdx !== -1) deselect(false);
      activeIdx = i; autoRot = false;
      nodeEls[i].classList.add('active');
      cardEls[i].classList.add('show');
      center.classList.add('paused');
      setTimeout(()=>{
        const fill = cardEls[i].querySelector('.ocd-fill');
        if(fill) fill.style.width = SVC[i].energy + '%';
      }, 40);
      connEls.forEach(({line,a,b})=>{
        line.classList.toggle('lit', a===i||b===i);
      });
    }

    function deselect(resume=true){
      if(activeIdx === -1) return;
      const prev = activeIdx; activeIdx = -1;
      nodeEls[prev].classList.remove('active');
      cardEls[prev].classList.remove('show');
      const fill = cardEls[prev].querySelector('.ocd-fill');
      if(fill) fill.style.width = '0';
      connEls.forEach(({line})=>line.classList.remove('lit'));
      if(resume){ autoRot = true; center.classList.remove('paused'); }
    }

    nodeEls.forEach((nd,i)=>{
      nd.addEventListener('click', ()=> activeIdx===i ? deselect() : select(i));
    });

    // Start orbit when section scrolls into view
    new IntersectionObserver((es,o)=>{
      es.forEach(e=>{
        if(e.isIntersecting){ tick(); o.disconnect(); }
      });
    },{threshold:0.15}).observe(wrap);

    // Click outside to deselect
    document.addEventListener('click', e=>{
      if(activeIdx !== -1 && !wrap.contains(e.target)) deselect();
    });
  })();

  // magnetic buttons
  if(!reduce)document.querySelectorAll('.magnet').forEach(b=>{
    b.addEventListener('pointermove',ev=>{const r=b.getBoundingClientRect();b.style.transform='translate('+((ev.clientX-r.left-r.width/2)*.3)+'px,'+((ev.clientY-r.top-r.height/2)*.4)+'px)';});
    b.addEventListener('pointerleave',()=>b.style.transform='');
  });

  // typewriter
  if(!reduce){
    const phrases=['Grow Your Business.','Reach More Customers.','Launch Faster.','Scale Online.'];
    let pi=0,ci=phrases[0].length,isDel=true;
    const tEl=document.getElementById('typingText');
    if(tEl){
      function typeStep(){
        const cur=phrases[pi];
        if(!isDel){
          tEl.textContent=cur.slice(0,++ci);
          if(ci===cur.length){isDel=true;setTimeout(typeStep,2500);return;}
          setTimeout(typeStep,72);
        } else {
          tEl.textContent=cur.slice(0,--ci);
          if(ci===0){isDel=false;pi=(pi+1)%phrases.length;setTimeout(typeStep,400);return;}
          setTimeout(typeStep,36);
        }
      }
      setTimeout(typeStep,2700);
    }
  }

  // vip floating cards reveal
  setTimeout(()=>{
    document.querySelectorAll('.vcard').forEach((c,i)=>{
      setTimeout(()=>c.classList.add('in'),i*280);
    });
  },reduce?0:1100);

  // hero stat card slider
  const heroStatCards = [...document.querySelectorAll('#heroStatSlider .stat-card')];
  if(heroStatCards.length > 1 && !reduce){
    let statIdx = heroStatCards.findIndex(card => card.classList.contains('active'));
    if(statIdx < 0) statIdx = 0;
    setInterval(()=>{
      heroStatCards[statIdx].classList.remove('active');
      statIdx = (statIdx + 1) % heroStatCards.length;
      heroStatCards[statIdx].classList.add('active');
    },2500);
  }

  // hero stat counters
  function countUp(el,target,ms){
    if(!el)return;let v=0;const step=target/(ms/14);
    const t=setInterval(()=>{v+=step;if(v>=target){v=target;clearInterval(t);}el.textContent=Math.round(v);},14);
  }
  const statsEl=document.getElementById('heroStats');
  if(statsEl){
    setTimeout(()=>{
      statsEl.querySelectorAll('.hstat').forEach(c=>c.classList.add('in'));
      countUp(document.getElementById('cnt1'),200,1800);
      countUp(document.getElementById('cnt2'),98,1400);
      countUp(document.getElementById('cnt3'),50,1200);
    },reduce?0:1100);
  }

  // hero illustration tilt
  const illus=document.getElementById('illus');
  if(illus&&!reduce)addEventListener('pointermove',ev=>{const x=(ev.clientX/innerWidth-.5),y=(ev.clientY/innerHeight-.5);illus.style.transform='rotateX('+(-y*8)+'deg) rotateY('+(x*8)+'deg)';});

  // testimonial carousel
  const slides=[...document.querySelectorAll('.slide')],dots=document.getElementById('dots');
  let cur=0;
  slides.forEach((_,i)=>{const b=document.createElement('button');if(i===0)b.classList.add('on');b.onclick=()=>go(i);dots.appendChild(b);});
  function go(i){slides[cur].classList.remove('active');dots.children[cur].classList.remove('on');cur=i;slides[cur].classList.add('active');dots.children[cur].classList.add('on');}
  if(slides.length>1&&!reduce)setInterval(()=>go((cur+1)%slides.length),5000);

  function subscribe(){const i=document.querySelector('.news input');if(i.value&&i.value.includes('@')){i.value='';alert("Thanks — you're subscribed!");}else{alert('Please enter a valid email.');}}

  // neural network canvas
  function neuralNet(canvas){
    const ctx=canvas.getContext('2d');let w,h,nodes;
    function size(){w=canvas.width=canvas.offsetWidth;h=canvas.height=canvas.offsetHeight;const count=Math.min(70,Math.floor(w*h/16000));nodes=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35}));}
    size();addEventListener('resize',size);
    function frame(){ctx.clearRect(0,0,w,h);for(const n of nodes){n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>w)n.vx*=-1;if(n.y<0||n.y>h)n.vy*=-1;}
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.hypot(dx,dy);if(d<130){ctx.strokeStyle='rgba(0,212,255,'+((1-d/130)*.22)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();}}
      for(const n of nodes){ctx.fillStyle='rgba(93,247,255,.7)';ctx.beginPath();ctx.arc(n.x,n.y,1.7,0,7);ctx.fill();}requestAnimationFrame(frame);}
    if(!reduce)frame();
  }
  neuralNet(document.getElementById('neural'));

  // showreel reveal
  const reelFrame = document.getElementById('reelFrame');
  if(reelFrame){
    const openReel=()=>reelFrame.classList.add('open');
    if(!reduce){
      new IntersectionObserver((es,o)=>{
        es.forEach(e=>{if(e.isIntersecting){openReel();o.disconnect();}});
      },{threshold:0.08}).observe(reelFrame);
    } else { openReel(); }
  }

  function particles(canvas){
    const ctx=canvas.getContext('2d');let w,h,ps;
    function size(){w=canvas.width=canvas.offsetWidth;h=canvas.height=canvas.offsetHeight;ps=Array.from({length:42},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+.5,vy:-(Math.random()*.4+.1),a:Math.random()*.5+.2}));}
    size();
    function frame(){ctx.clearRect(0,0,w,h);for(const p of ps){p.y+=p.vy;if(p.y<0){p.y=h;p.x=Math.random()*w;}ctx.fillStyle='rgba(0,212,255,'+p.a+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();}requestAnimationFrame(frame);}
    if(!reduce)frame();
  }
  particles(document.getElementById('ctaParticles'));
