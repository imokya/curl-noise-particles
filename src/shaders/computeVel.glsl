#pragma glslify: curl = require(./noise/curl4)

uniform vec3 mouse3d;
uniform sampler2D textureDefaultPosition;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 texturePos = texture2D(texturePosition, uv);
  vec4 textureVel = texture2D(textureVelocity, uv);

  
  vec3 vel = textureVel.xyz;
  vec3 pos = texturePos.xyz;
  vel += curl(pos * 0.02, 0.0, 0.05);
  vel *= 0.6;

  gl_FragColor = vec4(vel, 1.0);
}