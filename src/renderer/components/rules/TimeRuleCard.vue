<template>
  <div
    class="names"
    v-bind:class="{
      active: ruledata === activerule
    }"
  >
    <p>{{ timeRange }}</p>
    <p>{{ startWait }}</p>
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import EditInline from './EditInline'
  import { setTimeout } from 'timers'
  import TimeRule from './TimeRule'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'time-rule-card',

    computed: {
      startWait () {
        if (this.ruledata === undefined) { return 'meh' }
        return `${this.ruledata.startWait}s`
      },
      timeRange () {
        if (this.ruledata === undefined) { return 'meh' }
        const start = this.ruledata.getMomentStart().format('hh:mm A')
        const end = this.ruledata.getMomentEnd().format('hh:mm A')
        return `${start} — ${end}`
      }
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {},

    props: {
      ruledata: new TimeRule({}),
      activerule: null
    },

    components: {
      EditInline
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
    font-family: 'Staatliches';
    color: #666;
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

</style>
