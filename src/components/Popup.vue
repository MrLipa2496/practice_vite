<script>
export default {
  name: 'Popup',
  props: ['title', 'fullscreen'],
  data () {
    return {
      active: 0
    }
  },
  watch: {
    active (val) {
      if (val === 1) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
}
</script>

<template>
  <div v-if="active == 1">
    <div class="popup-back" @click="active = 0"></div>

    <div class="popup" :class="{ 'is-fullscreen': fullscreen }" ref="popup">
      <div class="head-popup">
        <div class="head-title">{{ title }}</div>
        <a href="#" class="close-btn" @click.prevent="active = 0">
          <i class="fas fa-window-close"></i>
        </a>
      </div>

      <div class="popup-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-back {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  backdrop-filter: blur(2px);
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  z-index: 9999;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.popup.is-fullscreen {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform: none;
  border-radius: 0;
  max-width: 100%;
  max-height: 100%;
}

.head-popup {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
  padding: 15px 20px;
  flex-shrink: 0;
}

.popup.is-fullscreen .head-popup {
  border-radius: 0;
}

.head-title {
  font-weight: 700;
  font-size: 16px;
  color: #333;
}

.popup-inner {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.close-btn {
  color: #94a3b8;
  font-size: 18px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #e74c3c;
}
</style>
