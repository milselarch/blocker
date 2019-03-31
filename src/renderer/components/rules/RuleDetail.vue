<template>
  <div>
    <codemirror v-model="code" :options="cmOptions" />
  </div>
</template>

<script>
  import { codemirror } from 'vue-codemirror'
  // require styles
  import 'codemirror/lib/codemirror.css'
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-detail',

    data: () => ({
      code: 'hihi',
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: 'text/javascript',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
    },

    components: {
      codemirror
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

</style>
