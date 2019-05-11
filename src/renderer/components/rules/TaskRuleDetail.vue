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
      v-model="blockDuration"
      v-bind:class = "{
        invalid: inputInvalid
      }"
    />
    <p id="duration-label">Block duration (seconds)</p>
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

    created () {},

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

      validDuration () {
        const match = String(this.blockDuration).match(/^[0-9]+$/)
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

        this.$refs.nameEdit.$forceUpdate()
        this.$refs.programEdit.$forceUpdate()
      },

      async saveRule () {
        this.rule.setName(this.name, this.nameMode)
        this.rule.setProgram(this.programName, this.programMode)
        this.rule.setBlockDuration(this.blockDuration)
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
            blockDuration: parseInt(self.blockDuration)
          }

          // console.log('RINFO', newRuleInfo)
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

div.task-edit {
  & #program {
    margin-bottom: 0.3rem;
  }

  & p#duration-label {
    margin-left: 0.2rem;
  }

  & #duration {
    border-radius: 0px;
    margin-top: 1rem !important;
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
