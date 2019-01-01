<template>
  <div id="wrapper">
    <table>
        <tr
          class="task"
          v-for="(task, index) in tasks"
          :key="index"
        >
            <tr>{{ task.windowTitle }}</th>
            <tr>{{ task.imageName }}</th>
        </tr>

    </table>
  </div>
</template>

<script>
  import Misc from '../../misc.js'
  const misc = new Misc()

  const tasklist = require('tasklist')

  export default {
    name: 'taskview',
    components: { },

    data: () => ({
      isDestroyed: false,
      tasks: []
    }),

    created () {
      const self = this

      setTimeout(async () => {
        while (!this.isDestroyed) {
          self.tasks = (
            await tasklist({verbose: true})
          ).filter(task => {
            return task.windowTitle !== 'N/A'
          })

          misc.sleepAsync(1000)
        }
      }, 0)
    },

    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      destroyed: function () {
        this.isDestroyed = true
      }
    }
  }
</script>

<style scoped>
tr.task, tr.task * {
  font-family: "Abel"
}
</style>
