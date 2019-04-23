<template>
  <div
    id="wrapper"
    v-bind:class="{
      hidden: (state === BLOCK_STATES.unblocked) || !allowVisible
    }"
  >
    <b-loading :is-full-page="true" :active="loading" />

    <div id="content">
      <!--
      <img id="mainImage" src="static/images/icon-border-filled.svg" />
      -->

      <h2 id="title">Blocked</h2>

      <!-- {{ state }} -->

      <template>
        <section class='buttons'>
          <button v-on:click="removeTasks" class="button is-info">Remove programs</button>
          <button
            v-on:click="clickAllow"
            class="button wait-button is-warning"
            :disabled="!(
              (state === BLOCK_STATES.blocked) ||
              (state === BLOCK_STATES.waited)
            )"
          >
            {{ allowText }}
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
  import BLOCK_STATES from './blockStates'
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'
  const { remote } = require('electron')
  const PS = require('ps-node')
  const ioHook = require('iohook')
  // const sys = require('sys')
  const OS = require('os')

  const __LIVE__ = true
  let IOHOOKED = false

  setTimeout(() => {
    console.log(Misc)
  })

  console.log('BLOCS', BLOCK_STATES.unblocked)
  const exec = require('child_process').exec

  export default {
    name: 'blockview',

    data: () => ({
      loading: false,
      drainMultiplier: 1,
      BLOCK_STATES: BLOCK_STATES,
      state: BLOCK_STATES.unblocked,
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
      allowText () {
        if (
          (this.state === BLOCK_STATES.blocked) ||
          (this.state === BLOCK_STATES.waiting)
        ) {
          return 'Wait a while'
        } else if (
          (this.state === BLOCK_STATES.waited) ||
          (this.state === BLOCK_STATES.allowing)
        ) {
          return 'Gimme a while'
        } else {
          return 'Meh'
        }
      },

      progress () {
        const progress = this.timeWaited / this.maxWait
        return Math.min(Math.max(progress, 0), 1)
      }
    },

    methods: {
      clickAllow () {
        this.lastUpdate = Misc.getTimePassed()
        if (this.state === BLOCK_STATES.blocked) {
          this.state = BLOCK_STATES.waiting
          this.lastUpdate = Misc.getTimePassed()
        } else if (this.state === BLOCK_STATES.waited) {
          this.state = BLOCK_STATES.allowing
          this.lastUpdate = Misc.getTimePassed()
        } else {
          throw new Error(`INVALID STATE ${this.state}`)
        }
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
      console.log('BLOCKERVIEW INITIALISED')

      if (!IOHOOKED) {
        IOHOOKED = true
        ioHook.on('keydown', event => {
          if (!(
            (self.state === BLOCK_STATES.unblocked) ||
            (self.state === BLOCK_STATES.allowing)
          )) {
            const platform = OS.platform()

            if (__LIVE__ === false) {
              console.log('LOCK')
              return true
            } else if (platform === 'win32') {
              exec('rundll32.exe user32.dll,LockWorkStation')
            } else {
              exec('gnome-screensaver-command --lock')
            }
          }

          // console.log(event)
        })

        ioHook.start()
      }
    },

    mounted () {
      const window = remote.getCurrentWindow()
      const self = this
      let fullscreen = false;

      (async () => {
        while (!this.isDestroyed) {
          [self.maxWait, self.blockedTasks] = (
            await self.$store.dispatch('getBlockedTasks')
          )

          if (self.blockedTasks.length === 0) {
            self.state = BLOCK_STATES.unblocked
          }

          if (self.state === BLOCK_STATES.unblocked) {
            fullscreen = false
            window.setAlwaysOnTop(false)
            window.setFullScreen(false)
            self.drainMultiplier = 1
            self.timeWaited = 0

            self.lastUpdate = -1

            if (self.blockedTasks.length > 0) {
              self.state = BLOCK_STATES.blocked
            }
          } else if (self.state === BLOCK_STATES.allowing) {
            fullscreen = false
            window.setAlwaysOnTop(false)
            window.setFullScreen(false)
          } else {
            // console.log('FILLESCREEN')
            if (fullscreen === false) {
              fullscreen = true
              window.minimize()
              window.focus()
            }

            if (__LIVE__) {
              window.setAlwaysOnTop(true)
              window.setFullScreen(true)
              window.webContents.focus()
              window.focus()
            }
          }

          if (self.lastUpdate !== -1) {
            const wait = Misc.getTimePassed() - self.lastUpdate
            self.lastUpdate = Misc.getTimePassed()

            if (self.state === BLOCK_STATES.waiting) {
              self.timeWaited += wait
              // console.log('WAIT', self.state)
              if (self.timeWaited >= self.maxWait) {
                self.lastUpdate = -1
                self.state = BLOCK_STATES.waited
              }
            } else if (self.state === BLOCK_STATES.allowing) {
              self.timeWaited -= wait * self.drainMultiplier
              if (self.timeWaited < 0) {
                self.lastUpdate = -1
                self.state = BLOCK_STATES.blocked
                self.drainMultiplier *= 1.2
              }
            }
          }

          this.$emit('on-state', self.state)
          this.$emit('block-progress', self.progress)
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
