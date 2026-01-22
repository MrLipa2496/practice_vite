<script>
export default {
  data () {
    return {
      url: 'https://affiliate.yanbasok.com',
      user: { name: '', phone: '', email: '', date: '', auth: '' },
      title: ''
    }
  },
  components: {},
  watch: {
    $route () {
      this.init()
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      const localUser = window.localStorage.getItem('user')
      if (localUser) {
        this.user = JSON.parse(localUser)
      }

      const currentPath = this.$route.path
      if (!this.user.auth && currentPath !== '/') {
        this.$router.push('/')
      }
    },
    logout () {
      this.user = { name: '', phone: '', email: '', date: '', auth: '' }
      window.localStorage.setItem('user', '')
      this.$router.push('/')
    },
    updateTitle () {
      if (this.$route.name) {
        this.title = this.$route.name
        document.title = this.title
      }
    }
  }
}
</script>

<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<style></style>
