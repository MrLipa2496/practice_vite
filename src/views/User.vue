<script>
import axios from 'axios'
import Chart from 'chart.js/auto'

import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'
import Toogle from '../components/Toogle.vue'

import loaderImg from '../assets/img/loader.gif'

export default {
  name: 'User',
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
        url: ''
      },
      loaderImg,
      data: { statistics: [], sites: [], payments: [], info: {} },
      user: [],
      tab: 0,
      tabs: ['Statistic', 'Sites', 'Payments'],
      date: '',
      date2: '',
      iChart: -1,
      loader: 1,
      myChartInstance: null,
      mySiteChart: null
    }
  },
  mounted: function () {
    const foundParent = this.findParent()
    if (foundParent) {
      this.parent = foundParent
    }

    if (!this.parent.user) {
      this.parent.logout()
    }

    if (!this.$route.params.id) {
      this.$router.push('/users')
    }

    this.GetFirstAndLastDate()
    this.get()
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
      data.append('id', this.$route.params.id)
      data.append('uid', this.$route.params.id)
      if (this.date != '') data.append('date', this.date)
      if (this.date2 != '') data.append('date2', this.date2)

      self.loader = 1

      axios
        .post(
          this.parent.url + '/site/getUser?auth=' + this.parent.user.auth,
          data
        )
        .then(function (response) {
          self.loader = 0
          if (response.data.error) {
            self.$refs.header.$refs.msg.alertFun(response.data.error)
            return false
          }
          self.data = response.data
          if (self.data.info) self.user = self.data.info
          if (self.data.info && self.data.info.user)
            document.title = self.data.info.user
        })
        .catch(function (error) {
          self.parent.logout()
        })
    },
    action: function () {
      var self = this
      var data = this.toFormData(self.parent.formData)

      axios
        .post(
          this.parent.url + '/site/actionUser?auth=' + this.parent.user.auth,
          data
        )
        .then(function (response) {
          if (response.data.error) {
            self.$refs.header.$refs.msg.alertFun(response.data.error)
            return false
          } else {
            self.$refs.new.active = 0
            if (self.parent.formData.id) {
              self.$refs.header.$refs.msg.successFun(
                'Successfully updated user!'
              )
            } else {
              self.$refs.header.$refs.msg.successFun(
                'Successfully added new user!'
              )
            }
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
          'Please confirm next action',
          'Do you want to delete this user?'
        )
      ) {
        var self = this
        var data = this.toFormData(self.parent.formData)
        axios
          .post(
            this.parent.url + '/site/deleteUser?auth=' + this.parent.user.auth,
            data
          )
          .then(function (response) {
            if (response.data.error) {
              self.$refs.header.$refs.msg.alertFun(response.data.error)
              return false
            } else {
              self.$refs.header.$refs.msg.successFun(
                'Successfully deleted user!'
              )
              self.$router.push('/users')
            }
          })
      }
    },
    actionStatistic: function () {
      var self = this
      var data = this.toFormData(self.parent.formData)
      data.append('uid', this.$route.params.id)

      axios
        .post(
          this.parent.url +
            '/site/actionStatistic?auth=' +
            this.parent.user.auth,
          data
        )
        .then(function (response) {
          if (response.data.error) {
            self.$refs.header.$refs.msg.alertFun(response.data.error)
            return false
          } else {
            self.$refs.header.$refs.msg.successFun(
              self.parent.formData.id
                ? 'Successfully updated banner!'
                : 'Successfully added new banner!'
            )
            self.get()
          }
        })
    },
    actionPayment: function () {
      var self = this
      var data = this.toFormData(self.parent.formData)
      data.append('uid', this.$route.params.id)

      axios
        .post(
          this.parent.url + '/site/actionPayment?auth=' + this.parent.user.auth,
          data
        )
        .then(function (response) {
          if (response.data.error) {
            self.$refs.header.$refs.msg.alertFun(response.data.error)
            return false
          } else {
            self.$refs.payment.active = 0
            self.$refs.header.$refs.msg.successFun(
              self.parent.formData.id
                ? 'Successfully updated payment!'
                : 'Successfully added new payment!'
            )
            self.get()
          }
        })
    },
    delPayment: async function () {
      if (
        await this.$refs.header.$refs.msg.confirmFun(
          'Please confirm next action',
          'Do you want to delete this payment?'
        )
      ) {
        var self = this
        var data = this.toFormData(self.parent.formData)
        axios
          .post(
            this.parent.url +
              '/site/deletePayment?auth=' +
              this.parent.user.auth,
            data
          )
          .then(function (response) {
            if (response.data.error) {
              self.$refs.header.$refs.msg.alertFun(response.data.error)
              return false
            } else {
              self.$refs.header.$refs.msg.successFun(
                'Successfully deleted payment!'
              )
              self.get()
            }
          })
      }
    },
    actionSite: function () {
      var self = this
      var data = this.toFormData(self.parent.formData)
      axios
        .post(
          this.parent.url + '/site/actionSite?auth=' + this.parent.user.auth,
          data
        )
        .then(function (response) {
          if (response.data.error) {
            self.$refs.header.$refs.msg.alertFun(response.data.error)
            return false
          } else {
            self.$refs.header.$refs.msg.successFun(
              self.parent.formData.id
                ? 'Successfully updated site!'
                : 'Successfully added new site!'
            )
            self.get()
          }
        })
    },

    getStatisticChart () {
      if (this.iChart === -1 || !this.data.statistics[this.iChart]) return
      let item = this.data.statistics[this.iChart]
      this.parent.formData = item
      const data = this.toFormData(this.parent.formData)
      if (this.date) data.append('date', this.date)
      if (this.date2) data.append('date2', this.date2)

      axios
        .post(
          this.parent.url +
            '/site/getCampaignBannersChart?auth=' +
            this.parent.user.auth,
          data
        )
        .then(response => {
          if (response.data.error) {
            this.$refs.header.$refs.msg.alertFun(response.data.error)
            return
          }
          let resItem = response.data.items
            ? response.data.items
            : response.data
          if (resItem) {
            if (resItem.line)
              this.data.statistics[this.iChart].line = resItem.line
            if (resItem.sites)
              this.data.statistics[this.iChart].sites = resItem.sites
            if (resItem.clicks !== undefined)
              this.data.statistics[this.iChart].clicks = resItem.clicks
            if (resItem.views !== undefined)
              this.data.statistics[this.iChart].views = resItem.views
            if (resItem.leads !== undefined)
              this.data.statistics[this.iChart].leads = resItem.leads
          }
          this.renderStatisticChart(this.data.statistics[this.iChart])
        })
    },
    LineStatistic: function (item) {
      this.$nextTick(() => {
        const container = document.getElementById('chartOuterStats')
        if (container) {
          container.innerHTML =
            '<div style="padding:20px; text-align:center">Loading...</div>'
          this.getStatisticChart()
        }
      })
    },
    renderStatisticChart: function (item) {
      const self = this
      if (this.myChartInstance) this.myChartInstance.destroy()
      if (!document.getElementById('chartOuterStats')) return

      setTimeout(function () {
        const container = document.getElementById('chartOuterStats')
        if (!container) return
        let dates = [],
          clicks = [],
          views = [],
          leads = []
        let current = new Date(self.date),
          end = new Date(self.date2)

        while (current <= end) {
          let year = current.getFullYear(),
            month = ('0' + (current.getMonth() + 1)).slice(-2),
            day = ('0' + current.getDate()).slice(-2)
          let keyDateDot = `${day}.${month}.${year}`,
            keyDateDash = `${year}-${month}-${day}`
          dates.push(`${day}.${month}.${year}`)
          let stats =
            item && item.line
              ? item.line[keyDateDot] || item.line[keyDateDash]
              : null
          clicks.push(stats ? parseInt(stats.clicks) || 0 : 0)
          views.push(stats ? parseInt(stats.views) || 0 : 0)
          current.setDate(current.getDate() + 1)
        }

        container.innerHTML =
          '<div id="chartHintsStats"><div class="chartHintsViews">Views</div><div class="chartHintsClicks">Clicks</div></div><canvas id="myChartStats"></canvas>'
        const ctx = document.getElementById('myChartStats')
        self.myChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Clicks',
                borderColor: '#00599D',
                data: clicks,
                yAxisID: 'y',
                borderWidth: 2,
                pointRadius: 3
              },
              {
                label: 'Views',
                borderColor: '#5000B8',
                data: views,
                yAxisID: 'y2',
                borderWidth: 2,
                pointRadius: 3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { type: 'linear', position: 'right', beginAtZero: true },
              y2: {
                type: 'linear',
                position: 'left',
                beginAtZero: true,
                grid: { color: '#e5e5e5' }
              }
            }
          }
        })
      }, 100)
    },

    getSiteChart () {
      if (this.iChart === -1 || !this.data.sites[this.iChart]) return
      let item = this.data.sites[this.iChart]
      this.parent.formData = item
      const data = this.toFormData(this.parent.formData)
      if (this.date) data.append('date', this.date)
      if (this.date2) data.append('date2', this.date2)

      axios
        .post(
          this.parent.url + '/site/getSiteChart?auth=' + this.parent.user.auth,
          data
        )
        .then(response => {
          if (response.data.error) {
            this.$refs.header.$refs.msg.alertFun(response.data.error)
            return
          }
          let resItem = response.data.items
            ? response.data.items
            : response.data
          if (resItem) {
            if (resItem.line) this.data.sites[this.iChart].line = resItem.line
            if (resItem.clicks !== undefined)
              this.data.sites[this.iChart].clicks = resItem.clicks
            if (resItem.views !== undefined)
              this.data.sites[this.iChart].views = resItem.views
            if (resItem.leads !== undefined)
              this.data.sites[this.iChart].leads = resItem.leads
          }
          this.renderSiteChart(this.data.sites[this.iChart])
        })
    },
    LineSite: function (item) {
      this.$nextTick(() => {
        const container = document.getElementById('chartOuterSites')
        if (container) {
          container.innerHTML =
            '<div style="padding:20px; text-align:center">Loading...</div>'
          this.getSiteChart()
        }
      })
    },
    renderSiteChart: function (item) {
      const self = this
      if (this.mySiteChart) this.mySiteChart.destroy()
      if (!document.getElementById('chartOuterSites')) return

      setTimeout(function () {
        const container = document.getElementById('chartOuterSites')
        if (!container) return
        let dates = [],
          clicks = [],
          views = []
        let current = new Date(self.date),
          end = new Date(self.date2)

        while (current <= end) {
          let year = current.getFullYear(),
            month = ('0' + (current.getMonth() + 1)).slice(-2),
            day = ('0' + current.getDate()).slice(-2)
          let keyDateDot = `${day}.${month}.${year}`,
            keyDateDash = `${year}-${month}-${day}`
          dates.push(`${day}.${month}.${year}`)
          let stats =
            item && item.line
              ? item.line[keyDateDot] || item.line[keyDateDash]
              : null
          clicks.push(stats ? parseInt(stats.clicks) || 0 : 0)
          views.push(stats ? parseInt(stats.views) || 0 : 0)
          current.setDate(current.getDate() + 1)
        }

        container.innerHTML =
          '<div id="chartHintsSites"><div class="chartHintsViews">Views</div><div class="chartHintsClicks">Clicks</div></div><canvas id="myChartSites"></canvas>'
        const ctx = document.getElementById('myChartSites')
        self.mySiteChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Clicks',
                borderColor: '#00599D',
                data: clicks,
                yAxisID: 'y',
                borderWidth: 2,
                pointRadius: 3
              },
              {
                label: 'Views',
                borderColor: '#5000B8',
                data: views,
                yAxisID: 'y2',
                borderWidth: 2,
                pointRadius: 3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { type: 'linear', position: 'left', beginAtZero: true },
              y2: {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                grid: { drawOnChartArea: false }
              }
            }
          }
        })
      }, 100)
    },
    getDetails (id, type) {
      console.log('Details for', id, type)
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

    <div class="sub-header-user">
      <div class="content-wrapper">
        <div class="toolbar">
          <div class="toolbar-left">
            <a
              class="btn-primary"
              href="#"
              @click.prevent=";(parent.formData = user), ($refs.new.active = 1)"
            >
              <i class="fas fa-edit"></i> Edit user
            </a>
          </div>
          <div class="toolbar-right">
            <h1 class="page-title" v-if="data && data.info">
              {{ data.info.user }}
            </h1>
          </div>
        </div>

        <div class="user-brief-info" v-if="data && data.info">
          <span><b>Phone:</b> {{ data.info.phone }}</span>
          <span><b>Email:</b> {{ data.info.email }}</span>
        </div>

        <div class="tabs-container">
          <ul>
            <li
              v-for="(t, i) in tabs"
              :key="i"
              :class="{ active: tab == i }"
              @click="tab = i"
            >
              {{ t }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
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

      <div v-if="tab == 1">
        <div class="toolbar">
          <div class="toolbar-left">
            <h2 class="section-subtitle">{{ tabs[tab] }}</h2>
          </div>
          <div class="toolbar-center">
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
          <div class="toolbar-right"></div>
        </div>

        <div class="table-container" v-if="data.sites && data.sites.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-toggle"></th>
                <th>Site</th>
                <th class="col-stat">Views</th>
                <th class="col-stat">Clicks</th>
                <th class="col-stat">Leads</th>
                <th class="col-stat">Fraud</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in data.sites" :key="item.id || i">
                <td class="col-toggle">
                  <Toogle
                    :modelValue="item.published"
                    @update:modelValue="
                      item.published = $event
                      ;(parent.formData = item), actionSite()
                    "
                  />
                </td>
                <td class="col-title">{{ item.site }}</td>
                <td class="col-stat">{{ item.views }}</td>
                <td class="col-stat">{{ item.clicks || 0 }}</td>
                <td class="col-stat">{{ item.leads || 0 }}</td>
                <td class="col-stat">
                  <a
                    href="#"
                    class="link-primary"
                    @click.prevent="
                      $refs.details &&
                        (($refs.details.active = 1), getDetails(item.id, 4))
                    "
                  >
                    {{ item.fclicks || 0 }}
                  </a>
                </td>
                <td class="col-actions">
                  <a
                    href="#"
                    class="action-icon"
                    @click.prevent="
                      ;(parent.formData = item), (iChart = i)
                      $refs.chart.active = 1
                      LineSite(item)
                    "
                  >
                    <i class="fas fa-chart-bar"></i>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" v-else-if="!loader">No sites found</div>
      </div>

      <div v-if="tab == 2">
        <div class="toolbar">
          <div class="toolbar-left">
            <h2 class="section-subtitle">{{ tabs[tab] }}</h2>
          </div>
          <div class="toolbar-right">
            <a
              class="btn-primary"
              href="#"
              @click.prevent="
                ;(parent.formData = {}), ($refs.payment.active = 1)
              "
            >
              <i class="fas fa-plus"></i> Add payment
            </a>
          </div>
        </div>

        <div
          class="table-container"
          v-if="data.payments && data.payments.length > 0"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-id">#</th>
                <th>Value</th>
                <th>Date</th>
                <th>Description</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in data.payments" :key="item.id">
                <td class="col-id">{{ item.id }}</td>
                <td class="col-title">
                  <a
                    href="#"
                    class="link-primary"
                    @click.prevent="
                      ;(parent.formData = item), ($refs.payment.active = 1)
                    "
                    >{{ item.value }}</a
                  >
                </td>
                <td>{{ item.date_title }}</td>
                <td>{{ item.description }}</td>
                <td class="col-actions">
                  <a
                    href="#"
                    class="action-icon"
                    @click.prevent="
                      ;(parent.formData = item), ($refs.payment.active = 1)
                    "
                    ><i class="fas fa-edit"></i
                  ></a>
                  <a
                    href="#"
                    class="icon-delete"
                    @click.prevent=";(parent.formData = item), delPayment()"
                    ><i class="fas fa-trash-alt"></i
                  ></a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" v-else-if="!loader">No payments found</div>
      </div>

      <div v-if="tab == 0">
        <div class="toolbar">
          <div class="toolbar-left">
            <h2 class="section-subtitle">{{ tabs[tab] }}</h2>
          </div>
          <div class="toolbar-center">
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
          <div class="toolbar-right"></div>
        </div>

        <div
          class="table-container"
          v-if="data.statistics && data.statistics.length > 0"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-toggle"></th>
                <th style="width: 60px">Img</th>
                <th>Campaign</th>
                <th>Size</th>
                <th class="col-stat">Views</th>
                <th class="col-stat">Clicks</th>
                <th class="col-stat">Leads</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in data.statistics" :key="item.id || i">
                <td class="col-toggle">
                  <Toogle
                    :modelValue="item.published"
                    @update:modelValue="
                      ;(item.published = $event), (parent.formData = item)
                      actionStatistic()
                    "
                  />
                </td>
                <td>
                  <a
                    href="#"
                    @click.prevent="
                      ;(parent.formData = item), ($refs.img.active = 1)
                    "
                  >
                    <img
                      :src="item.img ? parent.url + item.img : ''"
                      style="max-height: 150px; border-radius: 4px"
                    />
                  </a>
                </td>
                <td class="col-title">{{ item.campaign_title }}</td>
                <td style="font-size: 12px; color: #999">{{ item.size }}</td>
                <td class="col-stat">{{ item.views }}</td>
                <td class="col-stat">{{ item.clicks || 0 }}</td>
                <td class="col-stat">{{ item.leads || 0 }}</td>
                <td class="col-actions">
                  <a
                    href="#"
                    class="action-icon"
                    @click.prevent="
                      ;(parent.formData = item), (iChart = i)
                      ;($refs.chartStats.active = 1), LineStatistic(item)
                    "
                  >
                    <i class="fas fa-chart-bar"></i>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" v-else-if="!loader">No statistics found</div>
      </div>
    </div>

    <Popup
      ref="payment"
      :title="
        parent.formData && parent.formData.id ? 'Edit payment' : 'New payment'
      "
    >
      <div class="form-container">
        <form @submit.prevent="actionPayment()">
          <div class="form-group">
            <label>Value</label>
            <input
              type="number"
              class="text-input"
              v-model="parent.formData.value"
              required
            />
          </div>
          <div class="form-group">
            <label>Date</label>
            <input
              type="date"
              class="text-input"
              v-model="parent.formData.date"
              required
            />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input
              type="text"
              class="text-input"
              v-model="parent.formData.description"
            />
          </div>
          <div class="form-actions">
            <button class="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </Popup>

    <Popup ref="chart" fullscreen="true" title="Chart">
      <div class="chart-popup-content">
        <div class="toolbar">
          <div class="toolbar-center">
            <input
              type="date"
              class="date-input"
              v-model="date"
              @change="getSiteChart()"
            />
            <input
              type="date"
              class="date-input"
              v-model="date2"
              @change="getSiteChart()"
            />
          </div>
        </div>
        <div class="flex-body-chart" style="padding: 20px">
          <div
            id="chartOuterSites"
            style="position: relative; height: 400px; width: 100%"
          ></div>
        </div>
      </div>
    </Popup>

    <Popup ref="chartStats" fullscreen="true" title="Campaign Chart">
      <div class="chart-popup-content">
        <div class="flex-body-chart" style="padding: 20px">
          <div
            id="chartOuterStats"
            style="position: relative; height: 400px; width: 100%"
          ></div>
        </div>
      </div>
    </Popup>

    <Popup ref="img" title="Banner">
      <div class="ac">
        <img
          :src="parent.url + parent.formData.img"
          v-if="parent.formData && parent.formData.img"
        />
      </div>
    </Popup>
  </div>
</template>

<style scoped>
.ac {
  display: flex;
  justify-content: center;
}
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

.sub-header-user {
  background-color: #e3fff9;
  padding: 10px 0 0 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #d0f0e8;
}

.user-brief-info {
  margin-top: -10px;
  padding-bottom: 15px;
  color: #666;
}

.user-brief-info span {
  margin-right: 25px;
  font-size: 14px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
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
}

.section-subtitle {
  font-size: 18px;
  font-weight: 600;
  color: #444;
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
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #00b87a;
}

.date-input {
  background: #fff;
  border: 1px solid #dce1e6;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}

.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
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

.col-stat {
  text-align: center !important;
  width: 100px;
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
  font-weight: 600;
}
.action-icon {
  margin: 0 5px;
  color: #525f7f;
  cursor: pointer;
}
.icon-delete {
  color: #adb5bd !important;
  margin-left: 5px;
  cursor: pointer;
}
.icon-delete:hover {
  color: #f5365c !important;
}

.tabs-container ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.tabs-container li {
  padding: 12px 25px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tabs-container li.active {
  color: #00d68f;
  border-bottom-color: #00d68f;
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
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
#spinner img {
  width: 64px;
}
</style>
