const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let dispose = () => {};
export function mountMotion() {
 dispose();
 const controller = new AbortController();
 const {signal} = controller;
 const frames = new Set();
 let active = true;
 const later = fn => {const id=requestAnimationFrame(()=>{frames.delete(id);if(active)fn()});frames.add(id)};
 const title=document.querySelector('h1');
 if(title){title.innerHTML=[...title.textContent].map((c,i)=>`<span style="--letter:${i}">${c===' '?'&nbsp;':c}</span>`).join('');}
 const intro=document.querySelector('.intro');
 const original=document.querySelector('.hero-portrait');
 const section=document.querySelector('.portrait-section');
 const footer=document.querySelector('.footer-mark');
 const preview=document.querySelector('.hover-preview');
 const mark=footer?.querySelector('svg');
 if(mark){mark.insertAdjacentHTML('afterbegin',`<defs><filter id="liquid-mark" x="-15%" y="-25%" width="130%" height="150%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012 .025" numOctaves="2" seed="8" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`);mark.querySelector('path').setAttribute('filter','url(#liquid-mark)');}
 const displacement=mark?.querySelector('feDisplacementMap');
 const noise=mark?.querySelector('feTurbulence');
 let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty,lastX=x,velocity=0;
 document.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY},{signal});
 const mirror=original?.cloneNode();
 if(mirror){mirror.className='portrait-flight';mirror.alt='';mirror.setAttribute('aria-hidden','true');document.body.append(mirror)}
 let origin;
 const measure=()=>{if(!original)return;const rect=original.getBoundingClientRect();origin={left:rect.left,top:rect.top+scrollY,width:rect.width,height:rect.height}};
 measure();
 window.addEventListener('resize',measure,{signal});
 const bend=(img,amount)=>{if(!img)return;img.style.clipPath=`polygon(0 ${amount}%, 25% 0, 75% 0, 100% ${amount}%, 100% ${100-amount}%, 75% 100%, 25% 100%, 0 ${100-amount}%)`};
 let lastScroll=scrollY,speed=0;
 function tick(){
  if(reduced()){if(mirror)mirror.style.display='none';return;}
  const ready=!intro||!intro.isConnected;
  document.body.classList.toggle('motion-ready',ready);
  x+=(tx-x)*.13;y+=(ty-y)*.13;
  velocity+=(tx-lastX-velocity)*.1;lastX=tx;
  speed+=(scrollY-lastScroll-speed)*.1;lastScroll=scrollY;
  if(preview){preview.style.left=`${x}px`;preview.style.top=`${y}px`;preview.style.setProperty('--lean',`${Math.max(-12,Math.min(12,velocity*.6))}deg`);preview.style.setProperty('--stretch',1+Math.min(.15,Math.abs(velocity)*.008));bend(preview,Math.min(9,Math.abs(velocity)*.4));}
  if(mirror&&origin&&section){
   const end=section.getBoundingClientRect().bottom;
   const p=Math.max(0,Math.min(1,scrollY/(innerHeight*.95)));
   const eased=p*p*(3-2*p);
   const visible=ready&&scrollY>1&&end>0;
   mirror.style.display=visible?'block':'none';
   original.style.opacity=visible?'0':'1';
   section.classList.toggle('flight-active',visible);
   const mix=(a,b)=>a+(b-a)*eased;
   Object.assign(mirror.style,{left:`${mix(origin.left,0)}px`,top:`${mix(origin.top-scrollY,0)}px`,width:`${mix(origin.width,innerWidth)}px`,height:`${mix(origin.height,innerHeight)}px`,transform:`perspective(1600px) rotateX(${Math.max(-5,Math.min(5,speed*.12))*(1-eased)}deg)`});
   bend(mirror,Math.sin(p*Math.PI)*3);
   mirror.style.opacity=String(Math.min(1,end/(innerHeight*.25)));
  }
  if(footer){const r=footer.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0){const px=(x/innerWidth-.5),py=(y/innerHeight-.5);footer.style.setProperty('--mx',px);footer.style.setProperty('--my',py);displacement?.setAttribute('scale',String(4+Math.abs(px)*12+Math.min(10,Math.abs(speed))));noise?.setAttribute('baseFrequency',`${.009+Math.abs(px)*.008} ${.015+Math.abs(py)*.015}`);footer.style.setProperty('--warp',`${Math.max(-5,Math.min(5,speed*.2+px*3))}deg`);}}
  later(tick);
 }
 later(tick);
 dispose=()=>{active=false;controller.abort();frames.forEach(cancelAnimationFrame);mirror?.remove();document.body.classList.remove('motion-ready')};
}
