<template>
  <div class="rule-detail">
    <b-loading :is-full-page="true" :active="loading" />

    <div class="detail-icons">
      <font-awesome-icon
        :icon="iconName"
        class="rule-icon large icon alt"
        v-bind:class="{
          muted: !saved
        }"
      >
      </font-awesome-icon>
      <div id="padding"></div>

      <font-awesome-icon
        @click="unlock"
        icon="lock" class="lock lock-close icon alt"
        v-bind:class="{
          disabled: !locked,
          unlocking: unlocking
        }"
      >
      </font-awesome-icon>
      <font-awesome-icon
        @click="lock"
        icon="lock-open" class="lock lock-open icon alt"
        v-bind:class="{ disabled: locked }"
      >
      </font-awesome-icon>

      <font-awesome-icon 
        icon="trash" class="delete-icon icon alt"
        @click="deleteRule"
        v-bind:class="{
          deletable: !this.isLocked
        }"
      >
      </font-awesome-icon>
      
      <font-awesome-icon
        icon="save"
        class="icon save-icon alt"
        @click="saveRule"
        v-bind:class="{
          savable: savable
        }"
      >
      </font-awesome-icon>
    </div>

    <!-- {{ [baseSavable, ruleSavable] }} -->
  
    <component
      :is="ruleContentDetail"
      v-bind:rule="rule"
      v-bind:baseSavable="baseSavable"
      v-on:savableUpdate="onSavableUpdate"
      ref="ruleContentDetail"
    ></component>
  </div>
</template>

<script>
  import './modes/HighlightModes.js'
  import PomodoroRuleDetail from './PomodoroRuleDetail.vue'
  import TaskRuleDetail from './TaskRuleDetail.vue'
  import TimeRuleDetail from './TimeRuleDetail.vue'
  // require styles
  import Misc from '@/misc.js'
  import assert from '@/assert.js'
  import TaskRule from './TaskRule'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-detail',

    data: () => ({
      baseSavable: false,
      ruleSavable: false,
      ruleValid: true,
      baseValid: true,

      name: '',
      nameMode: TaskRule.nameTypes.text,
      programName: '',
      programMode: TaskRule.nameTypes.text,
      unlocking: false,
      loading: false,
      locked: true,
      blockDuration: 300,
      hasChanged: false
    }),

    computed: {
      iconName () {
        if (this.rule === null) { return 'question' }
        const ruleType = this.rule.constructor.RULE_TYPE

        if (ruleType === TaskRuleDetail.RULE_TYPE) {
          return 'window-restore'
        } else if (ruleType === TimeRuleDetail.RULE_TYPE) {
          return 'clock'
        } else if (ruleType === PomodoroRuleDetail.RULE_TYPE) {
          return 'stopwatch'
        } else {
          return 'question'
        }
      },

      ruleContentDetail () {
        console.log('RULE-CONTENT', this.rule)
        let componentName

        if (this.rule === null) { return null }
        const ruleType = this.rule.constructor.RULE_TYPE

        if (ruleType === TaskRuleDetail.RULE_TYPE) {
          componentName = Misc.getVarStringName({TaskRuleDetail})
        } else if (ruleType === TimeRuleDetail.RULE_TYPE) {
          componentName = Misc.getVarStringName({TimeRuleDetail})
        } else if (ruleType === PomodoroRuleDetail.RULE_TYPE) {
          componentName = Misc.getVarStringName({PomodoroRuleDetail})
        } else {
          throw new Error(`RULE TYPE UNKNOWN ${ruleType}`)
        }

        return componentName
      },

      savable () {
        if (this.rule === null) {
          return false
        }
        console.log(
          'DEATHH',
          (this.ruleSavable || this.baseSavable),
          (this.rule !== null),
          this.ruleValid,
          this.baseValid
        )

        return (
          (this.ruleSavable || this.baseSavable) &&
          !this.rule.locked &&
          this.ruleValid &&
          this.baseValid
        )
      },

      saved () {
        if (this.rule === null) { return false }
        return this.rule.saved
      },
      isLocked () {
        return this.getRuleLocked()
      },

      inputInvalid () {
        return !this.validDuration()
      }
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    created () {
      const self = this
      let ID = self.getRuleID()
      const unlockWaits = self.$store.getters.unlockWaits
      let wasUnlocking = unlockWaits.hasOwnProperty(ID);

      (async () => {
        while (!self.isDestroyed) {
          const currentID = self.getRuleID()
          const unlockWaits = self.$store.getters.unlockWaits

          if (currentID !== ID) {
            ID = currentID
            wasUnlocking = unlockWaits.hasOwnProperty(ID)
          }

          const isUnlocking = unlockWaits.hasOwnProperty(ID)

          if (
            !isUnlocking &&
            wasUnlocking &&
            self.locked
          ) {
            self.rule.unlock()
            self.locked = false
          }

          if (currentID !== null) {
            const rule = await self.$store.dispatch(
              'getRuleByID', currentID
            )

            if (self.rule !== null) {
              if (self.rule.locked && !rule.locked) {
                self.rule.unlock()
                self.unlocking = false
                self.locked = false
              }
            }
          }

          await Misc.sleepAsync(200)
        }
      })()
    },

    methods: {
      onSavableUpdate (ruleSavable, ruleValid) {
        assert(typeof ruleSavable === 'boolean')
        assert(typeof ruleValid === 'boolean')
        this.ruleSavable = ruleSavable
        this.ruleValid = ruleValid
        // console.log('RULESAVE', ruleSavable)
      },
  
      getRuleID () {
        if (this.rule === null) { return null }
        return this.rule.ID
      },
      getRuleLocked () {
        if (this.rule === null) { return null }
        return this.rule.locked
      },

      deleteRule () {
        console.log('EMIT DELETE')
        if (!this.isLocked) {
          this.$emit('delete-rule', this.rule)
        }
      },

      async lock () {
        if (this.locked === false) {
          this.unlocking = false
          this.locked = true
        } else if (this.isLocked === false) {
          this.locked = false
        }

        this.updateSavable()
      },

      async unlock () {
        console.log('UNLOCKING')
        if (!this.isLocked) {
          // rule was not locked, change icon to lock
          this.unlocking = false
          this.locked = !this.locked
        } else if (this.unlocking === true) {
          // was unlocking, changed to locked
          this.loading = true
          await this.$store.dispatch('relockRule', this.rule)
          await Misc.sleepAsync(50)
          this.loading = false
          this.unlocking = false
        } else {
          // was not unlocking, show unlocking in transit
          console.log('UNLOCK')
          this.loading = true
          await this.$store.dispatch('unlockRule', this.rule)
          await Misc.sleepAsync(50)
          this.loading = false
          this.unlocking = true
          this.locked = true
        }

        this.updateSavable()
      },

      loadRule (rule) {
        if (rule === null) { return }
        this.locked = this.isLocked

        const unlockWaits = this.$store.getters.unlockWaits
        const unlocking = unlockWaits.hasOwnProperty(this.rule.ID)
        this.unlocking = unlocking
        this.updateSavable()
      },

      async saveRule () {
        if (this.rule === null) { return }

        if (this.savable) {
          this.loading = true
          await this.$refs.ruleContentDetail.saveRule()
          if (this.locked) { this.rule.lock() }
          this.rule.save()
          this.updateSavable()
          await this.$store.dispatch('saveRule', this.rule)
          this.loading = false
        }
      },

      updateSavable () {
        const self = this
        if (self.rule === null) { return false }

        const newRuleInfo = { locked: self.locked }
        // console.log('RINFO', newRuleInfo)
        const hasChanged = self.rule.hasChanged(newRuleInfo)

        // rule initially saved or changed
        console.log('BASE-CHANGE', hasChanged, !self.saved)
        self.baseSavable = (hasChanged || !self.saved)
        console.log('BASE-SAVABLE', self.baseSavable)
      }
    },

    watch: {
      rule (newRule, oldRule) {
        console.log('RDETAIL', newRule)
        this.loadRule(newRule)
        this.updateSavable()
      },

      name () {
        this.updateSavable()
      },
      programName () {
        this.updateSavable()
      },
      blockDuration () {
        this.updateSavable()
      }
    },

    mounted () {
      this.loadRule(this.rule)
    },

    components: {
      PomodoroRuleDetail,
      TaskRuleDetail,
      TimeRuleDetail
    },

    props: {
      rule: {
        type: null,
        default: null
      }
    }
  }
