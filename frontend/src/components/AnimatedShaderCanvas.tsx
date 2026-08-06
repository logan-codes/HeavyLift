import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;

#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(in vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  float a = rnd(i), b = rnd(i + vec2(1, 0)), c = rnd(i + vec2(0, 1)), d = rnd(i + 1.);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main(void) {
  vec2 uv = (FC - .5 * R) / MN;
  
  // Warm Off-White Cream Light Background matching reference image
  vec3 baseBg = vec3(0.97, 0.96, 0.94);
  
  // Subtle organic background cloud noise
  float bgNoise = noise(uv * 3.0 + vec2(T * 0.08, -T * 0.04));
  vec3 bgCol = mix(baseBg, vec3(0.94, 0.92, 0.88), bgNoise * 0.35);
  
  vec3 starCol = vec3(0.0);
  
  // 7 Straight Parallel Horizontal Golden Comet Laser Beams
  float yPositions[7] = float[7](0.28, 0.16, 0.05, -0.06, -0.16, -0.26, -0.36);
  float speeds[7]     = float[7](0.38, 0.44, 0.40, 0.48, 0.35, 0.42, 0.39);
  float headOffsets[7] = float[7](0.0,  0.8,  1.6,  0.4,  1.2,  2.0,  0.6);

  for (int i = 0; i < 7; i++) {
    float yPos = yPositions[i];
    float speed = speeds[i];
    float cycle = 3.6;
    float headX = mod((T * speed) + headOffsets[i], cycle) - (cycle * 0.5);
    
    vec2 p = vec2(uv.x - headX, uv.y - yPos);
    
    // Core intense golden glowing head point
    float headDist = length(p);
    float headGlow = 0.0035 / (headDist + 0.0008);
    
    // Straight Horizontal Golden Laser Tail extending leftwards
    float tail = 0.0;
    if (p.x < 0.0 && p.x > -2.4) {
      float n = noise(vec2(p.x * 12.0 + T * 2.0, p.y * 30.0 + float(i)));
      float streakDist = max(-p.x * 0.012, abs(p.y));
      tail = 0.0028 * (1.0 + 0.25 * n) / (streakDist + 0.0006);
      tail *= smoothstep(-2.4, -0.02, p.x);
    }
    
    // Warm Golden Amber Beam Tinting
    vec3 beamTint = mix(vec3(1.0, 0.72, 0.22), vec3(1.0, 0.92, 0.55), clamp(headGlow * 0.35, 0.0, 1.0));
    starCol += (headGlow + tail) * beamTint;
  }
  
  // Ambient composite glow
  vec3 finalCol = mix(bgCol, bgCol + starCol * 0.9, min(length(starCol), 1.0));
  finalCol += starCol * 0.25;
  
  O = vec4(finalCol, 1.0);
}`;

interface AnimatedShaderCanvasProps {
  opacity?: number;
}

export const AnimatedShaderCanvas: React.FC<AnimatedShaderCanvasProps> = ({ opacity = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const opacityRef = useRef(opacity);
  opacityRef.current = opacity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'resolution');
    const timeLoc = gl.getUniformLocation(program, 'time');

    let animationFrameId: number;
    const startTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      const scale = Math.min(window.devicePixelRatio || 1, 1.25) * 0.75;
      const width = Math.floor((canvas.clientWidth || window.innerWidth) * scale);
      const height = Math.floor((canvas.clientHeight || window.innerHeight) * scale);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = () => {
      if (opacityRef.current > 0.01) {
        resize();
        const currentTime = (performance.now() - startTime) / 1000;
        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.uniform1f(timeLoc, currentTime);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        opacity: opacity,
        transition: 'opacity 200ms ease-out',
        pointerEvents: 'none',
        willChange: 'opacity',
      }}
    />
  );
};
