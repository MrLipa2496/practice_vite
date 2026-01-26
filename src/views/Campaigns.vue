<script>
import axios from 'axios'
import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'
import Toogle from '../components/Toogle.vue'

export default {
  name: 'Campaigns',
  components: { Header, Popup, Toogle },
  data () {
    return {
      parent: '',
      data: {},
      details: {},
      date: '',
      date2: '',
      q: '',
      sort: '',
      loader: 1,
      id: 0,
      type: 0,
      all: true
    }
  },
  mounted () {
    this.parent = this.$root || this.$parent

    if (this.parent && !this.parent.user) {
      if (this.parent.logout) this.parent.logout()
    }

    this.get()
  },
  methods: {
    toFormData (obj) {
      const fd = new FormData()
      for (let key in obj) {
        fd.append(key, obj[key])
      }
      return fd
    },

    GetFirstAndLastDate () {
      const year = new Date().getFullYear()
      const month = new Date().getMonth()
      const firstDayOfMonth = new Date(year, month, 2)
      const lastDayOfMonth = new Date(year, month + 1, 1)

      this.date = firstDayOfMonth.toISOString().substring(0, 10)
      this.date2 = lastDayOfMonth.toISOString().substring(0, 10)
    },

    get () {
      if (!this.parent.formData) this.parent.formData = {}

      const data = this.toFormData(this.parent.formData)

      if (this.date !== '') data.append('date', this.date)
      if (this.date2 !== '') data.append('date2', this.date2)
      if (this.q) data.append('q', this.q)
      if (this.sort) data.append('sort', this.sort)

      this.loader = 1

      if (!this.parent.user) return

      axios
        .post(
          this.parent.url + '/site/getCampaigns?auth=' + this.parent.user.auth,
          data
        )
        .then(response => {
          this.data = response.data
          this.loader = 0
        })
        .catch(error => {
          if (this.parent.logout) this.parent.logout()
          console.error(error)
        })
    },

    action () {
      if (!this.parent.formData) return
      this.parent.formData.copy = ''

      const data = this.toFormData(this.parent.formData)

      axios
        .post(
          this.parent.url +
            '/site/actionCampaign?auth=' +
            this.parent.user.auth,
          data
        )
        .then(response => {
          if (this.$refs.new) this.$refs.new.active = 0

          if (this.parent.formData.id) {
            this.$refs.header.$refs.msg.successFun(
              'Successfully updated campaign!'
            )
          } else {
            this.$refs.header.$refs.msg.successFun(
              'Successfully added new campaign!'
            )
          }
          this.get()
        })
        .catch(error => {
          console.log('errors', error)
        })
    },

    async del (item) {
      this.parent.formData = item

      if (
        await this.$refs.header.$refs.msg.confirmFun(
          'Please confirm next action',
          'Do you want to delete this campaign?'
        )
      ) {
        const data = this.toFormData(this.parent.formData)

        axios
          .post(
            this.parent.url +
              '/site/deleteCampaign?auth=' +
              this.parent.user.auth,
            data
          )
          .then(response => {
            if (response.data.error) {
              this.$refs.header.$refs.msg.alertFun(response.data.error)
            } else {
              this.$refs.header.$refs.msg.successFun(
                'Successfully deleted campaign!'
              )
              this.get()
            }
          })
          .catch(error => {
            console.log('errors', error)
          })
      }
    },

    getDetails (id, type) {
      console.log('Get details for:', id, 'Type:', type)
    },

    openDetails (id, type) {
      this.$refs.details.active = 1
      this.getDetails(id, type)
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
          <a
            class="btn-primary"
            href="#"
            @click.prevent=";(parent.formData = {}), ($refs.new.active = 1)"
          >
            <i class="fas fa-plus"></i> New
          </a>
        </div>

        <div class="toolbar-center">
          <input
            type="date"
            v-model="date"
            @change="get()"
            class="date-input"
          />
          <span class="date-separator">—</span>
          <input
            type="date"
            v-model="date2"
            @change="get()"
            class="date-input"
          />
        </div>

        <div class="toolbar-right">
          <h1 class="page-title">Campaigns</h1>
        </div>
      </div>

      <Popup
        ref="new"
        :title="
          parent.formData && parent.formData.id
            ? 'Edit campaign'
            : 'New campaign'
        "
      >
        <div class="form-container">
          <form @submit.prevent="action()" v-if="parent.formData">
            <div class="form-group">
              <label>Name</label>
              <input
                type="text"
                v-model="parent.formData.title"
                required
                placeholder="Enter campaign name..."
                class="text-input"
              />
            </div>

            <div class="form-actions">
              <button
                class="btn-primary"
                v-if="parent.formData && parent.formData.id"
              >
                Save Changes
              </button>
              <button
                class="btn-primary"
                v-if="parent.formData && !parent.formData.id"
              >
                Add Campaign
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
              <th class="col-toggle">Status</th>
              <th>Title</th>
              <th class="col-stat">Views</th>
              <th class="col-stat">Clicks</th>
              <th class="col-stat">Leads</th>
              <th class="col-stat">Fraud</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in data.items" :key="item.id || i">
              <td class="col-id">{{ item.id }}</td>
              <td class="col-toggle">
                <Toogle
                  v-model="item.published"
                  @update:modelValue=";(parent.formData = item), action()"
                />
              </td>
              <td class="col-title">
                <router-link :to="'/campaign/' + item.id" class="link-primary">
                  {{ item.title }}
                </router-link>
              </td>
              <td class="col-stat">
                <a href="#" @click.prevent="openDetails(item.id, 1)">{{
                  item.views
                }}</a>
              </td>
              <td class="col-stat">
                <a href="#" @click.prevent="openDetails(item.id, 2)">{{
                  item.clicks || 0
                }}</a>
              </td>
              <td class="col-stat">
                <a href="#" @click.prevent="openDetails(item.id, 3)">{{
                  item.leads || 0
                }}</a>
              </td>
              <td class="col-stat">
                <a href="#" @click.prevent="openDetails(item.id, 4)">{{
                  item.fclicks || 0
                }}</a>
              </td>
              <td class="col-actions">
                <a
                  href="#"
                  @click.prevent=";(parent.formData = item), del(item)"
                  class="icon-delete"
                >
                  <i class="fas fa-trash-alt"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-if="!data.items || data.items.length === 0">
        No items found
      </div>
    </div>

    <Popup ref="details" title="Campaign Details">
      <div class="popup-content">
        <p>Details for campaign loaded in console.</p>
        <pre>{{ details }}</pre>
      </div>
    </Popup>
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

.btn-primary:active {
  transform: translateY(1px);
}

.date-input {
  background: #fff;
  border: 1px solid #dce1e6;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: #555;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.date-input:focus {
  border-color: #00d68f;
  box-shadow: 0 0 0 3px rgba(0, 214, 143, 0.1);
}

.date-separator {
  color: #888;
  font-weight: 500;
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
  border-spacing: 0;
}

.data-table th {
  background-color: #fff;
  border-bottom: 2px solid #f0f0f0;
  padding: 18px 15px;
  font-size: 13px;
  font-weight: 700;
  color: #8898aa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.data-table a {
  text-decoration: none;
  color: inherit;
  font-weight: 500;
  transition: color 0.2s;
}

.data-table a:hover {
  color: #00d68f;
}

/* Specific Columns alignment */
.col-id,
.col-toggle,
.col-stat,
.col-actions {
  text-align: center !important;
  width: 80px;
}

.col-toggle {
  width: 60px;
}

.col-title {
  font-weight: 600;
  color: #32325d;
}

.link-primary {
  color: #00d68f !important;
}

.icon-delete {
  color: #adb5bd !important;
  transition: color 0.2s;
}

.icon-delete:hover {
  color: #f5365c !important;
}

/* --- States --- */
.empty-state {
  text-align: center;
  padding: 60px;
  color: #8898aa;
  background: #fff;
  border-radius: 12px;
  margin-top: 20px;
  font-size: 16px;
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
