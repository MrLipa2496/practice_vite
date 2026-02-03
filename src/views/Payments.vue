<script>
import axios from 'axios'

import Header from '../components/Header.vue'

import loaderImg from '../assets/img/loader.gif'

export default {
  name: 'Payments',
  components: {
    Header
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
      data.append('id', userId)

      self.loader = 1
      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      if (!url) {
        self.loader = 0
        return
      }

      axios
        .post(url + '/site/getPayments?auth=' + auth, data)
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
          <h1 class="page-title">Payments</h1>
        </div>
        <div class="toolbar-center"></div>
        <div class="toolbar-right"></div>
      </div>

      <div class="table-container" v-if="data.items && data.items.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-id">#</th>
              <th class="col-stat">Value</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.items" :key="item.id">
              <td class="col-id" data-label="ID">{{ item.id }}</td>
              <td class="col-stat" data-label="Amount">
                <span class="link-primary" style="font-weight: 700">
                  {{ item.value }}
                </span>
              </td>
              <td class="col-title" data-label="Date">
                {{ item.date_title }}
              </td>
              <td class="col-desc" data-label="Description">
                {{ item.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else-if="!loader">No payments found</div>
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

.data-table tr:hover {
  background-color: #f8f9fe;
}

.col-id {
  text-align: center;
  width: 60px;
}
.col-stat {
  text-align: center;
  width: 120px;
}
.col-title {
  font-weight: 600;
  color: #32325d;
}

.link-primary {
  color: #00d68f;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #8898aa;
  background: #fff;
  border-radius: 12px;
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

@media (max-width: 600px) {
  .content-wrapper {
    padding: 0 12px;
  }

  .toolbar {
    padding: 20px 0;
    justify-content: center;
  }

  .page-title {
    font-size: 20px;
  }

  .table-container {
    background: transparent;
    box-shadow: none;
    overflow: visible;
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
    margin-bottom: 15px;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    border: 1px solid #edf2f7;
    position: relative;
  }

  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
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
    padding-top: 2px;
  }

  .col-id {
    font-size: 12px;
    color: #adb5bd;
    padding-bottom: 5px !important;
  }

  .col-stat {
    font-size: 16px;
  }

  .col-desc {
    flex-direction: column;
    align-items: flex-start !important;
    text-align: left;
  }

  .col-desc::before {
    margin-bottom: 5px;
  }
}
</style>
