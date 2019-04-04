<template>
  <div class="regex-wrapper">
    <div class="editor">
      <codemirror v-model="value" :options="cmOptions" />
    </div>
  </div>
</template>

<script>
  import './modes/HighlightModes.js'
  import { codemirror } from 'vue-codemirror'
  // require styles
  import 'codemirror/lib/codemirror.css'
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'edit-inline',

    data: () => ({
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: 'regex',
        theme: 'base16-dark',
        scrollbarStyle: null,
        lineNumbers: false,
        line: true
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }),

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
    },

    components: {
      codemirror
    }
  }
</script>

<style lang="scss">
@import "@/assets/scss/vars.scss";

.rule-detail {
  & div.regex-wrapper {
    display: flex;
    flex-direction: column;
    padding-right: 0.5rem;
    & .editor {
      height: fit-content;
      border-bottom: 1px solid #dcdfe6;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }

  & .CodeMirror {
    text-align: left!important; 
    height: auto;
    & pre {
      font-family: "Ubuntu Mono";
      padding-left: 0px;
      font-size: 1rem;
      & > * {
        font-family: "Ubuntu Mono";
        font-size: 1rem;
      }
      & span {
        font-family: "Ubuntu Mono";
        font-size: 1rem;
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

  & .regex {
    font-family: 'Ubuntu Mono';
    overflow-x: scroll;
    overflow-y: hidden;
    white-space: nowrap;
    padding-bottom: 0.5rem;
    padding-top: 0.5rem;
    display: flex;
    text-align: start;
    height: 1rem;
  } & .regex * {
    font-family: 'Ubuntu Mono';
    height: 1rem;
  }

  & div.regex {
    border-bottom: 1px solid #dcdfe6;
  }

  & div.regex::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }

  & .regex b     {background: #aad1f7;} 
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
}
</style>
