<template>
  <div id="rules-view">
    <RuleDetail
      class="detail"
      :rule="activerule"
    />

    <div class="divider"></div>

    <div id="rule-cards">
      <RuleCard
        v-for="(ruleChunk, index) in rules"
        v-bind:key="index"
        :ruledata="ruleChunk"
        v-on:select-rule="selectRule"
      />
    </div>
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import RuleDetail from './rules/RuleDetail'
  import RuleCard from './rules/RuleCard.vue'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'ruleview',

    data: () => ({
      rules: [],
      activerule: null
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      selectRule (rule) {
        this.activerule = rule
      }
    },

    created () {
      this.rules = this.$store.getters.rules
      for (let k = 0; k < this.rules.length; k++) {
        const rule = this.rules[k]
        if (!rule.saved) {
          this.activerule = rule
          break
        }
      }

      if (this.activerule === null) {
        if (this.rules.length > 0) {
          this.activerule = this.rules[0]
        }
      }

      console.log('RULES', this.rules, this.activerule)
    },

    components: {
      RuleDetail,
      RuleCard
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

  & div#rule-cards {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: flex-start;
  }
}
</style>
