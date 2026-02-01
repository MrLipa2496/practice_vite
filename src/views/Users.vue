<script>
import axios from 'axios'

import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'
import Toogle from '../components/Toogle.vue'

export default {
  name: 'Users',
  components: {
    Header,
    Popup,
    Toogle
  },
  data: function () {
    return {
      parent: {
        formData: {},
        user: { auth: '' },
        url: '',
        toFormData: obj => {
          const fd = new FormData()
          for (let key in obj) fd.append(key, obj[key])
          return fd
        }
      },
      data: { items: [], types: [] },
      loader: 1,
      type: 0,
      uid: -1
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
      if (!self.parent.formData) self.parent.formData = {}

      var data = this.toFormData(self.parent.formData)
      if (this.type != '') data.append('type', this.type)

      self.loader = 1
      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      if (!url) {
        this.loader = 0
        return
      }

      axios
        .post(url + '/site/getUsers?auth=' + auth, data)
        .then(function (response) {
          self.loader = 0
          self.data = response.data
          if (response.data.types && response.data.types[0] && !self.type) {
            self.type = response.data.types[0].id
          }
          if (self.uid > -1 && self.data.items) {
            self.parent.formData.copy = self.data.items[self.uid].multi
          }
        })
        .catch(function (error) {
          if (self.parent.logout) self.parent.logout()
          self.loader = 0
        })
    },

    action: function () {
      var self = this
      if (!self.parent.formData) return

      var data = this.toFormData(self.parent.formData)
      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      axios
        .post(url + '/site/actionUser?auth=' + auth, data)
        .then(function (response) {
          if (response.data.error) {
            self.$refs.header.$refs.msg.alertFun(response.data.error)
          } else {
            if (self.$refs.new) self.$refs.new.active = 0

            const msg = self.parent.formData.id
              ? 'Successfully updated user!'
              : 'Successfully added new user!'
            self.$refs.header.$refs.msg.successFun(msg)
            self.get()
          }
        })
        .catch(function (error) {
          console.log('errors', error)
        })
    },

    del: async function () {
      if (
        await this.$refs.header.$refs.msg.confirmFun(
          'Please confirm',
          'Delete this user?'
        )
      ) {
        var self = this
        var data = this.toFormData(self.parent.formData)
        const url = this.parent.url || ''
        const auth = this.parent.user ? this.parent.user.auth : ''

        axios
          .post(url + '/site/deleteUser?auth=' + auth, data)
          .then(function (response) {
            if (response.data.error) {
              self.$refs.header.$refs.msg.alertFun(response.data.error)
            } else {
              self.$refs.header.$refs.msg.successFun(
                'Successfully deleted user!'
              )
              self.get()
            }
          })
      }
    },
    copy: async function (text) {
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        this.$refs.header.$refs.msg.successFun('Successfully copied!')
        if (this.$refs.copy) this.$refs.copy.active = 0
        this.parent.formData = {}
      } else {
        this.$refs.header.$refs.msg.alertFun('Use https!')
      }
    }
  }
}
</script>

<template>
  <div class="page-container">
    <Header ref="header" />
    <div id="spinner" v-if="loader">
      <img src="/src/assets/img/loader.gif" alt="Loading..." />
    </div>

    <div class="content-wrapper">
      <div class="toolbar">
        <div class="toolbar-left">
          <h1 class="page-title">Users</h1>
        </div>
        <div class="toolbar-center">
          <search />
        </div>
        <div class="toolbar-right">
          <a
            class="btn-primary"
            href="#"
            @click.prevent=";(parent.formData = {}), ($refs.new.active = 1)"
          >
            <i class="fas fa-plus"></i> New
          </a>
        </div>
      </div>

      <Popup
        ref="new"
        :title="
          parent.formData && parent.formData.id ? 'Edit user' : 'New user'
        "
      >
        <div class="form-container">
          <form @submit.prevent="action()" v-if="parent.formData">
            <div class="form-group">
              <label>Name</label>
              <input
                type="text"
                class="text-input"
                v-model="parent.formData.user"
                required
              />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input
                type="text"
                class="text-input"
                v-model="parent.formData.phone"
                required
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                type="text"
                class="text-input"
                v-model="parent.formData.email"
                required
              />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input
                type="text"
                class="text-input"
                v-model="parent.formData.password"
              />
            </div>
            <div class="form-actions">
              <button class="btn-primary">
                {{ parent.formData.id ? 'Edit' : 'Add' }}
              </button>
            </div>
          </form>
        </div>
      </Popup>

      <Popup ref="copy" title="Copy banner">
        <div class="form-container">
          <form v-if="parent.formData">
            <div class="form-group">
              <label>Code</label>
              <textarea
                class="text-input"
                style="height: 100px"
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
                <option value="0"></option>
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
              <th class="col-id">#</th>
              <th class="col-toggle"></th>
              <th class="col-title">Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in data.items" :key="item.id || i">
              <td class="col-id">{{ item.id }}</td>
              <td class="col-toggle">
                <Toogle
                  :modelValue="item.published"
                  @update:modelValue="
                    item.published = $event
                    ;(parent.formData = item), action()
                  "
                />
              </td>
              <td class="col-title">
                <router-link :to="'/user/' + item.id" class="link-primary">
                  {{ item.user }}
                </router-link>
              </td>
              <td>{{ item.phone }}</td>
              <td>{{ item.email }}</td>
              <td class="col-actions">
                <router-link :to="'/user/' + item.id" class="action-icon">
                  <i class="fas fa-edit"></i>
                </router-link>
                <a
                  href="#"
                  class="action-icon"
                  @click.prevent="
                    ;(parent.formData.copy = item.multi), (uid = i)
                    $refs.copy.active = 1
                  "
                >
                  <i class="fas fa-images"></i>
                </a>
                <a
                  href="#"
                  class="icon-delete"
                  @click.prevent=";(parent.formData = item), del()"
                >
                  <i class="fas fa-trash-alt"></i>
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
  gap: 20px;
}

.toolbar-left,
.toolbar-right {
  flex: 1;
}

.toolbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
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
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary:hover {
  background-color: #00b87a;
}

.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.form-container {
  padding: 10px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
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

.col-id,
.col-toggle,
.col-actions {
  text-align: center !important;
  width: 80px;
}

.col-title {
  font-weight: 600;
  color: #32325d;
}

.link-primary {
  color: #00d68f !important;
  text-decoration: none;
}

.action-icon {
  margin: 0 5px;
  color: #525f7f;
}

.icon-delete {
  color: #adb5bd !important;
  margin-left: 5px;
}

.icon-delete:hover {
  color: #f5365c !important;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #8898aa;
  background: #fff;
  border-radius: 12px;
  margin-top: 20px;
}

#spinner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
#spinner img {
  width: 64px;
}
</style>
