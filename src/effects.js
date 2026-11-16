// The cards use a subdivided canvas surface so the image itself bends.
export function createIntro(
  intro,
  portrait,
  complete,
  { duration = 1.8 } = {},
) {
  const canvas = document.createElement("canvas");
  canvas.className = "intro-surface";
  intro.append(canvas);
  const ctx = canvas.getContext("2d");
  const images = [...intro.querySelectorAll(".intro-strip img")];
  const start = performance.now();
  let stopped = false,
    lastFrame = 0;
  const bitmaps = new Map();
  images.forEach((img) => {
    img
      .decode()
      .then(() => createImageBitmap(img))
      .then((bitmap) => {
        if (stopped) bitmap.close();
        else bitmaps.set(img, bitmap);
      })
      .catch(() => {});
  });
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => 1 - Math.pow(1 - clamp(v), 3);
  const render = (now) => {
    if (stopped) return;
    if (now - lastFrame < 32) {
      id = requestAnimationFrame(render);
      return;
    }
    lastFrame = now;
    const w = innerWidth,
      h = innerHeight,
      dpr = Math.min(devicePixelRatio, 1.5);
    if (
      canvas.width !== Math.round(w * dpr) ||
      canvas.height !== Math.round(h * dpr)
    ) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const t = (((now - start) / 1000) * 5.05) / duration;
    const opening = ease((t - 2.3) / 0.85);
    const gathering = ease((t - 3.9) / 1.0);
    const rect = portrait.getBoundingClientRect();
    intro.style.setProperty("--intro-open", opening);
    intro.style.setProperty("--intro-gather", gathering);
    if (t > 3.9) {
      intro.classList.add("revealing");
      document.body.classList.add("motion-ready");
    }
    if (t > 2.3)
      images.forEach((img, i) => {
        const bitmap = bitmaps.get(img);
        if (!bitmap) return;
        const offset = i - 5;
        const spread = offset * w * 0.0915 * opening;
        const folded = w / 2 + spread;
        const x = folded + (rect.left + rect.width / 2 - folded) * gathering;
        const arc =
          Math.abs(offset) * h * 0.045 * Math.sin(gathering * Math.PI);
        const y =
          h * 0.52 + (rect.top + rect.height / 2 - h * 0.52) * gathering - arc;
        const cw =
          (w * 0.0625 + (rect.width - w * 0.0625) * gathering) *
          Math.max(0.02, opening);
        const ch = w * 0.078 + (rect.height - w * 0.078) * gathering;
        const bend =
          (1 - gathering) * Math.sin(offset * 0.7 + t * 2) * ch * 0.09;
        ctx.globalAlpha = i === 5 ? 1 : 1 - ease((gathering - 0.7) / 0.3);
        // Subdivided, predecoded image strips bend the surface without decoding during a frame.
        const columns = w <= 700 ? 10 : 24;
        for (let s = 0; s < columns; s++) {
          const u = s / columns;
          const shift = Math.sin(u * Math.PI) * bend;
          const stretch = 1 + Math.abs(u - 0.5) * 2 * 0.05 * (1 - gathering);
          ctx.drawImage(
            bitmap,
            bitmap.width * u,
            0,
            bitmap.width / columns,
            bitmap.height,
            x - cw / 2 + u * cw,
            y - ch / 2 + shift,
            cw / columns + 0.7,
            ch * stretch,
          );
        }
      });
    ctx.globalAlpha = 1;
    if (t >= 5.05) {
      bitmaps.forEach((b) => b.close());
      bitmaps.clear();
      complete();
      return;
    }
    id = requestAnimationFrame(render);
  };
  let id = requestAnimationFrame(render);
  return () => {
    stopped = true;
    cancelAnimationFrame(id);
    bitmaps.forEach((b) => b.close());
    bitmaps.clear();
    canvas.remove();
  };
}

