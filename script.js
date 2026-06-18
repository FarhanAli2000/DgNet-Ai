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

  // service glow follow
  document.querySelectorAll('.svc').forEach(c=>c.addEventListener('pointermove',ev=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(ev.clientX-r.left)+'px');c.style.setProperty('--my',(ev.clientY-r.top)+'px');}));

  // magnetic buttons
  if(!reduce)document.querySelectorAll('.magnet').forEach(b=>{
    b.addEventListener('pointermove',ev=>{const r=b.getBoundingClientRect();b.style.transform='translate('+((ev.clientX-r.left-r.width/2)*.3)+'px,'+((ev.clientY-r.top-r.height/2)*.4)+'px)';});
    b.addEventListener('pointerleave',()=>b.style.transform='');
  });

  // typewriter
  if(!reduce){
    const phrases=['AI-Powered Innovation.','Intelligent Automation.','Digital Transformation.','Smart Solutions.'];
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