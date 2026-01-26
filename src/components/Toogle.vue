<script>
export default {
  name: 'Toogle',
  props: {
    modelValue: [String, Number, Boolean]
  },
  data () {
    return {
      value: false
    }
  },
  watch: {
    modelValue (val) {
      this.value = val === '1' || val === 1 || val === 'true' || val === true
    }
  },
  mounted () {
    this.value =
      this.modelValue === '1' ||
      this.modelValue === 1 ||
      this.modelValue === 'true' ||
      this.modelValue === true
  },
  methods: {
    change () {
      const payload = this.value ? '1' : '0'
      this.$emit('update:modelValue', payload)
    }
  }
}
</script>

<template>
  <label class="switch-creative">
    <input type="checkbox" v-model="value" @change="change()" />

    <div class="switch-bg">
      <div class="icons-track">
        <i class="fas fa-check icon-check"></i>
        <i class="fas fa-times icon-cross"></i>
      </div>

      <div class="switch-handle"></div>
    </div>
  </label>
</template>

<style scoped>
.switch-creative {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 28px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.switch-creative input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.switch-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #eef2f6;
  border-radius: 30px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.switch-handle {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.icons-track {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 9px;
  box-sizing: border-box;
  font-size: 11px;
  z-index: 1;
}

.icon-cross {
  color: #94a3b8;
  opacity: 1;
  transform: scale(1);
  transition: all 0.3s ease;
  margin-left: auto;
}

.icon-check {
  color: #fff;
  opacity: 0;
  transform: scale(0.5) rotate(-30deg);
  transition: all 0.3s ease;
}

.switch-creative input:checked + .switch-bg {
  background: linear-gradient(135deg, #00d68f, #00b87a);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1),
    0 4px 15px rgba(0, 214, 143, 0.4);
}

.switch-creative input:checked + .switch-bg .switch-handle {
  transform: translateX(28px);
  background-color: #fff;
  box-shadow: -2px 2px 5px rgba(0, 0, 0, 0.1);
}

.switch-creative input:checked + .switch-bg .icon-cross {
  opacity: 0;
  transform: scale(0.5) rotate(30deg);
}

.switch-creative input:checked + .switch-bg .icon-check {
  opacity: 1;
  transform: scale(1.1) rotate(0deg);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.switch-creative input:active + .switch-bg .switch-handle {
  width: 26px;
}
.switch-creative input:checked:active + .switch-bg .switch-handle {
  transform: translateX(24px);
}
</style>
