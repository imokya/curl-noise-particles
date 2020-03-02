uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
varying float vLife;

#include <common>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>


void main() {
  vec4 pos = texture2D(texturePosition, uv);
  vec4 vel = texture2D(textureVelocity, uv);

  vec4 worldPosition = modelMatrix * vec4(pos.xyz, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  vLife = pos.w;

  gl_PointSize = 1300.0 / length(mvPosition.xyz) * smoothstep(0.0, 0.2, pos.w);

  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
  #include <shadowmap_vertex>
}