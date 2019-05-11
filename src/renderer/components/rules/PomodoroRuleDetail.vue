<template>
  <div class="task-edit">
    <input
      id="Duration"
      class="num-input"
      v-model="duration"
      v-bind:class = "{
        invalid: !isValidInt(duration)
      }"
    />
    <p id="duration-label">Pomodoro duration (min)</p>

    <input
      id="Short Break Duration"
      class="num-input"
      v-model="shortBreak"
      v-bind:class = "{
        invalid: !isValidInt(shortBreak)
      }"
    />
    <p id="duration-label">Short break duration (min)</p>

    <input
      id="Long Break Duration"
      class="num-input"
      v-model="longBreak"
      v-bind:class = "{
        invalid: !isValidInt(longBreak)
      }"
    />
    <p id="duration-label">Long break duration (min)</p>

    <input
      id="duration"
      class="num-input"
      v-model="blockDuration"
      v-bind:class = "{
        invalid: !isValidInt(blockDuration)
      }"
    />
    <p id="duration-label">Block duration (sec)</p>
  </div>
</template>

<script>
  import './modes/HighlightModes.js'
  import EditInlineMode from './EditInlineMode'
  // require styles
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'
  import PomodoroRule from './PomodoroRule'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'pomodoro-rule-detail',
    RULE_TYPE: PomodoroRule.RULE_TYPE,

    data: () => ({
      ruleSavable: false,
      ruleValid: false,

      duration: 25,
      shortBreak: 6,
      longBreak: 15,
      blockDuration: 300
    }),

    computed: {
      savable () {
        return this.ruleSavable || this.baseSavable
      },

      blockDurationInvalid () {
        return !this.isValidInt(this.blockDuration)
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

      isValidInt (string) {
        const match = String(string).match(/^[0-9]+$/)
        return match !== null
      },

      loadRule (rule) {
        if (rule === null) {
          // console.log('NULL RULE')
          return
        }

        // console.log('LOAD RULE', rule)

        this.duration = rule.duration
        this.shortBreak = rule.shortBreak
        this.longBreak = rule.longBreak
      },

      async saveRule () {
        this.rule.setDuration(parseInt(this.duration))
        this.rule.setShortBreak(parseInt(this.shortBreak))
        this.rule.setLongBreak(parseInt(this.longBreak))
        this.updateSavable()
      },

      updateSavable () {
        const self = this
        let hasChanged = false

        if (self.rule instanceof PomodoroRule) {
          // console.log('SELFRULE', self.rule)
          const newRuleInfo = {
            duration: parseInt(self.duration),
            shortBreak: parseInt(self.shortBreak),
            longBreak: parseInt(self.longBreak),
            blockDuration: parseInt(self.blockDuration)
          }

          // console.log('RINFO', newRuleInfo)
          hasChanged = self.rule.hasChanged(newRuleInfo)
        }

        self.ruleValid = (
          self.isValidInt(self.duration) &&
          self.isValidInt(self.shortBreak) &&
          self.isValidInt(self.longBreak) &&
          self.isValidInt(self.blockDuration)
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

      duration () {
        this.updateSavable()
      },
      shortBreak () {
        this.updateSavable()
      },
      longBreak () {
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
  & input.num-input {
    border-radius: 0px;
    margin-top: 0.2rem;
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
