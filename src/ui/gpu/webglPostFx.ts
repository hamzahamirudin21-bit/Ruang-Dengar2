/**
 * Mesin Post-Processing GPU WebGL2 (GLSL 300 es) bergaya HD-2D Modern (*Octopath Traveler II*).
 * Menjalankan 5 efek shader real-time dalam 1 pass GPU berkecepatan penuh:
 *  1. Selective Emissive Bloom & Warm Halation (pendar lampu, monitor, & percikan las)
 *  2. HD-2D Tilt-Shift Depth of Field (fokus tajam di 11 ruangan, bokeh lembut di pinggir atas/bawah)
 *  3. Volumetric God-Rays (berkas cahaya matahari dinamis yang bergeser mengikuti sudut matahari)
 *  4. ACES Filmic Tone Mapping + Dynamic Time-of-Day Color Grading + Micro-Vibrance
 *  5. Interactive Cursor Specular Spotlight (sorotan hangat halus mengikuti kursor pemain)
 *
 * Aman 100% di Node/headless & browser tanpa WebGL2 (otomatis mengembalikan null / no-op).
 */

export interface WebGLPostFxUniforms {
  timeSeconds: number;
  reducedMotion: boolean;
  gradeRgb: readonly [number, number, number];
  godRayAngle: number;
  godRayIntensity: number;
  bloomStrength: number;
  tiltShiftStrength: number;
  /** Posisi kursor ternormalisasi 0..1 (-1 bila kursor di luar kanvas). */
  pointerNormX: number;
  pointerNormY: number;
}

