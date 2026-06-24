<template>
  <transition-group
    tag="ul"
    :class="[
      'el-upload-list',
      'el-upload-list--' + listType,
      { 'is-disabled': disabled },
      { 'is-draggable': draggable && !disabled }
    ]"
    :name="listTransitionName"
    :css="listTransitionEnabled"
  >
    <li
      v-for="(file, index) in files"
      :class="['el-upload-list__item', 'is-' + file.status, focusing ? 'focusing' : '']"
      :key="file.uid"
      tabindex="0"
      @keydown.delete="!disabled && $emit('remove', file)"
      @focus="focusing = true"
      @blur="focusing = false"
      @click.stop="focusing = false"
    >
    <slot name="file" :file="file">  
      <i v-if="draggable && !disabled" class="el-icon-rank el-upload-list__item-drag"></i>
      <el-tooltip v-if="index === 0" popper-class="tooltip-use-in-form" placement="top-start" :content="tooltipContent" ref="tooltip"></el-tooltip>
      <img
        class="el-upload-list__item-thumbnail"
        v-if="file.status !== 'uploading' && ['picture-card', 'picture'].indexOf(listType) > -1"
        :src="file[props['url']] || file.url" alt=""
      >
      <a class="el-upload-list__item-name" @mouseenter="handleNameMouseEnter" @mouseleave="handleNameMouseLeave" @click="handleClick(file)">
        <i class="el-icon-document" v-if="!$scopedSlots.btn"></i>
        <template v-else>
          <slot name="btn" :file="file"></slot>
        </template>
        {{ file[props['name']] || file.name }}
      </a>
      <span class="suffix-name">
        <slot name="suffixName" :file="file"></slot>
      </span>
      <label class="el-upload-list__item-status-label">
        <i :class="{
          'el-icon-upload-success': true,
          'el-icon-circle-check': listType === 'text',
          'el-icon-check': ['picture-card', 'picture'].indexOf(listType) > -1
        }"></i>
      </label>
      <i class="el-icon-close" v-if="!disabled" @click.stop="$emit('remove', file)"></i>
      <!--因为close按钮只在li:focus的时候 display, li blur后就不存在了，所以键盘导航时永远无法 focus到 close按钮上-->
      <!-- <i class="el-icon-close-tip" v-if="!disabled">{{ t('el.upload.deleteTip') }}</i>  -->
      <el-progress
        v-if="file.status === 'uploading'"
        :type="listType === 'picture-card' ? 'circle' : 'line'"
        :stroke-width="listType === 'picture-card' ? 6 : 2"
        :percentage="parsePercentage(file.percentage)">
      </el-progress>
      <span class="el-upload-list__item-actions" v-if="listType === 'picture-card'">
        <span
          class="el-upload-list__item-preview"
          v-if="handlePreview && listType === 'picture-card'"
          @click="handlePreview(file)"
        >
          <i class="el-icon-search-plus"></i>
        </span>
        <span
          v-if="!disabled"
          class="el-upload-list__item-delete"
          @click="$emit('remove', file)"
        >
          <i class="el-icon-trash-o"></i>
        </span>
      </span>
    </slot>
    </li>
  </transition-group>
</template>
<script>
  import debounce from 'throttle-debounce/debounce';
  import Locale from 'element-ui/src/mixins/locale';
  import ElProgress from 'element-ui/packages/progress';
  import Sortable from 'sortablejs';

  export default {
    mixins: [Locale],

    data() {
      return {
        focusing: false,
        tooltipContent: '',
        sortableInstance: null
      };
    },
    components: { ElProgress },

    props: {
      files: {
        type: Array,
        default() {
          return [];
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      handlePreview: Function,
      listType: String,
      props: {},
      draggable: {
        type: Boolean,
        default: false
      },
      uploadAnimation: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      listTransitionEnabled() {
        return this.uploadAnimation && !(this.draggable && !this.disabled);
      },
      listTransitionName() {
        return this.listTransitionEnabled ? 'el-list' : '';
      }
    },
    created() {
      this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper());
    },
    mounted() {
      if (this.draggable) {
        this.initSortable();
      }
    },
    watch: {
      draggable(val) {
        if (val) {
          this.initSortable();
        } else {
          this.destroySortable();
        }
      },
      disabled(val) {
        if (this.sortableInstance) {
          this.sortableInstance.option('disabled', val);
        }
      }
    },
    beforeDestroy() {
      this.destroySortable();
    },
    methods: {
      initSortable() {
        this.$nextTick(() => {
          const el = this.$el;
          if (!el) return;
          this.sortableInstance = Sortable.create(el, {
            animation: 300,
            easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
            disabled: this.disabled,
            handle: '.el-upload-list__item-drag',
            ghostClass: 'el-upload-list__item--ghost',
            chosenClass: 'el-upload-list__item--chosen',
            dragClass: 'el-upload-list__item--drag',
            onEnd: (evt) => {
              const { oldIndex, newIndex } = evt;
              if (oldIndex === newIndex) return;
              const files = [...this.files];
              const moved = files.splice(oldIndex, 1)[0];
              files.splice(newIndex, 0, moved);
              this.$emit('sort-change', { oldIndex, newIndex, file: moved, files });
            }
          });
        });
      },
      destroySortable() {
        if (this.sortableInstance) {
          this.sortableInstance.destroy();
          this.sortableInstance = null;
        }
      },
      parsePercentage(val) {
        return parseInt(val, 10);
      },
      handleClick(file) {
        this.handlePreview && this.handlePreview(file);
      },
      handleNameMouseEnter(event) {
        const currentTarget = event.currentTarget;
        if (currentTarget.scrollWidth > currentTarget.clientWidth) {
          this.showToolTip(currentTarget);
        }
      },
      handleNameMouseLeave(event) {
        const currentTarget = event.currentTarget;
        this.hideToolTip(currentTarget);
      },
      showToolTip(target) {
        const tooltip = this.$refs.tooltip[0];
        if (tooltip) {
          this.tooltipContent = target.innerText;
          tooltip.referenceElm = target;
          tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none');
          tooltip.doDestroy();
          tooltip.setExpectedState(true);
          this.activateTooltip(tooltip);
        }
      },
      hideToolTip() {
        const tooltip = this.$refs.tooltip[0];
        if (tooltip) {
          tooltip.setExpectedState(false);
          tooltip.handleClosePopper();
        }
      }
    }
  };
</script>
<style>
  /* 拖拽手柄图标 */
  .el-upload-list__item-drag {
    margin-right: 6px;
    color: #c0c4cc;
    cursor: move;
    font-size: 14px;
    line-height: inherit;
    transition: color .2s;
  }
  .el-upload-list__item-drag:hover {
    color: #409eff;
  }
  /* 关键：覆盖 .el-upload-list__item 上的 transition: all .5s
     该 transition 会拦截 Sortable.js 设置的 transform，导致动画失效 */
  .el-upload-list.is-draggable .el-upload-list__item {
    transition: none;
  }
  /* 拖拽幽灵元素（占位提示） */
  .el-upload-list__item--ghost {
    opacity: 0.4;
    background: #ecf5ff !important;
    border: 1px dashed #409eff;
    border-radius: 4px;
  }
  /* 选中态 */
  .el-upload-list__item--chosen {
    background: #f0f9ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  /* 拖拽中 */
  .el-upload-list__item--drag {
    opacity: 0.9;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
</style>
