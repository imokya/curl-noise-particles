uniform vec3 mouse3d;
uniform sampler2D textureDefaultPosition;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  vec4 texturePos = texture2D(texturePosition, uv);
  vec4 textureVel = texture2D(textureVelocity, uv);
  vec4 defaultPos = texture2D(textureDefaultPosition, uv);
  vec3 pos = texturePos.xyz;
  vec3 vel = textureVel.xyz;


  float life = texturePos.w - 0.04;
  vec3 followPos = mouse3d;
  

  if (life < 0.0) {
    texturePos = texture2D(textureDefaultPosition, uv);
    pos = texturePos.xyz * 0.5 + followPos;
    life = 0.5 + fract(texturePos.w * 21.4131 + 0.1);
  } else {
    vec3 delta = followPos - pos;
    pos += delta * 0.001;
    pos += vel;
  }

  gl_FragColor = vec4(pos, life);
}