<script>
export default {
  name: 'Campaigns',
  data () {
    return {
      parent: null
    }
  },
  mounted () {
    this.parent = this.$root

    if (!this.parent.user) {
      const localUser = localStorage.getItem('user')
      if (localUser) {
        this.parent.user = JSON.parse(localUser)
      } else {
        this.parent.logout()
      }
    }
  }
}
</script>

<template>
  <div class="campaigns-page">
    <div class="header">
      <div class="wrapper">
        <h1>Campaigns</h1>

        <button class="btn-logout" @click="parent.logout()">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>

    <div class="wrapper content-area">
      <div class="content-box">
        <h2>List of Campaigns</h2>
        <p v-if="parent && parent.user" style="margin-top: 20px; color: #666">
          Logged in as:
          <strong>{{ parent.user.name || parent.user.email }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campaigns-page {
  background-color: #f4f6f8;
  min-height: 100vh;
}

.header {
  background-color: #333;
  color: #fff;
  padding: 15px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.content-area {
  padding-top: 30px;
}

.content-box {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.btn-logout {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}
</style>
