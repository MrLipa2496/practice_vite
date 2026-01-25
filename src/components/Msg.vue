<script>
import Popup from './Popup.vue'

export default {
  name: 'Msg',
  components: { Popup },
  data () {
    return {
      alert: '',
      success: '',
      t1: null,
      t2: null,
      confirmTitle: 'Please confirm next action',
      confirm: '',
      code: 0,
      interval: null
    }
  },
  mounted () {
    this.parent = this.$root
  },
  methods: {
    fadeIn (el, timeout, display) {
      el.style.opacity = 0
      el.style.display = display || 'block'
      el.style.transition = `opacity ${timeout}ms`
      setTimeout(() => {
        el.style.opacity = 1
      }, 10)
    },
    fadeOut (el, timeout) {
      el.style.opacity = 1
      el.style.transition = `opacity ${timeout}ms`
      el.style.opacity = 0
      setTimeout(() => {
        el.style.display = 'none'
      }, timeout)
    },
    successFun (msg) {
      this.success = msg
      var self = this

      if (self.t1) clearTimeout(self.t1)
      if (self.t2) clearTimeout(self.t2)

      self.t1 = setTimeout(function () {
        const block = document.querySelector('.successMsg')
        if (block) {
          self.fadeIn(block, 1000, 'flex')
          self.t2 = setTimeout(function () {
            self.fadeOut(block, 1000)
            setTimeout(() => {
              self.success = ''
            }, 1000)
          }, 3000)
        }
      }, 100)
    },
    alertFun (msg) {
      this.alert = msg
      var self = this

      if (self.t1) clearTimeout(self.t1)
      if (self.t2) clearTimeout(self.t2)

      self.t1 = setTimeout(function () {
        const block = document.querySelector('.alertMsg')
        if (block) {
          self.fadeIn(block, 1000, 'flex')
          self.t2 = setTimeout(function () {
            self.fadeOut(block, 1000)
            setTimeout(() => {
              self.alert = ''
            }, 1000)
          }, 3000)
        }
      }, 100)
    },
    confirmFun (title, text) {
      this.code = 0
      var self = this
      return new Promise(function (resolve, reject) {
        self.confirmTitle = title
        self.confirm = text
        self.$refs.confirm.active = 1
        self.interval = setInterval(function () {
          if (self.code > 0) resolve()
        }, 100)
      }).then(function () {
        clearInterval(self.interval)
        self.$refs.confirm.active = 0
        if (self.code == 1) {
          return true
        }
        if (self.code == 2) {
          return false
        }
      })
    }
  }
}
</script>

<template>
  <div>
    <div class="alertMsg" v-if="alert" style="display: none">
      <div class="wrapper al">
        <i class="fas fa-times-circle"></i> {{ alert }}
      </div>
    </div>

    <div class="successMsg" v-if="success" style="display: none">
      <div class="wrapper al">
        <i class="fas fa-check-circle"></i> {{ success }}
      </div>
    </div>

    <Popup ref="confirm" title="">
      <div class="ac ptb20">
        <div class="confirm-text">
          <i class="fas fa-info-circle"></i> {{ confirm }}
        </div>

        <div class="botBtns">
          <a class="btnS btn-no" href="#" @click.prevent="code = 2">No</a>
          <a class="btnS btn-yes" href="#" @click.prevent="code = 1">Yes</a>
        </div>
      </div>
    </Popup>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.ac {
  text-align: center;
}
.al {
  text-align: left;
}
.ptb20 {
  padding-top: 20px;
  padding-bottom: 20px;
}

.alertMsg {
  font-size: inherit;
  padding: 20px 10px;
  position: fixed;
  bottom: 5%;
  left: 2%;
  border-radius: 10px;
  z-index: 999;
  height: auto;
  display: none;
  color: red;
  background-color: rgba(255, 228, 228, 0.75);
  box-shadow: 0px 0 10px 0px rgba(205, 30, 11, 0.5);
  animation: slideIn 0.3s linear;
}

.successMsg {
  font-size: inherit;
  padding: 20px 0;
  position: fixed;
  bottom: 5%;
  left: 2%;
  border-radius: 10px;
  z-index: 999;
  height: auto;
  display: none;
  color: green;
  background-color: rgba(218, 249, 223, 0.75);
  box-shadow: 0px 0 10px 0px rgb(11 205 61 / 50%);
  animation: slideIn 0.3s normal;
}

.confirm-wrapper {
  text-align: center;
  padding: 10px 0;
}

.confirm-text {
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.confirm-text i {
  margin-right: 10px;
  font-size: 20px;
  color: #333;
}

.botBtns {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btnS {
  display: inline-block;
  min-width: 80px;
  padding: 10px 20px;
  background-color: #00d68f;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 6px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 214, 143, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btnS:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 214, 143, 0.4);
  background-color: #00c080;
}

.btnS:active {
  transform: translateY(0);
}
</style>
