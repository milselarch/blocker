<template>
  <div
    id="wrapper"
    v-bind:class="{
      hidden: (blockedTasks.length === 0) || !allowVisible
    }"
  >
    <b-loading :is-full-page="true" :active="loading" />

    <div id="content">
      <!--
      <img id="mainImage" src="static/images/icon-border-filled.svg" />
      -->

      <h2 id="title">Blocked</h2>
      <template>
        <section class='buttons'>
          <button v-on:click="removeTasks" class="button is-info">Remove programs</button>
          <button
            :disabled="lastUpdate !== -1"
            v-on:click="giveAllowance"
            class="button is-warning"
          >
            Gimme 5 minutes
          </button>
        </section>
      </template>
            
      <div id="blockedTasks">
        <b-table :data="blockedTasks">
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
              numeric
            >
              {{ Number(props.row.CPU) }}
            </b-table-column>
          </template>
        </b-table>
      </div>
    </div>

  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'
  const { remote } = require('electron')
  const PS = require('ps-node')
  const ioHook = require('iohook')
  // const sys = require('sys')
  const OS = require('os')

  const __LIVE__ = false

  setTimeout(() => {
    console.log(Misc)
  })

  const exec = require('child_process').exec

  export default {
    name: 'blockview',

    data: () => ({
      loading: false,
      drainMultiplier: 1,
      multiplier: 1,
      timeWaited: 0,
      lastUpdate: -1,
      maxWait: 1,
      isDestroyed: false,
      blockFace: 'icon-border.svg',
      blockedTasks: [],
      excusedPids: []
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    computed: {
      progress () {
        const progress = this.timeWaited / this.maxWait
        return Math.min(Math.max(progress, 0), 1)
      }
    },

    methods: {
      giveAllowance () {
        this.lastUpdate = Misc.getTimePassed()
      },

      async removeTasks () {
        const self = this
        self.loading = true
        console.log('REMOVING', self.blockedTasks)

        for (let k = 0; k < self.blockedTasks.length; k++) {
          const task = self.blockedTasks[k]
          console.log('KILLING', task, task.pid)

          try {
            await PS.kill(task.pid)
          } catch (err) {
            console.log('KILL FAILED', err)
          }
        }

        await self.$store.dispatch('updater')
        self.loading = false
      }
    },

    created () {
      const self = this
      ioHook.on('keydown', event => {
        if (self.multiplier > 0 && self.blockedTasks.length > 0) {
          const platform = OS.platform()
          if (platform === 'win32') {
            exec('rundll32.exe user32.dll,LockWorkStation')
          } else {
            exec('gnome-screensaver-command --lock')
          }
        }

        // console.log(event)
      })

      if (__LIVE__) {
        ioHook.start()
      }
    },

    mounted () {
      const window = remote.getCurrentWindow()
      const self = this;

      (async () => {
        while (true) {
          [self.maxWait, self.blockedTasks] = (
            await self.$store.dispatch('getBlockedTasks')
          )

          if (self.blockedTasks.length === 0) {
            window.setFullScreen(false)
            self.drainMultiplier = 1
            self.timeWaited = 0
            self.multiplier = 1
            self.lastUpdate = -1
          } else {
            // console.log('FILLESCREEN')
            if (__LIVE__) {
              window.setFullScreen(true)
              window.webContents.focus()
              window.focus()
            }
          }

          if (self.lastUpdate !== -1) {
            let multiplier = self.multiplier
            if (multiplier < 0) {
              multiplier *= self.drainMultiplier
            }

            self.timeWaited += (
              Misc.getTimePassed() - self.lastUpdate
            ) * multiplier
            self.lastUpdate = Misc.getTimePassed()

            if (
              self.timeWaited < 0 ||
              self.timeWaited >= self.maxWait
            ) {
              self.drainMultiplier *= 1.2
              self.multiplier *= -1
              self.lastUpdate = -1
            }
          }
          await Misc.sleepAsync(250)
        }
      })()
    },

    props: {
      allowVisible: true
    },

    components: {
    }
  }
</script>

<style lang="scss" scoped>
@import "~bulma";
@import "~buefy/src/scss/buefy";
@import "@/assets/scss/vars.scss";

div#wrapper {
  margin: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: white;

  position: absolute;
  z-index: 200;
  background-color: white;
  opacity: 0.95;

  & section.buttons {
    & button {
      font-family: "Staatliches";
      font-size: 1.25rem;
    }
  }

  & h2#title {
    font-family: "Staatliches";
    margin-top: 2rem;
    font-size: 5rem;
  }

  &.hidden {
    display: none !important
  }

  & div#content {
    height: 100%;
    width: fit-content;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;

    & div#blockedTasks {
      margin-bottom: 2rem;
    }
  }
}

img#mainImage {
  width: 20rem;
  height: 20rem;
  padding: 2rem;
  flex-shrink: 1;
}
</style>
