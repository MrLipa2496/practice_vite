<script>
export default {
  name: 'Login',
  data () {
    return {
      img: 1,
      parent: null,
      // Добавил модели для полей, чтобы потом было удобно отправлять данные
      form: {
        email: '',
        password: ''
      }
    }
  },
  mounted () {
    this.img = this.randomIntFromInterval(1, 7)
    this.parent = this.$root
  },
  methods: {
    randomIntFromInterval (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    doLogin () {}
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h1 class="title">Sign In</h1>
      <p class="subtitle">Welcome back to the system</p>

      <form @submit.prevent="doLogin">
        <div class="input-group">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>

        <div class="input-group">
          <label>Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn-primary">
          <i class="fas fa-sign-in-alt"></i> Login
        </button>
      </form>

      <div class="debug-info">
        <small>Session ID: #{{ img }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: 'Segoe UI', sans-serif;
}

.login-box {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  text-align: center;
}

.subtitle {
  margin-top: 8px;
  margin-bottom: 30px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.input-group input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.debug-info {
  margin-top: 20px;
  text-align: center;
  color: #9ca3af;
}
</style>
