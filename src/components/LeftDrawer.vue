<template lang="pug">
  q-drawer(v-model="model" side="left" overlay behavior="mobile" elevated)
    q-toolbar.bg-primary.text-white.shadow-2
      q-toolbar-title {{ $t('menu.title') }}
    q-list(bordered)
      q-expansion-item(:label="$t('menu.settings')" icon="settings" expand-separator)
        q-item-label(header) {{ $t('menu.lang') }}
        q-card
          q-card-section
            q-select(:value="settings.lang" :options="langOptions" @input="changeLang" emit-value map-options filled)
      q-expansion-item(:label="$t('menu.background')" icon="image" expand-separator)
        q-card
          q-card-section
            q-select(:value="settings.mode" :options="modeOptions" @input="changeMode" emit-value map-options filled)
        q-card(v-if="settings.mode === 'ar'")
          q-card-section
            div.text-subtitle2 {{ $t('menu.camera') }}
          q-card-section
            q-select(:value="settings.cam.device" :options="deviceOptions" @input="changeDevice" emit-value map-options filled)
        q-card(v-if="settings.mode === 'color'")
          q-card-section
            q-color.full-width(:value="settings.color" @change="changeColor")
        q-card(v-else-if="settings.mode === 'image'" style="flex-wrap: wrap")
          q-card-section
            img.full-width(:src="settings.image.file")
          q-card-section.text-center
            p(v-if="settings.image.file === './img/bg.jpg'") {{ $t('menu.defaultImage') }}
            q-file.hidden(ref="fileimage" label="Pick VRM file" filled @input="changeImage" accept="image/*")
            q-btn(flat :label="$t('menu.change')" color='primary' v-close-popup @click="$refs.fileimage.$el.click()")
            q-btn(flat :label="$t('menu.default')" color='red' v-close-popup @click="resetImage")
      q-expansion-item(:label="$t('menu.vrm')" icon="person" expand-separator)
        q-item
          q-item-section.q-ml-none(top)
            img.full-width(:src="settings.model.thumbnail")
          q-item-section
            q-item-label {{ settings.model.name }}
            br
            q-item-label
              q-file.hidden(ref="filemodel" label="Pick VRM file" filled @input="changeModel")
              q-btn(flat :label="$t('menu.change')" color='primary' v-close-popup @click="$refs.filemodel.$el.click()")
              q-btn(flat :label="$t('menu.default')" color='red' v-close-popup @click="resetModel")
      q-expansion-item(:label="$t('menu.mouth')" icon="tag_faces" expand-separator)
        q-card
          q-card-section
            q-select(:value="settings.model.mouth" @input="changeMouth" :options="mouthOptions" emit-value map-options filled)
      q-expansion-item(:label="$t('menu.emote')" icon="face" expand-separator)
        q-card
          q-card-section
            q-select(:value="settings.model.emote" @input="changeEmote" :options="emoteOptions" emit-value map-options filled)
      q-expansion-item(:label="$t('menu.pose')" icon="accessibility" expand-separator)
        q-card
          q-card-section
            q-select(:value="settings.model.pose" @input="changePose" :options="poseOptions" emit-value map-options filled)
</template>

<script>
export default {
  name: 'LeftDrawer',
  data () {
    return {
      mouthOptions: [
        {
          label: 'Normal',
          value: ''
        },
        {
          label: 'A',
          value: 'A'
        },
        {
          label: 'I',
          value: 'I'
        },
        {
          label: 'U',
          value: 'U'
        },
        {
          label: 'E',
          value: 'E'
        },
        {
          label: 'O',
          value: 'O'
        }
      ],
      poseOptions: [
        {
          label: 'Standard',
          value: 'standard'
        },
        {
          label: 'Ya',
          value: 'ya'
        }
      ],
      langOptions: [
        {
          label: 'English',
          value: 'en-us'
        },
        {
          label: '中文 (繁體)',
          value: 'zh-tw'
        }
      ]
    }
  },
  computed: {
    model: {
      get () {
        return this.open
      },
      set (value) {
        this.$root.$emit('triggerDrawer', { side: 'left', open: value })
      }
    },
    settings () {
      return this.$store.getters['settings/get']
    },
    modeOptions () {
      return [
        {
          label: this.$t('menu.ar'),
          value: 'ar'
        },
        {
          label: this.$t('menu.color'),
          value: 'color'
        },
        {
          label: this.$t('menu.image'),
          value: 'image'
        }
      ]
    },
    deviceOptions () {
      return this.settings.cam.devices.map(device => {
        return {
          label: device.label,
          value: device.deviceId
        }
      })
    },
    emoteOptions () {
      return this.settings.model.expressions
    }
  },
  methods: {
    changeLang (value) {
      this.$store.commit('settings/updateLang', value)
      this.$i18n.locale = value
    },
    changeMode (value) {
      this.$store.commit('settings/updateMode', value)
    },
    changeDevice (value) {
      this.$store.commit('settings/updateDevice', value)
    },
    changeColor (value) {
      this.$store.commit('settings/updateColor', value)
    },
    changeModel (file) {
      if (!file || file.name.split('.').pop() !== 'vrm') return
      const blob = new Blob([file], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      this.$store.commit('settings/updateModel', url)
    },
    resetModel () {
      this.$store.commit('settings/updateModel', './vrm/AliciaSolid.vrm')
    },
    changeImage (file) {
      const url = URL.createObjectURL(file)
      this.settings.image.file = url

      const img = document.createElement('img')
      img.src = url
      img.onload = () => {
        this.$store.commit('settings/updateImage', { url, width: img.width, height: img.height })
      }
    },
    resetImage () {
      this.$store.commit('settings/updateImage', { url: './img/bg.jpg', width: 1050, height: 700 })
    },
    changeMouth (value) {
      this.$store.commit('settings/updateMouth', value)
    },
    changeEmote (value) {
      this.$store.commit('settings/updateEmote', value)
    },
    changePose (value) {
      this.$store.commit('settings/updatePose', value)
    }
  },
  props: {
    open: Boolean
  }
}
</script>
