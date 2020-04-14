<template>
  <div
    class="names"
    v-bind:class="{
      active: ruledata === activerule
    }"
  >
    <div
      id="cam-view"
      v-bind:class="{visible: cameraOn}"
    >
      <video id="camera" ref="camera" autoplay></video>
      <b-button 
        class='go-back' type="is-primary"
        v-on:click="backPress()"
      >
        ✖️
      </b-button>
    </div>

    <div
      id="obscurer"
      v-bind:class="{visible: cameraOn}"
    ></div>

    <EditInline
      v-model="ruledata.name"
      :border="false"
      readonly='nocursor'
      :mode="ruledata.nameType"
    />

    <div class="diode" v-on:click="doNothing()">
      <div class="laser"></div>
    </div>

    <EditInline 
      v-model="ruledata.programName"
      :border="false"
      readonly='nocursor'
      :mode="ruledata.programType"
    />
  </div>
</template>

<script>
  import Misc from '@/misc.js'
  import EditInline from './EditInline'
  import { setTimeout } from 'timers'
  import RemoteRule from './RemoteRule'

  const Instascan = require('instascan')
  let CAMERA

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'remote-rule-card',

    data: () => ({
      cameraOn: false,
      scanner: null
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      backPress () {
        this.$refs.camera.srcObject = null
        this.cameraOn = false
        CAMERA.stop()
      },

      doNothing () {
        CAMERA = null
      },

      turnOnCamera () {
        // console.log('CAMERA ON', this.$refs.camera)
        const self = this
        self.cameraOn = true

        Instascan.Camera.getCameras().then((cameras) => {
          if (cameras.length > 0) {
            CAMERA = cameras[0]
            self.scanner.start(cameras[0])
          }
        })
      }
    },

    props: {
      ruledata: new RemoteRule({}),
      activerule: null
    },

    components: {
      EditInline
    },

    mounted () {
      const self = this
      self.scanner = new Instascan.Scanner({
        video: self.$refs.camera
      })

      self.scanner.addListener('scan', (content) => {
        console.log('CAMERA CONTEN', content)
      })
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

div#obscurer {
  width: auto;
  height: auto;
  opacity: 0.8;
  z-index: 100;
  background-color: white;

  &:not(.visible) {
    display: none;
  }
}

div#cam-view {
  width: auto;
  height: auto;
  opacity: 1;
  z-index: 101;
  
  & video#camera {
    transform: scaleX(1);
  }

  &:not(.visible) {
    display: none;
  }

  & > .go-back {
    height: 100%;
    font-weight: 700;
    font-family: 'Inconsolata';
  }
}

.laser {
  width: 100%;
  background-color: tomato;
  height: 2px;
  box-shadow: 0 0 8px red;
  animation: scanning 1s infinite;
  z-index: 20;
  cursor: pointer;
}

@keyframes scanning {
  25% {
    transform: translateY(-1px);
  }
  75% {
    transform: translateY(1px);
  }
}

.diode {
  animation: none;
  cursor: pointer;
  animation: none;
  z-index: 20;
  height: 6px;
  flex-direction: column;
  justify-content: space-around;
  overflow: visible;
  display: flex;

  &:hover {
    animation: beam .03s infinite;
  }
  &.active > .laser {
    background-color: red;
  }
}

@keyframes beam {
  50% {
    opacity: 0;
  }
}

div.names {
  width: 10rem;
  border: 2px solid #dcdfe6;
  padding-top: calc(0.3rem - 3px);
  padding-bottom: calc(0.3rem - 3px);
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  &:hover {
    cursor: pointer;
    border: 2px solid $twitter;
  }
  &:active {
    cursor: pointer;
    border: 2px solid $primary;
  }

  &.active {
    border: 2px solid $twitter;
    &:hover { border: 2px solid $primary; }
    &:active { border: 2px solid $selected-hover; }
  }
}

</style>
