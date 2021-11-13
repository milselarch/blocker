<template>
  <div
    id="wrapper"
    v-bind:class="{
      hidden: (
        (state === BLOCK_STATES.unblocked) ||
        (state === BLOCK_STATES.allowing)
      ) || !allowVisible
    }"
  >
    <b-loading :is-full-page="true" :active="loading" />

    <div id="content">
      <!--
      <img id="mainImage" src="static/images/icon-border-filled.svg" />
      -->

      <h2 id="title">Blocked</h2>
      <h2 
        id="auto-close"
        v-bind:class="{
          invisible: (
            (displayCount === 1) | !killMultiMonitor
          )
        }"
      > 
        ━━━━&nbsp;&nbsp;
        AUTO CLOSING IN {{monitorTimeLeft}}
        &nbsp;&nbsp;━━━━
      </h2> 

      <template>
        <section class='buttons'>
          <button
            v-on:click="startPomodoro"
            class="button is-info"
            :disabled="!alarmOn && (!pomodoroPrompt || !pomodoroTitleValid)"
            v-show="blockList.indexOf(true) === 2"
          >
            {{ pomodoroButtonText }}
          </button>
          
          <button
            v-on:click="removeTasks"
            class="button is-info"
            :disabled="blockedTasks.length === 0"
            v-show="blockedTasks.length > 0"
          >
            Remove programs
          </button>

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

      <div 
        id="blockedPomodoros"
        v-show="blockList.indexOf(true) === 2"
      >
        <p class="pomodoro-reason" v-if="!pomodoroPrompt">
          {{ pomodoroTitle }}
        </p>

        <textarea
          name="" id="pomodoro-title" cols="30" rows="2"
          v-if="pomodoroPrompt"
          v-model="pomodoroTitle"
          :disabled="alarmOn"
          :placeholder="pomodoroPlaceholder"
        >
        </textarea>

        <br/>
        <button 
          id="remove-optins" @click="removeOptins" type="is-info"
          v-show="hasOptinPomodoros && pomodoroPrompt"
          :disabled="alarmOn" class="button is-info"
        >
          Remove Opt-in Pomodoros
        </button>

        <b-table
          class="block-table" :data="blockingPomodoros"
          v-if="!pomodoroPrompt"
        >
          <template slot-scope="props" class="table-row">  
            <b-table-column
              field="duration" label="Duration"
              class="table-column column-name"
              numeric
            >
              {{ props.row.duration }}m
            </b-table-column>

            <b-table-column
              field="shortBreak" label="Short Break"
              class="table-column pomodoro-break"
              numeric
            >
              {{ getTimeLeft(
                props.row.duration, props.row.shortBreak,
                false, dateNow
              )}}
            </b-table-column>

            <b-table-column
              field="longBreak" label="Long Break" :visible="true"
              class="table-column"
              numeric
            >
              {{ getTimeLeft(
                props.row.duration, props.row.longBreak,
                true, dateNow
              )}}
            </b-table-column>
          </template>
        </b-table>
      </div>

      <div 
        id="blockedTimes"
        v-show="blockList.indexOf(true) === 1"
      >
       <b-table class="block-table" :data="timeBlocks">
          <template slot-scope="props" class="table-row">  
            <b-table-column
              field="startTime" label="Start Time"
              class="table-column column-name"
            >
              {{ props.row.getMomentStart().format('hh:mm A') }}
            </b-table-column>

            <b-table-column
              field="endTime" label="End Time"
              class="table-column"
            >
              {{ props.row.getMomentEnd().format('hh:mm A') }}
            </b-table-column>

            <b-table-column
              field="startWait" label="Start Wait" :visible="true"
              class="table-column"
              numeric
            >
              {{ parseInt(timeSinceStart()) }} / {{ Number(props.row.startWait) }}s
            </b-table-column>
          </template>
        </b-table>
      </div>
            
      <div 
        id="blockedTasks"
        v-show="blockList.indexOf(true) === 0"
      >
        <b-table class="block-table" :data="blockedTasks">
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
  import assert from '@/assert.js'
  import si from 'systeminformation'
  import { setTimeout } from 'timers'
  import { Toast } from 'buefy/dist/components/toast'
  import { Howl } from 'howler'

  const { remote } = require('electron')
  const PS = require('ps-node')
  // const path = require('path')
  const ioHook = require('iohook')
  // const sys = require('sys')
  const OS = require('os')
  
  try {
    console.log('test')
  } catch (e) {
    console.log('nop')
  }

  console.log(si)

  const __LIVE__ = process.env.NODE_ENV === 'production'
  let IOHOOKED = false

  const WAIT_DISCOUNT = (
    process.env.NODE_ENV === 'development' ? 10 : 1
  )

  const window = remote.getCurrentWindow()
  window.setMenuBarVisibility(true)

  setTimeout(() => {
    console.log(Misc)
  })

  console.log('BLOCS', BLOCK_STATES.unblocked)
  // const exec = require('child_process').exec

  export default {
    name: 'blockview',

    data: () => ({
      loading: false,
      audioStart: null,
      drainMultiplier: 1,
      BLOCK_STATES: BLOCK_STATES,
      state: BLOCK_STATES.unblocked,
      timeWaited: 0,
      lastUpdate: -1,
      maxWait: 1,
      isDestroyed: false,
      blockFace: 'icon-border.svg',

      blockStart: -1,
      multiMonitorStart: -1,
      displayCount: 1,
      monitorTimeLeft: -1,
      monitorWait: 10,

      dateNow: new Date(),
      isTimeBlocked: false,
      timeBlocks: [],
      pomodoroPrompt: true,
      alarmOn: false,
      pomodoroTitle: '',
      blockingPomodoros: [],
      blockedTasks: [],
      excusedPids: []
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    computed: {
      pomodoroTitleValid () {
        const wordCount = Misc.countWords(this.pomodoroTitle)
        return wordCount >= 10
      },

      hasOptinPomodoros () {
        return this.$store.getters.hasOptinPomodoros
      },

      killMultiMonitor () {
        return this.$store.getters.killMultiMonitor
      },

      pomodoroButtonText () {
        if (this.alarmOn) {
          return 'Stop alarm'
        }

        if (this.pomodoroPrompt) {
          if (this.pomodoroTitleValid) {
            return 'Start pomodoro'
          } else {
            return 'Pomodoro needs 10-word explanation'
          }
        } else {
          return 'Taking a break'
        }
      },

      pomodoroPlaceholder () {
        const pomodoroPlaceholder = this.$store.getters.pomodoroTitle
        // console.log('PTITLE', pomodoroPlaceholder)
        if (String.trim(pomodoroPlaceholder) === '') {
          return 'Type what this pomodoro is for'
        }

        return pomodoroPlaceholder
      },

      blockList () {
        const self = this
        const blockList = [
          self.blockedTasks.length > 0,
          self.isTimeBlocked,
          self.blockingPomodoros.length > 0
        ]

        blockList.map(block => {
          assert(typeof block === 'boolean')
        })

        return blockList
      },

      blockCount () {
        return this.blockList.filter((value) => {
          return value === true
        }).length
      },

      needsBlocking () {
        return this.blockList.includes(true)
      },

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
      runMonitorLoop () {
        const self = this

        return (async () => {
          while (!self.isDestroyed) {
            if (!self.killMultiMonitor | (self.displayCount === 1)) {
              self.monitorTimeLeft = -1
            } else {
              const timePassed = self.multiMonitorTimePassed()
              // console.log('MM PASSED', timePassed)
              let timeLeft = self.monitorWait - timePassed
              timeLeft = Math.ceil(Math.max(timeLeft, 0))
              self.monitorTimeLeft = timeLeft
            }

            await Misc.sleepAsync(250)
          }
        })()
      },

      removeOptins () {
        this.$store.commit('removeOptinPomodoros')
      },

      multiMonitorTimePassed () {
        const self = this
        const timeNow = Misc.getTimePassed()

        if (self.displayCount <= 1) {
          return -1
        }

        const start = Math.max(
          self.blockStart, self.multiMonitorStart
        )

        if (start === -1) {
          return -1
        } else {
          const duration = timeNow - start
          return duration
        }
      },

      getDisplayCount () {
        return new Promise((resolve, reject) => {
          si.graphics((data) => {
            resolve(data.displays.length)
          })
        })
      },

      getTimeLeft (
        pomodoroDurationMins, breakDurationMins,
        isLongbreak, dateNow
      ) {
        // return 'asdasd'
        const pomodoroDuration = pomodoroDurationMins * 60
        const breakDuration = breakDurationMins * 60
        const timeNow = dateNow.getTime()

        if (dateNow === undefined) { dateNow = new Date() }
        const pomodoroNo = this.$store.getters.pomodoroNo
        if (isLongbreak !== (pomodoroNo === 3)) {
          return `${breakDurationMins}m`
        }

        const pomodoroStart = this.$store.getters.pomodoroStart
        const breakStart = pomodoroStart + pomodoroDuration * 1000
        const secondsLeft = Misc.getSecondsLeft(
          breakStart, breakDuration, timeNow
        )

        const mins = Math.floor(secondsLeft / 60)
        const secs = secondsLeft % 60
        return `${mins}m${secs}s / ${breakDurationMins}m`
      },

      async startPomodoro () {
        const self = this
        self.loading = true
        await Misc.sleepAsync(300)

        if (self.alarmOn) {
          self.alarmOn = false
        } else if (!self.pomodoroTitleValid) {
          Toast.open({
            message: 'Pomodoro requires 10-word explanation',
            type: 'is-danger'
          })
        } else {
          await self.$store.dispatch(
            'startPomodoro', self.pomodoroTitle
          )
        }

        self.loading = false
      },

      timeSinceStart () {
        return (
          (new Date()).getTime() -
          this.$store.getters.firstOpened
        ) / 1000
      },

      clickAllow () {
        this.lastUpdate = Misc.getTimePassed()
        if (this.state === BLOCK_STATES.blocked) {
          self.setBlockState(BLOCK_STATES.waiting)
          this.lastUpdate = Misc.getTimePassed()
        } else if (this.state === BLOCK_STATES.waited) {
          self.setBlockState(BLOCK_STATES.allowing)
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
      },

      setBlockState (state) {
        const self = this
        Misc.assert(BLOCK_STATES.includes(state))
        self.state = state

        if (state === BLOCK_STATES.blocked) {
          self.blockStart = Misc.getTimePassed()
        } else if (state === BLOCK_STATES.unblocked) {
          self.blockStart = -1
        }
      }
    },

    created () {
      const self = this
      const platform = OS.platform()
      console.log('BLOCKERVIEW INITIALISED')

      const handler = event => {
        if (!self.pomodoroPrompt && !(
          (self.state === BLOCK_STATES.unblocked) ||
          (self.state === BLOCK_STATES.allowing)
        )) {
          if (__LIVE__ === false) {
            // console.log('LOCK')
            return true
          } else if (platform === 'win32') {
            // exec('rundll32.exe user32.dll,LockWorkStation')
          } else {
            // exec('gnome-screensaver-command --lock')
          }
        }

        self.$store.commit('updateLastUsage')
        // console.log('LAST USAGE', event)
      }

      if (!IOHOOKED) {
        IOHOOKED = true
        ioHook.on('keydown', handler)
        ioHook.on('mouseclick', handler)
        ioHook.start()
      }
    },

    mounted () {
      const self = this
      let fullscreen = false;

      (async () => {
        const audio = new Howl({
          src: require('@/assets/sounds/analog-watch-alarm.mp3'),
          autoplay: false,
          loop: true,
          volume: 0.5
        })

        while (!self.isDestroyed) {
          // console.log('POLLING BLOCKIER')
          self.dateNow = new Date()
          const buildUpAllowance = !(
            self.state === BLOCK_STATES.blocked ||
            self.state === BLOCK_STATES.allowing
          )

          const [taskMaxWait, blockedTasks] = (
            await self.$store.dispatch(
              'checkBlockedTasks', buildUpAllowance
            )
          )
          self.blockedTasks = blockedTasks
          const [isTimeBlocked, timeMaxWait, timeBlocks] = (
            await self.$store.dispatch('checkTimeBlocked')
          )
          self.isTimeBlocked = isTimeBlocked
          const [prompt, maxPomodoroWait, blockingPomodoros] = (
            await self.$store.dispatch('checkPomodoroBlocked')
          )

          self.$store.commit('updateLastTime', true)
          self.blockingPomodoros = blockingPomodoros

          if (prompt !== self.pomodoroPrompt) {
            self.pomodoroPrompt = prompt

            if (prompt === true) {
              self.pomodoroTitle = ''
              if (blockingPomodoros.length > 0) {
                console.log('PLAY-NOW-POMODO', blockingPomodoros)
                self.alarmOn = true
                window.webContents.focus()
                window.focus()
              }
            } else {
              window.webContents.focus()
              window.focus()
              self.alarmOn = false
            }
          }

          if (self.alarmOn) {
            const scale = 0.5

            if (!audio.playing()) {
              self.audioStart = Misc.getTimePassed()
              audio.volume(scale)
              audio.play()
            } else {
              const timeNow = Misc.getTimePassed()
              const timePassed = Math.max(timeNow - self.audioStart, 0)
              const progress = Math.min(1, 8 / timePassed)
              // console.log('SCALE', progress, timePassed)
              audio.volume(scale * progress)
            }
          } else {
            audio.pause()
          }

          self.timeBlocks = timeBlocks
          self.maxWait = Math.max(
            taskMaxWait, timeMaxWait, maxPomodoroWait
          )

          if (!self.needsBlocking) {
            self.setBlockState(BLOCK_STATES.unblocked)
          }

          if (self.state === BLOCK_STATES.unblocked) {
            fullscreen = false
            window.setAlwaysOnTop(false)
            window.setFullScreen(false)
            self.drainMultiplier = 1
            self.timeWaited = 0

            self.lastUpdate = -1

            if (self.needsBlocking) {
              self.setBlockState(BLOCK_STATES.blocked)
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
              self.timeWaited += wait * WAIT_DISCOUNT
              // console.log('WAIT', self.state)
              if (self.timeWaited >= self.maxWait) {
                self.lastUpdate = -1
                self.setBlockState(BLOCK_STATES.waited)
              }
            } else if (self.state === BLOCK_STATES.allowing) {
              self.timeWaited -= wait * self.drainMultiplier
              if (self.timeWaited < 0) {
                self.lastUpdate = -1
                self.setBlockState(BLOCK_STATES.blocked)
                self.drainMultiplier *= 1.2
              }
            }
          }

          const displays = await self.getDisplayCount()

          if (displays !== self.displayCount) {
            self.displayCount = displays

            if (displays === 1) {
              self.multiMonitorStart = -1
            } else {
              self.multiMonitorStart = Misc.getTimePassed()
            }
          }

          if (self.monitorTimeLeft === 0) {
            await self.removeTasks()
          }

          this.$emit('on-state', self.state)
          this.$emit('block-progress', self.progress)
          window.setMenuBarVisibility(true)
          await Misc.sleepAsync(250)
        }
      })()

      self.runMonitorLoop()
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

.block-table {
  width: 20rem;
  margin-left: auto;
  margin-right: auto;
  padding-top: 1rem;
}

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

  & div#blockedPomodoros {
    & p.pomodoro-reason {
      margin-left: auto;
      margin-right: auto;
    }

    & .pomodoro-reason {
      max-width: 40rem;
      word-break: break-all;
    }

    & textarea#pomodoro-title {
      outline: none;
      border: 2px solid #dcdfe6;
      padding: 1rem;
      font-family: 'Abel';
      font-size: 1.2rem;
      resize: none;
      width: 30rem;
    }

    & button#remove-optins {
      font-family: "Staatliches";
      margin-left: auto;
      margin-right: auto;
      width: calc(100% - 0.5rem);
      display: flex;
      /* padding-left: 3rem; */
    }
  }

  & section.buttons {
    & button {
      font-family: "Staatliches";
      font-size: 1.25rem;
    }
  }

  & h2#title {
    font-family: "Staatliches";
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 5rem;
    flex-shrink: 0;
  }

  & h2#auto-close {
    font-family: "Staatliches";
    margin-bottom: 2rem;
    font-size: 2rem;
    flex-shrink: 0;
    overflow: hidden;
    white-space: nowrap;
    width: fit-content;
    height: fit-content;

    &.invisible {
      display: none
    }
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
