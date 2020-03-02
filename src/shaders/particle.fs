#include <common>
#include <packing>
#include <bsdfs>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>


varying float vLife;

void main() {
  vec3 color1 = vec3(1.0, 1.0, 1.0);
  vec3 color2 = vec3(1.0, 0.0, 0.0);
  vec3 outgoingLight = color1;

  float shadowMask = getShadowMask();
  outgoingLight *= shadowMask;

  gl_FragColor = vec4(outgoingLight, 1.0);
}

//http://jsfiddle.net/awp8vyxs/1/