<script>
import axios from 'axios'
import Chart from 'chart.js/auto'

// Импортируем компоненты
import Header from '../components/Header.vue'
import Popup from '../components/Popup.vue'
import Toogle from '../components/Toogle.vue'
import ImageUpload from '../components/Image.vue' // Переименовали, чтобы не конфликтовало с HTML Image

export default {
  name: 'Campaign',
  components: {
    Header,
    Popup,
    Toogle,
    // В шаблоне используется тег <Image>, поэтому регистрируем компонент под этим именем
    Image: ImageUpload
  },
  data: function () {
    return {
      // ГЛАВНОЕ ИСПРАВЛЕНИЕ ЗДЕСЬ:
      // Инициализируем parent заглушкой, чтобы шаблон не падал при старте
      parent: {
        formData: {},
        user: { auth: '' },
        url: ''
      },

      data: { items: [], info: {} },
      details: [],
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
  mounted: function () {
    // 1. Ищем настоящего родителя (App.vue)
    const foundParent = this.findParent()
    if (foundParent) {
      this.parent = foundParent
    } else {
      console.warn('Parent component not found, using stub')
    }

    // 2. Проверка авторизации
    if (this.parent.user && !this.parent.user.auth) {
      if (typeof this.parent.logout === 'function') {
        this.parent.logout()
      }
    }

    this.get()
    // this.GetFirstAndLastDate()
  },
  methods: {
    // Вспомогательная функция поиска родителя
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

      if (this.date != '') data.append('date', this.date)
      if (this.date2 != '') data.append('date2', this.date2)

      // Получаем ID из роутера (Vue 3 style) или из родителя (Legacy style)
      const routeId =
        this.$route.params.id ||
        (this.parent.$route && this.parent.$route.params.id)
      data.append('id', routeId)

      self.loader = 1

      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      if (!url) {
        this.loader = 0
        return
      }

      axios
        .post(url + '/site/getBanners?auth=' + auth, data)
        .then(function (response) {
          self.loader = 0
          self.data = response.data
          // Безопасная установка заголовка
          if (self.data.info && self.data.info.title) {
            document.title = self.data.info.title
          }
          if (self.iChart != -1 && self.data.items[self.iChart]) {
            self.line(self.data.items[self.iChart])
          }
        })
        .catch(function (error) {
          console.error(error)
          if (self.parent.logout) self.parent.logout()
          self.loader = 0
        })
    },

    getDetails: function (bid = false, type = false) {
      this.details = [] // Лучше массив
      if (bid) this.id = bid
      if (type) this.type = type
      if (this.id) bid = this.id
      if (this.type) type = this.type

      var self = this
      var data = this.toFormData(self.parent.formData)

      if (this.date != '') data.append('date', this.date)
      if (this.date2 != '') data.append('date2', this.date2)
      if (this.q != '') data.append('q', this.q)
      if (this.sort != '') data.append('sort', this.sort)
      if (bid != '') data.append('bid', bid)
      if (type != '') data.append('type', type)

      self.loader = 1

      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      axios
        .post(url + '/site/getStatisticsDetails?auth=' + auth, data)
        .then(function (response) {
          self.details = response.data
          self.loader = 0
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
        .post(url + '/site/actionCampaign?auth=' + auth, data)
        .then(function (response) {
          if (self.$refs.new) self.$refs.new.active = 0

          if (response.data.error) {
            self.$refs.header.$refs.msg.alertFun(response.data.error)
          } else if (self.parent.formData.id) {
            self.$refs.header.$refs.msg.successFun(
              'Successfully updated campaign!'
            )
          } else {
            self.$refs.header.$refs.msg.successFun(
              'Successfully added new campaign!'
            )
          }
          self.get()
        })
        .catch(function (error) {
          console.log('errors: ', error)
        })
    },

    actionAd: function () {
      var self = this
      if (!self.parent.formData) return

      self.parent.formData.copy = ''
      var data = this.toFormData(self.parent.formData)

      // Получаем ID кампании
      const routeId =
        this.$route.params.id ||
        (this.parent.$route && this.parent.$route.params.id)
      data.append('campaign', routeId)

      const url = this.parent.url || ''
      const auth = this.parent.user ? this.parent.user.auth : ''

      axios
        .post(url + '/site/actionBanner?auth=' + auth, data)
        .then(function (response) {
          if (self.$refs.ad) self.$refs.ad.active = 0

          if (response.data.error) {
            self.$refs.header.$refs.msg.alertFun(response.data.error)
          } else if (self.parent.formData.id) {
            self.$refs.header.$refs.msg.successFun(
              'Successfully updated banner!'
            )
          } else {
            self.$refs.header.$refs.msg.successFun(
              'Successfully added new banner!'
            )
          }
          self.get()
        })
        .catch(function (error) {
          console.log('errors: ', error)
        })
    },

    delAd: async function () {
      if (
        await this.$refs.header.$refs.msg.confirmFun(
          'Please confirm next action',
          'Do you want to delete this banner?'
        )
      ) {
        var self = this
        var data = this.toFormData(self.parent.formData)
        const url = this.parent.url || ''
        const auth = this.parent.user ? this.parent.user.auth : ''

        axios
          .post(url + '/site/deleteBanner?auth=' + auth, data)
          .then(function (response) {
            if (response.data.error) {
              self.$refs.header.$refs.msg.alertFun(response.data.error)
            } else {
              self.$refs.header.$refs.msg.successFun(
                'Successfully deleted banner!'
              )
              self.get()
            }
          })
          .catch(function (error) {
            console.log('errors', error)
          })
      }
    },

    line: function (item) {
      this.$nextTick(() => {
        const container = document.getElementById('chartOuter')
        if (!container) return

        let dates = []
        let clicks = []
        let views = []
        let images = []

        if (item && item['line']) {
          for (let i in item['line']) {
            dates.push(i)
            clicks.push(item['line'][i].clicks || 0)
            views.push(item['line'][i].views || 0)
          }
        }

        const hintsDiv = document.getElementById('chartHints')
        if (!hintsDiv) {
          container.innerHTML = `<div id="chartHints"><div class="chartHintsViews">Views</div><div class="chartHintsClicks">Clicks</div></div><canvas id="myChart"></canvas>`
        }

        const ctx = document.getElementById('myChart')
        if (!ctx) return

        if (window.myAdChart) window.myAdChart.destroy()

        const xScaleImage = {
          id: 'xScaleImage',
          afterDatasetsDraw (chart) {}
        }

        window.myAdChart = new Chart(ctx, {
          type: 'line',
          plugins: [xScaleImage],
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Clicks',
                backgroundColor: '#005990',
                borderColor: '#00599D',
                data: clicks,
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
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { position: 'left', beginAtZero: true },
              y2: {
                position: 'right',
                beginAtZero: true,
                grid: { drawOnChartArea: false }
              },
              x: { ticks: { maxRotation: 45, minRotation: 45 } }
            }
          }
        })
      })
    },

    checkAll: function (prop) {
      if (!this.data.items[this.iChart]) return

      const sites = this.data.items[this.iChart].sites
      if (sites) {
        Object.values(sites).forEach(site => {
          site.include = prop
        })
      }
      this.parent.formData = this.data.items[this.iChart]
      this.get()
    }
  }
}
</script>

<template>
  <div class="page-wrapper">
    <Header ref="header" />

    <div id="spinner" v-if="loader">
      <img src="/src/assets/img/loader.gif" alt="Loading..." />
    </div>

    <div class="sub-header">
      <div class="content-container flex-between">
        <a
          class="btn-edit"
          href="#"
          @click.prevent="
            ;(parent.formData = data.info), ($refs.new.active = 1)
          "
        >
          Edit campaign <i class="fas fa-edit"></i>
        </a>
        <h1 class="campaign-title" v-if="data && data.info">
          {{ data.info.title }}
        </h1>
      </div>
    </div>

    <div class="content-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <a
            class="btn-new"
            href="#"
            @click.prevent=";(parent.formData = {}), ($refs.ad.active = 1)"
          >
            New <i class="fas fa-plus"></i>
          </a>
        </div>

        <div class="toolbar-center">
          <div class="date-group">
            <input type="date" v-model="date" @change="get()" />
            <span class="sep">-</span>
            <input type="date" v-model="date2" @change="get()" />
          </div>
        </div>

        <div class="toolbar-right">
          <span class="section-label">Ads</span>
        </div>
      </div>

      <div class="table-card" v-if="data.items && data.items.length > 0">
        <table class="styled-table">
          <thead>
            <tr>
              <th class="th-actions">Actions</th>
              <th>Fraud clicks</th>
              <th>Leads</th>
              <th>Clicks</th>
              <th>Views</th>
              <th class="th-link">Link</th>
              <th>Size</th>
              <th>Img</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in data.items" :key="item.id || i">
              <td class="td-actions">
                <a
                  href="#"
                  class="action-icon del"
                  @click.prevent=";(parent.formData = item), delAd()"
                >
                  <i class="fas fa-trash-alt"></i>
                </a>
                <a
                  href="#"
                  class="action-icon chart"
                  @click.prevent="
                    parent.formData = item
                    iChart = i
                    ;($refs.chart.active = 1), line(item)
                  "
                >
                  <i class="fas fa-chart-bar"></i>
                </a>
                <a
                  href="#"
                  class="action-icon edit"
                  @click.prevent="
                    ;(parent.formData = item), ($refs.ad.active = 1)
                  "
                >
                  <i class="fas fa-edit"></i>
                </a>
              </td>

              <td>
                <a
                  href="#"
                  @click.prevent="
                    ;($refs.details.active = 1), getDetails(item.id, 4)
                  "
                >
                  {{ item.fclicks || 0 }}
                </a>
              </td>
              <td>
                <a
                  href="#"
                  @click.prevent="
                    ;($refs.details.active = 1), getDetails(item.id, 3)
                  "
                >
                  {{ item.leads || 0 }}
                </a>
              </td>
              <td>
                <a
                  href="#"
                  @click.prevent="
                    ;($refs.details.active = 1), getDetails(item.id, 2)
                  "
                >
                  <template v-if="item.clicks">{{ item.clicks }}</template>
                  <template v-else>0</template>
                </a>
              </td>
              <td>
                <a
                  href="#"
                  @click.prevent="
                    ;($refs.details.active = 1), getDetails(item.id, 1)
                  "
                >
                  {{ item.views }}
                </a>
              </td>

              <td class="td-link">
                <a :href="item.link" target="_blank" class="link-text">
                  {{ item.link }}
                </a>
              </td>

              <td>{{ item.size }}</td>

              <td class="td-toggle">
                <div class="toggle-wrapper">
                  <div
                    class="mini-preview"
                    v-if="item.img"
                    @click.prevent="
                      ;(parent.formData = item), ($refs.ad.active = 1)
                    "
                  >
                    <img :src="this.parent.url + '/' + item.img" />
                  </div>
                  <Toogle
                    :modelValue="item.published"
                    @update:modelValue="
                      item.published = $event
                      ;(parent.formData = item), actionAd()
                    "
                  />
                  <span class="row-id">{{ item.id }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else-if="!loader">No items found</div>
    </div>

    <Popup ref="chart" fullscreen="true" title="Chart">
      <div class="flex panel">
        <div class="w30 ptb25">
          <input
            class="legacy-input"
            type="date"
            v-model="date"
            @change="get()"
          />
          <input
            class="legacy-input"
            type="date"
            v-model="date2"
            @change="get()"
          />
        </div>
        <div class="w70 al">
          <div class="flex cubes">
            <div class="w30 clicks">
              <div>Clicks</div>
              {{
                data.items && data.items[iChart] ? data.items[iChart].clicks : 0
              }}
            </div>
            <div class="w30 views">
              <div>Views</div>
              {{
                data.items && data.items[iChart] ? data.items[iChart].views : 0
              }}
            </div>
            <div class="w30 leads">
              <div>Leads</div>
              {{
                data.items && data.items[iChart] ? data.items[iChart].leads : 0
              }}
            </div>
            <div class="w30 ctr">
              <div>CTR</div>
              {{
                data.items && data.items[iChart] && data.items[iChart].views > 0
                  ? (
                      (data.items[iChart].clicks * 100) /
                      data.items[iChart].views
                    ).toFixed(2)
                  : '0.00'
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="flex body">
        <div class="w30 ar filchart">
          <div class="itemchart ptble">
            <Toogle
              :modelValue="all"
              @update:modelValue=";(all = $event), checkAll($event)"
            />
            ALL
            <hr />
            <div
              class="itemchart ptble"
              v-if="
                data.items && data.items[iChart] && data.items[iChart].sites
              "
              v-for="(s, index) in data.items[iChart].sites"
              :key="index"
            >
              <Toogle
                :modelValue="s.include"
                @update:modelValue="
                  ;(s.include = $event), (parent.formData = data.items[iChart])
                  get()
                "
              />
              {{ s.site }}
            </div>
          </div>
        </div>
        <div class="w70" id="chartOuter">
          <div id="chartHints">
            <div class="chartHintsViews">Views</div>
            <div class="chartHintsClicks">Clicks</div>
          </div>
          <canvas id="myChart"></canvas>
          <hr />
        </div>
      </div>
    </Popup>

    <Popup
      ref="new"
      :title="
        parent.formData && parent.formData.id ? 'Edit campaign' : 'New campaign'
      "
    >
      <div class="form inner-form">
        <form @submit.prevent="action()" v-if="parent.formData">
          <div class="row">
            <label>Name</label>
            <input type="text" v-model="parent.formData.title" required />
          </div>
          <div class="row">
            <button class="btnS" v-if="parent.formData && parent.formData.id">
              Edit
            </button>
            <button class="btnS" v-if="parent.formData && !parent.formData.id">
              Add
            </button>
          </div>
        </form>
      </div>
    </Popup>

    <Popup
      ref="ad"
      :title="
        parent.formData && parent.formData.id ? 'Edit banner' : 'New banner'
      "
    >
      <div class="form inner-form">
        <form @submit.prevent="actionAd()" v-if="parent.formData">
          <div class="row">
            <label>Link</label>
            <input type="text" v-model="parent.formData.link" required />
          </div>
          <div class="row">
            <label>Description</label>
            <input type="text" v-model="parent.formData.description" />
          </div>
          <div class="row">
            <label>Type</label>
            <select v-model="parent.formData.type" required>
              <option value="0"></option>
              <option
                v-if="data.types"
                v-for="c in data.types"
                :value="c.id"
                :key="c.id"
              >
                {{ c.title }}
              </option>
            </select>
          </div>
          <div class="row">
            <label>Image</label>
            <Image
              v-model="parent.formData.img"
              @update:modelValue="parent.formData.img = $event"
            />
          </div>
          <div class="row">
            <button class="btnS" v-if="parent.formData && parent.formData.id">
              Edit
            </button>
            <button class="btnS" v-if="parent.formData && !parent.formData.id">
              Add
            </button>
          </div>
        </form>
      </div>
    </Popup>

    <Popup ref="details" fullscreen="true" title="Details">
      <div class="flex panel">
        <div class="w60">
          <input
            type="text"
            placeholder="Search..."
            v-model="q"
            @keyup="getDetails()"
          />
          <input
            class="legacy-input"
            type="date"
            v-model="date"
            @change="getDetails()"
          />
        </div>
        <div class="w40 al"></div>
      </div>
      <br />
      <div class="table">
        <table v-if="details && details.length > 0">
          <thead>
            <tr>
              <th class="id">#</th>
              <th>Type</th>
              <th>IP <i class="fas fa-caret-down"></i></th>
              <th class="id">Date</th>
              <th class="id">Site</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in details" :key="item.id || i">
              <td class="id">{{ item.id }}</td>
              <td>
                <template v-if="item.type == 1">Views</template>
                <template v-if="item.type == 2">Clicks</template>
                <template v-if="item.type == 3">Leads</template>
              </td>
              <td>{{ item.ip }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.site }}</td>
            </tr>
          </tbody>
        </table>
        <div class="empty" v-else>No items</div>
      </div>
    </Popup>
  </div>
</template>

<style scoped>
/* =========================================
   1. ОБЩИЕ СТИЛИ СТРАНИЦЫ (ПО СКРИНШОТУ)
   ========================================= */

.page-wrapper {
  background-color: #f7f8fa; /* Светлый фон всей страницы */
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* --- МЯТНЫЙ ПОДЗАГОЛОВОК --- */
.sub-header {
  background-color: #e3fff9; /* Мятный цвет из скриншота */
  padding: 15px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #d0f0e8;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.campaign-title {
  font-size: 20px;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.btn-edit {
  background-color: #00d68f;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
}
.btn-edit:hover {
  opacity: 0.9;
}

/* --- ТУЛБАР (ФИЛЬТРЫ) --- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-new {
  background-color: #00d68f;
  color: white;
  padding: 8px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.date-group {
  background: white;
  padding: 5px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.date-group input {
  border: 1px solid #eee;
  padding: 6px 10px;
  border-radius: 4px;
  color: #555;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}
.date-group .sep {
  padding: 0 10px;
  color: #ccc;
}

.section-label {
  font-weight: 700;
  font-size: 16px;
  color: #333;
}

/* --- ТАБЛИЦА (TABLE) --- */
.table-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  padding: 0;
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center; /* Центрируем всё по умолчанию как на скрине */
}

.styled-table th {
  background-color: #fff;
  color: #333;
  font-weight: 700;
  font-size: 13px;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.styled-table td {
  padding: 12px 15px;
  font-size: 14px;
  color: #555;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.styled-table td a {
  color: #555;
  text-decoration: none;
}

.styled-table tr:last-child td {
  border-bottom: none;
}

/* Колонки */
.th-actions {
  text-align: left;
  padding-left: 20px;
}
.td-actions {
  text-align: left;
  padding-left: 20px;
  white-space: nowrap;
}

.th-link {
  text-align: right;
}
.td-link {
  text-align: right;
  max-width: 300px;
}

/* Ссылки в таблице */
.link-text {
  color: #555;
  text-decoration: none;
  font-size: 13px;
}
.link-text:hover {
  text-decoration: underline;
}

/* Иконки действий */
.action-icon {
  color: #555;
  margin-right: 12px;
  font-size: 16px;
  transition: color 0.2s;
}
.action-icon.del:hover {
  color: #e53935;
}
.action-icon.chart:hover {
  color: #00d68f;
}
.action-icon.edit:hover {
  color: #00d68f;
}

/* Переключатель и картинка */
.toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
}

.mini-preview img {
  width: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
  cursor: pointer;
}

.row-id {
  color: #999;
  font-size: 12px;
  min-width: 20px;
  text-align: right;
}

/* =========================================
   2. СТИЛИ ДЛЯ POPUP И ГРАФИКОВ (LEGACY)
   Эти стили нужны, чтобы попапы не развалились
   ========================================= */

.panel {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
}

.legacy-input {
  border: 1px solid #ddd;
  padding: 5px;
  border-radius: 4px;
}

.w30.ptb25 {
  padding: 25px 0;
}
.w70.al {
  width: 70%;
  text-align: left;
}
.w30 {
  width: 30%;
}
.w70 {
  width: 70%;
}
.ar {
  text-align: right;
}

/* Кубики в графике */
.cubes {
  display: flex;
  width: 100%;
  color: white;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 10px;
}
.cubes > div {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60px;
  text-align: right;
  font-size: 20px;
  font-weight: bold;
}
.cubes > div > div:first-child {
  font-size: 11px;
  text-transform: uppercase;
  margin-bottom: 5px;
  opacity: 0.9;
}
.clicks {
  background-color: #01579b;
}
.views {
  background-color: #4a148c;
}
.leads {
  background-color: #4caf50;
}
.ctr {
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
}

/* Тело графика */
.body {
  display: flex;
  flex-direction: row-reverse;
  padding: 20px;
  align-items: flex-start;
  gap: 20px;
}
.filchart {
  padding-top: 20px;
}
.itemchart {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  border-bottom: 1px dashed #eee;
  padding: 4px 0;
}
#chartHints {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
  font-weight: bold;
}
.chartHintsViews {
  color: #4a148c;
}
.chartHintsClicks {
  color: #01579b;
}

#myChart {
  width: 100% !important;
  height: 300px !important;
}

/* Стили форм внутри попапов */
.form.inner-form {
  padding: 10px;
}
.row {
  margin-bottom: 15px;
}
.row label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 13px;
}
.row input,
.row select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.btnS {
  background-color: #00d68f;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

/* Лоадер */
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

.empty-state {
  text-align: center;
  padding: 50px;
  color: #999;
}
</style>
