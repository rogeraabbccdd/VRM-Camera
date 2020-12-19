<template lang="pug">
  #q-app
    router-view
</template>
<script>
export default {
  name: 'App',
  mounted () {
    this.$i18n.locale = this.$store.getters['settings/get'].lang
  }
}
</script>
