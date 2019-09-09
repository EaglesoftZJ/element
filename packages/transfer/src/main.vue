<template>
  <div class="el-transfer">
    <transfer-panel v-bind="$props" ref="leftPanel" :data="sourceData" :title="titles[0] || t('el.transfer.titles.0')" :default-checked="leftDefaultChecked" :placeholder="filterPlaceholder || t('el.transfer.filterPlaceholder')" @checked-change="onSourceCheckedChange"
      :drag="drag" :draggable-name="draggableName" draggable-sort @val-change="handleChange('left', arguments[0])" :buttons="buttons && []" :functions="functions && []">
      <slot name="left-footer"></slot>
    </transfer-panel>
    <div class="el-transfer__buttons">
      <el-button type="primary" :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']" @click.native="addToLeft" :disabled="rightChecked.length === 0">
        <i class="el-icon-arrow-left"></i>
        <span v-if="buttonTexts[0] !== undefined">{{ buttonTexts[0] }}</span>
      </el-button>
      <el-button type="primary" :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']" @click.native="addToRight" :disabled="leftChecked.length === 0">
        <span v-if="buttonTexts[1] !== undefined">{{ buttonTexts[1] }}</span>
        <i class="el-icon-arrow-right"></i>
      </el-button>
    </div>
    <transfer-panel v-bind="$props" ref="rightPanel" :data="targetData" :title="titles[1] || t('el.transfer.titles.1')" :default-checked="rightDefaultChecked" :placeholder="filterPlaceholder || t('el.transfer.filterPlaceholder')" @checked-change="onTargetCheckedChange"
      @val-change="handleChange('right', arguments[0])" :drag="drag" :draggable-name="draggableName" draggable-sort :buttons="buttons" :functions="functions">
      <slot name="right-footer"></slot>
    </transfer-panel>
  </div>
</template>

<script>
  import ElButton from 'element-ui/packages/button';
  import Emitter from 'element-ui/src/mixins/emitter';
  import Locale from 'element-ui/src/mixins/locale';
  import TransferPanel from './transfer-panel.vue';
  import Migrating from 'element-ui/src/mixins/migrating';
  export default {
    name: 'ElTransfer',
    componentName: 'ElTransfer',
    mixins: [Emitter, Locale, Migrating],
    components: {
      TransferPanel,
      ElButton
    },
    props: {
      data: {
        type: Array,
        default () {
          return [];
        }
      },
      titles: {
        type: Array,
        default () {
          return [];
        }
      },
      buttonTexts: {
        type: Array,
        default () {
          return [];
        }
      },
      filterPlaceholder: {
        type: String,
        default: ''
      },
      filterMethod: Function,
      leftDefaultChecked: {
        type: Array,
        default () {
          return [];
        }
      },
      rightDefaultChecked: {
        type: Array,
        default () {
          return [];
        }
      },
      renderContent: Function,
      value: {
        type: Array,
        default () {
          return [];
        }
      },
      format: {
        type: Object,
        default () {
          return {};
        }
      },
      filterable: Boolean,
      sort: Boolean,
      drag: Boolean,
      props: {
        type: Object,
        default () {
          return {
            label: 'label',
            key: 'key',
            disabled: 'disabled'
          };
        }
      },
      buttons: Array,
      functions: Array,
      targetOrder: {
        type: String,
        default: 'original'
      }
    },
    data() {
      return {
        leftChecked: [],
        rightChecked: [],
        leftData: [],
        leftValue: [],
        draggableName: '',
        allQuery: 0
      };
    },
    computed: {
      dataObj() {
        const key = this.props.key;
        return this.data.reduce((o, cur) => (o[cur[key]] = cur) && o, {});
      },
      sourceData() {
        if (this.sort) {
          return this.getArr(this.leftValue);
        } else {
          return this.data.filter(item => this.value.indexOf(item[this.props.key]) === -1);
        }
      },
      targetData() {
        if (this.sort) {
          return this.getArr(this.value);
        } else {
          return this.targetOrder === 'original' ?
            this.data.filter(item => this.value.indexOf(item[this.props.key]) > -1) :
            this.value.map(key => this.dataObj[key]);
        }
      },
      hasButtonTexts() {
        return this.buttonTexts.length === 2;
      }
    },
    watch: {
      value(val) {
        this.dispatch('ElFormItem', 'el.form.change', val);
      },
      leftData(val) {
        this.leftValue = val.map(item => item[this.props.key]);
      },
      data(val) {
        if (this.sort) {
          this.leftData = val.filter(item => this.value.indexOf(item[this.props.key]) === -1);
        }
      }
    },
    methods: {
      getArr(val) {
        let arr = [];
        let index;
        this.data.filter((item) => {
          index = val.indexOf(item[this.props.key]);
          if (index > -1) {
            arr[index] = item;
          }
        });
        return arr;
      },
      getMigratingConfig() {
        return {
          props: {
            'footer-format': 'footer-format is renamed to format.'
          }
        };
      },
      onSourceCheckedChange(val, movedKeys) {
        this.leftChecked = val;
        if (movedKeys === undefined) return;
        this.$emit('left-check-change', val, movedKeys);
      },
      onTargetCheckedChange(val, movedKeys) {
        this.rightChecked = val;
        if (movedKeys === undefined) return;
        this.$emit('right-check-change', val, movedKeys);
      },
      addToLeft() {
        let currentValue = this.value.slice();
        this.rightChecked.forEach(item => {
          const index = currentValue.indexOf(item);
          if (index > -1) {
            let arr = currentValue.splice(index, 1);
            this.leftValue = this.leftValue.concat(arr);
          }
        });
        this.$emit('input', currentValue);
        this.$emit('change', currentValue, 'left', this.rightChecked);
      },
      addToRight() {
        let currentValue = this.value.slice();
        const itemsToBeMoved = [];
        const key = this.props.key;
        this.data.forEach(item => {
          const itemKey = item[key];
          if (
            this.leftChecked.indexOf(itemKey) > -1 &&
            this.value.indexOf(itemKey) === -1
          ) {
            itemsToBeMoved.push(itemKey);
            let index = this.leftValue.indexOf(itemKey);
            this.leftValue.splice(index, 1);
          }
        });
        currentValue = this.targetOrder === 'unshift' ?
          itemsToBeMoved.concat(currentValue) :
          currentValue.concat(itemsToBeMoved);
        this.$emit('input', currentValue);
        this.$emit('change', currentValue, 'right', this.leftChecked);
      },
      handleChange(type, val) {
        let arr = [];
        if (type === 'right') {
          arr = val.map((item) => {
            return item[this.props.key];
          });
          this.$emit('input', arr);
        } else if (type === 'left') {
          this.leftData = val;
        }
      },
      clearQuery(which) {
        if (which === 'left') {
          this.$refs.leftPanel.query = '';
        } else if (which === 'right') {
          this.$refs.rightPanel.query = '';
        }
      }
    },
    created() {
      if (this.drag) {
        this.draggableName = 'transfer_' + new Date().getTime();
      }
      if (this.sort) {
        this.leftData = this.data.filter(item => this.value.indexOf(item[this.props.key]) === -1);
      }
    }
  };
</script>
