<template>
  <div id="app">
    <b-tabs 
      position="is-centered" class="block"
      v-on:change="onTabChange"
      type="is-toggle" expanded
    >
      <b-tab-item 
        v-for="tabName in tabNames"
        v-bind:key = "tabName"
        class="main-tab-item" 
        :label="tabName"
      >
      </b-tab-item>
    </b-tabs>

    <!--
    <router-view></router-view>
    -->
  </div>
</template>

<script>
  import taskView from '@/components/tasks'

  export default {
    name: 'browser',

    data: () => ({
      tabNames: ['Programs', 'Rules']
    }),

    components: {
      'TaskView': taskView
    },

    methods: {
      onTabChange: function (tabNo) {
        console.log(`TAB CHANGE NO ${tabNo}`)
      }
    }
  }
</script>

<style lang="scss">
  html {
    overflow-y: auto !important;
  }

  div.b-tabs > nav.tabs > ul > li > a {
    border-radius: 0px !important;
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
</style>
