<script>
import axios from 'axios'

import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'
import Toogle from '../components/Toogle.vue'

import loaderImg from '../assets/img/loader.gif'

export default {
  name: 'Statistics',
  components: {
    Header,
    Popup,
    Toogle
  },
  data: function () {
    return {
      parent: {
        formData: {},
        user: { id: '', auth: '' },
        url: ''
      },
      loaderImg,
      data: { items: [], types: [], multi: '' },
      date: '',
      date2: '',
      loader: 1,
      type: 0
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
      this.GetFirstAndLastDate()
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

    GetFirstAndLastDate: function () {
      var year = new Date().getFullYear()
      var month = new Date().getMonth()
      var firstDayOfMonth = new Date(year, month, 2)
      var lastDayOfMonth = new Date(year, month + 1, 1)
      this.date = firstDayOfMonth.toISOString().substring(0, 10)
      this.date2 = lastDayOfMonth.toISOString().substring(0, 10)
    },

    get: function () {
      var self = this
      if (!self.parent.formData) self.parent.formData = {}

      var data = this.toFormData(self.parent.formData)
      const userId = this.parent.user ? this.parent.user.id : ''

      data.append('id', userId)
      data.append('type', 'user')

      if (this.date != '') data.append('date', this.date)
      if (this.date2 != '') data.append('date2', this.date2)
      if (this.type != '') data.append('type', this.type)

      self.loader = 1
      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      if (!url) {
        self.loader = 0
        return
      }

      axios
        .post(url + '/site/getStatistics?auth=' + auth, data)
        .then(function (response) {
          self.loader = 0
          self.data = response.data

          if (response.data.types && response.data.types[0] && !self.type) {
            self.type = response.data.types[0].id
          }

          if (self.parent.formData) {
            self.parent.formData.copy = self.data.multi
          }
        })
        .catch(function (error) {
          console.error(error)
          if (self.parent.logout) self.parent.logout()
          self.loader = 0
        })
    },

    actionStatistic: function () {
      var self = this
      var data = this.toFormData(self.parent.formData)
      const userId = this.parent.user ? this.parent.user.id : ''
      data.append('uid', userId)

      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      axios
        .post(url + '/site/actionStatistic?auth=' + auth, data)
        .then(function (response) {
          const msg = self.$refs.header?.$refs?.msg
          if (response.data.error) {
            if (msg) msg.alertFun(response.data.error)
            return false
          }

          if (msg) {
            const text = self.parent.formData.id
              ? 'Successfully updated banner!'
              : 'Successfully added new banner!'
            msg.successFun(text)
          }
          self.get()
        })
        .catch(function (error) {
          console.log('errors: ', error)
        })
    },

    copy: async function (text) {
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        const msg = this.$refs.header?.$refs?.msg
        if (msg) msg.successFun('Successfully copied!')
        if (this.$refs.copy) this.$refs.copy.active = 0
        this.parent.formData = {}
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
          <h1 class="page-title">Statistics</h1>
        </div>
        <div class="toolbar-center">
          <div class="date-group">
            <input
              type="date"
              class="date-input"
              v-model="date"
              @change="get()"
            />
            <span class="date-separator">-</span>
            <input
              type="date"
              class="date-input"
              v-model="date2"
              @change="get()"
            />
          </div>
        </div>
        <div class="toolbar-right">
          <a
            href="#"
            class="btn-primary"
            @click.prevent="
              ;(parent.formData.copy = data.multi), ($refs.copy.active = 1)
            "
          >
            <i class="fas fa-images"></i> Multi banners
          </a>
        </div>
      </div>

      <Popup ref="img" title="Banner">
        <div class="ac" v-if="parent.formData && parent.formData.img">
          <img
            :src="parent.url + '/' + parent.formData.img"
            style="max-width: 100%; border-radius: 8px"
          />
        </div>
      </Popup>

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
            <div class="form-group">
              <label>Type</label>
              <select
                class="text-input"
                v-model="type"
                @change="get()"
                required
              >
                <option value="0">---</option>
                <option v-for="c in data.types" :key="c.id" :value="c.id">
                  {{ c.title }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button
                class="btn-primary"
                @click.prevent="copy(parent.formData.copy)"
              >
                Copy code
              </button>
            </div>
          </form>
        </div>
      </Popup>

      <div class="table-container" v-if="data.items && data.items.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-toggle"></th>
              <th style="width: 80px">Img</th>
              <th>Campaign</th>
              <th>Link</th>
              <th class="col-stat">Views</th>
              <th class="col-stat">Clicks</th>
              <th class="col-stat">Leads</th>
              <th class="col-stat">Fraud</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.items" :key="item.id">
              <td class="col-toggle">
                <Toogle
                  :modelValue="item.published"
                  @update:modelValue="
                    item.published = $event
                    ;(parent.formData = item), actionStatistic()
                  "
                />
              </td>
              <td>
                <div
                  class="mini-preview"
                  @click=";(parent.formData = item), ($refs.img.active = 1)"
                >
                  <img
                    :src="item.img ? parent.url + '/' + item.img : ''"
                    style="cursor: pointer"
                  />
                </div>
              </td>
              <td class="col-title" data-label="Campaign">
                {{ item.campaign_title }}
              </td>
              <td class="col-link" data-label="Link">{{ item.link }}</td>
              <td class="col-stat" data-label="Views">{{ item.views }}</td>
              <td class="col-stat" data-label="Clicks">
                {{ item.clicks || 0 }}
              </td>
              <td class="col-stat" data-label="Leads">{{ item.leads || 0 }}</td>
              <td class="col-stat" data-label="Fraud">
                <span :class="{ 'text-danger': item.fclicks > 0 }">{{
                  item.fclicks || 0
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else-if="!loader">
        No statistics found for selected period
      </div>
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
  gap: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}
.date-group {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 5px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.date-input {
  border: 1px solid #dce1e6;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  outline: none;
}
.date-separator {
  margin: 0 10px;
  color: #888;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #00d68f;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
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
  font-size: 11px;
  font-weight: 700;
  color: #8898aa;
  text-transform: uppercase;
}
.data-table td {
  padding: 16px 15px;
  font-size: 14px;
  color: #525f7f;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}
.col-link {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mini-preview img {
  max-width: 60px;
  max-height: 40px;
  border-radius: 4px;
  border: 1px solid #eee;
  cursor: pointer;
  display: block;
}
.text-danger {
  color: #f5365c;
  font-weight: bold;
}

@media (max-width: 850px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 20px 0;
    gap: 15px;
  }
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .date-group {
    width: 100%;
    justify-content: space-between;
  }
  .date-input {
    flex: 1;
    width: 40%;
  }
  .btn-primary {
    width: 100%;
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
    margin-bottom: 20px;
    border: 1px solid #edf2f7;
    border-radius: 12px;
    padding: 10px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f8f9fa;
    padding: 12px 8px;
    text-align: right;
  }
  .data-table td:last-child {
    border-bottom: none;
  }

  .data-table td::before {
    content: attr(data-label);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10px;
    color: #adb5bd;
    margin-right: 15px;
    text-align: left;
  }

  .col-toggle {
    background: #f8f9fe;
    border-radius: 8px;
    margin-bottom: 8px;
  }
  .col-link {
    max-width: 180px;
  }
  .mini-preview img {
    max-width: 80px;
    max-height: 50px;
  }
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
.form-container {
  padding: 20px;
  background-color: #fff;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #4a5568;
}

.text-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  background-color: #f8fafc;
  box-sizing: border-box;
  transition: all 0.2s ease;
  outline: none;
}

.text-input:focus {
  border-color: #00d68f;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(0, 214, 143, 0.1);
}

.form-actions {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: #00d68f;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #00b87a;
}

textarea.text-input {
  line-height: 1.5;
  resize: vertical;
}
.text-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
</style>
