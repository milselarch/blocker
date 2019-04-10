<template>
  <div id="app">
    <BlockView
      v-bind:class="{ disabled: blocked }"
      id="blocked"
    />

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
</template>

<script>
  import BlockView from '@/components/BlockView'
  const TABS = {
    Programs: {icon: 'window-restore'},
    Rules: {icon: 'shield-alt'}
  }

  const TAB_NAMES = Object.keys(TABS)

  export default {
    name: 'browser',

    data: () => ({
      blocked: false,
      tabNames: TAB_NAMES,
      tabViewName: TAB_NAMES[0],
      tabIndex: 0,
      tabs: TABS
    }),

    async created () {
      // await this.$store.dispatch('reset')
    },

    methods: {
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
  html {
    overflow-y: auto !important;
  }

  div#app {
    display: flex;
    flex-direction: column;
    height: -webkit-fill-available;

    & #blocked {
      width: 100vw;
      height: 100vh;
      position: absolute;
      background-color: white;
      opacity: 0.9;
      z-index: 100;
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
</style>
