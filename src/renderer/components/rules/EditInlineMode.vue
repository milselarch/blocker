<template>
  <div id="mode-edit-inline">
    <div class="texts">
      <p> {{ title }} </p>
      <p v-on:click="changeMode" id="mode"> {{ modeText }} </p>
    </div>
    <EditInline 
      :value="editValue"
      @input="changeVal"
      :mode="editMode"
      :disabled="editMode === 'none'"
    />
  </div>
</template>

<script>
  // import Misc from '@/misc.js'
  import EditInline from './EditInline'

  const MODES = {
    'text': 'Tt',
    'wildcard': '/*',
    'regex': '.+'
  }
  
  const MODE_LIST = Object.keys(MODES)
  const DEFAULT_MODE = MODE_LIST[0]

  export default {
    name: 'edit-inline',

    computed: {
      modeText () {
        return MODES[this.editMode]
      }
    },

    data: () => ({
      editValue: '',
      editMode: DEFAULT_MODE
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    watch: {
      mode: function (newMode, oldMode) {
        // watch it
        this.editMode = newMode
      },

      editMode: function (newMode, oldMode) {
        this.$emit('mode-change', newMode)
      },

      editValue: function (newValue, oldValue) {
        this.$emit('input', newValue)
      },

      value: function (newValue, oldValue) {
        this.editValue = newValue
      }
    },

    methods: {
      changeMode (newVal, oldVal) {
        const currentIndex = MODE_LIST.indexOf(this.editMode)
        const newModeIndex = (currentIndex + 1) % MODE_LIST.length
        this.editMode = MODE_LIST[newModeIndex]
      },

      changeVal (newVal, oldVal) {
        this.editValue = newVal
      }
    },

    props: {
      value: {
        type: String,
        default: ''
      },

      mode: {
        type: String,
        default: DEFAULT_MODE
      },

      title: {
        type: String,
        default: 'test'
      }
    },

    components: {
      EditInline
    }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";
$editor-font: 'Abel';

div.texts {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  & p#mode {
    font-family: 'Ubuntu Mono';
    font-weight: bold;
    padding-left: 1rem;
    padding-right: 1rem; 
    background-color: #dcdfe6;
    user-select: none;
    cursor: pointer;

    &:hover {
      color: $twitter;
    }

    &:active {
      color: $primary;
    }
  }
}
</style>
