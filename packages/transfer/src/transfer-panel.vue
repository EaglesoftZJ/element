<template>
  <div class="el-transfer-panel">
    <p class="el-transfer-panel__header">
      <el-checkbox
        v-model="allChecked"
        @change="handleAllCheckedChange"
        :indeterminate="isIndeterminate">
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
    </p>
    
    <div :class="['el-transfer-panel__body', hasFooter ? 'is-with-footer' : '']">
      <el-input
        class="el-transfer-panel__filter"
        v-model="query"
        size="small"
        :placeholder="placeholder"
        @mouseenter.native="inputHover = true"
        @mouseleave.native="inputHover = false"
        v-if="filterable">
        <i slot="prefix"
          :class="['el-input__icon', 'el-icon-' + inputIcon]"
          @click="clearQuery"
        ></i>
      </el-input>
      <el-checkbox-group
        v-model="checked"
        v-show="drag || !hasNoMatch && data.length > 0"
        :class="{ 'is-filterable': filterable }"
        class="el-transfer-panel__list">
        <div style="width: 100%; height: 100%; overflow: hidden; position: relative;" ref="scroll-transfer">
        <el-checkbox
          v-if="!drag"
          class="el-transfer-panel__item"
          :label="item[keyProp]"
          :disabled="item[disabledProp]"
          :key="item[keyProp]"
          showTitle
          v-for="item in filteredData">
          <option-content :option="item"></option-content>
        </el-checkbox>
        <draggable v-if="drag" element="div" style="height: 100%;" :value="filteredData" :options="dragOption" @input="handleInput">
          <span class="el-transfer-panel__outer" style="display: block;" v-for="item in filteredData" :key="item[keyProp]">
           <el-checkbox
              class="el-transfer-panel__item"
              :style="{'padding-right': buttons && buttons.length > 0 && '60px'}"
              :label="item[keyProp]"
              :disabled="item[disabledProp]"
              :showTitle="item[labelProp]"
              @mousedown.native="check"
              @pointerdown.native="check"
           >
            <option-content :option="item"></option-content>
        </el-checkbox>
            <div class="btn-list" v-if="buttons && buttons.length > 0">
              <div :class="['btn-item', 'el-icon-' + btn.type, {'btn-item__select': btn.key && item[btn.key] === i}]" @click="functions[i](item[keyProp], btn, $event)" :title="btn.text" v-for="(btn, i) in buttons" :key="i"></div>
            </div>
          </span>
        </draggable>
      </div>
      </el-checkbox-group>
      <p
        class="el-transfer-panel__empty"
        v-show="hasNoMatch">{{ t('el.transfer.noMatch') }}</p>
      <p
        class="el-transfer-panel__empty"
        v-show="data.length === 0 && !hasNoMatch">{{ t('el.transfer.noData') }}</p>
    </div>
    <p class="el-transfer-panel__footer" v-if="hasFooter">
      <slot></slot>
    </p>
  </div>
</template>

