<template>
  <transition :name="disableTransitions ? '' : 'el-zoom-in-center'">
    <span
      class="el-tag"
<<<<<<< HEAD
      :class="[type ? 'el-tag--' + type : '', {'is-hit': hit}]"
      :title="title"
=======
      :class="[
        type ? 'el-tag--' + type : '',
        tagSize && `el-tag--${tagSize}`,
        {'is-hit': hit}
      ]"
>>>>>>> dev
      :style="{backgroundColor: color}">
      <slot></slot>
      <i class="el-tag__close el-icon-close"
        v-if="closable"
        @click.stop="handleClose"></i>
    </span>
  </transition>
</template>
<script>
  export default {
    name: 'ElTag',
    props: {
      text: String,
      closable: Boolean,
      type: String,
      hit: Boolean,
<<<<<<< HEAD
      closeTransition: Boolean,
      color: String,
      title: String
=======
      disableTransitions: Boolean,
      color: String,
      size: String
>>>>>>> dev
    },
    methods: {
      handleClose(event) {
        this.$emit('close', event);
      }
    },
    computed: {
      tagSize() {
        return this.size || (this.$ELEMENT || {}).size;
      }
    }
  };
</script>
