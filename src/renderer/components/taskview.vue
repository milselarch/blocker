<template>
  <div id="wrapper">
   <p>{{ }}</p>

    <b-table 
      :data="tasks"
      :selected.sync="selected"
      :loading="tasks.length === 0"
      class="tasks-table"
    >
      <template slot-scope="props" class="table-row">
        <b-table-column field="windowTitle" label="Name">
            {{ props.row.name }}
        </b-table-column>

        <b-table-column field="imageName" label="Application">
            {{ props.row.program }}
        </b-table-column>

        <b-table-column label="Block">
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
  import { setTimeout } from 'timers'
  const misc = new Misc()

  export default {
    name: 'taskview',
    components: { },

    data: () => ({
      selected: null,
      isDestroyed: false,
      tasks: [],
      test: false
    }),

    mounted () {
      const self = this
      console.log('STATEC', this.$store)
      console.log('ON CREATE TASKS', `${self.tasks}`)
      setTimeout(async () => {
        while (!self.isDestroyed) {
          console.log('NEW TASKS', self.tasks)
          console.log('m', self.$store.getters.tasks)
          const t = await self.$store.dispatch('updater')
          console.log('T', t)
          self.tasks = self.$store.getters.tasks
          self.test = true

          await misc.sleepAsync(3000)
        }
      }, 0)
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

tr.task, tr.task * {
  font-family: "Abel"
}

th, th * {
  font-family: "Abel"
}

div.tasks-table {
  min-height: 10rem;
  /* background-color: red; */
}

button.block-button {
  background-color: transparent;
  border-radius: 0px;
  color: #DDD;

  &:hover {
    background-color: $danger;
    /* #fe304a #f64a62*/
  }
}

</style>
