<template>
  <div id="wrapper">
    <div id="content">
      <img id="mainImage" src="static/images/icon-border-filled.svg" />
      <div>
        {{ blockedTasks }}
      </div>
    </div>
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'blockview',

    data: () => ({
      isDestroyed: false,
      blockFace: 'icon-border.svg',
      blockedTasks: []
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
    },

    created () {
    },

    components: {
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

div#wrapper {
  margin: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: red;

  & div#content {
    height: 100%;
    width: fit-content;
    margin: auto;
    display: flex;
    align-items: center;
  }
}

img#mainImage {
  width: 25rem;
  height: 25rem;
  flex-shrink: 1;
}
</style>
