<template>
  <div id="app">
    <Menu ref="menus" class="test-nav" theme="dark" @on-select="goToPage">
      <img @click="goToHome" class="test-logo" src="../src/assets/bilibili-back/logo-zhi.png" alt="">
      <Submenu name="1">
        <template slot="title">
            <Icon type="ios-pricetags" />
            考试系统
        </template>

        <MenuItem name="addTest">
            <Icon type="ios-paper" />
            添加试题
        </MenuItem>
        <MenuItem name="buildTest">
            <Icon type="ios-people" />
            生成试卷
        </MenuItem>
      </Submenu>
    </Menu>
    <transition name="router-loding">
      <router-view class="show-sec" />
    </transition>
    <background-2233></background-2233>
  </div>
</template>

<script>
import background2233 from './components/background2233'

export default {
  data () {
    return {

    }
  },
  methods: {
    goToPage (e) {
      this.$router.push(e)
    },
    goToHome () {
      this.$nextTick(() => {
        this.$router.push('/')
        this.$refs.menus.currentActiveName = 1
      })
    }
  },
  watch: {
    '$route' (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    }
  },
  components: {
    background2233
  }
}
</script>

<style lang="scss">
#app {
  display: flex;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  .test-logo {
    margin: 30px 0 10px;
    padding-bottom: 30px;
    width: 80%;
    border-bottom: #459dea solid 1px;
  }

  a {
    color: rgba(255, 255, 255, 0.7);
  }

  .test-nav {
    width: 10vw !important;
    min-height: 100vh;
    user-select: none;
  }

  @media screen and (max-width: 1500px) {
    .test-nav {
      width: 15vw !important;
    }
  }

  // .show-sec {

  // }

  .router-loding-enter,
  .router-loding-leave-to {
    opacity: 0;
  }

  .router-loding-enter-to,
  .router-loding-leave {
    opacity: 1;
  }

  .router-loding-enter-active,
  .router-loding-leave-active {
    transition: all .5s ease-in-out
  }
}
</style>
