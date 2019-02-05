<template>
  <div id="wrapper">
   <p>{{ }}</p>

    <b-table 
      :data="tasks"
      :selected="selected"
      :loading="tasks.length === 0"
      default-sort="CPU"
      default-sort-direction="desc"
      class="tasks-table"
      @select="onRowSelect"
    >
      <template slot-scope="props" class="table-row">
        <b-table-column
          field="CPU" label="CPU" :visible="false"
          class="table-column"
          sortable numeric
        >
          {{ Number(props.row.CPU) }}
        </b-table-column>
        
        <b-table-column
          field="windowTitle" label="Name"
          class="table-column"
        >
          {{ props.row.name }}
        </b-table-column>

        <b-table-column
          field="imageName" label="Application"
          class="table-column"
        >
          {{ props.row.program }}
        </b-table-column>

        <b-table-column
          label="Block"
          class="table-column"
        >
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
      isDestroyed: false,
      selected: null,
      tasks: [],
      test: false
    }),

    mounted () {
      const self = this
      console.log('STATEC', this.$store)
      console.log('ON CREATE TASKS', `${self.tasks}`)
      setTimeout(async () => {
        while (!self.isDestroyed) {
          // console.log('NEW TASKS', self.tasks)
          // console.log('m', self.$store.getters.tasks)
          self.tasks = self.$store.getters.tasks
          await self.$store.dispatch('updater')
          await misc.sleepAsync(500)
        }
      }, 0)
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      onRowSelect () {
        console.log('SELECTED')
        this.selected = []
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

td.table-column {
  vertical-align: middle;
}

button.block-button {
  background-color: transparent;
  border-radius: 0px;
  color: #DDD;

  &:focus {
    color: #DDD;
  }

  &:hover {
    background-color: $danger;
    color: white;
    /* #fe304a #f64a62*/
  }
}

</style>
