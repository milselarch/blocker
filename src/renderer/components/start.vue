<template>
  <div id="wrapper">
    <div id="rulesbox">
      <rule
        v-for="(ruleData, index) in rules"
        :ruleData="ruleData"
        :key="index"
        v-on:deleteRule="deleteRule"
        class="ruleDiv"
      ></rule>
    </div>
  </div>
</template>

<script>
  import rule from './rule.vue'

  export default {
    name: 'start',
    components: { rule },
    data: () => ({
      rules: [[1, 2]]
    }),
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
  @font-face {
  font-family: "Abel";
  src:
    url("/static/fonts/Abel-Regular.ttf") format("truetype");
    /* Add other formats as you see fit */
  }

  @font-face {
    font-family: "Staatliches";
    src:
      url("/static/fonts/Staatliches-Regular.ttf") format("truetype");
      /* Add other formats as you see fit */
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Staatliches', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }
</style>
