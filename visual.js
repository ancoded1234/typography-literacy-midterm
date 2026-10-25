(()=>{
  'use strict';
  const slides=[...document.querySelectorAll('.slide')];
  const deck=document.querySelector('#deck');
  const shell=document.createElement('div');shell.className='deck-shell';deck.before(shell);shell.append(deck);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,animations=[];
  function resize(){
    if(matchMedia('(max-width:650px) and (orientation:portrait)').matches){shell.style.width='100%';shell.style.height='auto';deck.style.transform='none';return}
    const scale=Math.max(.05,Math.min((innerWidth-28)/1600,(innerHeight-84)/900));
    shell.style.width=(1600*scale)+'px';shell.style.height=(900*scale)+'px';deck.style.transform=`scale(${scale})`;
  }
  function finishMotion(){
    animations.forEach(a=>{a.pause();if(a.seek)a.seek(a.duration)});animations=[];
    document.querySelectorAll('[data-enter]').forEach(e=>{e.style.opacity='1';e.style.transform='none'});
    document.querySelectorAll('[data-bar]').forEach(e=>{e.style.opacity='1';e.style.transform='none'});
  }
  function motion(){
    finishMotion();if(reduced.matches||!window.anime)return;
    const entering=slides[index].querySelectorAll('[data-enter]');
    if(entering.length)animations.push(anime({targets:entering,translateY:[8,0],duration:480,delay:anime.stagger(65),easing:'easeOutCubic'}));
    const bars=slides[index].querySelectorAll('[data-bar]');
    if(bars.length)animations.push(anime({targets:bars,opacity:[0.55,1],duration:620,delay:anime.stagger(100),easing:'easeOutCubic'}));
  }
  function show(i,update=true){
    finishMotion();index=Math.max(0,Math.min(i,slides.length-1));
    slides.forEach((s,j)=>{s.hidden=j!==index;s.inert=j!==index});
    const counter=document.querySelector('#counter');counter.value=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    document.querySelector('#prev').disabled=index===0;document.querySelector('#next').disabled=index===slides.length-1;
    document.querySelectorAll('#dots button').forEach((b,j)=>b.setAttribute('aria-current',String(j===index)));
    const progress=document.querySelector('.progress');progress.setAttribute('aria-valuemin','1');progress.setAttribute('aria-valuemax',String(slides.length));progress.setAttribute('aria-valuenow',String(index+1));progress.firstElementChild.style.width=((index+1)/slides.length*100)+'%';
    deck.classList.toggle('is-dark',slides[index].classList.contains('dark-slide'));
    if(update)history.replaceState(null,'','#'+slides[index].id);
    scrollTo({top:0,left:0,behavior:'instant'});motion();
  }
  slides.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`${String(i+1).padStart(2,'0')}\ubc88 \uc2ac\ub77c\uc774\ub4dc\ub85c \uc774\ub3d9`);b.onclick=()=>show(i);document.querySelector('#dots').append(b)});
  function fromHash(){const n=slides.findIndex(s=>s.id===location.hash.slice(1));show(n<0?0:n,false)}
  document.querySelector('#prev').onclick=()=>show(index-1);document.querySelector('#next').onclick=()=>show(index+1);document.querySelector('#replay').onclick=motion;
  document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>{const group=[...b.parentElement.querySelectorAll('[role=tab]')];group.forEach(x=>{const on=x===b;x.setAttribute('aria-selected',String(on));document.getElementById(x.dataset.panel).hidden=!on})});
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}}
  document.querySelector('#fullscreen').onclick=fullscreen;document.addEventListener('fullscreenchange',resize);
  document.querySelector('#sources').onclick=()=>document.querySelector('#source-dialog').showModal();
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  document.querySelectorAll('[data-image]').forEach(b=>{const open=()=>{document.querySelector('#expanded-image').src=b.dataset.image;document.querySelector('#image-caption').textContent=b.dataset.caption||'';document.querySelector('#image-dialog').showModal()};b.addEventListener('click',open);if(b.getAttribute('role')==='button')b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});
  document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(index+1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(index-1)}else if(e.key==='Home'){e.preventDefault();show(0)}else if(e.key==='End'){e.preventDefault();show(slides.length-1)}else if(e.key.toLowerCase()==='f')fullscreen()});
  let touch=null;document.querySelector('#viewport').addEventListener('touchstart',e=>{if(!e.target.closest('button,a,input'))touch={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}},{passive:true});document.querySelector('#viewport').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1));touch=null},{passive:true});
  addEventListener('resize',resize);addEventListener('hashchange',fromHash);reduced.addEventListener('change',finishMotion);
  window.DECK_QA={show,finishMotion,slideIds:slides.map(s=>s.id)};fromHash();resize();
})();


