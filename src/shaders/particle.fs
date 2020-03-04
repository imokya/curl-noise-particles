#include <common>
#include <packing>
#include <bsdfs>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>


varying float vLife;

void main() {
  vec3 color1 = vec3(134.0/255.0, 37.0/255.0, 25.0/255.0);
  vec3 color2 = vec3(174.0/255.0, 95.0/255.0, 57.0/255.0);

  vec3 outgoingLight = mix(color1, color2, smoothstep(0.9, 0.1, vLife));

  float shadowMask = max(getShadowMask(), 0.75);
  outgoingLight *= shadowMask;

  gl_FragColor = vec4(outgoingLight, 1.0);
  #include <fog_fragment>
}
