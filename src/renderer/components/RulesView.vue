<template>
  <div id="rules-view">
    <b-loading :is-full-page="true" :active="loading" />

    <RuleDetail
      class="detail"
      :rule="activerule"
      v-on:unlock-progress="updateUnlockProgress"
      v-on:delete-rule="deleteRule"
    />

    <div class="divider">
      <div
        class="progress-fill"
        v-bind:style="{
        'flex-basis': (100 * progress) + '%'
      }"></div>
    </div>

    <div id="rule-cards">
      <RuleCard
        v-for="(ruleChunk, index) in rules"
        v-bind:key="index"
        :ruledata="ruleChunk"
        v-on:select-rule="selectRule"
        :activerule="activerule"
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
      activerule: null,
      progress: -1,
      loading: false
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      selectRule (rule) {
        this.activerule = rule
      },

      async deleteRule (rule) {
        console.log('DELETE')
        this.loading = true
        await this.$store.dispatch('deleteRule', rule)
        await Misc.sleepAsync(100)
        this.loadRules()
        this.loading = false
      },

      updateUnlockProgress (progress) {
        // console.log('UPRO', progress)
        this.progress = progress
      },

      loadRules () {
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
      }
    },

    created () {
      this.loadRules()
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

div.divider {
  display: flex;
  justify-content: space-between;
  flex-direction: column-reverse;

  & div.progress-fill {
    color: red;
    background-color: #58B7FF;
  }
  & div.progress-background {
    flex-basis: auto;
    background-color: #DDD;
    flex-grow: 1;
  }
}

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
