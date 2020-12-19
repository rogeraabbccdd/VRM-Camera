
<template lang="pug">
  q-layout(view="hhh lpR fFf")
    LeftDrawer(:open="left")
    RightDrawer(:open="right")
    q-page-container
      router-view
  </q-layout>
</template>

<script>
import LeftDrawer from '../components/LeftDrawer.vue'
import RightDrawer from '../components/RightDrawer.vue'

export default {
  data () {
    return {
      left: false,
      right: false
    }
  },
  components: {
    LeftDrawer,
    RightDrawer
  },
  mounted () {
    this.$root.$on('triggerDrawer', (e) => {
      e.side === 'left' ? this.left = e.open : this.right = e.open
    })
  }
}
</script>
