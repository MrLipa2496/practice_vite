<script>
import axios from 'axios'
import Msg from '../components/Msg.vue'

export default {
  name: 'Login',
  components: { Msg },
  data () {
    return {
      img: 1,
      parent: null,
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
    toFormData (obj) {
      const fd = new FormData()
      for (let key in obj) {
        fd.append(key, obj[key])
      }
      return fd
    },
    doLogin () {
      const self = this

      if (!this.form.email || !this.form.password) {
        if (this.$refs.msg) this.$refs.msg.alertFun('Please fill all fields')
        else alert('Please fill all fields')
        return
      }

      const data = this.toFormData(this.form)

      axios
        .post(this.parent.url + '/site/login', data)
        .then(response => {
          if (response.data.error) {
            if (self.$refs.msg) self.$refs.msg.alertFun(response.data.error)
            else alert(response.data.error)
          } else if (response.data.user) {
            self.parent.user = response.data.user
            localStorage.setItem('user', JSON.stringify(self.parent.user))
            self.$router.push('/campaigns')
          }
        })
        .catch(error => {
          console.error('Login error:', error)
          if (self.$refs.msg) self.$refs.msg.alertFun('Network Error')
        })
    }
  }
}
</script>

<template>
  <div class="login-container">
    <Msg ref="msg" />

    <div id="left-area" class="image-side">
      <img
        v-if="parent"
        :src="`${parent.url}/app/views/images/Cover_${img}.jpg`"
        class="bg-cover"
        alt="Cover"
      />
    </div>

    <div id="right-area" class="form-side">
      <div class="login-header">
        <div class="title-logo-wrapper">
          <div class="title">
            <h1>Affiliate Sign in</h1>
          </div>
          <div class="logo">
            <img
              v-if="parent"
              :src="`${parent.url}/app/views/images/logo.svg`"
              alt="Logo"
            />
          </div>
        </div>
      </div>

      <div class="form-wrapper">
        <form @submit.prevent="doLogin">
          <div class="row">
            <label>Email</label>
            <input
              type="email"
              v-model="form.email"
              required
              placeholder="email@example.com"
            />
          </div>
          <div class="row">
            <label>Password</label>
            <input
              type="password"
              v-model="form.password"
              required
              autocomplete="on"
              placeholder="********"
            />
          </div>
          <div class="row btn-row">
            <button class="btn-success">SIGN IN</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: 'Roboto', 'Segoe UI', sans-serif;
}

.image-side {
  width: 60%;
  position: relative;
  background-color: #000;
}

.bg-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.form-side {
  width: 40%;
  background-color: #f4f6f8;
  display: flex;
  flex-direction: column;
  position: relative;
}

.login-header {
  display: flex;
  background-color: #333333;
  color: #fff;
  padding: 15px 30px;
  width: 100%;
  box-sizing: border-box;
}

.title-logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.login-header h1 {
  font-size: 18px;
  margin: 0;
  font-weight: 500;
}

.login-header .logo img {
  height: 30px;
  width: auto;
}

.form-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.form-wrapper form {
  text-align: right;
  width: 100%;
  max-width: 400px;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    overflow-y: auto;
  }

  .image-side {
    display: none;
  }

  .form-side {
    width: 100%;
    min-height: 100vh;
  }

  .login-header {
    padding: 15px 20px;
  }

  .login-header h1 {
    font-size: 16px;
  }

  .form-wrapper {
    align-items: flex-start;
    padding-top: 50px;
  }

  .form-wrapper form {
    text-align: left;
    max-width: 100%;
  }

  .row input {
    text-align: left;
    padding: 15px;
    font-size: 16px;
  }

  .row label {
    font-size: 13px;
  }

  .btn-success {
    padding: 16px;
    font-weight: bold;
    letter-spacing: 1px;
  }
}

.row {
  margin-bottom: 20px;
}
.row label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 14px;
  color: #333;
}
.row input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dcdcdc;
  background-color: #f0f2f5;
  border-radius: 4px;
  box-sizing: border-box;
  outline: none;
  transition: border 0.3s;
}
.row input:focus {
  border-color: #00c853;
  background-color: #fff;
}
.btn-success {
  width: 100%;
  height: 40px;
  background-color: #11de79;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  transition: background 0.3s;
}
.btn-success:hover {
  background-color: #1d7683;
}
.btn-row {
  margin-top: 30px;
}
</style>
