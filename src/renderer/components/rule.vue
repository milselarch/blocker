<template>
  <div class="rule">
    rtest
  </div>
</template>

<script>
  export default {
    name: 'rule',
    components: { },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
</style>
