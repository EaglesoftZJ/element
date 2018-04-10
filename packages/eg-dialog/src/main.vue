<template>
  <transition :name="animate" 
  v-on:before-enter="handleTransition('beforeEnter')"
  v-on:enter="handleTransition('enter')"
  v-on:after-enter="handleTransition('afterEnter')"
  v-on:enter-cancelled="handleTransition('cancelledEnter')"
  v-on:before-leave="handleTransition('beforeLeave')"
  v-on:leave="handleTransition('leave')"
  v-on:after-leave="handleTransition('afterLeave')"
  v-on:leave-cancelled="handleTransition('cancelledLeave')"> 
    <div class="el-eg-dialog__wrapper" v-show="visible" v-if="!boxClose" @click.self="handleWrapperClick"  :style="style">
      <div class="el-eg-dialog" :class="customClass" :style="dialogStyle">
        <div class="el-eg-dialog__header" v-if="title !== undefined">
          <div class="el-eg-dialog__title" >{{ title || t('el.messagebox.title') }}</div>
          <i class="el-eg-dialog__close el-icon-close" @click="handleAction('cancel')" v-if="showClose"></i>
        </div>
        <div class="el-eg-dialog__content"  v-if="message !== ''" :style="contentStyle">
          <div class="el-eg-dialog__status" :class="[ typeClass ]"></div>
          <div class="el-eg-dialog__message" :style="messageStyle" v-if="messageShow">
            <slot><p>{{ message }}</p></slot>
          </div>
          <div class="el-eg-dialog__input" v-show="showInput">
            <el-input v-model="inputValue" @keyup.enter.native="handleAction('confirm')" :placeholder="inputPlaceholder" ref="input"></el-input>
            <div class="el-eg-dialog__errormsg" :style="{ visibility: !!editorErrorMessage ? 'visible' : 'hidden' }">{{ editorErrorMessage }}</div>
          </div>
        </div>
        <div class="el-eg-dialog__btns" :style="btnsStyle">
  
          <el-button v-for="(item, index) in buttons" :key="item.text" :size="item.size" :icon="item.icon" :type="item.type" :loading="item.loadings" :class="item.class" @click="doFunctions($event,index)">
            {{item.text}}
          </el-button>
         
        </div>
      </div>
    </div>
  </transition>
</template>

<style scope>

</style>

