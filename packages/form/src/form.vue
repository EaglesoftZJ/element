<template>
  <form class="el-form" :class="[
    labelPosition ? 'el-form--label-' + labelPosition : '',
    { 'el-form--inline': inline }
  ]">
    <slot></slot>
  </form>
</template>
<script>
  import objectAssign from 'element-ui/src/utils/merge';

  export default {
    name: 'ElForm',

    componentName: 'ElForm',

    provide() {
      return {
        elForm: this
      };
    },

    props: {
      model: Object,
      rules: Object,
      labelPosition: String,
      labelWidth: String,
      labelSuffix: {
        type: String,
        default: ''
      },
      inline: Boolean,
      inlineMessage: Boolean,
      statusIcon: Boolean,
      showMessage: {
        type: Boolean,
        default: true
      },
      size: String,
      disabled: Boolean,
      validateOnRuleChange: {
        type: Boolean,
        default: true
      },
      scrollToError: { // 表单校验后滚动到错误位置
        type: Boolean,
        default: true
      },
      scrollToErrorOffset: { // 表单校验后滚动到错误位置距离容器顶部的偏移值
        type: Number,
        default: 50
      }
    },
    watch: {
      rules() {
        if (this.validateOnRuleChange) {
          this.validate(() => {});
        }
      }
    },
    data() {
      return {
        fields: []
      };
    },
    created() {
      this.$on('el.form.addField', (field) => {
        if (field) {
          this.fields.push(field);
        }
      });
      /* istanbul ignore next */
      this.$on('el.form.removeField', (field) => {
        if (field.prop) {
          this.fields.splice(this.fields.indexOf(field), 1);
        }
      });
    },
    methods: {
      resetFields() {
        if (!this.model) {
          process.env.NODE_ENV !== 'production' &&
          console.warn('[Element Warn][Form]model is required for resetFields to work.');
          return;
        }
        this.fields.forEach(field => {
          field.resetField();
        });
      },
      clearValidate() {
        this.fields.forEach(field => {
          field.clearValidate();
        });
      },
      validate(callback) {
        if (!this.model) {
          console.warn('[Element Warn][Form]model is required for validate to work!');
          return;
        }

        let scrolled = false; // 记录是否已滚动的error

        let promise;
        // if no callback, return promise
        if (typeof callback !== 'function' && window.Promise) {
          promise = new window.Promise((resolve, reject) => {
            callback = function(valid) {
              valid ? resolve(valid) : reject(valid);
            };
          });
        }

        let valid = true;
        let count = 0;
        // 如果需要验证的fields为空，调用验证时立刻返回callback
        if (this.fields.length === 0 && callback) {
          callback(true);
        }
        let invalidFields = {};
        this.fields.forEach(field => {
          let currentFieldValid = true; // 当前表单项的校验状态
          field.validate('', (message, field, el) => {
            if (message) {
              valid = false;
              currentFieldValid = false;
            }
            if (!scrolled && !currentFieldValid && el && this.scrollToError) {
              scrolled = true;
              el.focus();
              this.scrollToErrorField();
            } else if (!scrolled && !currentFieldValid && !el && this.scrollToError) {
              scrolled = true;
              this.scrollToErrorField();
            }
            invalidFields = objectAssign({}, invalidFields, field);
            if (typeof callback === 'function' && ++count === this.fields.length) {
              callback(valid, invalidFields);
            }
          }, true);
        });

        if (promise) {
          return promise;
        }
      },
      validateField(prop, cb) {
        let field = this.fields.filter(field => field.prop === prop)[0];
        if (!field) { throw new Error('must call validateField with valid prop string!'); }

        field.validate('', cb);
      },
      // 滚动到表单第一个错误位子
      scrollToErrorField() {
        this.$nextTick(() => {
          const scrollNode = getScrollParent(this.$el);
          console.log('scrollNode', scrollNode);
          const $error = $(this.$el).find('.is-error');
          if (scrollNode && $error.length) {
            const scrollBoxTop = $(scrollNode).offset().top; // 滚动容器距离浏览器的高度
            const errorTop = $error.eq(0).offset().top; // 距离浏览器顶部高度
            const errorShouldTop = scrollBoxTop + this.scrollToErrorOffset; // 错误信息应该展示在距滚动容器以下偏移值的位置
            let scrollTop = $(scrollNode).scrollTop() + errorTop - errorShouldTop;
            if (scrollTop < 0) scrollTop = 0;
            if (scrollTop > scrollNode.scrollHeight - scrollNode.clientHeight) scrollTop = scrollNode.scrollHeight - scrollNode.clientHeight;
            $(scrollNode).scrollTop(scrollTop);
          }
        });
        function getScrollParent(node) { // 寻找父级滚动容器
          if (!node || !node.tagName) return null;
          const { overflowY } = window.getComputedStyle(node);
          if (overflowY === 'auto' || overflowY === 'scroll') { // 滚动条容器
            return node;
          } else {
            return getScrollParent(node.parentNode); // 判断父级
          }
        }
      },
      /**
       * 第一个表单元素获取焦点
       */
      toFocusFirst() {
        if (this.fields[0] && this.fields[0].$el) {
          this.fields[0].$el.querySelector('input') && this.fields[0].$el.querySelector('input').focus();
        }
      }
    }
  };
</script>
