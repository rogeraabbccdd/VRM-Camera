<template lang="pug">
  q-drawer(v-model="model" side="right" overlay behavior="mobile" elevated)
    q-toolbar.bg-primary.text-white.shadow-2
      q-toolbar-title VRM Camera
    q-list(bordered separator)
      q-item
        q-item-section
          q-item-label(header) {{ $t('usage.title') }}
          ul.desktop-only.q-mt-none(v-html="$t('usage.desktop')")
          ul.mobile-only.q-mt-none(v-html="$t('usage.mobile')")
    q-list.fixed-bottom(bordered separator)
      q-item
        q-item-section
          | v{{ version }}
          br
          | Made with ❤ by Kento
</template>

<script>
export default {
  name: 'RightDrawer',
  data () {
    return {
      version: process.env.VERSION
    }
  },
  computed: {
    model: {
      get () {
        return this.open
      },
      set (value) {
        this.$root.$emit('triggerDrawer', { side: 'right', open: value })
      }
    }
  },
  props: {
    open: Boolean
  }
}
</script>
