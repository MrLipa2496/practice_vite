<script>
import Msg from './Msg.vue'

export default {
  name: 'Header',
  components: {
    Msg
  },
  data () {
    return {
      active: false, // Используем boolean для v-if/v-show
      menu: false,
      parent: null
    }
  },
  mounted () {
    // Безопасный поиск родителя с данными
    this.parent = this.$parent.$parent.$parent || this.$parent || this.$root
  },
  methods: {
    toggleActive () {
      this.active = !this.active
    },
    toggleMenu () {
      this.menu = !this.menu
    },
    closeMenu () {
      this.menu = false
      this.active = false
    }
  }
}
</script>

<template>
  <header class="header">
    <Msg ref="msg" />

    <div class="header-content">
      <div
        class="user-section"
        v-if="parent && parent.user && parent.user.user"
      >
        <div class="user-trigger" @click="toggleActive()">
          <div class="user-avatar">
            {{ parent.user.user[0] }}
          </div>
          <i
            class="fas fa-caret-down arrow-icon"
            :class="{ rotated: active }"
          ></i>
        </div>

        <transition name="dropdown">
          <div class="user-dropdown" v-if="active" v-click-outside="closeMenu">
            <a href="#" @click.prevent="parent.logout()" class="dropdown-item">
              <i class="fas fa-sign-out-alt"></i>
              <span>Log out ({{ parent.user.user }})</span>
            </a>
          </div>
        </transition>
      </div>

      <nav class="nav-section">
        <div class="mobile-burger" @click="toggleMenu()">
          <i class="fas fa-bars"></i>
        </div>

        <div class="nav-overlay" v-if="menu" @click="closeMenu()"></div>

        <ul class="nav-list" :class="{ 'mobile-active': menu }">
          <li class="mobile-close" @click="closeMenu()">
            <i class="fas fa-times"></i>
          </li>

          <template v-if="parent && parent.user && parent.user.type == 'admin'">
            <li>
              <router-link to="/users" active-class="active-link">
                <i class="fas fa-users"></i> Users
              </router-link>
            </li>
            <li>
              <router-link to="/campaigns" active-class="active-link">
                <i class="fas fa-bullhorn"></i> Campaigns
              </router-link>
            </li>
          </template>

          <template v-if="parent && parent.user && parent.user.type != 'admin'">
            <li>
              <router-link to="/statistics" active-class="active-link">
                <i class="fas fa-chart-area"></i> Statistics
              </router-link>
            </li>
            <li>
              <router-link to="/ads" active-class="active-link">
                <i class="fas fa-image"></i> Ads
              </router-link>
            </li>
            <li>
              <router-link to="/sites" active-class="active-link">
                <i class="fab fa-chrome"></i> Sites
              </router-link>
            </li>
            <li>
              <router-link to="/payments" active-class="active-link">
                <i class="fas fa-credit-card"></i> Payments
              </router-link>
            </li>
          </template>
        </ul>
      </nav>

      <div class="logo-section">
        <img
          v-if="parent && parent.url"
          :src="parent.url + '/app/views/images/logo.svg'"
          alt="Logo"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: #333333;
  height: 90px;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.header-content {
  max-width: 1600px;
  height: 100%;
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-section {
  position: relative;
  min-width: 180px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7a7979, #555);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.user-trigger:hover .user-avatar {
  transform: scale(1.05);
  background: #00d68f;
}

.arrow-icon {
  color: #aaa;
  font-size: 14px;
  transition: transform 0.3s ease, color 0.2s;
}

.user-trigger:hover .arrow-icon {
  color: #fff;
}

.arrow-icon.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 60px;
  left: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 200px;
  z-index: 101;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  text-decoration: none;
  padding: 12px 15px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background-color: #f0fdf9;
  color: #00d68f;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.nav-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 10px;
}

.nav-list a {
  text-decoration: none;
  color: #cccccc;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-list a:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.active-link {
  color: #00d68f !important;
  background: rgba(0, 214, 143, 0.05);
}

.active-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #00d68f;
  border-radius: 3px;
  box-shadow: 0 0 8px rgba(0, 214, 143, 0.6);
}

.logo-section img {
  height: 40px;
  width: auto;
  transition: transform 0.2s;
  display: block;
}

.logo-section img:hover {
  transform: scale(1.05);
}

.mobile-burger {
  display: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.mobile-close {
  display: none;
}

@media (max-width: 900px) {
  .header-content {
    padding: 0 20px;
  }

  .mobile-burger {
    display: block;
    margin-right: auto;
  }

  .nav-section {
    justify-content: flex-start;
    flex: 0;
  }

  .nav-list {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    background: #2d2d2d;
    flex-direction: column;
    padding: 20px;
    z-index: 200;
    transition: left 0.3s ease;
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
  }

  .nav-list.mobile-active {
    left: 0;
  }

  .nav-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
    backdrop-filter: blur(2px);
  }

  .mobile-close {
    display: flex;
    justify-content: flex-end;
    font-size: 22px;
    color: #fff;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .nav-list a {
    width: 100%;
    justify-content: flex-start;
    padding: 15px 8px;
    font-size: 16px;
  }

  .active-link::after {
    left: 0;
    transform: none;
    height: 100%;
    width: 4px;
    top: 0;
    overflow: hidden;
  }
}
</style>
