uniform sampler2D texturePosition;

varying vec4 vWorldPosition;

void main() {

    vec4 texturePos = texture2D(texturePosition, position.xy);

    vec4 worldPosition = modelMatrix * vec4(texturePos.xyz, 1.0);
    vec4 mvPosition = viewMatrix * worldPosition;

    gl_PointSize = 50.0 / length(mvPosition.xyz);

    vWorldPosition = worldPosition;

    gl_Position = projectionMatrix * mvPosition;

}
