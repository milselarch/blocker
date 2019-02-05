<template>
  <div id="wrapper">
  </div>
</template>

<script>
  import Misc from '../../misc.js'
  import { setTimeout } from 'timers'
  const misc = new Misc()

  export default {
    name: 'taskview',
    components: { },

    data: () => ({
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

</style>
