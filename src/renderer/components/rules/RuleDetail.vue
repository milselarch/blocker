<template>
  <div class="rule-detail">
    <div class="detail-icons">
      <font-awesome-icon icon="window-restore" class="large icon alt">
      </font-awesome-icon>
      <div id="padding"></div>
      <font-awesome-icon icon="save" class="icon alt">
      </font-awesome-icon>
      <font-awesome-icon icon="lock" class="icon alt">
      </font-awesome-icon>
      <font-awesome-icon icon="trash" class="icon alt">
      </font-awesome-icon>
    </div>
   
    <div class="mode-edit">
      <EditInlineMode id="program" title="Program" v-model="code" />
      <EditInlineMode id="title" title="Window Title" v-model="code" />
      <input 
        id="duration"
        v-model="blockDuration"
        placeholder="Block duration (seconds)"
        v-bind:class = "{
          invalid: !invalidDuration 
        }"
      />
    </div>

    <!-- <p> {{ code }} </p> -->
    
  </div>

</template>

<script>
  import './modes/HighlightModes.js'
  import EditInlineMode from './EditInlineMode'
  // require styles
  import Misc from '@/misc.js'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-detail',

    data: () => ({
      code: 'hihi',
      blockDuration: '300'
    }),

    computed: {
      invalidDuration () {
        return this.blockDuration.match(/^[0-9]+$/)
      }
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
    },

    components: {
      EditInlineMode
    }
  }
</script>

<style lang="scss">
@import "@/assets/scss/vars.scss";

div.rule-detail {
  max-width: 25rem;
}

div.mode-edit {
  & #program {
    margin-bottom: 0.3rem;
  }

  & #duration {
    border-radius: 0px;
    margin-top: 1rem;
    border: 0px;
    border-bottom: 2px solid #dcdfe6;
    font-size: 1rem;
    font-family: 'Abel';
    padding: 0.2rem;
    width: 100%;

    &:focus, &:focus, &:focus{
        outline: none;
    }

    &.invalid {
      border-bottom: 2px solid #db9797;
    }
  }
}

div.detail-icons {
  border-bottom: 2px solid grey;

  display: flex;
  padding-left: 0rem;
  padding-right: 0rem;
  margin-bottom: 1rem;
  flex-direction: row;
  align-items: center;

  & .icon {
    &:not(:last-child) {
      margin-right: 0.4rem;
    }
    &.large {
      width: 1.3rem;
    }
  }

  div#padding {
    width: -webkit-fill-available;
  };

}
</style>
