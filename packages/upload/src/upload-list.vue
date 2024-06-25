<template>
  <transition-group
    tag="ul"
    :class="[
      'el-upload-list',
      'el-upload-list--' + listType,
      { 'is-disabled': disabled }
    ]"
    name="el-list"
  >
    <li
      v-for="(file, index) in files"
      :class="['el-upload-list__item', 'is-' + file.status, focusing ? 'focusing' : '']"
      :key="index"
      tabindex="0"
      @keydown.delete="!disabled && $emit('remove', file)"
      @focus="focusing = true"
      @blur="focusing = false"
      @click.stop="focusing = false"
    >
      <el-tooltip v-if="index === 0" popper-class="tooltip-use-in-form" placement="top-start" :content="tooltipContent" ref="tooltip"></el-tooltip>
      <img
        class="el-upload-list__item-thumbnail"
        v-if="file.status !== 'uploading' && ['picture-card', 'picture'].indexOf(listType) > -1"
        :src="file[props['url']] || file.url" alt=""
      >
      <a class="el-upload-list__item-name" @mouseenter="handleNameMouseEnter" @mouseleave="handleNameMouseLeave" @click="handleClick(file)">
        <i class="el-icon-document" v-if="!$scopedSlots.default"></i>
        <template v-else>
          <slot :file="file"></slot>
        </template>
        {{ file[props['name']] || file.name }}
      </a>
      <label class="el-upload-list__item-status-label">
        <i :class="{
          'el-icon-upload-success': true,
          'el-icon-circle-check': listType === 'text',
          'el-icon-check': ['picture-card', 'picture'].indexOf(listType) > -1
        }"></i>
      </label>
      <i class="el-icon-close" v-if="!disabled" @click.stop="$emit('remove', file)"></i>
      <i class="el-icon-close-tip" v-if="!disabled">{{ t('el.upload.deleteTip') }}</i> <!--因为close按钮只在li:focus的时候 display, li blur后就不存在了，所以键盘导航时永远无法 focus到 close按钮上-->
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
    </li>
  </transition-group>
</template>
<script>
  import debounce from 'throttle-debounce/debounce';
  import Locale from 'element-ui/src/mixins/locale';
  import ElProgress from 'element-ui/packages/progress';

  export default {
    mixins: [Locale],

    data() {
      return {
        focusing: false,
        tooltipContent: ''
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
      props: {}
    },
    created() {
      this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper());
    },
    methods: {
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
