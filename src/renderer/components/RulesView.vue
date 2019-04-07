<template>
  <div id="rules-view">
    <RuleDetail class="detail"/>

    <div class="divider"></div>

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

div#rules-view {
  /* min-height: max-content; */
  flex: auto;
  display: grid;
  grid-template-columns: 17rem 1px 1fr;
  grid-template-rows: 100%;
  grid-column-gap: 3rem;

  & div#detail {
    width: 15rem;
  }

  & div.divider {
    height: auto;
    width: 2px;
    background:#dcdfe6;
  }
}
</style>
