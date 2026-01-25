<script>
import axios from 'axios'
import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'

export default {
  name: 'Campaigns',
  components: { Header, Popup },
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
    this.parent = this.$root

    if (!this.parent.user) {
      this.parent.logout()
    }

    this.get()
    this.GetFirstAndLastDate()
  },
  methods: {
    // --- NEW METHOD: Moved here to fix the error ---
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

      // FIX: Call local this.toFormData instead of parent
      const data = this.toFormData(this.parent.formData)

      if (this.date !== '') data.append('date', this.date)
      if (this.date2 !== '') data.append('date2', this.date2)

      this.loader = 1

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
          this.parent.logout()
        })
    },

    action () {
      this.parent.formData.copy = ''

      // FIX: Call local this.toFormData
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
        // FIX: Call local this.toFormData
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
  <div class="inside-content">
    <Header ref="header" />

    <div id="spinner" v-if="loader">
      <img src="/src/assets/img/loader.gif" alt="Loading..." />
    </div>

    <div class="wrapper">
      <div class="flex panel">
        <div class="w20"></div>

        <div class="w60 ptb20 ac">
          <input type="date" v-model="date" @change="get()" />
          <span style="margin: 0 5px; color: #888">-</span>
          <input type="date" v-model="date2" @change="get()" />
        </div>

        <div class="w20 ptb30 ar">
          <h1>Campaigns</h1>
        </div>
      </div>

      <div class="table" v-if="data.items != ''">
        <table>
          <thead>
            <tr>
              <th class="id">#</th>
              <th class="id"></th>
              <th>Title</th>
              <th class="id">Views</th>
              <th class="id">Clicks</th>
              <th class="id">Leads</th>
              <th class="id">Fraud clicks</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in data.items" :key="item.id || i">
              <td class="id">{{ item.id }}</td>
              <td class="id"></td>
              <td>
                <router-link :to="'/campaign/' + item.id">{{
                  item.title
                }}</router-link>
              </td>
              <td class="id">
                <a href="#" @click.prevent="openDetails(item.id, 1)">
                  {{ item.views }}
                </a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="openDetails(item.id, 2)">
                  <template v-if="item.clicks">{{ item.clicks }}</template>
                  <template v-else>0</template>
                </a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="openDetails(item.id, 3)">
                  <template v-if="item.leads">{{ item.leads }}</template>
                  <template v-else>0</template>
                </a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="openDetails(item.id, 4)">
                  <template v-if="item.fclicks">{{ item.fclicks }}</template>
                  <template v-else>0</template>
                </a>
              </td>
              <td class="actions">
                <a href="#" @click.prevent="del(item)">
                  <i class="fas fa-trash-alt"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty" v-if="data.items == ''">No items</div>
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
.inside-content {
  background-color: #f0f4f8;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  position: relative;
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.flex {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

.w20 {
  width: 20%;
}
.w60 {
  width: 60%;
}

.ptb20 {
  padding-top: 20px;
  padding-bottom: 20px;
}
.ptb30 {
  padding-top: 30px;
  padding-bottom: 30px;
}

.ac {
  text-align: center;
}
.al {
  text-align: left;
}
.ar {
  text-align: right;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

input[type='date'] {
  background: #fff;
  border: 1px solid #dce1e6;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: #555;
  outline: none;
  margin: 0 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s;
}

input[type='date']:focus {
  border-color: #3498db;
}

.table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

thead {
  background-color: #fff;
  border-bottom: 2px solid #f0f0f0;
}

th {
  padding: 18px 15px;
  font-size: 13px;
  font-weight: 700;
  color: #2c3e50;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 16px 15px;
  font-size: 14px;
  color: #555;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

td a {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  transition: color 0.2s;
}

td a:hover {
  color: #3498db;
}

th.id,
td.id,
th.actions,
td.actions {
  text-align: center;
  width: 80px;
}

tbody tr:nth-child(odd) {
  background-color: #f9fafb;
}
tbody tr:nth-child(even) {
  background-color: #ffffff;
}
tbody tr:hover {
  background-color: #f1f5f9;
}

.actions i {
  color: #555;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}

.actions i:hover {
  color: #e74c3c;
  transform: scale(1.1);
}

.empty {
  text-align: center;
  padding: 40px;
  color: #888;
  background: #fff;
  border-radius: 8px;
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
  height: auto;
}

.popup-content {
  padding: 20px;
}
</style>
