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
          field="windowTitle" label="Name"
          class="table-column column-name"
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
          field="CPU" label="CPU" :visible="true"
          class="table-column"
          sortable numeric
        >
          {{ Number(props.row.CPU) }}
        </b-table-column>

        <b-table-column
          label="Block"
          class="table-column"
        >
          <button
            class="button is-danger block-button"
            v-on:click="makeNewRule(props.row)"
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
  import Misc from '@/misc.js'
  import Rule from './rules/Rule.js'
  import { setTimeout } from 'timers'

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
          await Misc.sleepAsync(500)
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
        // this.selected = []
      },
      makeNewRule (task) {
        var newRule = new Rule()
        this.$store.commit('setNewRule', newRule)
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

  &.column-name {
    width: 40vw;
    max-width: 40vw;
  }
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
