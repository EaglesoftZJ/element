<template>
  <transition
    name="dialog-fade"
    @enter="handleEnter"
    @after-enter="handleAfterEnter"
    @after-leave="handleAfterLeave"
    v-on:before-enter="handleTransition('beforeEnter')"
    v-on:enter-cancelled="handleTransition('cancelledEnter')"
    v-on:before-leave="handleTransition('beforeLeave')"
    v-on:leave="handleTransition('leave')"
    v-on:leave-cancelled="handleTransition('cancelledLeave')"
  >
    <div
      class="el-eg-dialog__wrapper el-dialog__wrapper"
      :class="wrapperClass"
      v-show="calVisible"
      @click.self="handleWrapperClick"
      :style="style"
    >
      <div
        class="el-eg-dialog el-dialog"
        :class="[
          { 'is-fullscreen': fullscreen, 'el-dialog--center': center },
          customClass,
        ]"
        :style="dialogStyle_1"
        ref="dialog"
      >
        <div class="el-eg-dialog__header el-dialog__header" ref="header" :style="headerStyle">
          <slot name="title">
            <span class="el-eg-dialog__title el-dialog__title">{{ title }}</span>
          </slot>
          <button
            type="button"
            class="el-dialog__headerbtn"
            aria-label="Close"
            v-if="showClose"
            @click="handleClose"
          >
            <i class="el-eg-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>
        <div
          ref="body"
          class="el-eg-dialog__content el-dialog__body"
          :style="contentStyle_1"
          v-if="rendered"
        >
          <slot></slot>
          <!-- <div ref="flow" class="el-dialog__body__flow">
            <iframe ref=iframe class="flow-iframe"></iframe>
          </div> -->
        </div>
        <div class="el-dialog__footer" ref="footer">
          <el-button
            v-for="(item, index) in buttons"
            :disabled="
              buttons[buttons.length - 1 - index].disabled !== undefined &&
              buttons[buttons.length - 1 - index].disabled === true
            "
            :key="buttons[buttons.length - 1 - index].text"
            :size="buttons[buttons.length - 1 - index].size"
            :icon="buttons[buttons.length - 1 - index].icon"
            :type="buttons[buttons.length - 1 - index].type"
            :loading="buttons[buttons.length - 1 - index].loadings"
            :class="buttons[buttons.length - 1 - index].class"
            @click="doFunctions($event, index)"
          >
            {{ buttons[buttons.length - 1 - index].text }}
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Popup from "element-ui/src/utils/popup";
import Migrating from "element-ui/src/mixins/migrating";
import emitter from "element-ui/src/mixins/emitter";

