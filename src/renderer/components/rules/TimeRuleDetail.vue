<template>
  <div class="time-edit">
    <div class="columns">
      <div id="left-timepicker" class="timepicker column">
        <b-field label="Start Time">
          <b-clockpicker v-model="startTime"></b-clockpicker>
        </b-field>
      </div>
      <div id="right-timepicker" class="timepicker column">
        <b-field label="End Time">
          <b-clockpicker v-model="endTime"></b-clockpicker>
        </b-field>
      </div>
    </div>

    <input
      id="duration"
      v-model="startWait"
      v-bind:class = "{
        invalid: !startWaitValid
      }"
    />
    <p id="duration-label">Start wait duration (seconds)</p>

    <input
      id="duration"
      v-model="blockDuration"
      v-bind:class = "{
        invalid: !blockDurationValid
      }"
    />
    <p id="duration-label">Block duration (seconds)</p>
  </div>
</template>

<script>
  // require styles
  import assert from '@/assert.js'

  import Misc from '@/misc.js'
  import TimeRule from './TimeRule'
  import moment from 'moment'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-detail',

    data: () => ({
      ruleSavable: false,
      hasChanged: false,
      ruleValid: false,

      startWait: 0,
      blockDuration: 300,
      startTime: moment('22:00', 'HH:mm').toDate(),
      endTime: moment('6:00', 'HH:mm').toDate()
    }),

    computed: {
      savable () {
        return this.ruleSavable || this.baseSavable
      },

      startWaitValid () {
        return this.validDuration(this.startWait)
      },
      blockDurationValid () {
        return this.validDuration(this.blockDuration)
      }
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    created () {},

    methods: {
      validDuration (string) {
        const match = String(string).match(/^[0-9]+$/)
        return match !== null
      },

      loadRule (rule) {
        assert(rule instanceof TimeRule)
        if (rule === null) { return }

        this.startTime = rule.getStartTime(true)
        this.endTime = rule.getEndTime(true)
        this.startWait = rule.startWait
        this.blockDuration = rule.blockDuration
      },

      async saveRule () {
        this.rule.setStartTime(this.startTime)
        this.rule.setEndTime(this.endTime)
        this.rule.setStartWait(Number(this.startWait))
        this.rule.setBlockDuration(Number(this.blockDuration))
        this.updateSavable()
      },

      updateSavable () {
        const self = this
        let hasChanged = false

        const newRuleInfo = {
          endTime: self.endTime,
          startTime: self.startTime,
          startWait: parseInt(self.startWait),
          blockDuration: parseInt(self.blockDuration)
        }

        // console.log('RINFO', newRuleInfo)
        hasChanged = self.rule.hasChanged(newRuleInfo)

        self.ruleValid = (
          self.startWaitValid &&
          self.blockDurationValid
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

      startTime (newStartTime, oldStartTime) {
        this.updateSavable()
      },
      endTime (newEndTime, oldEndTime) {
        this.updateSavable()
      },

      startWait () {
        this.updateSavable()
      },
      blockDuration () {
        this.updateSavable()
      }
    },

    mounted () {
      this.loadRule(this.rule)
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

div.time-edit {
  & > div.columns {
    margin: 0px;
    width: 17rem;
    margin-bottom: 0.5rem;
    padding-left: 0.25rem;
    padding-right: 0.25rem;

    & > div.timepicker {
      &#left-timepicker {
        padding: 0px;
        padding-right: 0.75rem;
      }
      &#right-timepicker {
        padding: 0px;
        padding-left: 0.75rem;
      }
    }
  }

  & #program {
    margin-bottom: 0.3rem;
  }

  & p#duration-label {
    margin-left: 0.2rem;
  }

  & #duration {
    border-radius: 0px;
    margin-top: 0rem;
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
