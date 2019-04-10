<template>
  <div>
    <img id="mainImage" :src="blockFace" />
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
      blockFace: 'icon-border.svg'
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

img#mainImage {
  width: 25rem;
  height: 25rem;
}
</style>
