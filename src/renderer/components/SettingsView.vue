<template>
  <div id="settings-view">
    <div id="holder">
      <b-field>
        <b-input
          placeholder="Protect rules with password"
          type="password"
          v-model="password"
          password-reveal>
        ></b-input>
      </b-field>

      <b-button
        class="pw-button" type="is-danger"
        :disabled='set || (password.length === 0)' expanded
        v-bind:class="{visible: !set}"
        v-on:click="setPassword()"
      >
        SET PASSWORD
      </b-button>

      <b-button
        class="pw-button" type="is-primary"
        v-bind:class="{visible: set}"
        v-on:click="unsetPassword()"
        expanded
      >
        UNSET PASSWORD
      </b-button>

      <p id="hash">{{ hash }}</p>

      <div id="settings-box">
        <b-field class="audio-controls">
          <b-button 
            class='audio-button' type="is-primary"
            @click="toggleAudioPlayer()"
          >
            <!-- volume-up -->
            <font-awesome-icon
              :icon="'volume-mute'"
              class="volume-down-icon large icon alt"
              v-if="!playAudio"
            ></font-awesome-icon>
            <font-awesome-icon
              :icon="'volume-down'"
              class="volume-down-icon large icon alt"
              v-if="playAudio"
            ></font-awesome-icon>
          </b-button>

          <b-slider 
            v-model="audioLevel" :min="0" :max="100"
            @change="onAudioLevelUpdate"
            @dragging="onAudioLevelUpdate"
          ></b-slider>
        </b-field>

        <b-checkbox 
          v-model="killMultiMonitor"
          :disabled="isPasswordSet"
        >
          Auto close when there's multiple monitors
        </b-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import { Howl } from 'howler'

  export default {
    name: 'settingsview',

    data: () => ({
      password: '',
      killMultiMonitor: false,
      audioLevel: 0,
      playAudio: false
    }),

    computed: {
      hash () {
        const passhash = this.$store.getters.passhash
        if (passhash === false) {
          return 'Version 0.1.1'
        } else {
          return passhash
        }
      },

      set () {
        const passhash = this.$store.getters.passhash
        return !(passhash === false)
      },

      isValidPassword () {
        const passhash = this.$store.getters.passhash
        return passhash === Misc.makeHash(this.password)
      },

      isPasswordSet () {
        return this.$store.getters.hasPassword
      }
    },

    created () {
      const self = this
      this.audioLevel = this.$store.getters.audioLevel
      const kill = this.$store.getters.killMultiMonitor
      this.killMultiMonitor = kill
      console.log('LOADED', kill)

      const audio = new Howl({
        src: require('@/assets/sounds/analog-watch-alarm.mp3'),
        autoplay: false,
        loop: true,
        volume: 0
      })

      audio.play();

      (async () => {
        while (true) {
          const scale = this.$store.getters.audioLevel / 100
          // console.log('VOL', scale)

          if (self.playAudio) {
            audio.volume(scale)
          } else {
            audio.volume(0)
          }

          await Misc.sleepAsync(10)
        }
      })()
    },

    methods: {
      toggleAudioPlayer () {
        this.playAudio = !this.playAudio
      },

      setPassword () {
        this.$store.dispatch('setPassword', this.password)
        this.password = ''
      },

      unsetPassword () {
        if (this.isValidPassword) {
          this.$store.dispatch('unsetPassword', this.password)
          this.password = ''
        } else {
          this.$buefy.toast.open({
            duration: 500,
            message: `Password is incorrect`,
            position: 'is-bottom',
            type: 'is-warning'
          })
        }
      },

      onAudioLevelUpdate (newAudioLevel) {
        // console.log('UPDATE', newAudioLevel)
        this.$store.commit('setAudioLevel', newAudioLevel)
      }
    },

    watch: {
      killMultiMonitor: function (newKill) {
        const kill = this.$store.getters.kill_multi_monitor

        if (kill !== newKill) {
          this.$store.commit('setMultipleMonitorKill', newKill)
          console.log('SET', newKill)
        }
      }
    },

    components: {}
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

div#holder {
  display: flex;
  flex-direction: column;
  width: 50%;
  margin: auto;

  & > .pw-button {
    font-family: 'Inconsolata';
    font-size: 1.2rem;
    font-weight: 700;
    margin-top: 0rem;

    &:not(.visible) {
      display: none;
    }
  }

  & > p {
    text-align: center;
    margin-top: 0.5rem;
    font-family: 'Inconsolata';
    font-weight: 700;
    word-break: break-all;
  }

  & > div#settings-box {
    margin-top: 2rem;

    & > .audio-controls {
      & > .audio-button {
        margin-right: 0.8rem;
      }
    }
  }
}
</style>
