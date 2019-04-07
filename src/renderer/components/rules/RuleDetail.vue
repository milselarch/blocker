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
      <EditInlineMode 
        id="program"
        title="Program"
        v-model="name"
        ref="nameEdit"
      />
      <EditInlineMode
        id="title"
        title="Window Title"
        v-model="programName"
        ref="programEdit"
      />

      <input 
        id="duration"
        v-model="blockDuration"
        v-bind:class = "{
          invalid: !invalidDuration 
        }"
      />
      <p id="duration-label">Block duration (seconds)</p>
    </div>

    <!-- <p> {{ code }} </p> -->
    
  </div>

</template>

<script>
  import './modes/HighlightModes.js'
  import EditInlineMode from './EditInlineMode'
  // require styles
  import Misc from '@/misc.js'
  // import Rule from './Rule'
  import { setTimeout } from 'timers'

  setTimeout(() => {
    console.log(Misc)
  })

  export default {
    name: 'rule-detail',

    data: () => ({
      name: '',
      programName: '',
      blockDuration: 300
    }),

    computed: {
      invalidDuration () {
        return String(this.blockDuration).match(/^[0-9]+$/)
      }
    },

    beforeDestroy () {
      this.isDestroyed = true
    },

    methods: {
      loadRule (rule) {
        if (rule === null) {
          console.log('NULL RULE')
          return
        }

        console.log('LOAD RULE', rule)
        this.name = rule.name
        this.programName = rule.programName
        this.blockDuration = rule.blockDuration
        this.$refs.nameEdit.$forceUpdate()
        this.$refs.programEdit.$forceUpdate()
      }
    },

    watch: {
      rule (newRule, oldRule) {
        console.log('RDETAIL', newRule)
        this.loadRule(newRule)
      }
    },

    created () {
      // this.loadRule(this.rule)
    },

    mounted () {
      this.loadRule(this.rule)
    },

    components: {
      EditInlineMode
    },

    props: {
      rule: {
        type: null,
        default: null
      }
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

  & p#duration-label {
    margin-left: 0.2rem;
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
      border-bottom: 2px solid $warning;
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
