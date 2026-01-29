<template>
  <div class="image-upload-container">
    <div class="image-preview-area">
      <a href="#" class="select_img" @click.prevent="triggerInput">
        <span v-if="preview">
          <img :src="preview" class="im" alt="Preview" />
        </span>
        <span v-else>
          <img src="/src/assets/img/placeholder.svg" alt="Upload placeholder" />
        </span>
      </a>
    </div>

    <input
      type="file"
      style="display: none"
      ref="input"
      accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
      @change="change($event)"
    />
  </div>
</template>

<script>
export default {
  name: 'ImageUpload',
  props: {
    modelValue: [String, File]
  },
  emits: ['update:modelValue'],
  data () {
    return {
      preview: '',
      baseUrl: ''
    }
  },
  mounted () {
    this.baseUrl = this.findUrl()

    this.setPreview(this.modelValue)
  },
  watch: {
    modelValue (newVal) {
      this.setPreview(newVal)
    }
  },
  methods: {
    findUrl () {
      let p = this.$parent
      while (p) {
        if (p.url) return p.url
        if (p.parent && p.parent.url) return p.parent.url
        p = p.$parent
      }
      return ''
    },
    triggerInput () {
      this.$refs.input.click()
    },
    setPreview (val) {
      if (!val) {
        this.preview = ''
        return
      }

      if (val instanceof File) {
        const reader = new FileReader()
        reader.onload = e => {
          this.preview = e.target.result
        }
        reader.readAsDataURL(val)
      } else if (typeof val === 'string') {
        if (val.startsWith('data:')) {
          this.preview = val
        } else if (val.startsWith('http')) {
          this.preview = val
        } else {
          this.preview = this.baseUrl ? this.baseUrl + '/' + val : val
        }
      }
    },
    change (event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = e => {
          this.preview = e.target.result
        }
        reader.readAsDataURL(file)

        this.$emit('update:modelValue', file)
      }
    }
  }
}
</script>

<style scoped>
.image-preview-area {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

.select_img {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 200px;
  background-color: #f8f9fa;
  border: 2px solid #ced4da;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.select_img:hover {
  background-color: #e9ecef;
  border-color: #005990;
}

.select_img .im {
  display: block;
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}

.select_img img[src*='placeholder'] {
  width: 80px;
  height: 80px;
  opacity: 0.5;
  transition: transform 0.3s ease;
}

.select_img:hover img[src*='placeholder'] {
  transform: scale(1.1);
  opacity: 0.8;
}
</style>
