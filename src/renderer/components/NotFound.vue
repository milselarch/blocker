<template>
    <p> 404 not found </p>
</template>

<script>
  export default {
    name: 'NotFound',
    components: { }
  }
</script>

<style lang="scss" scoped>
@import "@/assets/scss/vars.scss";

tr.task, tr.task * {
  font-family: "Abel"
}

th, th * {
  font-family: "Abel"
}

div.tasks-table {
  min-height: 10rem;
  /* background-color: red; */
}

td.table-column {
  vertical-align: middle;

  &.column-name {
    width: 40vw;
    max-width: 40vw;
  }
}

button.block-button {
  background-color: transparent;
  border-radius: 0px;
  color: #DDD;

  &:focus {
    color: #DDD;
  }

  &:hover {
    background-color: $danger;
    color: white;
    /* #fe304a #f64a62*/
  }
}

</style>
