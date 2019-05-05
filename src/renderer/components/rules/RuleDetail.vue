<template>
  <div class="rule-detail">
    <b-loading :is-full-page="true" :active="loading" />

    <div class="detail-icons">
      <font-awesome-icon
        icon="window-restore"
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
      class="mode-edit"
    ></component>
  </div>
</template>

<script>
  import './modes/HighlightModes.js'
  import TaskRuleDetail from './TaskRuleDetail.vue'
  // require styles
  import Misc from '@/misc.js'
  import Rule from './Rule'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-detail',

    data: () => ({
      baseSavable: false,
      ruleSavable: false,

      name: '',
      nameMode: Rule.nameTypes.text,
      programName: '',
      programMode: Rule.nameTypes.text,
      unlocking: false,
      loading: false,
      locked: true,
      blockDuration: 300,
      hasChanged: false
    }),

    computed: {
      savable () {
        return (
          this.ruleSavable || this.baseSavable
        ) && (this.rule !== null)
      },

      ruleContentDetail () {
        console.log('RULE-CONTENT', this.rule)
        let componentName

        if (this.rule === null) {
          return null
        }

        const ruleType = this.rule.constructor.RULE_TYPE

        if (ruleType === 'PROGRAM') {
          componentName = Misc.getVarStringName({TaskRuleDetail})
        } else {
          throw new Error(`RULE TYPE UNKNOWN ${ruleType}`)
        }

        return componentName
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
          if (currentID !== ID) {
            ID = currentID
            const unlockWaits = self.$store.getters.unlockWaits
            wasUnlocking = unlockWaits.hasOwnProperty(ID)
          }

          const unlockWaits = self.$store.getters.unlockWaits
          const isUnlocking = unlockWaits.hasOwnProperty(ID)

          if (
            !isUnlocking &&
            wasUnlocking &&
            self.locked
          ) {
            self.rule.unlock()
            self.locked = false
          }

          await Misc.sleepAsync(200)
        }
      })()
    },

    methods: {
      onSavableUpdate (ruleSavable) {
        this.ruleSavable = ruleSavable
        console.log('RULESAVE', ruleSavable)
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
        let hasChanged = false

        if (self.rule instanceof Rule) {
          // console.log('SELFRULE', self.rule)
          const newRuleInfo = {
            locked: self.locked
          }

          // console.log('RINFO', newRuleInfo)
          hasChanged = self.rule.hasChanged(newRuleInfo)
        }

        // rule initially saved or changed
        console.log('BASE-CHANGE', hasChanged, !self.saved)
        self.baseSavable = hasChanged || !self.saved
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
      TaskRuleDetail
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

div.mode-edit {
  & #program {
    margin-bottom: 0.3rem;
  }

  & p#duration-label {
    margin-left: 0.2rem;
  }

  & #duration {
    border-radius: 0px;
    margin-top: 1rem;
    border: 0px;
    border-bottom: 2px solid #dcdfe6;
    font-size: 1rem;
    font-family: 'Abel';
    padding: 0.2rem;
    width: 100%;

    &:focus, &:focus, &:focus{
      outline: none;
    }

    &.invalid {
      border-bottom: 2px solid $warning;
    }
  }
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
  border-bottom: 2px solid grey;

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
      width: 1.3rem;
    }
  }

  div#padding {
    width: -webkit-fill-available;
  };
}
</style>
