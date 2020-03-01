uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

#include <common>
#include <shadowmap_pars_vertex>

void main() {
  vec4 pos = texture2D(texturePosition, uv);
  vec4 vel = texture2D(textureVelocity, uv);

  vec4 worldPosition = modelMatrix * vec4(pos.xyz, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  gl_PointSize = 1300.0 / length(mvPosition.xyz);

  gl_Position = projectionMatrix * mvPosition;

}