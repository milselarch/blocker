<template>
  <div id="app">
    <BlockView
      v-on:on-state="onStateChange"
      v-on:block-progress="onBlockProgress"
      :allowVisible="allowBlock"
      class="blocked"
    />

    <div
      id="content"
      v-bind:class="{
        padded: blockState !== BLOCK_STATES.unblocked
      }"
    >
      {{ blockState }}

      <b-tabs 
        position="is-centered"
        class="tabs-block"
        v-model="tabIndex"
        v-on:change="onTabChange"
        type="is-boxed"
        :hoverable="true"
      >
        <b-tab-item
          v-for="tabName in tabNames"
          v-bind:key = "tabName"
          class="main-tab-item" 
          :label="tabName"
        >
          <template slot="header" class="tab-header">
            <div class="tab-wrapper">
              <span class="tab-head-name"> {{ tabName }} </span>
              <font-awesome-icon 
                :icon="tabs[tabName].icon"
                class="icon alt"
              >
              </font-awesome-icon>
            </div>
          </template>

        </b-tab-item>
      </b-tabs>

      <router-view 
        class="tab-content"
        :name="tabViewName"
        v-on:new-rule="addNewRule"
      >
      </router-view>
    </div>

    <div
      id="progress"
      v-bind:class="{
        invisible: blockState === BLOCK_STATES.unblocked
      }"
    >
      <div
        class="progress-fill"
        v-bind:style="{
          'flex-basis': (100 * blockProgress) + '%'
        }"
        v-bind:class="{
          depleting: blockState === BLOCK_STATES.allowing
        }"
      ></div>
    </div>

  </div>
</template>

<script>
  import BlockView from '@/components/BlockView'
  import Misc from '@/misc.js'
  import BLOCK_STATES from '@/components/blockStates'
  
  const TABS = {
    Programs: {icon: 'window-restore'},
    Rules: {icon: 'shield-alt'}
  }

  const TAB_NAMES = Object.keys(TABS)
  console.log('STATESR')

  export default {
    name: 'blocker-app',

    data: () => ({
      blockProgress: 0,
      BLOCK_STATES: BLOCK_STATES,
      blockState: BLOCK_STATES.unblocked,

      allowBlock: true,
      tabNames: TAB_NAMES,
      tabViewName: TAB_NAMES[0],
      tabIndex: 0,
      tabs: TABS
    }),

    async created () {
      // await tshis.$store.dispatch('reset')
      const self = this;
      (async () => {
        await self.$store.dispatch('onStart')

        while (!self.isDestroyed) {
          await self.$store.dispatch('updateUnlocks')
          await Misc.sleepAsync(300)
        }
      })()
    },

    methods: {
      onBlockProgress: function (blockProgress) {
        this.blockProgress = blockProgress
      },
      onStateChange: function (blockState) {
        this.blockState = blockState
      },

      onTabChange: function (tabNo) {
        console.log(`TAB CHANGE NO ${tabNo}`)
        this.tabViewName = this.tabNames[tabNo]
      },
      addNewRule: async function (newRule) {
        console.log('RULE ACQUISITION', newRule)
        // this.$store.commit('setNewRule', newRule)
        this.tabIndex = TAB_NAMES.indexOf('Rules')
      }
    },

    components: {
      BlockView
    }
  }
</script>

<style lang="scss">
  // Import Bulma's core
  @import "~bulma/sass/utilities/_all";
  @import "@/assets/scss/vars.scss";
  // Setup $colors to use as bulsma classes (e.g. 'is-twitter')
  $colors: (
      "white": ($white, $black),
      "black": ($black, $white),
      "light": ($light, $light-invert),
      "dark": ($dark, $dark-invert),
      "primary": ($primary, $primary-invert),
      "info": ($info, $info-invert),
      "success": ($success, $success-invert),
      "warning": ($warning, $warning-invert),
      "danger": ($danger, $danger-invert),
      "twitter": ($twitter, $twitter-invert)
  );

  // Import Bulma and Buefy styles
  @import "~bulma";
  @import "~buefy/src/scss/buefy";

  $progBarHeight: 8px;

  html {
    overflow-y: auto !important;
  }

  div#app {
    & > div#content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;

      &.padded {
        padding-bottom: $progBarHeight;
      } &:not(.padded) {
        padding-bottom: 0px;
      }

      & .blocked {
        width: 100%;
        height: 100%;
        position: relative;
        background-color: white;
        opacity: 0.9;
        z-index: 100;
      }
    }

    & > div#progress {
      height: $progBarHeight;
      background-color:#dcdfe6;
      position: absolute;
      bottom: 0px;
      float: bottom;

      z-index: 300;
      width: -webkit-fill-available;
      justify-content: space-between;

      &.invisible {
        display: none;
        height: 0px;
      } &:not(.invisible) {
        display: flex;
        flex-direction: row;
      }

      & div.progress-fill {
        color: red;
        background-color: #58B7FF;
        transition: all 0.3s ease-out;
        &.depleting {
          background-color: $warning;
        }
      }
      & div.progress-background {
        flex-basis: auto;
        background-color: #DDD;
        flex-grow: 1;
      }
    }
  }

  .tabs-block {
    padding-top: 0.5rem;
    margin-bottom: 0px !important;
  }

  span.tab-head-name {
    display: flex;
    align-self: stretch;
    font-family: "Staatliches";
    
  }

  .tab-content {
    overflow-y: auto;
    padding-top: 2rem;
    padding-bottom: 2rem;
    padding-right: 3rem;
    padding-left: 3rem;
  }

  div.tab-wrapper {
    display: flex;
    align-self: stretch;
  }

  /*
  div.b-tabs > nav.tabs > ul > li > a {
    border-radius: 0px !important;
  }
  */

  section.tab-content {
    overflow-y: auto;
    padding: 0px !important;
  }

  ::-webkit-scrollbar {
    width: 0.5rem;
    height: 0.5rem;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 0px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 0px;
    background-color: #EEE; /* #475669 */
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: #BBB; /*#475669; */
  }
  ::-webkit-scrollbar-thumb:active {
    background-color: #475669; /*#475669; */
  }

  * {
    font-family: 'Abel', sans-serif;
  }

  @font-face {
    font-family: "Ubuntu Mono";
    src:
      url("/static/fonts/UbuntuMono-R.ttf") format("truetype");
      /* Add other formats as you see fit */
  }

  @font-face {
    font-family: "Inconsolata";
    src:
      url("/static/fonts/Inconsolata-Regular.ttf") format("truetype");
      /* Add other formats as you see fit */
  }

  @font-face {
    font-family: "Abel";
    src:
      url("/static/fonts/Abel-Regular.ttf") format("truetype");
      /* Add other formats as you see fit */
  }

  @font-face {
    font-family: "Staatliches";
    src:
      url("/static/fonts/Staatliches-Regular.ttf") format("truetype");
      /* Add other formats as you see fit */
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
</style>
