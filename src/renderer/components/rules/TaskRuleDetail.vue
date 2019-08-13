<template>
  <div class="task-edit">
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
      class="text-input"
      v-model="blockDuration"
      v-bind:class = "{
        invalid: inputInvalid
      }"
    />
    <p id="duration-label">Block duration (seconds)</p>

    <div class="allowance-wrapper">
      <input
        id="max-allowance-input"
        class="text-input"
        :disabled="!enableAllowance"
        v-model="maxAllowance"
        v-bind:class = "{
          invalid: maxInvalid,
          enabled: enableAllowance
        }"
      />
      <p class="input-label">Max cummulative allowance (seconds)</p>

      <input
        id="allowance-input"
        class="text-input"
        :disabled="!enableAllowance"
        v-model="dailyAllowance"
        v-bind:class = "{
          invalid: dailyInvalid,
          enabled: enableAllowance
        }"
      />
      <p class="input-label">Daily allowance (seconds) </p>
    </div>

    <b-progress
      id="progress" :value="progressPercentage"
      size="is-medium" show-value
    >
      <span> {{ progressMessage }} </span>
    </b-progress>

    <div class="toggle-allowance">
      <b-switch id="switch" v-model="enableAllowance" :rounded="false">
        <p
          id="allowance-status"
          v-bind:class = "{enabled: enableAllowance}"
        >
          {{ allowanceStatus }}
        </p>
      </b-switch>
    </div>

    <!--
    <p> {{ blocks }} <p/> 
    <p> {{ progressMessage }} </p>
    -->
  </div>
</template>

<script>
  import './modes/HighlightModes.js'
  import EditInlineMode from './EditInlineMode'
  // require styles
  import Misc from '@/misc.js'
  import TaskRule from './TaskRule'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'task-rule-detail',
    RULE_TYPE: TaskRule.RULE_TYPE,

    data: () => ({
      dailyAllowance: 600,
      maxAllowance: 7200,
      enableAllowance: false,

      allowanceLeft: 0,

      isDestroyed: false,
      ruleSavable: false,
      ruleValid: false,

      name: '',
      nameMode: TaskRule.nameTypes.text,
      programName: '',
      programMode: TaskRule.nameTypes.text,
      blockDuration: 300,
      hasChanged: false
    }),

    computed: {
      savable () {
        return this.ruleSavable || this.baseSavable
      },

      blocks () {
        return JSON.stringify(this.$store.getters.blockAllowances)
      },

      progressPercentage () {
        if (this.rule === null) { return 0 }

        const maxAllowance = this.rule.maxAllowance
        return 100 * this.allowanceLeft / maxAllowance
      },

      progressMessage () {
        if (this.rule === null) { return 'loading...' }
        const allowanceLeft = Number.parseInt(this.allowanceLeft)
        const maxAllowance = this.rule.maxAllowance
        // console.log('MAX ALLOWANCE', maxAllowance)
        return `${allowanceLeft} / ${maxAllowance}`
      },

      allowanceStatus () {
        if (this.enableAllowance) {
          return 'Allowance enabled'
        } else {
          return 'Allowance disabled'
        }
      },

      inputInvalid () {
        return !this.validDuration()
      },
      dailyInvalid () {
        return !this.validDuration(this.dailyAllowance)
      },
      maxInvalid () {
        return !this.validDuration(this.maxAllowance)
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

    created () {},

    mounted () {
      const self = this
      self.loadRule(self.rule);

      (async () => {
        while (!self.isDestroyed) {
          const ruleID = self.rule.getID()
          self.allowanceLeft = self.$store.getters.getAllowanceLeft(ruleID)
          await Misc.sleepAsync(250)
        }
      })()
    },

    methods: {
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

      validDuration (value) {
        if (value === undefined) {
          value = this.blockDuration
        }

        const match = String(value).match(/^[0-9]+$/)
        return match !== null
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

        this.dailyAllowance = rule.dailyAllowance
        this.maxAllowance = rule.maxAllowance
        this.enableAllowance = rule.enableAllowance

        this.$refs.nameEdit.$forceUpdate()
        this.$refs.programEdit.$forceUpdate()
      },

      async saveRule () {
        const changedAllowance = this.rule.hasChanged({
          dailyAllowance: this.dailyAllowance,
          enableAllowance: this.enableAllowance,
          maxAllowance: this.maxAllowance
        })

        console.log('CHANGED ALLOWANCE', changedAllowance)

        if (changedAllowance) {
          console.log('RESET ALLOWANCE', this.rule.getID())
          this.$store.commit('resetAllowance', this.rule)
        }

        this.rule.setName(this.name, this.nameMode)
        this.rule.setProgram(this.programName, this.programMode)
        this.rule.setBlockDuration(this.blockDuration)

        this.rule.setEnableAllowance(this.enableAllowance)
        this.rule.setDailyAllowance(this.dailyAllowance)
        this.rule.setMaxAllowance(this.maxAllowance)
        this.updateSavable()
      },

      updateSavable () {
        const self = this
        let hasChanged = false

        if (self.rule instanceof TaskRule) {
          // console.log('SELFRULE', self.rule)
          const newRuleInfo = {
            name: self.name,
            nameType: self.nameMode,
            programName: self.programName,
            programType: self.programMode,
            blockDuration: parseInt(self.blockDuration),

            enableAllowance: self.enableAllowance,
            dailyAllowance: parseInt(self.dailyAllowance),
            maxAllowance: parseInt(self.maxAllowance)
          }

          console.log('RINFO', newRuleInfo)
          hasChanged = self.rule.hasChanged(newRuleInfo)
        }

        self.ruleValid = (
          self.validDuration() &&
          self.nameInputValid &&
          self.programInputValid
        )

        self.ruleSavable = hasChanged && self.ruleValid
        this.$emit('savableUpdate', self.ruleSavable, self.ruleValid)
      }
    },

    watch: {
      rule (newRule, oldRule) {
        console.log('RDETAIL', newRule)
        this.loadRule(newRule)
        this.updateSavable()
      },

      name () { this.updateSavable() },
      programName () { this.updateSavable() },
      blockDuration () { this.updateSavable() },
      enableAllowance () { this.updateSavable() },
      dailyAllowance () { this.updateSavable() },
      maxAllowance () { this.updateSavable() }
    },

    components: {
      EditInlineMode
    },

    props: {
      baseSavable: {
        type: Boolean,
        default: false
      },
      rule: {
        type: null,
        default: null
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

div.rule-detail {
  width: 17rem;
  max-width: 17rem;
}

input.text-input {
  border-radius: 0px;
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

p.input-label {
  margin-left: 0.2rem;
}

div.toggle-allowance {
  margin-left: auto;
  margin-right: auto;
  margin-top: 0rem;
  width: fit-content;

  & p#allowance-status {
    font-family: "Staatliches";

    &:not(.enabled) {
      color: #AAA;
    }
  }
}

#progress {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;

  & span {
    font-family: "Inconsolata";
    display: table-cell;
  }
}

div.allowance-wrapper {
  margin-top: 0rem;
}

div.task-edit {
  & #program {
    margin-bottom: 0.3rem;
  }

  & p#duration-label {
    margin-left: 0.2rem;
  }

  & #duration {
    margin-top: 1rem !important;

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