export default {
  name: "ElDialog",

  mixins: [Popup, emitter, Migrating],

  props: {
    title: {
      type: String,
      default: "",
    },

    modal: {
      type: Boolean,
      default: true,
    },

    modalAppendToBody: {
      type: Boolean,
      default: true,
    },

    appendToBody: {
      type: Boolean,
      default: false,
    },

    lockScroll: {
      type: Boolean,
      default: true,
    },

    closeOnClickModal: {
      type: Boolean,
      default: true,
    },

    closeOnPressEscape: {
      type: Boolean,
      default: true,
    },

    showClose: {
      type: Boolean,
      default: true,
    },

    width: String,

    fullscreen: Boolean,

    customClass: {
      type: String,
      default: "",
    },

    top: {
      type: String,
    },
    beforeClose: Function,
    center: {
      type: Boolean,
      default: false,
    },
    fitHeight: Boolean,
    drag: Boolean,
    closeReset: Boolean,
  },

  data() {
    return {
      closed: false,
      dialogMaxHeight: 0,
      storeDialogMaxHeight: 0,
      contentMaxHeight: 0,
      isDraged: false,
      dialogLeft: 0,
      dialogTop: 0,
      openAfterAnimate: false,
      closeAfterAnimate: false,
      bodyShow: false,
      calVisible: false,
      buttons: null,
      wrapperClass: '',
      dialogStyle: '',
      contentStyle: '',
      style: ''
    };
  },

  watch: {
    visible(val) {
      if (val) {
        this.closed = false;
        this.$el.addEventListener("scroll", this.updatePopper);
        this.$nextTick(() => {
          if (typeof this.beforeShow === 'function') {
          // console.log(this.$slots.default[0]);
          const componentInstance = this.getInstance();
          this.beforeShow(this, componentInstance);
        }
          this.$refs.dialog.scrollTop = 0;
        });
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
        this.open();
        this.$nextTick(() => {
          // console.log('beforeBind', getComputedStyle(this.$refs.flow).height);
          // this.bindResizeEvent();
          setTimeout(() => {
            console.log('aaa111222');
            this.calVisible = this.visible;
            // this.$nextTick(() => {
            //   this.updateMaxHeight();
            // });
          }, 10);
          // this.$nextTick(() => {
          //   setTimeout(() => {
          //     this.bodyShow = true;
          //     this.$emit('open');
          //   }, 10);
        });
      } else {
        this.$el.removeEventListener("scroll", this.updatePopper);
        // this.unbindResizeEvent();
        if (!this.closed) this.$emit("close");
        this.calVisible = this.visible;
        // this.bodyShow = false;
      }
    },
    rendered(val) {
      if (val) {
        this.$emit('rendered');
      }
    }
  },

  computed: {
    dialogStyle_1() {
      let style = {};
      if (this.width) {
        style.width = this.width;
      }
      if (!this.fullscreen && this.top) {
        style.marginTop = this.top;
      }
      if (this.dialogMaxHeight) {
        style[this.fitHeight ? "height" : "maxHeight"] =
          this.dialogMaxHeight + "px";
      }
      if (
        this.drag &&
        ((this.openAfterAnimate && this.isDraged) ||
          (this.closeAfterAnimate && !this.closeReset))
      ) {
        style.position = "absolute";
        style.left = this.dialogLeft + "px";
        style.top = this.dialogTop + "px";
      }
       console.log('this.dialogStyle', this.dialogStyle);
      if (this.dialogStyle) {
        this.dialogStyle.split(';').forEach((item) => {
          const arr = item.split(':');
          style[arr[0]] = arr[1];
        })
      }
      return style;
    },
    contentStyle_1() {
      var style = {};
      if (this.contentMaxHeight) {
        style[this.fitHeight ? "height" : "maxHeight"] =
          this.contentMaxHeight + "px";
      }
      if (this.contentStyle) {
        this.contentStyle.split(';').forEach((item) => {
          const arr = item.split(':');
          style[arr[0]] = arr[1];
        })
      }
      return style;
    },
    headerStyle() {
      var style = {};
      if (this.drag) {
        style.cursor = "move";
        style["user-select"] = "none";
      }
      return style;
    },
  },

  methods: {
    test() {
      // this.dialogMaxHeight = this.storeDialogMaxHeight;
    },
    getMigratingConfig() {
      return {
        props: {
          size: "size is removed.",
        },
      };
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) return;
      this.handleClose();
    },
    handleClose() {
      if (typeof this.beforeClose === "function") {
        this.beforeClose('', this, this.close, this.$slots.default[0].componentInstance);
      } else {
        this.hide();
      }
    },
    hide(cancel) {
      if (cancel !== false) {
        this.$emit("update:visible", false);
        this.$emit("close");
        this.closed = true;
      }
    },
    updatePopper() {
      this.broadcast("ElSelectDropdown", "updatePopper");
      this.broadcast("ElDropdownMenu", "updatePopper");
    },
    handleEnter() {
      this.updateMaxHeight();
      this.handleTransition('enter');
    },
    handleAfterLeave() {
      this.isDraged = false;
      this.openAfterAnimate = false;
      this.closeAfterAnimate = true;
      this.$emit("closed");
      this.handleTransition('afterLeave')
    },
    handleAfterEnter() {
      this.openAfterAnimate = true;
      this.closeAfterAnimate = false;
      this.$emit("opened");
      this.handleTransition('afterEnter');
    },
    updateMaxHeight() {
      var winHeight = document.body.clientHeight;
      this.storeDialogMaxHeight = this.dialogMaxHeight = winHeight - 60;
      this.contentMaxHeight =
        this.dialogMaxHeight -
        (this.$refs["header"] ? this.$refs["header"].offsetHeight : 0) -
        (this.$refs["footer"] ? this.$refs["footer"].offsetHeight : 0);
    },
    initDrag() {
      // 设置拖拽
      this.dialogLeft = this.$refs["dialog"].offsetLeft;
      this.dialogTop = this.$refs["dialog"].offsetTop;
      this.isDraged = true;
    },
    handleMouseDown(event) {
      this.initDrag();
      var self = this;
      var left = self.dialogLeft;
      var top = self.dialogTop;
      var x1 = event.clientX;
      var y1 = event.clientY;
      var x2 = 0;
      var y2 = 0;
      var newLeft = 0;
      var newTop = 0;
      var w = document.body.clientWidth;
      var h = document.body.clientHeight;
      document.addEventListener("mousemove", handleMousemove);
      document.addEventListener("mouseup", handleMouseup);
      function handleMousemove(event) {
        x2 = event.clientX;
        y2 = event.clientY;
        newLeft = left + (x2 - x1);
        newTop = top + (y2 - y1);
        if (newLeft < 10) {
          newLeft = 10;
        } else if (newLeft + self.$refs["dialog"].offsetWidth + 10 > w) {
          newLeft = w - self.$refs["dialog"].offsetWidth - 10;
        }
        if (newTop < 10) {
          newTop = 10;
        } else if (newTop + self.$refs["dialog"].offsetHeight + 10 > h) {
          newTop = h - self.$refs["dialog"].offsetHeight - 10;
        }
        self.dialogLeft = newLeft;
        self.dialogTop = newTop;
      }
      function handleMouseup() {
        document.removeEventListener("mousemove", handleMousemove);
        document.removeEventListener("mousemove", handleMouseup);
      }
    },
    handleFlowResize() {
      console.log("handleFlowResize", getComputedStyle(this.$refs.flow).height);
      const padding =
        parseFloat(getComputedStyle(this.$refs.body).paddingTop) +
        parseFloat(getComputedStyle(this.$refs.body).paddingBottom);
      this.$refs.body.style.height =
        this.$refs.flow.clientHeight + padding + "px";
      this.$refs.body.style.overflow = "hidden";
      setTimeout(() => {
        this.$refs.body && (this.$refs.body.style.overflow = "auto");
      }, 300); // 展开动画执行300ms
    },
    bindResizeEvent() {
      if (this.$refs.iframe && !this.fitHeight) {
        const win = this.$refs.iframe.contentWindow;
        win && win.addEventListener("resize", this.handleFlowResize);
      }
    },
    unbindResizeEvent() {
      if (this.$refs.iframe && !this.fitHeight) {
        const win = this.$refs.iframe.contentWindow;
        win && win.removeEventListener("resize", this.handleFlowResize);
      }
    },
    bindEvent() {
      if (this.drag) {
        this.$refs["header"].addEventListener(
          "mousedown",
          this.handleMouseDown
        );
      }
    },
    unBindEvent() {
      if (this.drag) {
        this.$refs["header"].removeEventListener(
          "mousedown",
          this.handleMouseDown
        );
      }
    },
    handleTransition(type) {
      if (type === "enter") {
        this.messageShow = true;
      }
      // // // console.log('transitionCallback1');
      if (typeof this.transitionCallback === "function") {
        // // // console.log('transitionCallback2', this.$slots.default[0]);
        const componentInstance = this.getInstance();
        this.transitionCallback(type, this, componentInstance);
      }
      this.$emit(type);
    },
    doFunctions(evt, index) {
      const componentInstance = this.getInstance();
      if (this.buttons[index].callback) {
        this.buttons[this.buttons.length - 1 - index].callback(
          this,
          componentInstance,
          evt
        );
      } else {
        this.functions[this.functions.length - 1 - index](
          this,
          componentInstance,
          evt
        );
      }
    },
    getInstance() {
      if (
        this.$slots.default &&
        this.$slots.default[0] &&
        this.$slots.default[0].componentInstance
      ) {
        return this.$slots.default[0].componentInstance;
      } else {
        return null;
      }
    },
    doClose() {
      this._closing = true;
      this.$emit('update:visible', false);

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
    }
  },
  updated() {
    // this.updateMaxHeight();
  },
  created() {
    window.addEventListener("resize", this.updateMaxHeight);
  },

  mounted() {
    if (this.visible) {
      this.rendered = true;
      if (this.appendToBody) {
        document.body.appendChild(this.$el);
      }
      this.open();
      this.$nextTick(() => {
        this.bindResizeEvent();
        // console.log('beforeBind', getComputedStyle(this.$refs.flow).height);
        setTimeout(() => {
          // console.log('calVisible', getComputedStyle(this.$refs.flow).height);
          this.calVisible = this.visible;
          // this.$nextTick(() => {
          //   this.updateMaxHeight();
          // });
        }, 10);
      });
    }
    this.bindEvent();
  },
  beforeDestroy() {
    this.unBindEvent();
  },
  destroyed() {
    // if appendToBody is true, remove DOM node after destroy
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
    window.removeEventListener("resize", this.updateMaxHeight);
  },
};
</script>
