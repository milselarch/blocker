<template>
  <div class="wrapper" @click="onClick">
    <div id="status"></div>
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
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import EditInline from './EditInline'
  import { setTimeout } from 'timers'
  import Rule from './Rule'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-card',

    data: () => ({
      blob: 'asdasdasd'
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      onClick () {
        this.$emit('select-rule', this.ruledata)
        // console.log('RULE CLICK')
      }
    },

    props: {
      ruledata: new Rule({}),
      activerule: null
    },

    components: {
      EditInline
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

div.wrapper {
  display: flex;
  flex-direction: row;
  margin: 0.2rem;
  align-items: stretch;
  
  & div#status {
    width: 4px;
    background-color:#dcdfe6;
  }

  & div.names {
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
}

</style>
