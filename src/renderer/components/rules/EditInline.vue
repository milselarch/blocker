<template>
  <div 
    class="editor"
    v-bind:class = "{
      disabled: disabled,
      border: border
    }"
  >
    <codemirror
      v-model="editValue" 
      :options="cmOptions"
      @input="onCmCodeChange"
      ref="cm"
    />
  </div>
</template>

<script>
  import './modes/HighlightModes.js'
  import { CodeMirror, codemirror } from 'vue-codemirror'
  import 'codemirror/lib/codemirror.css'
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'
  console.log(codemirror, CodeMirror)

  function preventNewline (cm, event) {
    // Identify typing events that add a newline to the buffer.
    var hasTypedNewline = (
      event.origin === '+input' &&
      typeof event.text === 'object' &&
      event.text.join('') === ''
    )

    // Prevent newline characters from being added to the buffer.
    if (hasTypedNewline) {
      return event.cancel()
    }

    // Identify paste events.
    var hasPastedNewline = (
      event.origin === 'paste' &&
      typeof event.text === 'object' &&
      event.text.length > 1
    )

    // Format pasted text to replace newlines with spaces.
    if (hasPastedNewline) {
      var newText = event.text.join(' ')
      return event.update(null, null, [newText])
    }

    return null
  }

  const DEFAULT_MODE = 'text'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'edit-inline',

    mounted () {
      this.$refs.cm.$on('beforeChange', preventNewline)
    },
  
    data: () => ({
      cmOptions: {
        // codemirror options
        tabSize: 4,
        correctSyntax: false,
        mode: DEFAULT_MODE,
        theme: 'base16-dark',
        placeholder: 'testing',
        scrollbarStyle: null,
        lineNumbers: false,
        readOnly: false,
        line: false
        // more codemirror options, 更多 codemirror 的高级配置...
      },

      editValue: ''
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    watch: {
      value: function (newValue, oldValue) {
        this.editValue = newValue
        this.checkValueValidity()
      },
      mode: function (newMode, oldMode) {
        this.cmOptions.mode = newMode
        this.checkValueValidity()
      },
      readonly: function (readonly, old) {
        this.cmOptions.readOnly = readonly
      }
    },

    created () {
      this.editValue = this.value
      this.cmOptions.readOnly = this.readonly
    },

    methods: {
      checkValueValidity () {
        console.log('EDITVAL', [this.mode], this.value)
        this.correctSyntax = true
        let test

        if (this.mode === 'regex') {
          try {
            test = new RegExp(this.value)
            console.log('VALUD OK REGEX')
          } catch (err) {
            if (err.name === 'SyntaxError') {
              this.correctSyntax = false
            }
          }
        }

        if (test !== undefined) {
          this.correctSyntax = true
        }

        this.$emit('correctSyntax', this.correctSyntax)
      },
      onCmCodeChange (newCode) {
        this.$emit('input', newCode)
        this.checkValueValidity()
      }
    },

    props: {
      value: {
        type: String,
        default: 'TEST',
        immediate: true
      },
      mode: {
        type: String,
        default: DEFAULT_MODE
      },
      disabled: {
        type: Boolean,
        default: false
      },
      border: {
        type: Boolean,
        default: true
      },
      readonly: {
        type: null,
        default: false,
        immediate: true
      }
    },

    components: {
      codemirror
    }
  }
</script>

<style lang="scss">
@import "@/assets/scss/vars.scss";
$editor-font: 'Abel';
$editor-font-size: 1rem;

button.mode-button {
  all: unset;
  font-family: $editor-font;
  font-size: $editor-font-size;
  font-weight: bold;
  border: 2px solid #dcdfe6;
  padding: 0.2rem;
  text-align: center;
}

.disabled {
  display: none;
}

.editor {
  height: fit-content;

  &.border {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
    border: 2px solid #dcdfe6;
  }
}

.CodeMirror {
  text-align: left!important;
  height: auto;
  width: 100%;

  & pre {
    font-family: $editor-font;
    font-size: $editor-font-size;
    padding-left: 0px;
    font-size: 1rem;
    & > * {
      font-family: $editor-font;
      font-size: $editor-font-size;
    }
    & span {
      font-family: $editor-font;
      font-size: $editor-font-size;
      & span.cm-a { background: #aad1f7; }
      & span.cm-g0 { background: #daffa7; color: #000; }
      & span.cm-g1 { background: #b4fa50; color: #000; }
      & span.cm-g2 { background: #8cd400; color: #000; } 
      & span.cm-g3 { background: #26b809; color: #fff; } 
      & span.cm-g4 { background: #30ea60; color: #000; } 
      & span.cm-g5 { background: #0c8d15; color: #fff; } 
      & span.cm-b { background: #ffc080; color: #753e07; }
      & span.cm-err {background: #e30000; color: #fff; } 
    }
  }
  & .CodeMirror-lines {
    padding: 0px;
  }
}

.regex {
  font-family: $editor-font;
  font-size: $editor-font-size;
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  display: flex;
  text-align: start;
  height: 1rem;
} .regex * {
  font-family: $editor-font;
  font-size: $editor-font-size;
  height: 1rem;
}

div.regex {
  border-bottom: 1px solid #dcdfe6;
}

div.regex::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.regex b     {background: #aad1f7;} 
/* metasequence */
.regex i     {background: #e3e3e3;} 
/* char class */
.regex i b   {background: #9fb6dc;} 
/* char class: metasequence */
.regex i u   {background: #c3c3c3;} 
/* char class: range-hyphen */
.regex b.g1  {background: #b4fa50; color: #000;} 
/* group: depth 1 */
.regex b.g2  {background: #8cd400; color: #000;} 
/* group: depth 2 */
.regex b.g3  {background: #26b809; color: #fff;} 
/* group: depth 3 */
.regex b.g4  {background: #30ea60; color: #000;} 
/* group: depth 4 */
.regex b.g5  {background: #0c8d15; color: #fff;} 
/* group: depth 5 */
.regex b.err {background: #e30000; color: #fff;} 
/* error */
.regex b, .regex i, .regex u {
  font-weight: normal;
  font-style: normal;
  text-decoration: none;
  display: flex;
}

.regex[contenteditable]:focus {
  outline: 0px solid transparent;
  display: flex;
  height: 1rem;
}

</style>
