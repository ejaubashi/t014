// The cards use a subdivided canvas surface so the image itself bends.
export function createIntro(intro, portrait, complete) {
 const canvas=document.createElement('canvas');canvas.className='intro-surface';intro.append(canvas);
 const ctx=canvas.getContext('2d');const images=[...intro.querySelectorAll('.intro-strip img')];
 const start=performance.now();let stopped=false;
 const clamp=v=>Math.max(0,Math.min(1,v));const ease=v=>1-Math.pow(1-clamp(v),3);
 const render=now=>{
  if(stopped)return;
  const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio,2);
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const t=(now-start)/1000;const opening=ease((t-2.3)/.85);const gathering=ease((t-3.9)/1.0);
  const rect=portrait.getBoundingClientRect();
  intro.style.setProperty('--intro-open',opening);intro.style.setProperty('--intro-gather',gathering);
  if(t>3.9){intro.classList.add('revealing');document.body.classList.add('motion-ready')}
  if(t>2.3)images.forEach((img,i)=>{
   if(!img.complete||!img.naturalWidth)return;
   const offset=i-5;
   const spread=offset*w*.0915*opening;
   const folded=w/2+spread;
   const x=folded+(rect.left+rect.width/2-folded)*gathering;
   const arc=Math.abs(offset)*h*.045*Math.sin(gathering*Math.PI);
   const y=h*.52+(rect.top+rect.height/2-h*.52)*gathering-arc;
   const cw=(w*.0625+(rect.width-w*.0625)*gathering)*Math.max(.02,opening);
   const ch=w*.078+(rect.height-w*.078)*gathering;
   const bend=(1-gathering)*Math.sin(offset*.7+t*2)*ch*.09;
   ctx.globalAlpha=i===5?1:1-ease((gathering-.7)/.3);
   // 40 columns turn a flat image into a bowed card, including its texture.
   for(let s=0;s<40;s++){
    const u=s/40;const shift=Math.sin(u*Math.PI)*bend;
    const stretch=1+(Math.abs(u-.5)*2)*.05*(1-gathering);
    ctx.drawImage(img,img.naturalWidth*u,0,img.naturalWidth/40,img.naturalHeight,x-cw/2+u*cw,y-ch/2+shift,cw/40+.7,ch*stretch);
   }
  });
  ctx.globalAlpha=1;
  if(t>=5.05){complete();return}
  id=requestAnimationFrame(render);
 };
 let id=requestAnimationFrame(render);
 return()=>{stopped=true;cancelAnimationFrame(id);canvas.remove()};
}

