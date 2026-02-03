<script>
import axios from 'axios'

import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'

import loaderImg from '../assets/img/loader.gif'

export default {
  name: 'Ads',
  components: {
    Header,
    Popup
  },
  data: function () {
    return {
      parent: {
        formData: {},
        user: { id: '', auth: '' },
        url: ''
      },
      loaderImg,
      data: { items: [] },
      loader: 1
    }
  },
  mounted: function () {
    const foundParent = this.findParent()
    if (foundParent) {
      this.parent = foundParent
    }

    if (this.parent.user && !this.parent.user.auth) {
      if (typeof this.parent.logout === 'function') {
        this.parent.logout()
      }
    } else {
      this.get()
    }
  },
  methods: {
    findParent () {
      let p = this.$parent
      while (p) {
        if (p.url || (p.user && p.user.auth)) return p
        p = p.$parent
      }
      if (this.$root && (this.$root.url || this.$root.user)) return this.$root
      return null
    },

    toFormData (obj) {
      const fd = new FormData()
      if (!obj) return fd
      for (let key in obj) {
        fd.append(key, obj[key])
      }
      return fd
    },

    get: function () {
      var self = this
      var data = this.toFormData(self.parent.formData)

      const userId = this.parent.user ? this.parent.user.id : ''
      data.append('uid', userId)
      data.append('type', 'user')

      self.loader = 1
      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      if (!url) {
        self.loader = 0
        return
      }

      axios
        .post(url + '/site/getBanners?auth=' + auth, data)
        .then(function (response) {
          self.loader = 0
          self.data = response.data
        })
        .catch(function (error) {
          console.error(error)
          if (self.parent.logout) self.parent.logout()
          self.loader = 0
        })
    },

    copy: async function (text) {
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        const msg = this.$refs.header?.$refs?.msg
        if (msg) msg.successFun('Successfully copied!')

        if (this.$refs.copy) this.$refs.copy.active = 0
      } else {
        const msg = this.$refs.header?.$refs?.msg
        if (msg) msg.alertFun('Use https!')
      }
    }
  }
}
</script>

<template>
  <div class="page-container">
    <Header ref="header" />

    <div id="spinner" v-if="loader">
      <img :src="loaderImg" alt="Loading..." />
    </div>

    <div class="content-wrapper">
      <div class="toolbar">
        <div class="toolbar-left">
          <h1 class="page-title">Ads</h1>
        </div>
        <div class="toolbar-center"></div>
        <div class="toolbar-right"></div>
      </div>

      <Popup ref="copy" title="Copy banner">
        <div class="form-container">
          <form v-if="parent.formData">
            <div class="form-group">
              <label>Code</label>
              <textarea
                class="text-input"
                style="height: 120px; font-family: monospace"
                v-model="parent.formData.copy"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                class="btn-primary"
                @click.prevent="copy(parent.formData.copy)"
              >
                <i class="fas fa-copy"></i> Copy code
              </button>
            </div>
          </form>
        </div>
      </Popup>

      <div class="table-container" v-if="data.items && data.items.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-id">#</th>
              <th style="width: 120px">Preview</th>
              <th>Campaign</th>
              <th>Link</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.items" :key="item.id">
              <td class="col-id" data-label="ID">{{ item.id }}</td>
              <td data-label="Preview">
                <div class="mini-preview">
                  <img :src="item.img ? parent.url + item.img : ''" alt="ad" />
                </div>
              </td>
              <td class="col-title" data-label="Campaign">
                {{ item.campaign_title }}
              </td>
              <td class="col-link" data-label="Link">
                <a :href="item.link" target="_blank" class="link-primary">{{
                  item.link
                }}</a>
              </td>
              <td class="col-actions" data-label="Actions">
                <a
                  href="#"
                  class="action-icon"
                  title="Copy Code"
                  @click.prevent="
                    ;(parent.formData = item), ($refs.copy.active = 1)
                  "
                >
                  <i class="fas fa-copy"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else-if="!loader">No items found</div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  background-color: #f0f4f8;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #fff;
  border-bottom: 2px solid #f0f0f0;
  padding: 18px 15px;
  font-size: 13px;
  font-weight: 700;
  color: #8898aa;
  text-transform: uppercase;
  text-align: left;
}

.data-table td {
  padding: 16px 15px;
  font-size: 14px;
  color: #525f7f;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.data-table tr:hover {
  background-color: #f8f9fe;
}

.col-id {
  text-align: center;
  width: 60px;
}
.col-actions {
  text-align: center;
  width: 100px;
}
.col-title {
  font-weight: 600;
  color: #32325d;
}

.mini-preview img {
  max-width: 100px;
  max-height: 60px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.action-icon {
  font-size: 18px;
  color: #00d68f;
  transition: color 0.2s;
}

.action-icon:hover {
  color: #00b87a;
}

.link-primary {
  color: #00d68f;
  text-decoration: none;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #8898aa;
  background: #fff;
  border-radius: 12px;
}

.form-container {
  padding: 15px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.text-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: center;
}

.btn-primary {
  background-color: #00d68f;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

#spinner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
#spinner img {
  width: 64px;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 10px;
  }

  .toolbar {
    padding: 20px 0;
    justify-content: center;
  }

  .data-table,
  .data-table thead,
  .data-table tbody,
  .data-table th,
  .data-table td,
  .data-table tr {
    display: block;
  }

  .data-table thead {
    display: none;
  }

  .data-table tr {
    background: #fff;
    margin-bottom: 20px;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #edf2f7;
  }

  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 5px;
    border-bottom: 1px solid #f8f9fa;
    text-align: right;
    width: auto !important;
  }

  .data-table td:last-child {
    border-bottom: none;
  }

  .data-table td::before {
    content: attr(data-label);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 11px;
    color: #8898aa;
    margin-right: 15px;
    text-align: left;
  }

  .col-link {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .col-link::before {
    margin-bottom: 5px;
  }

  .link-text {
    display: block;
    width: 100%;
    word-break: break-all;
    font-size: 13px;
    text-align: left;
  }

  .mini-preview img {
    max-width: 120px;
    max-height: 80px;
  }

  .col-actions {
    background: #f8f9fe;
    border-radius: 8px;
    margin-top: 10px;
    justify-content: center !important;
  }

  .action-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    padding: 5px 0;
  }
}
</style>
