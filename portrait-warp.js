/* Cursor-driven mesh warp for the hero portrait.
   A WebGL grid whose vertices are pulled toward the pointer with a gaussian
   falloff, released with a spring. Falls back to the plain <img> silently. */
(function () {
  var host = document.querySelector('.portrait') || document.querySelector('.hs-portrait');
  if (!host) return;
  var img = host.querySelector('img');
  if (!img) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  if (!matchMedia('(pointer:fine)').matches) return;

  function start() {
    var cv = document.createElement('canvas');
    cv.className = 'hs-warp';
    var gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true, preserveDrawingBuffer: true });
    if (!gl) return;
    host.appendChild(cv);
    img.style.opacity = '0';

    var VS = [
      'attribute vec2 a;varying vec2 v;uniform vec2 m;uniform float s;uniform float r;',
      'void main(){v=a;vec2 d=a-m;float f=exp(-dot(d,d)/(r*r));',
      'float e=smoothstep(0.0,0.16,a.x)*smoothstep(0.0,0.16,1.0-a.x)*smoothstep(0.0,0.16,a.y)*smoothstep(0.0,0.16,1.0-a.y);',
      'vec2 p=a-d*f*s*e;',
      'p+= (a-vec2(0.5))*f*s*e*0.10;',
      'gl_Position=vec4(p.x*2.0-1.0,1.0-p.y*2.0,0.0,1.0);}'
    ].join('');
    var FS = 'precision mediump float;varying vec2 v;uniform sampler2D t;void main(){gl_FragColor=texture2D(t,v);}';

    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); img.style.opacity = ''; return; }
    gl.useProgram(pr);

    var N = 56, verts = [], idx = [];
    for (var y = 0; y <= N; y++) for (var x = 0; x <= N; x++) verts.push(x / N, y / N);
    for (var yy = 0; yy < N; yy++) for (var xx = 0; xx < N; xx++) {
      var i0 = yy * (N + 1) + xx, i1 = i0 + 1, i2 = i0 + N + 1, i3 = i2 + 1;
      idx.push(i0, i2, i1, i1, i2, i3);
    }
    var vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    var uM = gl.getUniformLocation(pr, 'm'), uS = gl.getUniformLocation(pr, 's'), uR = gl.getUniformLocation(pr, 'r');
    gl.uniform1f(uR, 0.30);

    function resize() {
      var b = host.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(b.width * d));
      cv.height = Math.max(1, Math.round(b.height * d));
      gl.viewport(0, 0, cv.width, cv.height);
    }
    resize();
    addEventListener('resize', resize, { passive: true });

    var mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;  // pointer, smoothed
    var s = 0, sv = 0, ts = 0;                      // strength spring
    var raf = null, dirty = true;

    function frame() {
      mx += (tmx - mx) * 0.16; my += (tmy - my) * 0.16;
      sv += (ts - s) * 0.16;   // spring: stiffness
      sv *= 0.76;              // damping -> gentle overshoot on release
      s += sv;
      gl.uniform2f(uM, mx, my);
      gl.uniform1f(uS, s);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      var settled = Math.abs(ts - s) < 0.0008 && Math.abs(sv) < 0.0008 &&
        Math.abs(tmx - mx) < 0.0015 && Math.abs(tmy - my) < 0.0015;
      if (settled && ts === 0) { raf = null; return; }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    frame();

    host.addEventListener('pointerenter', function () { ts = 0.34; kick(); });
    host.addEventListener('pointerleave', function () { ts = 0; kick(); });
    host.addEventListener('pointermove', function (e) {
      var b = host.getBoundingClientRect();
      tmx = (e.clientX - b.left) / b.width;
      tmy = (e.clientY - b.top) / b.height;
      ts = 0.34; kick();
    }, { passive: true });
  }

  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start, { once: true });
})();