const VERT_SRC = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);
out vec2 vUv;
void main() {
  vec2 p = POS[gl_VertexID];
  vUv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTex;
uniform vec2 uTexelSize;
uniform float uTime;
uniform float uReduced;
uniform vec3 uGradeRgb;
uniform float uGodRayAngle;
uniform float uGodRayIntensity;
uniform float uBloomStrength;
uniform float uTiltShift;
uniform vec2 uPointer;

// Kurva ACES Filmic lembut agar warna kaya & sorotan tak pecah
vec3 acesSoft(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// Ekstraksi piksel terang (emissive bloom & halation hangat)
vec3 brightSample(vec2 uv) {
  vec3 c = texture(uTex, clamp(uv, vec2(0.001), vec2(0.999))).rgb;
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float mask = smoothstep(0.68, 1.02, lum);
  return c * mask;
}

void main() {
  vec2 uv = vUv;

  // 1. HD-2D Tilt-Shift Depth of Field (tajam 100% di seluruh area 11 ruangan tengah, bokeh lembut di pinggir taman atas/bawah)
  float topBand = smoothstep(0.11, 0.0, uv.y);
  float botBand = smoothstep(0.89, 1.0, uv.y);
  float blurAmt = max(topBand, botBand) * uTiltShift;

  vec3 baseColor = texture(uTex, uv).rgb;
  if (blurAmt > 0.02) {
    vec2 r = uTexelSize * (1.8 + blurAmt * 2.8);
    vec3 acc = baseColor * 0.24;
    acc += texture(uTex, clamp(uv + vec2( r.x,  0.0), 0.001, 0.999)).rgb * 0.11;
    acc += texture(uTex, clamp(uv + vec2(-r.x,  0.0), 0.001, 0.999)).rgb * 0.11;
    acc += texture(uTex, clamp(uv + vec2( 0.0,  r.y), 0.001, 0.999)).rgb * 0.11;
    acc += texture(uTex, clamp(uv + vec2( 0.0, -r.y), 0.001, 0.999)).rgb * 0.11;
    acc += texture(uTex, clamp(uv + vec2( r.x,  r.y) * 0.75, 0.001, 0.999)).rgb * 0.08;
    acc += texture(uTex, clamp(uv + vec2(-r.x,  r.y) * 0.75, 0.001, 0.999)).rgb * 0.08;
    acc += texture(uTex, clamp(uv + vec2( r.x, -r.y) * 0.75, 0.001, 0.999)).rgb * 0.08;
    acc += texture(uTex, clamp(uv + vec2(-r.x, -r.y) * 0.75, 0.001, 0.999)).rgb * 0.08;
    baseColor = mix(baseColor, acc, blurAmt * 0.72);
  }

  // 2. Selective Emissive Bloom & Warm Halation (kernel 9-tap dua cincin)
  vec3 bloom = vec3(0.0);
  if (uBloomStrength > 0.005) {
    vec2 b1 = uTexelSize * 3.2;
    vec2 b2 = uTexelSize * 7.5;
    bloom += brightSample(uv) * 0.20;
    bloom += brightSample(uv + vec2( b1.x,  0.0)) * 0.11;
    bloom += brightSample(uv + vec2(-b1.x,  0.0)) * 0.11;
    bloom += brightSample(uv + vec2( 0.0,  b1.y)) * 0.11;
    bloom += brightSample(uv + vec2( 0.0, -b1.y)) * 0.11;
    bloom += brightSample(uv + vec2( b2.x,  b2.y)) * 0.09;
    bloom += brightSample(uv + vec2(-b2.x,  b2.y)) * 0.09;
    bloom += brightSample(uv + vec2( b2.x, -b2.y)) * 0.09;
    bloom += brightSample(uv + vec2(-b2.x, -b2.y)) * 0.09;
    // Halation hangat halus seperti film anime modern
    bloom *= vec3(1.06, 1.01, 0.94);
  }

  // 3. Volumetric God-Rays (berkas cahaya matahari bervolume melintasi diorama)
  float animT = mix(uTime, 0.0, uReduced);
  float rayCoord = uv.x * cos(uGodRayAngle) + uv.y * sin(uGodRayAngle);
  float shaft1 = pow(max(0.0, sin(rayCoord * 13.0 + animT * 0.22)), 5.0);
  float shaft2 = pow(max(0.0, sin(rayCoord * 23.0 - animT * 0.14 + 1.7)), 6.0);
  float topFade = smoothstep(0.92, 0.04, uv.y);
  float rayMask = (shaft1 * 0.65 + shaft2 * 0.35) * topFade * uGodRayIntensity * 0.085;
  vec3 rayColor = mix(vec3(1.0, 0.97, 0.86), vec3(1.0, 0.80, 0.48), clamp((uGradeRgb.r - 1.0) * 9.0, 0.0, 1.0));

  // 4. Interactive Cursor Specular Warm Lift (sorotan lembut saat menjelajahi ruangan)
  float cursorGlow = 0.0;
  if (uPointer.x >= 0.0 && uPointer.y >= 0.0) {
    float aspect = uTexelSize.y / max(uTexelSize.x, 0.00001);
    vec2 diff = (uv - uPointer) * vec2(aspect, 1.0);
    float dist = length(diff);
    cursorGlow = exp(-dist * dist * 16.0) * 0.055;
  }

  // 5. Komposisi + Dynamic Time-of-Day Color Grading + ACES Filmic Mix + Vignette Optik Hangat
  vec3 col = baseColor * uGradeRgb;
  col += bloom * uBloomStrength;
  col += rayColor * rayMask;
  col += vec3(1.0, 0.96, 0.85) * cursorGlow;

  // Sentuhan vibrance + ACES filmic lembut (campuran 32% agar warna pastel tetap cerah & jernih)
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, 1.08);
  vec3 filmic = acesSoft(col * 1.12);
  col = mix(clamp(col, 0.0, 1.0), filmic, 0.28);

  // Vinyet optik sudut lembut bergaya lensa kamera sinema
  vec2 vigUv = (uv - 0.5) * vec2(1.15, 1.05);
  float vig = smoothstep(0.92, 0.34, length(vigUv));
  col *= mix(0.88, 1.0, vig);

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export class WebGLPostFxRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private vao: WebGLVertexArrayObject | null;
  private loc: {
    uTex: WebGLUniformLocation | null;
    uTexelSize: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uReduced: WebGLUniformLocation | null;
    uGradeRgb: WebGLUniformLocation | null;
    uGodRayAngle: WebGLUniformLocation | null;
    uGodRayIntensity: WebGLUniformLocation | null;
    uBloomStrength: WebGLUniformLocation | null;
    uTiltShift: WebGLUniformLocation | null;
    uPointer: WebGLUniformLocation | null;
  };
  private disposed = false;

  private constructor(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    texture: WebGLTexture,
    vao: WebGLVertexArrayObject | null
  ) {
    this.gl = gl;
    this.program = program;
    this.texture = texture;
    this.vao = vao;
    this.loc = {
      uTex: gl.getUniformLocation(program, 'uTex'),
      uTexelSize: gl.getUniformLocation(program, 'uTexelSize'),
      uTime: gl.getUniformLocation(program, 'uTime'),
      uReduced: gl.getUniformLocation(program, 'uReduced'),
      uGradeRgb: gl.getUniformLocation(program, 'uGradeRgb'),
      uGodRayAngle: gl.getUniformLocation(program, 'uGodRayAngle'),
      uGodRayIntensity: gl.getUniformLocation(program, 'uGodRayIntensity'),
      uBloomStrength: gl.getUniformLocation(program, 'uBloomStrength'),
      uTiltShift: gl.getUniformLocation(program, 'uTiltShift'),
      uPointer: gl.getUniformLocation(program, 'uPointer'),
    };
  }

  /** Membuat instance WebGL2 HD-2D Post-FX secara aman; null bila WebGL2 tidak tersedia. */
  static create(targetCanvas: HTMLCanvasElement): WebGLPostFxRenderer | null {
    try {
      const gl = targetCanvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      });
      if (!gl) return null;

      const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
      if (!vs || !fs) {
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        return null;
      }

      const program = gl.createProgram();
      if (!program) {
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return null;
      }
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
      }

      const texture = gl.createTexture();
      if (!texture) {
        gl.deleteProgram(program);
        return null;
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const vao = gl.createVertexArray();
      return new WebGLPostFxRenderer(gl, program, texture, vao);
    } catch {
      return null;
    }
  }

  renderFromCanvas(sourceCanvas: HTMLCanvasElement, uniforms: WebGLPostFxUniforms): boolean {
    if (this.disposed) return false;
    try {
      const gl = this.gl;
      if (gl.isContextLost()) return false;
      const w = sourceCanvas.width;
      const h = sourceCanvas.height;
      if (w <= 0 || h <= 0) return false;

      const target = gl.canvas as HTMLCanvasElement;
      if (target.width !== w || target.height !== h) {
        target.width = w;
        target.height = h;
      }

      gl.viewport(0, 0, w, h);
      gl.useProgram(this.program);
      if (this.vao) gl.bindVertexArray(this.vao);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);

      gl.uniform1i(this.loc.uTex, 0);
      gl.uniform2f(this.loc.uTexelSize, 1 / w, 1 / h);
      gl.uniform1f(this.loc.uTime, uniforms.timeSeconds);
      gl.uniform1f(this.loc.uReduced, uniforms.reducedMotion ? 1.0 : 0.0);
      gl.uniform3f(
        this.loc.uGradeRgb,
        uniforms.gradeRgb[0],
        uniforms.gradeRgb[1],
        uniforms.gradeRgb[2]
      );
      gl.uniform1f(this.loc.uGodRayAngle, uniforms.godRayAngle);
      gl.uniform1f(this.loc.uGodRayIntensity, uniforms.godRayIntensity);
      gl.uniform1f(this.loc.uBloomStrength, uniforms.bloomStrength);
      gl.uniform1f(this.loc.uTiltShift, uniforms.tiltShiftStrength);
      gl.uniform2f(this.loc.uPointer, uniforms.pointerNormX, uniforms.pointerNormY);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    } catch {
      return false;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    try {
      const gl = this.gl;
      if (this.vao) gl.deleteVertexArray(this.vao);
      gl.deleteTexture(this.texture);
      gl.deleteProgram(this.program);
    } catch {
      /* abaikan */
    }
  }
}
