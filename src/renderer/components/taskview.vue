<template>
  <div id="wrapper">
    <font-awesome-icon icon="home">
    </font-awesome-icon>
    <!-- <p> {{ tasks }} </p> -->
    <p> {{ selected }} </p>

    <b-table :data="tasks" :selected.sync="selected">
      <template slot-scope="props">
        <b-table-column field="windowTitle" label="Name">
            {{ props.row.windowTitle }}
        </b-table-column>

        <b-table-column field="imageName" label="Application">
            {{ props.row.imageName }}
        </b-table-column>

        <b-table-column label="">
          <button 
            class="button is-danger block-button"
          >
            <!-- <p>Block&nbsp;</p> -->
            <font-awesome-icon icon="ban" class="icon alt">
            </font-awesome-icon>
          </button>
        </b-table-column>
      </template>
    </b-table>

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
      selected: null,
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
            if (task === undefined) { return true }
            return task.windowTitle !== 'N/A'
          }
          )

          misc.sleepAsync(0)
        }
      }, 0)
    },

    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      destroyed () {
        this.isDestroyed = true
      }
    }
  }
</script>

<style scoped>
tr.task, tr.task * {
  font-family: "Abel"
}

th, th * {
  font-family: "Abel"
}
</style>
