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
    </div>
  </div>
</template>

<script>
  import Misc from '@/misc.js'

  export default {
    name: 'settingsview',

    data: () => ({
      password: ''
    }),

    computed: {
      hash () {
        const passhash = this.$store.getters.passhash
        if (passhash === false) {
          return 'not set yet'
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
      }
    },

    created () {},

    methods: {
      setPassword () {
        console.log('SEND DISPALTCJ', this.password)
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
}
</style>
