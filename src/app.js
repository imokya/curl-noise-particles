import * as THREE from 'three'
import GPUComputationRenderer from './libs/GPUComputationRenderer'

import computePosShader from './shaders/computePos.glsl'
import computeVelShader from './shaders/computeVel.glsl'
import particleVertShader from './shaders/particle.vs'
import particleFragShader from './shaders/particle.fs'


import '@/css/style.css'


let scene, camera, renderer
let posTexture, velTexture
let comPosition, comVelocity
let computeRenderer, particle

let particleUniforms, posUniforms, velUniforms


let ray = new THREE.Ray()
let mouse3d = ray.origin
let mouse = new THREE.Vector2()


const TEXTURE_WIDTH = 256
const TEXTURE_HEIGHT = 256
const AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT
const touch = !!('ontouchstart' in window)

let touched = false
let winSize = {
  w: window.innerWidth,
  h: window.innerHeight
}

const clock = new THREE.Clock()
clock.start()


function init() {
  initScene()
  bindEvents()
  initComputeRenderer()
  initLights()
  initParticles()
  render()
}

function initLights() {
  const group = new THREE.Group()

  const ambient = new THREE.AmbientLight(0x333333)
  group.add(ambient)

  const pointLight = new THREE.PointLight(0xffffff, 1, 700)
  pointLight.castShadow = true
  pointLight.shadow.cameraNear = 10
  pointLight.shadow.cameraFar = 700
  pointLight.shadow.bias = 0.1
  pointLight.shadow.mapSize.width = 4096
  pointLight.shadow.mapSize.height = 2048
  group.add(pointLight)

  const directionalLight = new THREE.DirectionalLight(0xba8b8b, 0.5)
  directionalLight.position.set(1, 1, 1)
  group.add(directionalLight)

  const directionalLight2 = new THREE.DirectionalLight(0x8bbab4, 0.3)
  directionalLight2.position.set(1, 1, -1)
  group.add(directionalLight2)

  scene.add(group)
}

function initParticles() {
  const particleGeometry = new THREE.BufferGeometry()
  const position = new Float32Array(AMOUNT * 3)
  const uv = new Float32Array(AMOUNT * 2)
  let index = 0
  for (let i = 0; i < AMOUNT; i++) {
    index = i * 2
    uv[index + 0] = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH
    uv[index + 1] = ~~(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT
  }


  particleGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
  particleGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))

  particleUniforms = THREE.UniformsUtils.merge([
    {
      texturePosition: { value: null },
      textureVelocity: { value: null }
    },
    THREE.UniformsLib.lights
  ])

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: particleVertShader,
    fragmentShader: particleFragShader,
    blending: THREE.NoBlending
  })
  particleMaterial.extensions.drawBuffers = true

  particle = new THREE.Points(particleGeometry, particleMaterial)
  particle.castShadow = true
  particle.receiveShadow = true
  scene.add(particle)

}

function initComputeRenderer() {
  computeRenderer = new GPUComputationRenderer(TEXTURE_WIDTH, TEXTURE_HEIGHT, renderer)

  posTexture = computeRenderer.createTexture()
  velTexture = computeRenderer.createTexture()

  initPosition(posTexture)
  initVelocity(velTexture)

  comPosition = computeRenderer.addVariable('texturePosition', computePosShader, posTexture)
  comVelocity = computeRenderer.addVariable('textureVelocity', computeVelShader, velTexture)

  computeRenderer.setVariableDependencies(comPosition, [comPosition, comVelocity])
  posUniforms = comPosition.material.uniforms
  posUniforms.mouse3d = { type: 'v3', value: new THREE.Vector3() }
  posUniforms.textureDefaultPosition = { value: posTexture.clone() }

  computeRenderer.setVariableDependencies(comVelocity, [comVelocity, comPosition])
  velUniforms = comVelocity.material.uniforms
  velUniforms.mouse3d = { type: 'v3', value: new THREE.Vector3() }
  velUniforms.textureDefaultPosition = { value: posTexture.clone() }


  computeRenderer.init()

}


function initPosition(texture) {
  const data = texture.image.data
  for (let i = 0, l = data.length; i < l; i += 4) {
    const radius = (0.5 + Math.random() * 0.5) * 50
    const phi = (Math.random() - 0.5) * Math.PI
    const theta = Math.random() * Math.PI * 2
    data[i + 0] = radius * Math.cos(theta) * Math.cos(phi)
    data[i + 1] = radius * Math.sin(phi)
    data[i + 2] = radius * Math.sin(theta) * Math.cos(phi)
    data[i + 3] = Math.random()
  }
}

function initVelocity(texture) {
  const data = texture.image.data
  for (let i = 0, l = data.length; i < l; i += 4) {
    data[i + 0] = Math.random() * 20 - 10
    data[i + 1] = Math.random() * 20 - 10
    data[i + 2] = Math.random() * 20 - 10
    data[i + 3] = 0
  }
}

function bindEvents() {
  const touchBegan = touch ? 'touchstart' : 'mousedown'
  const touchMoved = touch ? 'touchmove' : 'mousemove'
  const touchEnded = touch ? 'touchend' : 'mouseup'
  document.addEventListener(touchBegan, onTouchBegan)
  window.addEventListener(touchMoved, onTouchMoved)
  document.addEventListener(touchEnded, onTouchEnded)
  window.addEventListener('resize', setSize, false)
}

function onTouchBegan(e) { }

function onTouchMoved(e) {
  const x = touch ? e.changedTouches[0].pageX : e.pageX
  const y = touch ? e.changedTouches[0].pageY : e.pageY
  mouse.x = (x / winSize.w) * 2 - 1
  mouse.y = -(y / winSize.h) * 2 + 1
}

function onTouchEnded(e) { }

function setSize() {
  winSize.w = window.innerWidth
  winSize.h = window.innerHeight
  renderer.setSize(winSize.w, winSize.h)
  camera.aspect = winSize.w / winSize.h
  camera.updateProjectionMatrix()
}

function initScene() {
  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.enabled = true
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, winSize.w / winSize.h, 10, 3000)
  camera.position.set(0, 0, 400)
  document.body.appendChild(renderer.domElement)
  setSize()
}

function update() {

  const delta = clock.getDelta()

  camera.updateMatrixWorld()
  ray.origin.setFromMatrixPosition(camera.matrixWorld)
  ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(ray.origin).normalize()
  const distance = ray.origin.length() / Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
  ray.origin.add(ray.direction.multiplyScalar(distance * 1.0))

  posUniforms.mouse3d.value.copy(mouse3d)
  velUniforms.mouse3d.value.copy(mouse3d)

  computeRenderer.compute()
  particleUniforms.texturePosition.value = computeRenderer.getCurrentRenderTarget(comPosition).texture
  particleUniforms.textureVelocity.value = computeRenderer.getCurrentRenderTarget(comVelocity).texture
}

function render() {
  update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

init()