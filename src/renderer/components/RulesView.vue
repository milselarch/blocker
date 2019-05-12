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
        class="rule-card"
      />

      <b-dropdown
        id="options" aria-role="list"
        v-model="addRuleType" v-on:change="addRule"
      >
        <button class="button is-primary" slot="trigger" id="add-button">➕</button>
        <b-dropdown-item value="TASK" class="dropdown-option" aria-role="listitem">Block Program</b-dropdown-item>
        <b-dropdown-item value="TIME-OF-DAY" class="dropdown-option" aria-role="listitem">Time-of-day access</b-dropdown-item>
        <b-dropdown-item value="POMODORO" class="dropdown-option" aria-role="listitem">Pomodoro</b-dropdown-item>
      </b-dropdown>
    </div>

    <!--
    <div id="options">
      <section>
        <button id="add-button">🞣</button>
      </section>
    </div>
    -->
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import RuleDetail from './rules/RuleDetail'
  import RuleCard from './rules/RuleCard.vue'
  import PomodoroRule from './rules/PomodoroRule.js'
  import TaskRule from './rules/TaskRule.js'
  import TimeRule from './rules/TimeRule.js'
  import { setTimeout } from 'timers'

  const OS = require('os')

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'ruleview',

    data: () => ({
      rules: [],
      unlockWaits: {},
      activerule: null,
      addRuleType: null,
      loading: false,
      ruleModalActive: true
    }),

    computed: {
      progress () {
        if (this.activerule === null) {
          return 0
        }

        const unlockWaits = this.$store.getters.unlockWaits
        for (let unlockID in unlockWaits) {
          if (this.activerule.ID === unlockID) {
            return Math.min((
              unlockWaits[unlockID] /
              this.activerule.lockTime
            ), 1)
          }
        }

        return 0
      }
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      async addRule (ruleType) {
        this.loading = true
        console.log('RULETYPE', ruleType, TaskRule.RULE_TYPE)
        let newRule

        if (ruleType === TaskRule.RULE_TYPE) {
          newRule = new TaskRule({
            name: 'test-name',
            programName: 'test-program',
            platform: OS.platform()
          })
        } else if (ruleType === TimeRule.RULE_TYPE) {
          newRule = new TimeRule({})
        } else if (ruleType === PomodoroRule.RULE_TYPE) {
          newRule = new PomodoroRule({})
        } else {
          throw new Error(`RULE TYPE UNKNOWN ${ruleType}`)
        }

        await this.$store.dispatch('addNewRule', newRule)
        await Misc.sleepAsync(100)
        this.addRuleType = null
        this.loadRules()
        this.loading = false
      },

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
      const self = this;
      (async () => {
        while (!self.isDestroyed) {
          self.unlockWaits = self.$store.getters.unlockWaits
          // console.log('UWAITS', self.unlockWaits)
          await Misc.sleepAsync(200)
        }
      })()
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
  grid-template-columns: 18rem 1px 1fr;
  grid-template-rows: 100%;
  grid-column-gap: 2.5rem;

  & div#detail {
    width: 15rem;
  }

  & div.divider {
    height: auto;
    width: 2px;
    margin-left: auto;
    background:#dcdfe6;
  }

  & div#rule-cards {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: flex-start;

    & .rule-card {
      margin: 0.2rem;
    }
  }

  & #options {
    & button#add-button {
      cursor: pointer;
      margin: 0.2rem;
      border-radius: 0;
      padding-left: 0.6rem;
      padding-right: 0.6rem;
      outline: none;
      background: transparent;
      border: 2px solid #dcdfe6;
      font-family: 'Staatliches';
      color: #555;
      font-size: 1rem;

      &:hover {
        border: 2px solid $light-blue;
        color: $light-blue;
      }
      &:active {
        border: 2px solid $primary; 
        color: $primary;
      }
      &:focus {
        outline: none;
        border: 2px solid $primary; 
        color: $primary !important;
      }
    }

    & .dropdown-option {
      font-size: 1rem !important;
    }
  }
}
</style>
