<script>
export default {
  name: 'Msg',
  data () {
    return {
      alert: '',
      success: '',
      timer: null
    }
  },
  methods: {
    alertFun (msg) {
      this.reset()
      this.alert = msg
      this.startTimer(() => {
        this.alert = ''
      })
    },
    successFun (msg) {
      this.reset()
      this.success = msg
      this.startTimer(() => {
        this.success = ''
      })
    },
    reset () {
      if (this.timer) clearTimeout(this.timer)
      this.alert = ''
      this.success = ''
    },
    startTimer (callback) {
      this.timer = setTimeout(() => {
        callback()
      }, 3000)
    }
  }
}
</script>

<template>
  <div class="alertMsg" v-if="alert">
    <i class="fas fa-times-circle"></i> {{ alert }}
  </div>

  <div class="successMsg" v-if="success">
    <i class="fas fa-check-circle"></i> {{ success }}
  </div>
</template>

<style scoped>
.alertMsg {
  font-size: inherit;
  padding: 20px 10px;
  position: fixed;
  bottom: 5%;
  left: 2%;
  border-radius: 10px;
  z-index: 999;
  color: red;
  background-color: rgba(255, 228, 228, 0.75);
  box-shadow: 0px 0 10px 0px rgba(205, 30, 11, 0.5);
  animation: showFromLeft 0.3s linear;
  display: flex;
  align-items: center;
  gap: 10px;
}

.successMsg {
  font-size: inherit;
  padding: 20px 10px;
  position: fixed;
  bottom: 5%;
  left: 2%;
  border-radius: 10px;
  z-index: 999;
  color: green;
  background-color: rgba(218, 249, 223, 0.75);
  box-shadow: 0px 0 10px 0px rgb(11 205 61 / 50%);
  animation: showFromLeft 0.3s normal;
  display: flex;
  align-items: center;
  gap: 10px;
}

@keyframes showFromLeft {
  0% {
    opacity: 0;
    margin-left: -100%;
  }
  25% {
    opacity: 0.2;
    margin-left: -50%;
  }
  35% {
    opacity: 0.4;
    margin-left: -20%;
  }
  50% {
    opacity: 0.8;
    margin-left: -15%;
  }
  65% {
    opacity: 0.9;
    margin-left: -12%;
  }
  75% {
    opacity: 0.9;
    margin-left: -10%;
  }
  80% {
    opacity: 0.9;
    margin-left: -8%;
  }
  85% {
    opacity: 0.95;
    margin-left: -6%;
  }
  90% {
    opacity: 0.95;
    margin-left: -4%;
  }
  95% {
    opacity: 0.95;
    margin-left: -2%;
  }
  100% {
    opacity: 1;
    margin-left: 0;
  }
}
</style>
