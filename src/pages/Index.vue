<template lang="pug">
  q-page.flex.flex-center#index
    q-inner-loading(:showing="isLoading")
      q-spinner(size="50px" color="primary")
      br
      p.text-white LOADING...
        span(ref="progress") 0
        | %
    #main
      #renderer.relative-position
        video.absolute-center(ref="video")
    #footer.fixed-bottom.q-py-lg.q-gutter-lg.text-center
      q-btn(round size="lg" color="primary" icon="menu" @click="$root.$emit('triggerDrawer',{side:'left', open: true})")
      q-btn(round size="lg" color="purple" icon="camera" @click="save")
      q-btn(round size="lg" color="secondary" icon="help" @click="$root.$emit('triggerDrawer',{side:'right', open: true})")
    q-dialog(v-model='cam.confirm')
      q-card
        q-card-section.row.items-center
          q-avatar(icon='camera_alt' color='primary' text-color='white')
          span.q-ml-sm {{ $t('alert.camera') }}
        q-card-actions(align='right')
          q-btn(flat :label="$t('alert.confirm')" color='primary' v-close-popup)
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMUtils, VRMSchema } from '@pixiv/three-vrm'
import Pose from '../assets/poses'

export default {
  name: 'PageIndex',
  data () {
    return {
      cam: {
        stream: null,
        videoSettings: null,
        confirm: null
      },
      three: {
        scene: new THREE.Scene(),
        renderer: new THREE.WebGLRenderer({ antialias: true, alpha: true }),
        // renderer: new THREE.WebGLRenderer(),
        camera: new THREE.PerspectiveCamera(30.0, 1.0, 0.1, 20.0),
        videoTexture: null,
        loader: new GLTFLoader(),
        clock: new THREE.Clock(),
        vrm: null,
        controls: null,
        light: new THREE.DirectionalLight(0xffffff),
        image: '',
        color: ''
      },
      model: {
        file: '',
        mouth: '',
        emote: '',
        pose: 'standard'
      },
      sfx: {
        camera: new Audio()
      },
      saveRequest: false,
      isLoading: true,
      mode: 'color',
      resizeTimer: 0
    }
  },
  computed: {
    settings: {
      get () {
        return this.$store.getters['settings/get']
      },
      set (value) {
        this.$store.commit('settings/update', value)
      }
    }
  },
  methods: {
    initWebCam () {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => {
            this.cam.stream = stream
            this.cam.videoSettings = stream.getVideoTracks()[0].getSettings()
            // console.log('videoSettings: width=%d, height=%d, frameRate=%d', this.cam.videoSettings.width, this.cam.videoSettings.height, this.cam.videoSettings.frameRate)
            Object.assign(this.$refs.video, {
              srcObject: stream,
              width: this.cam.videoSettings.width,
              height: this.cam.videoSettings.height,
              autoplay: true
              // Setting muted here breaks everything
              // muted: true,
            })

            this.three.scene.background = null
            this.three.renderer.setClearColor(0x000000, 0)

            this.onWindowResize()
            this.animate()
          })
          .catch(error => {
            console.log(error)
            this.cam.confirm = true
            this.settings.mode = 'color'
          })
      }
    },
    init () {
      // renderer
      this.three.renderer.setPixelRatio(window.devicePixelRatio)
      // camera
      this.three.camera.position.set(0.0, 1.0, -5.0)
      // camera controls
      this.three.controls = new OrbitControls(this.three.camera, this.three.renderer.domElement)
      this.three.controls.screenSpacePanning = true
      this.three.controls.target.set(0.0, 1.0, 0.0)
      this.three.controls.update()
      this.three.controls.addEventListener('change', this.animate)
      // scene
      this.three.scene.background = new THREE.Color(this.three.color)
      // light
      this.three.light.position.set(1.0, 1.0, -1.0).normalize()
      this.three.scene.add(this.three.light)
      this.loadModel(this.settings.model.file)
      // resize
      window.addEventListener('resize', () => {
        clearTimeout(this.resizeTimer)
        this.resizeTimer = setTimeout(this.onWindowResize, 300)
      })
      this.onWindowResize()
    },
    animate () {
      this.three.renderer.render(this.three.scene, this.three.camera)

      if (this.saveRequest) {
        const link = document.createElement('a')
        link.download = 'vrm.jpg'
        if (this.mode !== 'ar') {
          link.href = this.three.renderer.domElement.toDataURL('image/jpeg')
        } else {
          const canvas = document.createElement('canvas')
          canvas.width = this.three.renderer.domElement.width
          canvas.height = this.three.renderer.domElement.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(this.$refs.video, 0, 0, this.$refs.video.width, this.$refs.video.height)
          ctx.drawImage(this.three.renderer.domElement, 0, 0, this.three.renderer.domElement.width, this.three.renderer.domElement.height)
          link.href = canvas.toDataURL('image/jpeg')
        }
        link.click()
        this.sfx.camera.play()
        this.saveRequest = false
      }
    },
    onWindowResize () {
      if (this.settings.mode === 'ar' && this.cam.stream) {
        if (this.cam.videoSettings.width >= document.body.clientWidth || this.cam.videoSettings.height >= document.body.clientHeight) {
          const ratio = this.cam.videoSettings.width / this.cam.videoSettings.height
          this.three.renderer.setSize(document.body.clientWidth, document.body.clientWidth / ratio)
          this.three.camera.aspect = ratio
          this.$refs.video.width = document.body.clientWidth
          this.$refs.video.height = document.body.clientWidth / ratio
        } else {
          this.three.renderer.setSize(this.cam.videoSettings.width, this.cam.videoSettings.height)
          this.three.camera.aspect = this.cam.videoSettings.width / this.cam.videoSettings.height
          this.$refs.video.width = this.cam.videoSettings.width
          this.$refs.video.height = this.cam.videoSettings.height
        }
      } else if (this.settings.mode === 'image') {
        if (this.settings.image.width >= document.body.clientWidth || this.settings.image.height >= document.body.clientHeight) {
          const ratio = this.settings.image.width / this.settings.image.height
          this.three.renderer.setSize(document.body.clientWidth, document.body.clientWidth / ratio)
          this.three.camera.aspect = ratio
        } else {
          this.three.renderer.setSize(this.settings.image.width, this.settings.image.height)
          this.three.camera.aspect = this.settings.image.width / this.settings.image.height
        }
      } else {
        this.three.renderer.setSize(document.body.clientWidth, document.body.clientHeight)
        this.three.camera.aspect = document.body.clientWidth / document.body.clientHeight
      }
      this.three.camera.updateProjectionMatrix()
      this.animate()
    },
    save () {
      this.saveRequest = true
      this.animate()
    },
    loadModel (url) {
      // gltf and vrm
      this.isLoading = true
      this.three.loader.crossOrigin = 'anonymous'
      this.three.loader.load(
        url,
        (gltf) => {
          VRMUtils.removeUnnecessaryJoints(gltf.scene)
          // generate VRM instance from gltf
          VRM.from(gltf).then((vrm) => {
            if (this.three.scene.children[1]) {
              this.three.scene.remove(this.three.scene.children[1])
            }
            this.three.scene.add(vrm.scene)
            this.three.vrm = vrm
            this.settings.model.name = vrm.meta.title
            VRMUtils.extractThumbnailBlob(this.three.renderer, vrm, 256).then((blob) => {
              const url = URL.createObjectURL(blob)
              this.settings.model.thumbnail = url
            })
            this.settings.model.expressions = vrm.blendShapeProxy.expressions.map(expression => {
              if (expression === 'Blink_L') expression = 'BlinkL'
              else if (expression === 'Blink_R') expression = 'BlinkR'
              return expression
            }).filter(expression => {
              if (expression === 'A' ||
                expression === 'I' ||
                expression === 'U' ||
                expression === 'E' ||
                expression === 'O' ||
                expression.includes('Look')
              ) return false
              else return true
            })

            // Apply user settings
            if (this.settings.model.mouth) {
              this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName[this.model.mouth], 1.0)
            }
            if (vrm.blendShapeProxy.expressions.includes(this.model.emote)) {
              this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName[this.settings.model.emote], 1.0)
            } else {
              this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Neutral, 1.0)
              this.settings.model.emote = 'Neutral'
              this.model.emote = 'Neutral'
            }

            if (this.model.pose) {
              this.three.vrm.humanoid.setPose(Pose[this.model.pose])
            } else {
              this.three.vrm.humanoid.setPose(Pose.standard)
            }
            this.animate()
          })
        },
        (progress) => {
          const number = 100.0 * (progress.loaded / progress.total)
          console.log('Loading model...', number, '%')
          this.$refs.progress.innerText = Math.floor(number)
          if (number === 100) {
            this.isLoading = false
          }
        },
        (error) => {
          console.error(error)
          this.isLoading = false
        }
      )
    }
  },
  mounted () {
    const rendererEl = document.getElementById('renderer')
    this.three.renderer.domElement.classList.add('absolute-center')
    rendererEl.appendChild(this.three.renderer.domElement)

    this.mode = this.settings.mode
    this.color = this.settings.color
    this.model.file = this.settings.model.file

    this.init()

    this.sfx.camera.src = './sfx/camera.mp3'
  },
  watch: {
    settings: {
      handler (value) {
        // change mode
        if (this.mode !== this.settings.mode) {
          this.mode = this.settings.mode
          if (this.mode === 'ar') {
            this.initWebCam()
          } else if (this.mode === 'image') {
            if (this.cam.stream) this.cam.stream.getVideoTracks()[0].stop()
            this.three.scene.background = new THREE.TextureLoader().load(this.settings.image.file, () => {
              this.animate()
            })
          } else {
            if (this.cam.stream) this.cam.stream.getVideoTracks()[0].stop()
            this.three.scene.background = new THREE.Color(this.three.color)
          }
          this.onWindowResize()
        }
        // change model
        if (this.model.file !== this.settings.model.file) {
          this.model.file = this.settings.model.file
          this.loadModel(this.settings.model.file)
        }

        if (this.three.vrm) {
          const deltaTime = this.three.clock.getDelta()
          // change mouth
          if (this.model.mouth !== this.settings.model.mouth) {
            this.model.mouth = this.settings.model.mouth

            this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.A, 0.0)
            this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.I, 0.0)
            this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.U, 0.0)
            this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.E, 0.0)
            this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.O, 0.0)
            if (this.settings.model.mouth) {
              this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName[this.model.mouth], 1.0)
            }
          }
          // change emote
          if (this.model.emote !== this.settings.model.emote) {
            this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName[this.model.emote], 0.0)
            this.model.emote = this.settings.model.emote
            if (this.settings.model.emote) {
              this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName[this.model.emote], 1.0)
            } else {
              this.three.vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Neutral, 1.0)
            }
          }
          // change pose
          if (this.model.pose !== this.settings.model.pose) {
            this.model.pose = this.settings.model.pose
            if (this.model.pose) {
              this.three.vrm.humanoid.setPose(Pose[this.model.pose])
            } else {
              this.three.vrm.humanoid.setPose(Pose.standard)
            }
          }

          // update vrm
          this.three.vrm.update(deltaTime)
        }

        // change image
        if (this.mode === 'image' && this.settings.image.file !== this.three.image) {
          this.three.image = this.settings.image.file
          this.three.scene.background = new THREE.TextureLoader().load(this.settings.image.file, () => {
            this.animate()
          })
        }

        // change color
        if (this.mode === 'color' && this.settings.color !== this.three.color) {
          this.three.color = this.settings.color
          this.three.scene.background = new THREE.Color(this.three.color)
        }

        this.animate()
      },
      deep: true
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.myEventHandler)
  }
}
</script>
