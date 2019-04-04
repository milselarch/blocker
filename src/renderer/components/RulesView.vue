<template>
  <div id="wrapper">
    <div id="rule-details">
      <RuleDetail />
    </div>
    <div id="rule-cards">
    
    </div>
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import RuleDetail from './rules/RuleDetail'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'ruleview',

    data: () => ({
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
    },

    components: {
      RuleDetail
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

div#rule-details {
  width: 15rem;
}
</style>