</script>

<style lang="scss">
@import "@/assets/scss/vars.scss";

div.rule-detail {
  width: 17rem;
  max-width: 17rem;
}

@keyframes unlocking {
  0% {
    color: $twitter;
  }
  50% {
    color: $primary;
  }
  100% {
    color: $twitter;
  }
}

div.detail-icons {
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  border-bottom: 2px solid #BBB;

  display: flex;
  padding-left: 0rem;
  padding-right: 0rem;
  margin-bottom: 1rem;
  flex-direction: row;
  align-items: center;

  & .icon {
    &.rule-icon {
      &.muted {
        color: #dcdfe6;
      }
    }

    &.save-icon {
      &:not(.savable) {
        color: #dcdfe6;
      }
      &.savable {
        cursor: pointer;
        &:hover { color: $twitter; }
        &:active { color: $primary; }
      }
    }

    &.delete-icon {
      cursor: pointer;

      &:not(.deletable) {
        color: $disabled;
      }
      &.deletable {
        &:hover { color: $delete-hover; }
        &:active { color: $delete-active; }
      }
    }

    &.lock {
      cursor: pointer;
      &.unlocking {
        animation-name: unlocking;
        animation-duration: 1s;
        animation-iteration-count: infinite;
      }

      &:hover { color: $light-blue; }
      &:active { color: $primary; }
    }

    &:not(:last-child) {
      margin-right: 0.4rem;
    }
    &.large {
      width: 1.2rem;
    }
  }

  div#padding {
    width: -webkit-fill-available;
  };
}
</style>