<script>
  import ElCheckboxGroup from 'element-ui/packages/checkbox-group';
  import ElCheckbox from 'element-ui/packages/checkbox';
  import ElInput from 'element-ui/packages/input';
  import Locale from 'element-ui/src/mixins/locale';
  import draggable from 'vuedraggable';

  export default {
    mixins: [Locale],

    name: 'ElTransferPanel',

    componentName: 'ElTransferPanel',

    components: {
      ElCheckboxGroup,
      ElCheckbox,
      ElInput,
      draggable,
      OptionContent: {
        props: {
          option: Object
        },
        render(h) {
          const getParent = vm => {
            if (vm.$options.componentName === 'ElTransferPanel') {
              return vm;
            } else if (vm.$parent) {
              return getParent(vm.$parent);
            } else {
              return vm;
            }
          };
          const panel = getParent(this);
          const transfer = panel.$parent || panel;
          return panel.renderContent
            ? panel.renderContent(h, this.option)
            : transfer.$scopedSlots.default
              ? transfer.$scopedSlots.default({ option: this.option })
              : <span>{ this.option[panel.labelProp] || this.option[panel.keyProp] }</span>;
        }
      }
    },

    props: {
      data: {
        type: Array,
        default() {
          return [];
        }
      },
      drag: Boolean,
      draggableName: '',
      draggableSort: Boolean,
      renderContent: Function,
      placeholder: String,
      title: String,
      filterable: Boolean,
      format: Object,
      filterMethod: Function,
      defaultChecked: Array,
      props: Object,
      buttons: Array,
      functions: Array
    },

    data() {
      return {
        checked: [],
        allChecked: false,
        query: '',
        inputHover: false,
        canDrag: true,
        msg: false,
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
        parent: null,
        dragOption: {
          group: {
            name: this.draggableName,
            pull: true,
            put: true
          },
          animation: 150,
          sort: this.draggableSort
        },
        checkChangeByUser: true
      };
    },

    watch: {
      checked(val, oldVal) {
        this.updateAllChecked();
        if (this.checkChangeByUser) {
          const movedKeys = val.concat(oldVal)
            .filter(v => val.indexOf(v) === -1 || oldVal.indexOf(v) === -1);
          this.$emit('checked-change', val, movedKeys);
        } else {
          this.$emit('checked-change', val);
          this.checkChangeByUser = true;
        }
      },

      data() {
        const checked = [];
        const filteredDataKeys = this.filteredData.map(item => item[this.keyProp]);
        this.checked.forEach(item => {
          if (filteredDataKeys.indexOf(item) > -1) {
            checked.push(item);
          }
        });
        this.checkChangeByUser = false;
        this.checked = checked;
      },

      checkableData() {
        this.updateAllChecked();
      },
      query(val) {
        if (val && this.drag) {
          this.parent.allQuery++;
        } else {
          this.parent.allQuery--;
        }
      },
      defaultChecked: {
        immediate: true,
        handler(val, oldVal) {
          if (oldVal && val.length === oldVal.length &&
            val.every(item => oldVal.indexOf(item) > -1)) return;
          const checked = [];
          const checkableDataKeys = this.checkableData.map(item => item[this.keyProp]);
          val.forEach(item => {
            if (checkableDataKeys.indexOf(item) > -1) {
              checked.push(item);
            }
          });
          this.checkChangeByUser = false;
          this.checked = checked;
        }
      }
    },

    computed: {
      filteredData() {
        return this.data.filter(item => {
          if (typeof this.filterMethod === 'function') {
            return this.filterMethod(this.query, item);
          } else {
            const label = item[this.labelProp] || item[this.keyProp].toString();
            return label.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
          }
        });
      },

      checkableData() {
        return this.filteredData.filter(item => !item[this.disabledProp]);
      },

      checkedSummary() {
        const checkedLength = this.checked.length;
        const dataLength = this.data.length;
        const { noChecked, hasChecked } = this.format;
        if (noChecked && hasChecked) {
          return checkedLength > 0
            ? hasChecked.replace(/\${checked}/g, checkedLength).replace(/\${total}/g, dataLength)
            : noChecked.replace(/\${total}/g, dataLength);
        } else {
          return `${ checkedLength }/${ dataLength }`;
        }
      },

      isIndeterminate() {
        const checkedLength = this.checked.length;
        return checkedLength > 0 && checkedLength < this.checkableData.length;
      },

      hasNoMatch() {
        return this.query.length > 0 && this.filteredData.length === 0;
      },

      inputIcon() {
        return this.query.length > 0 && this.inputHover
          ? 'circle-close'
          : 'search';
      },

      labelProp() {
        return this.props.label || 'label';
      },

      keyProp() {
        return this.props.key || 'key';
      },

      disabledProp() {
        return this.props.disabled || 'disabled';
      },

      hasFooter() {
        return !!this.$slots.default;
      }
    },

    methods: {
      getParent() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName === 'ElTransfer') {
            this.parent = parent;
            break;
          }
          parent = parent.$parent;
        }
      },
      updateAllChecked() {
        const checkableDataKeys = this.checkableData.map(item => item[this.keyProp]);
        this.allChecked = checkableDataKeys.length > 0 &&
          checkableDataKeys.every(item => this.checked.indexOf(item) > -1);
      },

      handleAllCheckedChange(value) {
        this.checked = value
          ? this.checkableData.map(item => item[this.keyProp])
          : [];
      },

      clearQuery() {
        if (this.inputIcon === 'circle-close') {
          this.query = '';
        }
      },
      handleInput(val) {
        this.$emit('val-change', val);
      },
      check: function(evt) {
        evt = evt || window.event;
        if (this.parent.allQuery !== 0) {
          this.x1 = evt.clientX;
          this.y1 = evt.clientY;
          this.canDrag = false;
          evt.stopPropagation();
        }
      },
      handleUp: function() {
        this.canDrag = true;
        this.msg = false;
      },
      handleMove: function(evt) {
        evt = evt || window.event;
        if (!this.canDrag && !this.msg) {
          this.x2 = evt.clientX;
          this.y2 = evt.clientY;
          let x = Math.abs(this.x1 - this.x2);
          let y = Math.abs(this.y1 - this.y2);
          if (x < 10 && y < 10) {
            return;
          }
          this.$message({
            message: '筛选状态下不支持拖拽，请用按钮进行操作',
            type: 'warning'
          });
          this.msg = true;
        }
      }
    },
    created() {
      if (this.drag) {
        this.getParent();
        document.addEventListener('mouseup', this.handleUp);
        document.addEventListener('mousemove', this.handleMove);
      }
    },
    mounted() {
      console.log('buttons', this.buttons);
      this.$sbar && this.$sbar.use(this.$refs, this);
    },
    destoryed() {
      if (this.drag) {
        document.removeEventListener('mouseup', this.handleUp);
        document.removeEventListener('mousemove', this.handleMove);
      }
    }
  };
</script>
