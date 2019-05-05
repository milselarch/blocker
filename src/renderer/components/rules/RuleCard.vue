<template>
  <div class="wrapper" @click="onClick">
    <div id="status">
      <div
        class="progress-fill"
        v-bind:style="{
        'flex-basis': (100 * progress) + '%'
      }"></div>
    </div>

    <component
      :is="ruleCardDetail"
      v-bind:ruledata="ruledata"
      v-bind:activerule="activerule"
      ref="ruleCardDetail"
    ></component>
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import EditInline from './EditInline'
  import TaskRuleCard from './TaskRuleCard'
  import TimeRuleCard from './TimeRuleCard'
  import { setTimeout } from 'timers'
  import TaskRule from './TaskRule'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-card',

    computed: {
      ruleCardDetail () {
        const ruleType = this.ruledata.constructor.RULE_TYPE
        let componentName

        if (ruleType === 'TASK') {
          componentName = Misc.getVarStringName({TaskRuleCard})
        } else if (ruleType === 'TIME-OF-DAY') {
          componentName = Misc.getVarStringName({TimeRuleCard})
        } else {
          throw new Error(`RULE TYPE UNKNOWN ${ruleType}`)
        }

        return componentName
      },

      progress () {
        const unlockWaits = this.$store.getters.unlockWaits
        if (unlockWaits.hasOwnProperty(this.ruledata.ID)) {
          return (
            unlockWaits[this.ruledata.ID] /
            this.ruledata.lockTime
          )
        }

        return 0
      }
    },

    data: () => ({
      blob: 'asdasdasd'
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      onClick () {
        this.$emit('select-rule', this.ruledata)
        // console.log('RULE CLICK')
      }
    },

    props: {
      ruledata: new TaskRule({}),
      activerule: null
    },

    components: {
      TaskRuleCard,
      TimeRuleCard,
      EditInline
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

div.wrapper {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  
  & div#status {
    width: 4px;
    background-color:#dcdfe6;

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
}

</style>
