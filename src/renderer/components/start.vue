<template>
  <div id="wrapper">
    <taskview></taskview>
    <div id="rulesbox">
      <rule
        v-for="(ruleData, index) in rules"
        :ruleData="ruleData"
        :key="index"
        class="ruleDiv"
      ></rule>
    </div>
  </div>
</template>

<script>
  import rule from './rule.vue'
  import taskview from './taskview.vue'

  export default {
    name: 'start',
    components: { rule, taskview },
    data: () => ({
      rules: [[1, 2]]
    }),
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
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

  body { font-family: 'Staatliches', sans-serif; }
</style>