<script type="text/babel">
  import Popup from 'element-ui/src/utils/popup';
  import Locale from 'element-ui/src/mixins/locale';
  import ElInput from 'element-ui/packages/input';
  import ElButton from 'element-ui/packages/button';
  import { addClass, removeClass } from 'element-ui/src/utils/dom';
  import { t } from 'element-ui/src/locale';

  let typeMap = {
    success: 'circle-check',
    info: 'information',
    warning: 'warning',
    error: 'circle-cross'
  };

  export default {
    mixins: [Popup, Locale],

    props: {
      modal: {
        default: true
      },
      lockScroll: {
        default: true
      },
      showClose: {
        type: Boolean,
        default: true
      },
      closeOnClickModal: {
        default: true
      },
      closeOnPressEscape: {
        default: true
      }
    },

    components: {
      ElInput,
      ElButton
    },

    computed: {
      typeClass() {
        return this.type && typeMap[this.type] ? `el-icon-${ typeMap[this.type] }` : '';
      }
    },
    

    methods: {
      getResolveValue() {
        return this.$slots.default[0].componentInstance.resolveValue;
      },
      getSafeClose() {
        const currentId = this.uid;
        return () => {
          this.$nextTick(() => {
            if (currentId === this.uid) this.doClose();
          });
        };
      },
      doFunctions(evt, index) {
        if (this.buttons[index].callback) {
          this.buttons[index].callback(this, this.$slots.default[0].componentInstance, evt);
        } else {
          this.functions[index](this, this.$slots.default[0].componentInstance, evt);
        }
        
        
      },
      doClose() {
        if (!this.visible) return;
        this.visible = false;
        this._closing = true;

        this.onClose && this.onClose();

        if (this.lockScroll) {
          setTimeout(() => {
            if (this.modal && this.bodyOverflow !== 'hidden') {
              document.body.style.overflow = this.bodyOverflow;
              document.body.style.paddingRight = this.bodyPaddingRight;
            }
            this.bodyOverflow = null;
            this.bodyPaddingRight = null;
          }, 200);
        }
        this.opened = false;

        if (!this.transition) {
          this.doAfterClose();
        }
        if (this.$slots.default[0].componentInstance) {
          this.callback(this.$slots.default[0].componentInstance, this);
        }
        setTimeout(() => {
        //   typeof this.beforeClose === 'function' && this.beforeClose(this, this.$slots.default[0].componentInstance);
          this.boxClose = true;
        }, 500);
      },

      handleWrapperClick() {
        if (this.closeOnClickModal) {
          this.handleAction('cancel');
        }
      },

      handleAction(action) {
        if (this.$type === 'prompt' && action === 'confirm' && !this.validate()) {
          return;
        }
        this.action = action;
        if (typeof this.beforeClose === 'function') {
          this.close = this.getSafeClose();
          this.beforeClose(action, this, this.close, this.$slots.default[0].componentInstance);
        } else {
          this.doClose();
        }
      },

      

      validate() {
        if (this.$type === 'prompt') {
          var inputPattern = this.inputPattern;
          if (inputPattern && !inputPattern.test(this.inputValue || '')) {
            this.editorErrorMessage = this.inputErrorMessage || t('el.messagebox.error');
            addClass(this.$refs.input.$el.querySelector('input'), 'invalid');
            return false;
          }
          var inputValidator = this.inputValidator;
          if (typeof inputValidator === 'function') {
            var validateResult = inputValidator(this.inputValue);
            if (validateResult === false) {
              this.editorErrorMessage = this.inputErrorMessage || t('el.messagebox.error');
              addClass(this.$refs.input.$el.querySelector('input'), 'invalid');
              return false;
            }
            if (typeof validateResult === 'string') {
              this.editorErrorMessage = validateResult;
              return false;
            }
          }
        }
        this.editorErrorMessage = '';
        removeClass(this.$refs.input.$el.querySelector('input'), 'invalid');
        return true;
      },
      handleTransition(type) {
          if (type === 'enter') {
            this.messageShow = true;
          }
         // // // console.log('transitionCallback1');
         if (typeof this.transitionCallback === 'function') {
            // // // console.log('transitionCallback2', this.$slots.default[0]);
            this.transitionCallback(type, this, this.$slots.default[0].componentInstance);
          }
      }
    },

    watch: {
      inputValue: {
        immediate: true,
        handler(val) {
          this.$nextTick(_ => {
            if (this.$type === 'prompt' && val !== null) {
              this.validate();
            }
          });
        }
      },

      visible(val) {
        if (val) this.uid++;
        if (val) {
          if (typeof this.beforeShow === 'function') {
            // // // console.log(this.$slots.default[0]);
            this.beforeShow(this, this.$slots.default[0].componentInstance);
          }
        }
        if (this.$type === 'alert' || this.$type === 'confirm') {
          this.$nextTick(() => {
            this.$refs.confirm.$el.focus();
          });
        }
        if (this.$type !== 'prompt') return;
        if (val) {
          setTimeout(() => {
            if (this.$refs.input && this.$refs.input.$el) {
              this.$refs.input.$el.querySelector('input').focus();
            }
          }, 500);
        } else {
          this.editorErrorMessage = '';
          removeClass(this.$refs.input.$el.querySelector('input'), 'invalid');
        }
      }
    },

    data() {
      return {
        uid: 1,
        title: undefined,
        message: '',
        type: '',
        customClass: '',
        showInput: false,
        inputValue: null,
        inputPlaceholder: '',
        inputPattern: null,
        inputValidator: null,
        inputErrorMessage: '',
        callback: null,
        buttons: null,
        editorErrorMessage: null,
        animate: 'egdlg-fade',
        contentStyle: '',
        dialogStyle: '',
        messageStyle: '',
        styel: '',
        container: null,
        btnsStyle: '',
        transitionCallback: null,
        boxClose: false,
        messageShow: true
      };
    }
  };
</script>
