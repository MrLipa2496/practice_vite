<script>
import axios from 'axios'

import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'
import Toogle from '../components/Toogle.vue'

import loaderImg from '../assets/img/loader.gif'

export default {
  name: 'Sites',
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
      data: { items: [] },
      date: '',
      date2: '',
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
      var data = this.toFormData(self.parent.formData)

      const userId = this.parent.user ? this.parent.user.id : ''
      data.append('uid', userId)

      if (this.date != '') data.append('date', this.date)
      if (this.date2 != '') data.append('date2', this.date2)

      self.loader = 1
      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      if (!url) {
        self.loader = 0
        return
      }

      axios
        .post(url + '/site/getSites?auth=' + auth, data)
        .then(function (response) {
          self.loader = 0
          if (response.data.error) {
            const msg = self.$refs.header?.$refs?.msg
            if (msg) msg.alertFun(response.data.error)
            return false
          }
          self.data = response.data
        })
        .catch(function (error) {
          console.error(error)
          if (self.parent.logout) self.parent.logout()
          self.loader = 0
        })
    },

    action: function () {
      var self = this
      var data = this.toFormData(self.parent.formData)
      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      axios
        .post(url + '/site/actionSite?auth=' + auth, data)
        .then(function (response) {
          const msg = self.$refs.header?.$refs?.msg
          if (response.data.error) {
            if (msg) msg.alertFun(response.data.error)
            return false
          }

          if (msg) {
            const text = self.parent.formData.id
              ? 'Successfully updated site!'
              : 'Successfully added new site!'
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
          <h1 class="page-title">Sites</h1>
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
              <th class="col-title">Site</th>
              <th class="col-stat">Views</th>
              <th class="col-stat">Clicks</th>
              <th class="col-stat">Leads</th>
              <th class="col-stat">Fraud</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.items" :key="item.id">
              <td class="col-toggle" data-label="Status">
                <Toogle
                  :modelValue="item.published"
                  @update:modelValue="
                    ;(item.published = $event), (parent.formData = item)
                    action()
                  "
                />
              </td>
              <td class="col-title" data-label="Site">{{ item.site }}</td>
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
  font-size: 12px;
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

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 10px;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 0;
    gap: 15px;
  }

  .date-group {
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .date-input {
    flex: 1;
    min-width: 0;
    width: 45%;
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
    margin-bottom: 15px;
    border: 1px solid #edf2f7;
    border-radius: 10px;
    background: #fff;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
  }

  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f8f9fa;
    padding: 10px 5px;
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
    float: left;
    margin-right: 10px;
  }

  .col-toggle {
    order: -1;
    background: #fcfcfc;
    border-radius: 8px;
    margin-bottom: 5px;
  }
}

.text-danger {
  color: #f5365c;
  font-weight: bold;
}
.btn-primary {
  background-color: #00d68f;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
}
</style>
