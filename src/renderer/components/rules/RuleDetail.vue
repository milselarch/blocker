<template>
  <div class="rule-detail">
    <b-loading :is-full-page="true" :active="loading" />

    <div class="detail-icons">
      <font-awesome-icon
        icon="window-restore"
        class="rule-icon large icon alt"
        v-bind:class="{
          muted: !this.rule.saved
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
          deletable: !this.rule.locked
        }"
      >
      </font-awesome-icon>
      
      <font-awesome-icon
        icon="save"
        class="icon save-icon alt"
        @click="saveRule"
        v-bind:class="{
          savable: (
            savable &&
            nameInputValid &&
            programInputValid
          )
        }"
      >
      </font-awesome-icon>
    </div>
   
    <div class="mode-edit">
      <EditInlineMode 
        id="program"
        title="Program"
        v-model="name"
        ref="nameEdit"
        v-on:mode-change="changeNameMode"
        :mode="nameMode"
      />
      <EditInlineMode
        id="title"
        title="Window Title"
        v-model="programName"
        ref="programEdit"
        v-on:mode-change="changeProgramMode"
        :mode="programMode"
      />

      <input 
        id="duration"
        v-model="blockDuration"
        v-bind:class = "{
          invalid: inputInvalid
        }"
      />
      <p id="duration-label">Block duration (seconds)</p>
    </div>

    <!-- <p> {{ code }} </p> -->
    
  </div>

</template>

<script>
  import './modes/HighlightModes.js'
  import EditInlineMode from './EditInlineMode'
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
      name: '',
      nameMode: Rule.nameTypes.text,
      programName: '',
      programMode: Rule.nameTypes.text,
      unlocking: false,
      savable: false,
      loading: false,
      locked: true,
      blockDuration: 300,
      hasChanged: false
    }),

    computed: {
      inputInvalid () {
        return !this.validDuration()
      },

      nameInputValid () {
        return this.inputValid(this.name, this.nameMode)
      },
      programInputValid () {
        return this.inputValid(this.programName, this.programMode)
      }
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    created () {
      const self = this
      let ID = self.rule.ID
      const unlockWaits = self.$store.getters.unlockWaits
      let wasUnlocking = unlockWaits.hasOwnProperty(ID);

      (async () => {
        while (!self.isDestroyed) {
          if (self.rule.ID !== ID) {
            ID = self.rule.ID
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
      deleteRule () {
        console.log('EMIT DELETE')
        if (!this.rule.locked) {
          this.$emit('delete-rule', this.rule)
        }
      },

      inputValid (value, mode) {
        let test = true

        if (mode === 'regex') {
          try {
            test = new RegExp(value)
            console.log('VALUD OK REGEX')
          } catch (err) {
            if (err.name !== 'SyntaxError') {
              throw err
            } else {
              test = false
            }
          }
        }

        return test
      },

      validDuration () {
        const match = String(this.blockDuration).match(/^[0-9]+$/)
        return match !== null
      },

      async lock () {
        if (this.locked === false) {
          this.unlocking = false
          this.locked = true
        } else if (this.rule.locked === false) {
          this.locked = false
        }

        this.updateSavable()
      },

      async unlock () {
        console.log('UNLOCKING')
        if (!this.rule.locked) {
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

      changeNameMode (nameMode) {
        this.nameMode = nameMode
        // console.log('CGNAGEMODE N', nameMode)
        this.updateSavable()
      },
      changeProgramMode (programMode) {
        this.programMode = programMode
        // console.log('CGNAGEMODE P', programMode)
        this.updateSavable()
      },

      loadRule (rule) {
        if (rule === null) {
          // console.log('NULL RULE')
          return
        }

        // console.log('LOAD RULE', rule)

        this.name = rule.name
        this.nameMode = rule.nameType
        this.programName = rule.programName
        this.programMode = rule.programType
        this.blockDuration = rule.blockDuration
        this.locked = rule.locked

        const unlockWaits = this.$store.getters.unlockWaits
        const unlocking = unlockWaits.hasOwnProperty(this.rule.ID)
        this.unlocking = unlocking

        this.$refs.nameEdit.$forceUpdate()
        this.$refs.programEdit.$forceUpdate()
      },

      async saveRule () {
        if (this.savable) {
          this.rule.setName(this.name, this.nameMode)
          this.rule.setProgram(this.programName, this.programMode)
          this.rule.setBlockDuration(this.blockDuration)
          if (this.locked) { this.rule.lock() }
          this.rule.save()
          this.updateSavable()

          this.loading = true
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
            name: self.name,
            nameType: self.nameMode,
            locked: self.locked,
            programName: self.programName,
            programType: self.programMode,
            blockDuration: parseInt(self.blockDuration)
          }

          // console.log('RINFO', newRuleInfo)
          hasChanged = self.rule.hasChanged(newRuleInfo)
        }

        self.savable = (
          hasChanged &&
          self.validDuration()
        ) || !self.rule.saved
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
      EditInlineMode
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
  max-width: 25rem;
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
