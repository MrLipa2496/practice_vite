<script>
export default {
  data () {
    return {
      url: 'https://affiliate.yanbasok.com',
      user: { name: '', phone: '', email: '', date: '', auth: '' },
      title: ''
    }
  },
  watch: {
    $route () {
      this.syncUser()
      this.updateTitle()
    }
  },
  mounted () {
    this.syncUser()
    this.updateTitle()
  },
  methods: {
    syncUser () {
      const localUser = window.localStorage.getItem('user')
      if (localUser) {
        try {
          this.user = JSON.parse(localUser)
        } catch (e) {
          console.error('Ошибка парсинга пользователя', e)
        }
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
      }
    },
    toFormData (obj) {
      const fd = new FormData()
      for (let x in obj) {
        if (
          typeof obj[x] === 'object' &&
          obj[x] !== null &&
          x !== 'img' &&
          x !== 'copy'
        ) {
          for (let y in obj[x]) {
            if (typeof obj[x][y] === 'object' && obj[x][y] !== null) {
              for (let z in obj[x][y]) {
                fd.append(`${x}[${y}][${z}]`, obj[x][y][z])
              }
            } else {
              fd.append(`${x}[${y}]`, obj[x][y])
            }
          }
        } else if (x !== 'copy') {
          fd.append(x, obj[x])
        }
      }
      return fd
    }
  }
}
</script>

<template>
  <div class="app-container">
    <router-view :user="user" @logout="logout"></router-view>
  </div>
</template>

<style></style>
