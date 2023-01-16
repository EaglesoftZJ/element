<template>
  <button
    class="el-button"
    @click="handleClick"
    :disabled="buttonDisabled || loading"
    :autofocus="autofocus"
    :type="nativeType"
    :class="[
      type ? 'el-button--' + type : '',
      buttonSize ? 'el-button--' + buttonSize : '',
      {
        'is-disabled': buttonDisabled,
        'is-loading': loading,
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle
      }
    ]"
  >
    <i class="el-icon-loading" v-if="loading"></i>
    <i :class="icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>
<script>
  export default {
    name: 'ElButton',
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    props: {
      type: {
        type: String,
        default: 'default'
      },
      size: String,
      icon: {
        type: String,
        default: ''
      },
      nativeType: {
        type: String,
        default: 'button'
      },
      loading: Boolean,
      disabled: Boolean,
      plain: Boolean,
      autofocus: Boolean,
      round: Boolean,
      circle: Boolean,
      bindEnterByText: { // 文字内容为查询自动绑定enter 默认查询函数为select
        type: Boolean,
        default: true
      },
      bindEnterFn: Function
    },

    computed: {
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      buttonSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      buttonDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      }
    },

    methods: {
      handleClick(evt) {
        this.$emit('click', evt);
      },
      getParent(componentName) {
        var parent = this.$parent;
        while (parent && parent.$options.componentName !== componentName) {
          parent = parent.$parent;
        }
        return parent;
      },
      handleEnter(event) {
        if (event.keyCode === 13) {
          var hasFocusInput = false;
          var parent = this.getParent('ElForm');
          if (parent) {
            checkChildren.call(this, parent);
          }
        }
        function checkChildren(parent) {
          if (!parent) return;
          for (var i = 0; i < parent.$children.length; i++) {
            if (hasFocusInput) return;
            if (parent.$children[i].$options.componentName === 'ElInput' && parent.$children[i].focused) {
              if (this.bindEnterFn) {
                this.bindEnterFn();
              } else {
                this.$emit('click');
              }
              hasFocusInput = true;
              return;
            } else if (parent.$children[i].$children && parent.$children[i].$children.length > 0) {
              checkChildren.call(this, parent.$children[i]);
            }
          }
        }
      },
      bindEnter() {
        let text = this.bindEnterByText && this.$slots.default && this.$slots.default[0] && this.$slots.default[0].text;
        text = text.replace(/\s+/g, '');
        if (this.bindEnterFn || text === '查询') {
          document.addEventListener('keyup', this.handleEnter);
        }
      },
      unbindEnter() {
        document.removeEventListener('keyup', this.handleEnter);
      }
    },
    activated() {
      this.bindEnter();
    },
    mounted() {
      this.bindEnter();
    },
    deactivated() {
      this.unbindEnter();
    },
    destroyed() {
      this.unbindEnter();
    }
  };
</script>
