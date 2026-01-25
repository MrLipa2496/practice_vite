<script>
import Msg from './Msg.vue'

export default {
  name: 'Header',
  components: { Msg },
  data () {
    return {
      user: {},
      parent: '',
      active: 0,
      menu: 0
    }
  },
  mounted () {
    this.parent = this.$root
  }
}
</script>

<template>
  <header class="header">
    <Msg ref="msg" />
  </header>
</template>

<style scoped></style>
