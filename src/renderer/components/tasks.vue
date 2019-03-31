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
</style>
