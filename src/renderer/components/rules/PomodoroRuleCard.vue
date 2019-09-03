<template>
  <div
    class="names"
    v-bind:class="{
      active: ruledata === activerule
    }"
  >
    <p>
      <span id="duration">{{ duration }}</span>
      <span id="time-left">{{ timeLeftMsg }}</span>
      <button 
        @click="start" id="start"
        v-bind:class="{disabled: disabled}"
      >start</button>
    </p>
    <p class="break-times">
      <span>{{ shortBreak }}m × 3</span>
      <span>{{ longBreak }}m</span>
    </p>
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'
  import PomodoroRule from './PomodoroRule'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'pomodoro-rule-card',

    data: () => ({
      timeLeftMsg: ''
    }),

    computed: {
      duration () {
        if (this.ruledata === undefined) { return 'meh' }
        return `${this.ruledata.duration}min`
      },
      shortBreak () {
        if (this.ruledata === undefined) { return 'meh' }
        return `${this.ruledata.shortBreak}`
      },
      longBreak () {
        if (this.ruledata === undefined) { return 'meh' }
        return `${this.ruledata.longBreak}`
      },

      disabled () {
        if (this.ruledata === undefined) { return true }
        const ID = this.ruledata.getID()

        return !this.ruledata.optIn || (
          this.$store.getters.getOptIns.hasOwnProperty(ID)
        )
      }
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    async created () {
      const self = this;

      (async () => {
        while (!self.isDestroyed) {
          self.getTimeLeft()
          await Misc.sleepAsync(250)
        }
      })()
    },

    methods: {
      start () {
        if (this.ruledata === undefined) { return }
        this.$store.commit('addOptInPomodoro', this.ruledata)
        console.log('ADDED POMODORO')
      },

      getTimeLeft () {
        if (this.ruledata === undefined) { return '' }
        const pomodoroStart = this.$store.getters.pomodoroStart
        const duration = this.ruledata.duration * 60
        const secondsLeft = this.ruledata.secondsLeft(
          pomodoroStart, duration
        )

        // console.log('SECSLEGT', pomodoroStart, duration)
        const mins = Math.floor(secondsLeft / 60)
        const secs = secondsLeft % 60
        this.timeLeftMsg = `${mins}m${secs}s`
      }
    },

    props: {
      ruledata: new PomodoroRule({}),
      activerule: null
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

div.names {
  width: 10rem;
  border: 2px solid #dcdfe6;
  padding: 0.3rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  & p {
    & span#duration {
      font-family: 'Staatliches';
      color: #666;
    }
    & span#time-left {
      float: right;
      color: $light-blue;
      margin-right: 0.5rem;
    }

    & button#start {
      border: 0;
      cursor: pointer;
      outline: none;
      color: $warning;
      background-color: white;
      font-family: 'Staatliches';
      
      &:hover {
        color: $danger;
        background-color: white;
      }
    }
  }

  &:hover {
    cursor: pointer;
    border: 2px solid $twitter;
  }
  &:active {
    cursor: pointer;
    border: 2px solid $primary;
  }

  &.active {
    border: 2px solid $twitter;
    &:hover { border: 2px solid $primary; }
    &:active { border: 2px solid $selected-hover; }
  }
}

p.break-times {
  & span:nth-child(2) {
    float: right;
    margin-right: 0.5rem;
  }
}

</style>
