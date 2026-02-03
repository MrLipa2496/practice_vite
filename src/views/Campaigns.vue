<script>
import axios from 'axios'
import Chart from 'chart.js/auto'

import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'
import Toogle from '../components/Toogle.vue'

export default {
  name: 'Campaigns',
  components: { Header, Popup, Toogle },
  data () {
    return {
      parent: {
        formData: {},
        user: { auth: '' },
        url: ''
      },

      data: { items: [] },
      details: {},
      date: '',
      date2: '',
      q: '',
      sort: '',
      loader: 1,
      iChart: -1,
      id: 0,
      type: 0,
      all: true
    }
  },
  mounted () {
    const foundParent = this.findParent()

    if (foundParent) {
      this.parent = foundParent
    } else {
      console.warn('Родительский компонент не найден, работаем с заглушкой')
    }

    if (this.parent.user && !this.parent.user.auth) {
      if (typeof this.parent.logout === 'function') {
        this.parent.logout()
      }
    }

    this.get()
  },
  methods: {
    findParent () {
      let p = this.$parent
      while (p) {
        if (p.url || (p.user && p.user.auth)) return p
        p = p.$parent
      }
      if (this.$root && (this.$root.url || this.$root.user)) {
        return this.$root
      }
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

    get () {
      if (!this.parent.formData) this.parent.formData = {}

      const data = new FormData()

      if (this.date) data.append('date', this.date)
      if (this.date2) data.append('date2', this.date2)
      if (this.q) data.append('q', this.q)
      if (this.sort) data.append('sort', this.sort)

      this.loader = 1

      const url = this.parent.url || ''
      const auth =
        this.parent.user && this.parent.user.auth ? this.parent.user.auth : ''

      if (!url) {
        console.log('URL API не найден')
        this.loader = 0
        return
      }

      axios
        .post(`${url}/site/getCampaigns?auth=${auth}`, data)
        .then(response => {
          this.data = response.data
          this.loader = 0
        })
        .catch(error => {
          console.error(error)
          if (this.parent && typeof this.parent.logout === 'function') {
            this.parent.logout()
          }
          this.loader = 0
        })
    },

    getChart () {
      if (
        this.iChart === -1 ||
        !this.data.items ||
        !this.data.items[this.iChart]
      )
        return

      let item = this.data.items[this.iChart]
      this.parent.formData = item

      const data = this.toFormData(this.parent.formData)

      if (this.date) data.append('date', this.date)
      if (this.date2) data.append('date2', this.date2)

      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      axios
        .post(url + '/site/getCampaignBannersChart?auth=' + auth, data)
        .then(response => {
          let resItem = response.data.items
            ? response.data.items
            : response.data

          if (resItem) {
            if (resItem.line) this.data.items[this.iChart].line = resItem.line
            if (resItem.sites)
              this.data.items[this.iChart].sites = resItem.sites
            if (resItem.clicks !== undefined)
              this.data.items[this.iChart].clicks = resItem.clicks
            if (resItem.views !== undefined)
              this.data.items[this.iChart].views = resItem.views
            if (resItem.leads !== undefined)
              this.data.items[this.iChart].leads = resItem.leads
          }

          this.renderChart(this.data.items[this.iChart])
        })
        .catch(error => {
          console.log('Chart error', error)
        })
    },

    line (item) {
      this.$nextTick(() => {
        const container = document.getElementById('chartOuter')
        if (container) {
          this.getChart()
        } else {
          console.error('Element #chartOuter not found')
        }
      })
    },

    renderChart (item) {
      const self = this

      if (window.myLineChart) {
        window.myLineChart.destroy()
      }

      this.$nextTick(() => {
        const container = document.getElementById('chartOuter')
        if (!container) return

        let dates = []
        let clicks = []
        let views = []

        let current = new Date(self.date)
        let end = new Date(self.date2)

        if (!isNaN(current) && !isNaN(end)) {
          while (current <= end) {
            let year = current.getFullYear()
            let month = ('0' + (current.getMonth() + 1)).slice(-2)
            let day = ('0' + current.getDate()).slice(-2)

            let keyDateDot = `${day}.${month}.${year}`
            let keyDateDash = `${year}-${month}-${day}`

            dates.push(`${day}.${month}.${year}`)

            let stats = null
            if (item && item.line) {
              stats = item.line[keyDateDot] || item.line[keyDateDash]
            }

            if (stats) {
              clicks.push(parseInt(stats.clicks) || 0)
              views.push(parseInt(stats.views) || 0)
            } else {
              clicks.push(0)
              views.push(0)
            }
            current.setDate(current.getDate() + 1)
          }
        }

        const hintsDiv = document.getElementById('chartHints')
        if (!hintsDiv) {
          container.innerHTML = `
            <div id="chartHints" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;">
                <div class="chartHintsViews" style="color: #5000B8; font-weight: bold;">Views</div>
                <div class="chartHintsClicks" style="color: #00599D; font-weight: bold;">Clicks</div>
            </div>
            <div style="height: 300px; position: relative;">
                <canvas id="myChart"></canvas>
            </div>`
        }

        const ctx = document.getElementById('myChart')
        if (!ctx) return

        const xScaleImage = {
          id: 'xScaleImage',
          afterDatasetsDraw (chart) {}
        }

        window.myLineChart = new Chart(ctx, {
          type: 'line',
          plugins: [xScaleImage],
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Clicks',
                backgroundColor: '#00599D',
                borderColor: '#00599D',
                data: clicks,
                yAxisID: 'y',
                tension: 0.1
              },
              {
                label: 'Views',
                backgroundColor: '#5000B8',
                borderColor: '#5000B8',
                data: views,
                yAxisID: 'y2',
                tension: 0.1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true
              },
              y2: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                grid: {
                  drawOnChartArea: false
                }
              }
            }
          }
        })
      })
    },

    checkAll (prop) {
      if (this.iChart === -1 || !this.data.items[this.iChart]) return

      const currentItem = this.data.items[this.iChart]
      if (currentItem && currentItem.sites) {
        Object.values(currentItem.sites).forEach(site => {
          site.include = prop
        })
      }
      this.parent.formData = currentItem
      this.getChart()
    },

    action () {
      if (!this.parent.formData) return
      this.parent.formData.copy = ''

      const data = this.toFormData(this.parent.formData)
      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      axios
        .post(url + '/site/actionCampaign?auth=' + auth, data)
        .then(response => {
          if (this.$refs.new) this.$refs.new.active = 0

          if (this.$refs.header && this.$refs.header.$refs.msg) {
            if (this.parent.formData.id) {
              this.$refs.header.$refs.msg.successFun(
                'Successfully updated campaign!'
              )
            } else {
              this.$refs.header.$refs.msg.successFun(
                'Successfully added new campaign!'
              )
            }
          }
          this.get()
        })
        .catch(error => {
          console.log('errors', error)
        })
    },

    async del (item) {
      this.parent.formData = item

      if (this.$refs.header && this.$refs.header.$refs.msg) {
        if (
          await this.$refs.header.$refs.msg.confirmFun(
            'Please confirm next action',
            'Do you want to delete this campaign?'
          )
        ) {
          const data = this.toFormData(this.parent.formData)
          const url = this.parent.url || ''
          const auth = this.parent.user ? this.parent.user.auth : ''

          axios
            .post(url + '/site/deleteCampaign?auth=' + auth, data)
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

      <Popup ref="chart" fullscreen="true" title="Chart">
        <div
          class="flex panel"
          style="display: flex; justify-content: space-between; padding: 20px"
        >
          <div class="w30 ptb25">
            <input
              type="date"
              v-model="date"
              @change="getChart()"
              class="date-input"
            />
            <input
              type="date"
              v-model="date2"
              @change="getChart()"
              class="date-input"
            />
          </div>

          <div class="w70-al" style="flex-grow: 1; padding-left: 20px">
            <div
              class="flex cubes"
              style="display: flex; gap: 20px; text-align: center"
            >
              <div class="w30 clicks">
                <div style="font-weight: bold; color: #00599d">Clicks</div>
                {{
                  data.items && data.items[iChart]
                    ? data.items[iChart].clicks
                    : 0
                }}
              </div>
              <div class="w38 views">
                <div style="font-weight: bold; color: #5000b8">Views</div>
                {{
                  data.items && data.items[iChart]
                    ? data.items[iChart].views
                    : 0
                }}
              </div>
              <div class="w30 leads">
                <div>Leads</div>
                {{
                  data.items && data.items[iChart]
                    ? data.items[iChart].leads
                    : 0
                }}
              </div>
              <div class="w38-ctr">
                <div>CTR</div>
                {{
                  data.items &&
                  data.items[iChart] &&
                  data.items[iChart].views > 0
                    ? (
                        (data.items[iChart].clicks * 100) /
                        data.items[iChart].views
                      ).toFixed(2)
                    : '0.00'
                }}%
              </div>
            </div>
          </div>
        </div>

        <div class="flex body" style="display: flex; margin-top: 20px">
          <div
            class="w30 ar filchart"
            style="
              width: 30%;
              border-right: 1px solid #eee;
              padding-right: 10px;
            "
          >
            <div
              class="itemchart ptb10"
              style="padding: 5px 0"
              v-if="
                data.items && data.items[iChart] && data.items[iChart].sites
              "
            >
              <Toogle
                v-model="all"
                @update:modelValue="
                  val => {
                    all = val
                    checkAll(val)
                  }
                "
              />
              <strong>ALL</strong>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0" />

            <div
              class="itemchart ptb10"
              style="
                padding: 5px 0;
                display: flex;
                align-items: center;
                gap: 10px;
              "
              v-if="data.items && data.items[iChart]"
              v-for="(s, index) in data.items[iChart].sites"
              :key="s.site || index"
            >
              <Toogle
                v-model="s.include"
                @update:modelValue="
                  ;(parent.formData = data.items[iChart]), getChart()
                "
              />
              <span style="font-size: 13px">{{ s.site }}</span>
            </div>
          </div>

          <div
            class="w70"
            id="chartOuter"
            style="width: 70%; padding-left: 20px"
          >
            <div
              id="chartHints"
              style="
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-bottom: 10px;
              "
            >
              <div
                class="chartHintsViews"
                style="color: #5000b8; font-weight: bold"
              >
                Views
              </div>
              <div
                class="chartHintsClicks"
                style="color: #00599d; font-weight: bold"
              >
                Clicks
              </div>
            </div>
            <div style="height: 300px; position: relative">
              <canvas id="myChart"></canvas>
            </div>
          </div>
        </div>
      </Popup>

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
              <td class="col-id" data-label="ID">{{ item.id }}</td>
              <td class="col-toggle" data-label="Status">
                <Toogle
                  v-model="item.published"
                  @update:modelValue=";(parent.formData = item), action()"
                />
              </td>
              <td class="col-title" data-label="Title">
                <router-link :to="'/campaign/' + item.id" class="link-primary">
                  {{ item.title }}
                </router-link>
              </td>
              <td class="col-stat" data-label="Views">
                <a href="#" @click.prevent="openDetails(item.id, 1)">
                  {{ item.views }}
                </a>
              </td>
              <td class="col-stat" data-label="Clicks">
                <a href="#" @click.prevent="openDetails(item.id, 2)">
                  {{ item.clicks || 0 }}
                </a>
              </td>
              <td class="col-stat" data-label="Leads">
                <a href="#" @click.prevent="openDetails(item.id, 3)">
                  {{ item.leads || 0 }}
                </a>
              </td>
              <td class="col-stat" data-label="Fraud">
                <a href="#" @click.prevent="openDetails(item.id, 4)">
                  {{ item.fclicks || 0 }}
                </a>
              </td>
              <td class="col-actions" data-label="Actions">
                <router-link
                  :to="'/campaign/' + item.id"
                  style="margin-right: 8px; color: #888"
                >
                  <i class="fas fa-edit"></i>
                </router-link>

                <a
                  href="#"
                  @click.prevent="
                    ;(parent.formData = item), (iChart = i)
                    $refs.chart.active = 1
                    line(item)
                  "
                  style="margin-right: 8px; color: #888"
                >
                  <i class="fas fa-chart-bar"></i>
                </a>

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

.panel {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  border-bottom: 1px solid #eee;
}

.w30.ptb25 input {
  border: none;
  background: transparent;
  font-family: sans-serif;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  outline: none;
}

.w70-al {
  flex-grow: 1;
  min-width: 0;
}

.cubes {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  color: white;
  font-family: sans-serif;
  border-radius: 8px;
  margin-right: 5px;
  overflow: hidden;
}

.cubes > div {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 15px;
  height: 60px;
  flex: 1;
}

.cubes > div > div:first-child {
  align-self: flex-end;
  font-size: 11px;
  text-transform: uppercase;
  opacity: 0.9;
  margin-bottom: 2px;
}

.cubes > div {
  font-size: 22px;
  font-weight: 500;
  text-align: right;
  line-height: 1.2;
}

.w38-ctr {
  order: 1;
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-right: none;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
.w38-ctr > div:first-child {
  color: #999;
}

.leads {
  order: 2;
  background-color: #4caf50;
}

.views {
  order: 3;
  background-color: #4a148c;
}

.clicks {
  order: 4;
  background-color: #01579b;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.body {
  display: flex;
  flex-direction: row-reverse;
  padding: 20px;
  gap: 20px;
  align-items: flex-start;
}

#chartOuter.w70 {
  flex: 1;
  min-width: 0;
  position: relative;
}

#chartHints {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  font-family: sans-serif;
}

.filchart {
  width: 280px;
  flex-shrink: 0;
  text-align: right;
  padding-top: 25px;
}

.itemchart {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  font-family: sans-serif;
  color: #333;
  cursor: pointer;
}

.itemchart:hover {
  opacity: 0.8;
}

#myChart {
  width: 100% !important;
  height: auto !important;
  max-height: 400px;
}

@media (max-width: 850px) {
  .content-wrapper {
    padding: 0 10px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    padding: 20px 0;
  }
  .toolbar-left,
  .toolbar-right,
  .toolbar-center {
    width: 100%;
    justify-content: center;
    flex: none;
  }
  .toolbar-center {
    order: 3;
  }
  .toolbar-right {
    order: 1;
  }
  .date-input {
    flex: 1;
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
    background: #fff;
    margin-bottom: 20px;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 8px;
    border-bottom: 1px solid #f8f9fa;
    text-align: right;
    width: auto !important;
  }
  .data-table td::before {
    content: attr(data-label);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10px;
    color: #8898aa;
  }
  .col-actions {
    justify-content: center !important;
    gap: 15px;
    background: #f8f9fe;
    border-radius: 8px;
  }

  .panel {
    flex-direction: column !important;
    padding: 10px !important;
  }
  .w30.ptb25,
  .w70-al {
    width: 100% !important;
    padding: 10px 0 !important;
  }
  .cubes {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 10px !important;
  }
  .cubes > div {
    border-radius: 8px !important;
    margin: 0 !important;
  }

  .body {
    flex-direction: column !important;
    padding: 10px !important;
  }
  .body .w30.filchart,
  .body .w70 {
    width: 100% !important;
    padding: 0 !important;
    border: none !important;
  }
  .filchart {
    order: 2;
    text-align: left;
    margin-top: 20px;
  }
  .itemchart {
    flex-direction: row;
    justify-content: flex-start;
    gap: 15px;
    padding: 10px 0;
    border-bottom: 1px dashed #eee;
  }
  #chartOuter {
    order: 1;
    height: auto !important;
  }
  #myChart {
    max-height: 250px !important;
  }

  .btn-primary {
    width: 88%;
    justify-content: center;
  }
}

@media (max-width: 400px) {
  .cubes {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 18px;
  }
}
</style>
