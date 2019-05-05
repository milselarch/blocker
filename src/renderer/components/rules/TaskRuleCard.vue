<template>
  <div
    class="names"
    v-bind:class="{
      active: ruledata === activerule
    }"
  >
    <EditInline 
      v-model="ruledata.name"
      :border="false"
      readonly='nocursor'
      :mode="ruledata.nameType"
    />
    <EditInline 
      v-model="ruledata.programName"
      :border="false"
      readonly='nocursor'
      :mode="ruledata.programType"
    />
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import EditInline from './EditInline'
  import { setTimeout } from 'timers'
  import TaskRule from './TaskRule'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'task-rule-card',

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {},

    props: {
      ruledata: new TaskRule({}),
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