// Local, decaying pointer impulses displace a texture; the rest of the mark stays still.
export function createLiquidFooter(footer,logo,initialImage) {
 const canvas=document.createElement('canvas');canvas.className='liquid-footer';canvas.setAttribute('aria-hidden','true');footer.append(canvas);
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
 if(!gl){canvas.remove();return null}
 const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
 const fragment=`precision mediump float;
 varying vec2 uv;uniform sampler2D scene;uniform sampler2D picture;uniform vec3 trail[12];uniform vec2 size;uniform float time;uniform float energy;uniform vec3 tint;
 void main(){
 vec2 p=vec2(uv.x,1.-uv.y),q=p;float mask=0.;vec2 latest=trail[0].xy;
 for(int i=0;i<12;i++){
 vec2 delta=(p-trail[i].xy)*vec2(size.x/size.y,1.);float d=length(delta);float influence=exp(-d*d*90.)*trail[i].z;
 float wave=sin(d*48.-time*5.)*influence;
 q+=normalize(delta+vec2(.0001))*wave*.012;
 mask=max(mask,influence);
 }
 vec3 color=texture2D(scene,vec2(q.x,1.-q.y)).rgb;
 vec2 picUV=(q-latest)*vec2(size.x/size.y*1.9,1.9)+.5;
 picUV+=vec2(sin(q.y*15.+time)*.07,cos(q.x*12.-time)*.025)*mask;
 vec3 photo=texture2D(picture,vec2(clamp(picUV.x,0.,1.),1.-clamp(picUV.y,0.,1.))).rgb;
 float inside=step(0.,picUV.x)*step(picUV.x,1.)*step(0.,picUV.y)*step(picUV.y,1.);
 vec3 tinted=photo*tint;
 color=mix(color,color*.35+tinted*.65,mask*inside*.78);
 float grain=fract(sin(dot(p*size,vec2(12.9898,78.233)))*43758.5453)-.5;
 gl_FragColor=vec4(color+grain*.024,1.);
 }`;
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){canvas.remove();return null}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const loc=Object.fromEntries(['scene','picture','trail[0]','size','time','energy','tint'].map(k=>[k,gl.getUniformLocation(program,k)]));
 const makeTexture=unit=>{const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return tex};
 const sceneTexture=makeTexture(0),imageTexture=makeTexture(1);
 gl.uniform1i(loc.scene,0);gl.uniform1i(loc.picture,1);
 const palette=getComputedStyle(footer);
 const tint=palette.getPropertyValue('--footer-bg').trim();
 gl.uniform3f(loc.tint,...[1,3,5].map(i=>parseInt(tint.slice(i,i+2),16)/255));
 const source=document.createElement('canvas'),context=source.getContext('2d');
 let lastTime=performance.now();
 let lastWidth=0,lastHeight=0,photo=new Image(),pendingImage=initialImage,live=true;
 const upload=(unit,texture,image)=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image)};
 photo.onload=()=>{if(live)upload(1,imageTexture,photo)};photo.src=initialImage;
 const trail=Array.from({length:12},()=>({x:.5,y:.5,power:0}));let mx=.5,my=.5,moving=0;
 const pointer=e=>{const r=footer.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height;moving=1};
 footer.addEventListener('pointermove',pointer);footer.classList.add('liquid-active');
 const svgImage=new Image();let svgReady=false;
 svgImage.onload=()=>{svgReady=true;lastWidth=0};svgImage.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(logo.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace('fill="currentColor"',`fill="${getComputedStyle(footer).getPropertyValue('--footer-ink').trim()}"`));
 function draw(now){
  const dt=Math.min(100,now-lastTime);lastTime=now;
  const r=footer.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight)return;
  const dpr=Math.min(devicePixelRatio,1,1600/r.width),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
  if(w!==lastWidth||h!==lastHeight){
   canvas.width=w;canvas.height=h;source.width=w;source.height=h;gl.viewport(0,0,w,h);
   context.fillStyle=palette.getPropertyValue('--footer-bg').trim();context.fillRect(0,0,w,h);
   const mark=footer.querySelector('.footer-mark').getBoundingClientRect();
   if(svgReady)context.drawImage(svgImage,16*dpr,(mark.top-r.top)*dpr,(r.width-32)*dpr,mark.height*dpr);
   upload(0,sceneTexture,source);lastWidth=w;lastHeight=h;
  }
  const follow=1-Math.exp(-dt/70),fade=Math.exp(-dt/180);
  for(let i=11;i>0;i--){trail[i].x+=(trail[i-1].x-trail[i].x)*follow;trail[i].y+=(trail[i-1].y-trail[i].y)*follow;trail[i].power+=(trail[i-1].power*.8-trail[i].power)*follow}
  trail[0].x+=(mx-trail[0].x)*.15;trail[0].y+=(my-trail[0].y)*.15;trail[0].power+=(moving-trail[0].power)*follow;moving*=fade;
  gl.uniform3fv(loc['trail[0]'],new Float32Array(trail.flatMap(t=>[t.x,t.y,t.power])));gl.uniform2f(loc.size,w,h);gl.uniform1f(loc.time,now*.001);gl.drawArrays(gl.TRIANGLES,0,6);if(svgReady)canvas.dataset.ready='true';
 }
 return{draw,setImage(src){if(src!==pendingImage){pendingImage=src;photo.src=src}},destroy(){live=false;footer.removeEventListener('pointermove',pointer);footer.classList.remove('liquid-active');canvas.remove();gl.deleteTexture(sceneTexture);gl.deleteTexture(imageTexture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);gl.getExtension('WEBGL_lose_context')?.loseContext()}};
}

export function createPreviewSurface(image){
 if(!image)return null;
 const canvas=document.createElement('canvas');canvas.className='preview-surface';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d');
 return{draw(x,y,velocity){
  const visible=image.classList.contains('visible');canvas.classList.toggle('visible',visible);
  if(!visible||!image.complete||!image.naturalWidth)return;
  const w=Math.min(350,Math.max(160,innerWidth*.18)),h=Math.min(465,Math.max(215,innerWidth*.24)),dpr=Math.min(devicePixelRatio,2);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.style.left=x+'px';canvas.style.top=y+'px';canvas.style.transform=`translate(-50%,-50%) rotate(${Math.max(-10,Math.min(10,velocity*.4))}deg)`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const bend=Math.max(-h*.12,Math.min(h*.12,velocity*2.5));
  for(let s=0;s<48;s++){const u=s/48;const offset=Math.sin(u*Math.PI)*bend;ctx.drawImage(image,image.naturalWidth*u,0,image.naturalWidth/48,image.naturalHeight,u*w,Math.abs(bend)+offset,w/48+.5,h-Math.abs(bend)*2)}
 },destroy(){canvas.remove()}};
}
