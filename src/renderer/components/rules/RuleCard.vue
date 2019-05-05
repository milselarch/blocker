<template>
  <div class="wrapper" @click="onClick">
    <div id="status">
      <div
        class="progress-fill"
        v-bind:style="{
        'flex-basis': (100 * progress) + '%'
      }"></div>
    </div>
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
  import TaskRule from './TaskRule'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-card',

    computed: {
      progress () {
        const unlockWaits = this.$store.getters.unlockWaits
        if (unlockWaits.hasOwnProperty(this.ruledata.ID)) {
          return (
            unlockWaits[this.ruledata.ID] /
            this.ruledata.lockTime
          )
        }

        return 0
      }
    },

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

div.wrapper {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  
  & div#status {
    width: 4px;
    background-color:#dcdfe6;

    display: flex;
    justify-content: space-between;
    flex-direction: column-reverse;

    & div.progress-fill {
      color: red;
      background-color: #58B7FF;
    }
    & div.progress-background {
      flex-basis: auto;
      background-color: #DDD;
      flex-grow: 1;
    }
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
