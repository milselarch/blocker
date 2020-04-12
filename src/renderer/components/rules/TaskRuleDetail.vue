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
    <p id="duration-label">
      Block duration (seconds)
    </p>

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
      <p class="input-label">
        Max cummulative allowance (seconds)
      </p>

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
      <p class="input-label">
        Daily allowance (seconds)
      </p>
    </div>

    <b-checkbox-button
      v-model="checkboxGroup"
      :value="trackActiveUsage"
      :disabled="!enableAllowance"
      native-value="trackActiveUsage"
      @input="changeCheckbox"
      id="usage-checkbox"
      type="is-info"
    >
      <span 
        v-bind:class = "{ selected: trackActive }"
        class="label"
      >
        Only track active usage
      </span>
    </b-checkbox-button>

    <b-progress
      id="progress" :value="progressPercentage"
      size="is-medium" show-value
    >
      <span> {{ progressMessage }} </span>
    </b-progress>

    <div class="toggle-allowance">
      <b-switch
        id="switch" v-model="enableAllowance"
        :rounded="false" @input="onEnableAllowanceChange"
      >
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

  const ACTIVE_USAGE = 'trackActiveUsage'

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
      trackActiveUsage: false,

      checkboxGroup: [],
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

      trackActive () {
        return this.checkboxGroup.indexOf(ACTIVE_USAGE) > -1
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

      allowanceInvalid () {
        return (
          this.dailyAllowance > this.maxAllowance
        )
      },
      dailyInvalid () {
        return (
          !this.validDuration(this.dailyAllowance) ||
          this.dailyAllowance <= 0 ||
          this.allowanceInvalid
        )
      },
      maxInvalid () {
        return (
          !this.validDuration(this.maxAllowance) ||
          this.maxAllowance <= 0 ||
          this.allowanceInvalid
        )
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
      onEnableAllowanceChange (value) {
        if (!value) {
          this.checkboxGroup = []
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

      changeCheckbox (value) {
        this.updateSavable()
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

        this.trackActiveUsage = rule.onlyActiveUsage
        this.dailyAllowance = rule.dailyAllowance
        this.maxAllowance = rule.maxAllowance
        this.enableAllowance = rule.enableAllowance
        this.rule = rule

        this.checkboxGroup = []
        if (this.trackActiveUsage) {
          this.checkboxGroup.push(ACTIVE_USAGE)
        }

        this.$refs.nameEdit.$forceUpdate()
        this.$refs.programEdit.$forceUpdate()
      },

      async saveRule () {
        const changedAllowance = this.rule.hasChanged({
          dailyAllowance: this.dailyAllowance,
          enableAllowance: this.enableAllowance,
          maxAllowance: this.maxAllowance
        })

        // we have to check if the allowance has been changed
        // BEFORE saving the allowance, otherwise, changeAllowance
        // will always return false

        console.log('CHANGED ALLOWANCE', changedAllowance)
        this.rule.setName(this.name, this.nameMode)
        this.rule.setProgram(this.programName, this.programMode)
        this.rule.setBlockDuration(this.blockDuration)

        this.rule.setOnlyActiveUsage(this.trackActive)
        this.rule.setEnableAllowance(this.enableAllowance)
        this.rule.setDailyAllowance(parseInt(this.dailyAllowance))
        this.rule.setMaxAllowance(parseInt(this.maxAllowance))
        this.updateSavable()

        if (changedAllowance) {
          console.log('RESET ALLOWANCE', this.rule.getID())
          this.$store.commit('resetAllowance', this.rule)
        }
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

            onlyActiveUsage: self.trackActive,
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
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  & span {
    font-family: "Inconsolata";
    display: table-cell;
  }
}

div.allowance-wrapper {
  margin-top: 0rem;
}

#usage-checkbox {
  font-family: "Inconsolata";
  font-size: 1rem;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1rem;
  display: flex;
  justify-content: center;

  & .label {
    color: #555;
    margin-top: auto;
    margin-bottom: auto;
    margin-left: auto;
    margin-right: auto;
    display: flex;

    &.selected {
      color: white;
    }
  }
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