// Local, decaying pointer impulses displace a texture; the rest of the mark stays still.
export function createLiquidFooter(
  footer,
  logo,
  initialImage,
  wake = () => {},
) {
  const canvas = document.createElement("canvas");
  canvas.className = "liquid-footer";
  canvas.setAttribute("aria-hidden", "true");
  footer.append(canvas);
  let gl;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
  } catch {
    canvas.remove();
    return null;
  }
  if (!gl) {
    canvas.remove();
    return null;
  }
  const vertex = `attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision mediump float;
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
  const compile = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw Error(gl.getShaderInfoLog(s));
    return s;
  };
  let vs, fs;
  try {
    vs = compile(gl.VERTEX_SHADER, vertex);
    fs = compile(gl.FRAGMENT_SHADER, fragment);
  } catch {
    canvas.remove();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.remove();
    return null;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const pos = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const loc = Object.fromEntries(
    ["scene", "picture", "trail[0]", "size", "time", "energy", "tint"].map(
      (k) => [k, gl.getUniformLocation(program, k)],
    ),
  );
  const makeTexture = (unit) => {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Keep both samplers complete even if an artwork request fails.
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );
    return tex;
  };
  const sceneTexture = makeTexture(0),
    imageTexture = makeTexture(1);
  gl.uniform1i(loc.scene, 0);
  gl.uniform1i(loc.picture, 1);
  const palette = getComputedStyle(footer);
  const tint = palette.getPropertyValue("--footer-bg").trim();
  gl.uniform3f(
    loc.tint,
    ...[1, 3, 5].map((i) => parseInt(tint.slice(i, i + 2), 16) / 255),
  );
  const source = document.createElement("canvas"),
    context = source.getContext("2d");
  let lastTime = performance.now();
  let dirty = true,
    lost = false;
  let lastWidth = 0,
    lastHeight = 0,
    photo = new Image(),
    pendingImage = initialImage,
    live = true;
  const upload = (unit, texture, image) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };
  photo.onload = () => {
    if (live && !lost) {
      upload(1, imageTexture, photo);
      dirty = true;
      wake();
    }
  };
  photo.src = initialImage;
  const trail = Array.from({ length: 12 }, () => ({
      x: 0.5,
      y: 0.5,
      power: 0,
    })),
    trailData = new Float32Array(36);
  let mx = 0.5,
    my = 0.5,
    moving = 0,
    lastInteraction = -Infinity;
  const pointer = (e) => {
    const r = footer.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width;
    my = (e.clientY - r.top) / r.height;
    moving = 1;
    lastInteraction = performance.now();
    wake();
  };
  footer.addEventListener("pointermove", pointer);
  const contextLost = (e) => {
    e.preventDefault();
    lost = true;
    footer.classList.remove("liquid-active");
    canvas.hidden = true;
  };
  canvas.addEventListener("webglcontextlost", contextLost);
  const svgImage = new Image();
  let svgReady = false;
  svgImage.onload = () => {
    svgReady = true;
    lastWidth = 0;
    dirty = true;
    wake();
  };
  svgImage.src =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      logo.replace(
        'fill="currentColor"',
        `fill="${getComputedStyle(footer).getPropertyValue("--footer-ink").trim()}"`,
      ),
    );
  function draw(now, r, mark) {
    if (lost || !live) return;
    const dt = Math.min(100, now - lastTime);
    lastTime = now;
    if (!r || r.bottom <= 0 || r.top >= innerHeight) return;
    let settled = false;
    if (now - lastInteraction > 1000 && trail.some((t) => t.power > 0.002)) {
      moving = 0;
      trail.forEach((t) => (t.power = 0));
      settled = true;
    }
    const energy = Math.max(moving, ...trail.map((t) => t.power));
    if (!dirty && energy < 0.002 && !settled) return;
    const cap = (navigator.hardwareConcurrency || 4) <= 4 ? 1024 : 1600;
    const dpr = Math.min(devicePixelRatio, 1, cap / r.width),
      w = Math.round(r.width * dpr),
      h = Math.round(r.height * dpr);
    if (w !== lastWidth || h !== lastHeight || dirty) {
      canvas.width = w;
      canvas.height = h;
      source.width = w;
      source.height = h;
      gl.viewport(0, 0, w, h);
      context.fillStyle = palette.getPropertyValue("--footer-bg").trim();
      context.fillRect(0, 0, w, h);
      mark =
        mark || footer.querySelector(".footer-mark").getBoundingClientRect();
      if (svgReady)
        context.drawImage(
          svgImage,
          (mark.left - r.left) * dpr,
          (mark.top - r.top) * dpr,
          mark.width * dpr,
          mark.height * dpr,
        );
      upload(0, sceneTexture, source);
      lastWidth = w;
      lastHeight = h;
    }
    const follow = 1 - Math.exp(-dt / 70),
      fade = Math.exp(-dt / 180);
    for (let i = 11; i > 0; i--) {
      trail[i].x += (trail[i - 1].x - trail[i].x) * follow;
      trail[i].y += (trail[i - 1].y - trail[i].y) * follow;
      trail[i].power += (trail[i - 1].power * 0.8 - trail[i].power) * follow;
    }
    trail[0].x += (mx - trail[0].x) * 0.15;
    trail[0].y += (my - trail[0].y) * 0.15;
    trail[0].power += (moving - trail[0].power) * follow;
    moving *= fade;
    for (let i = 0; i < 12; i++) {
      trailData[i * 3] = trail[i].x;
      trailData[i * 3 + 1] = trail[i].y;
      trailData[i * 3 + 2] = trail[i].power;
    }
    gl.uniform3fv(loc["trail[0]"], trailData);
    gl.uniform2f(loc.size, w, h);
    gl.uniform1f(loc.time, now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (svgReady) {
      canvas.dataset.ready = "true";
      footer.classList.add("liquid-active");
    }
    dirty = false;
  }
  return {
    draw,
    get active() {
      return (
        !lost && (dirty || moving > 0.002 || trail.some((t) => t.power > 0.002))
      );
    },
    get needsLayout() {
      return dirty || !lastWidth;
    },
    invalidate() {
      dirty = true;
      wake();
    },
    setImage(src) {
      if (src !== pendingImage) {
        pendingImage = src;
        photo.src = src;
      }
    },
    destroy() {
      live = false;
      footer.removeEventListener("pointermove", pointer);
      canvas.removeEventListener("webglcontextlost", contextLost);
      footer.classList.remove("liquid-active");
      canvas.remove();
      gl.deleteTexture(sceneTexture);
      gl.deleteTexture(imageTexture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

export function createPreviewSurface(image, wake = () => {}) {
  if (!image) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "preview-surface";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  const ctx = canvas.getContext("2d");
  let lastKey = "",
    dirty = true,
    live = true;
  const loaded = () => {
    dirty = true;
    wake();
  };
  image.addEventListener("load", loaded);
  return {
    invalidate() {
      dirty = true;
    },
    draw(x, y, velocity) {
      if (!live) return;
      const visible = image.classList.contains("visible");
      canvas.classList.toggle("visible", visible);
      if (!visible || !image.complete || !image.naturalWidth) return;
      const w = Math.min(350, Math.max(180, innerWidth * 0.18)),
        h = w * 1.28,
        dpr = Math.min(devicePixelRatio, 2);
      const bend = Math.max(-h * 0.1, Math.min(h * 0.1, velocity * 2));
      const key = [image.currentSrc, Math.round(bend * 10), w, dpr].join("|");
      canvas.style.left = x + "px";
      canvas.style.top = y + "px";
      canvas.style.transform = `translate(-50%,-50%) rotate(${Math.max(-8, Math.min(8, velocity * 0.3))}deg)`;
      if (!dirty && key === lastKey) return;
      if (
        canvas.width !== Math.round(w * dpr) ||
        canvas.height !== Math.round(h * dpr)
      ) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let s = 0; s < 40; s++) {
        const u = s / 40;
        ctx.drawImage(
          image,
          image.naturalWidth * u,
          0,
          image.naturalWidth / 40,
          image.naturalHeight,
          u * w,
          Math.abs(bend) + Math.sin(u * Math.PI) * bend,
          w / 40 + 0.5,
          h - Math.abs(bend) * 2,
        );
      }
      lastKey = key;
      dirty = false;
    },
    destroy() {
      live = false;
      image.removeEventListener("load", loaded);
      canvas.remove();
    },
  };
}
