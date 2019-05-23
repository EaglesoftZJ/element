<template>
  <div class="el-table" :class="[{
              'el-table--fit': fit,
              'el-table--striped': stripe,
              'el-table--border': border || isGroup,
              'el-table--hidden': isHidden,
              'el-table--group': isGroup,
              'el-table--fluid-height': maxHeight,
                'el-table--fit-height': fitHeight,
              'el-table--scrollable-x': layout.scrollX,
              'el-table--scrollable-y': layout.scrollY,
              'el-table--enable-row-hover': !store.states.isComplex,
              'el-table--enable-row-transition': (store.states.data || []).length !== 0 && (store.states.data || []).length < 100
            }, tableSize ? `el-table--${ tableSize }` : '']" @mouseleave="handleMouseLeave($event)" :style="fitHeight ? fitHeightStyle  : ''">
    <div class="hidden-columns" ref="hiddenColumns">
      <slot></slot>
    </div>
    <div v-if="showHeader" v-mousewheel="handleHeaderFooterMousewheel" class="el-table__header-wrapper" :style="fitHeight ? fitHeightHeaderStyle  : ''" ref="headerWrapper">
      <table-header ref="tableHeader" :store="store" :border="border" :default-sort="defaultSort" :style="{
                  width: layout.bodyWidth ? layout.bodyWidth + 'px' : ''
                }">
      </table-header>
    </div>
    <div class="el-table__body-wrapper" ref="bodyWrapper" :class="[layout.scrollX ? `is-scrolling-${scrollPosition}` : 'is-scrolling-none']" @scroll="tableScroll" :style="fitHeight ? fitHeightBodyStyle  : [bodyHeight]">
      <table-body :context="context" :store="store" :stripe="stripe" :row-class-name="rowClassName" :row-style="rowStyle" :highlight="highlightCurrentRow" :style="{
                   width: bodyWidth
                }">
      </table-body>
      <div v-if="(!data || data.length === 0) &&  bindData.length === 0" class="el-table__empty-block" ref="emptyBlock" :style="{
                  width: bodyWidth
                }">
        <span class="el-table__empty-text">
                  <slot name="empty">{{ egLoading ? '数据加载中' : (emptyText || t('el.table.emptyText')) }}</slot>
                </span>
      </div>
      <div v-if="$slots.append" class="el-table__append-wrapper" ref="appendWrapper">
        <slot name="append"></slot>
      </div>
    </div>
    <div :class="{ 
              'el-table__footer-wrapper': false,
              'el-table__footer-wrapper-egfooter': true
              }" v-if="isShowTotal" ref="footerWrapper" :style="fitHeight ? fitHeightFooterStyle  : 'width:100%;box-sizing:border-box;'">
      <span class="EgGridView_BottomInfo_recordCount">
                共约&nbsp;<font color="red" id="GV_Show_recordCount">{{ recordTotal }}</font>&nbsp;条记录
              </span> ,
      <span class="EgGridView_BottomInfo_loadedCount">
                已加载&nbsp;<font color="red" id="GV_Show_loadedCount">{{ loadedRecordTotal }}</font>&nbsp;条
              </span>
      <span v-if="exportAction !== ''" class="EgGridView_BottomInfo_excel" title="导出excel。如果数据多，可能需要一段时间，请耐心等待！" @click="exportExcel"></span>
    </div>
    <div v-else-if="showSummary" v-show="data && data.length > 0" v-mousewheel="handleHeaderFooterMousewheel" class="el-table__footer-wrapper" ref="footerWrapper">
      <table-footer :store="store" :border="border" :sum-text="sumText || t('el.table.sumText')" :summary-method="summaryMethod" :default-sort="defaultSort" :style="{
                  width: layout.bodyWidth ? layout.bodyWidth + 'px' : ''
                }">
      </table-footer>
    </div>
    <div v-if="fixedColumns.length > 0" v-mousewheel="handleFixedMousewheel" class="el-table__fixed" ref="fixedWrapper" :style="[{
                width: layout.fixedWidth ? layout.fixedWidth + 'px' : ''
              },
               fitHeight ? fixedHeightFitHeight :fixedHeight]">
      <div v-if="showHeader" class="el-table__fixed-header-wrapper" ref="fixedHeaderWrapper">
        <table-header ref="fixedTableHeader" fixed="left" :border="border" :store="store" :style="{
                    width: bodyWidth
                  }"></table-header>
      </div>
      <div class="el-table__fixed-body-wrapper" ref="fixedBodyWrapper" :style="[{
                  top: layout.headerHeight + 'px'
                },
                fitHeight ? fixedBodyHeightFitHeight : fixedBodyHeight]">
        <table-body fixed="left" :store="store" :stripe="stripe" :highlight="highlightCurrentRow" :row-class-name="rowClassName" :row-style="rowStyle" :style="{
                    width: bodyWidth
                  }">
        </table-body>
        <div v-if="$slots.append" class="el-table__append-gutter" :style="{
                    height: layout.appendHeight + 'px'
                  }"></div>
      </div>
      <div v-if="showSummary" v-show="data && data.length > 0" class="el-table__fixed-footer-wrapper" ref="fixedFooterWrapper">
        <table-footer fixed="left" :border="border" :sum-text="sumText || t('el.table.sumText')" :summary-method="summaryMethod" :store="store" :style="{
                    width: bodyWidth
                  }"></table-footer>
      </div>
    </div>
    <div v-if="rightFixedColumns.length > 0" v-mousewheel="handleFixedMousewheel" :class="['el-table__fixed-right', isShowTotal && 'is-bottom-border-hide']" ref="rightFixedWrapper" :style="[{
                width: layout.rightFixedWidth ? layout.rightFixedWidth + 'px' : '',
                right: layout.scrollY ? (border ? layout.gutterWidth : (layout.gutterWidth || 0)) + 'px' : ''
              },
               fitHeight ? fixedHeightFitHeight :fixedHeight]">
      <div v-if="showHeader" class="el-table__fixed-header-wrapper" ref="rightFixedHeaderWrapper">
        <table-header ref="rightFixedTableHeader" fixed="right" :border="border" :store="store" :style="{
                    width: bodyWidth
                  }"></table-header>
      </div>
      <div class="el-table__fixed-body-wrapper" ref="rightFixedBodyWrapper" :style="[{
                  top: layout.headerHeight + 'px'
                },
                 fitHeight ? fixedBodyHeightFitHeight : fixedBodyHeight]">
        <table-body fixed="right" :store="store" :stripe="stripe" :row-class-name="rowClassName" :row-style="rowStyle" :highlight="highlightCurrentRow" :style="{
                    width: bodyWidth
                  }">
        </table-body>
      </div>
      <div v-if="showSummary" v-show="data && data.length > 0" class="el-table__fixed-footer-wrapper" ref="rightFixedFooterWrapper">
        <table-footer fixed="right" :border="border" :sum-text="sumText || t('el.table.sumText')" :summary-method="summaryMethod" :store="store" :style="{
                    width: bodyWidth
                  }"></table-footer>
      </div>
    </div>
    <div v-if="rightFixedColumns.length > 0" class="el-table__fixed-right-patch" ref="rightFixedPatch" :style="{
                width: layout.scrollY ? layout.gutterWidth + 'px' : '0',
                height: layout.headerHeight + 'px'
              }"></div>
    <div class="el-table__column-resize-proxy" ref="resizeProxy" v-show="resizeProxyVisible"></div>
  </div>
</template>

<script type="text/babel">
  import ElCheckbox from 'element-ui/packages/checkbox';
  import debounce from 'throttle-debounce/debounce';
  import {
    addResizeListener,
    removeResizeListener
  } from 'element-ui/src/utils/resize-event';
  import Mousewheel from 'element-ui/src/directives/mousewheel';
  import Locale from 'element-ui/src/mixins/locale';
  import Migrating from 'element-ui/src/mixins/migrating';
  import TableStore from './table-store';
  import TableLayout from './table-layout';
  import TableBody from './table-body';
  import TableHeader from './table-header';
  import TableFooter from './table-footer';
  let tableIdSeed = 1;
  export default {
    name: 'ElTable',
    componentName: 'ElTable',
    mixins: [Locale, Migrating],
    directives: {
      Mousewheel
    },
    props: {
      data: {
        type: Array,
        default: function() {
          return [];
        }
      },
      actionShowTotal: {
        type: Boolean,
        default: true
      },
      size: String,
      width: [String, Number],
      height: [String, Number],
      maxHeight: [String, Number],
      fit: {
        type: Boolean,
        default: true
      },
      stripe: Boolean,
      border: Boolean,
      rowKey: [String, Function],
      context: {},
      showHeader: {
        type: Boolean,
        default: true
      },
      showSummary: Boolean,
      sumText: String,
      summaryMethod: Function,
      rowClassName: [String, Function],
      rowStyle: [Object, Function],
      cellClassName: [String, Function],
      cellStyle: [Object, Function],
      headerRowClassName: [String, Function],
      headerRowStyle: [Object, Function],
      headerCellClassName: [String, Function],
      headerCellStyle: [Object, Function],
      highlightCurrentRow: Boolean,
      currentRowKey: [String, Number],
      emptyText: String,
      expandRowKeys: Array,
      defaultExpandAll: Boolean,
      defaultSort: Object,
      tooltipEffect: String,
      spanMethod: Function,
      selectOnIndeterminate: {
        type: Boolean,
        default: true
      },
      /* start */
      action: {
        type: String,
        default: ''
      },
      exportAction: {
        type: String,
        default: ''
      },
      jsontype: Boolean,
      callback: {
        type: Function
      },
      fitHeight: Boolean,
      id: String,
      queryData: {
        type: Object,
        default () {
          return {};
        }
      },
      primaryKey: {
        type: String
      },
      orderBy: {
        type: String,
        default: ''
      },
      sortType: {
        type: String,
        default: ''
      },
      showTotal: {
        type: Boolean,
        default: false
      },
      pageing: { // 非远程数据时生效
        type: Boolean,
        default: false
      },
      customPageSize: { // 自定义分页
        type: String
      },
      refreshBindQuery: { // 刷新请求是否绑定queryData
        type: Boolean,
        default: true
      }
      /* end */
    },
    components: {
      TableHeader,
      TableFooter,
      TableBody,
      ElCheckbox
    },
    methods: {
      /* 自已加的方法开始 */
      dataBind() {
        return new Promise((resolve) => {
          if (this.egLoading) return;
          if (this.action !== '') {
            this.egLoading = true;
            this.nowQueryData['pageNum'] = this.start !== -1 ? this.start : (this.pageNum * this.pageSize - this.deleteNum);
            this.nowQueryData['pageSize'] = this.pageSize;
            this.nowQueryData['orderBy'] = this.store.states.orderBy;
            this.nowQueryData['sortType'] = this.store.states.sortType;
            //   var options = {
            //       url: this.action,
            //       data: this.nowQueryData,
            //       jsontype: this.jsontype && 'json',
            //       type: 'post',
            //       success: function(res) {
            //           res[0].data.forEach((row)=>{
            //               this.bindData.push(row);
            //           });
            //           this.recordTotal = res[0].total;
            //           this.loadedRecordTotal = this.bindData.length;
            //           if ((res[0].data.length === 0) || (res[0].data.length < this.pageSize)) {
            //             this.nodata = true;
            //           }
            //           this.store.commit('setData', this.bindData);
            //           this.doLayout();
            //           this.egLoading = false;
            //           this.callback && this.callback(res);
            //       }
            //   };
            this.$axios && this.$axios.DTO(this.action, this.nowQueryData).then(res => {
              res[0].data.forEach(row => {
                this.bindData.push(row);
              });
              this.recordTotal = res[0].total;
              this.loadedRecordTotal = this.bindData.length;
              if (res[0].data.length === 0 ||
                (this.recordTotal || this.recordTotal === 0) && res[0].data.length < this.pageSize
              ) {
                this.nodata = true;
              }
              // 存在不知道总数的情况，这时候没有返回总数值，并且可能返回数不等于请求数，需要重定义当前加载数
              if (!this.recordTotal && (res[0].pageNum || res[0].pageNum === 0)) {
                this.start = res[0].pageNum;
              }
              this.store.commit('setData', this.bindData);
              this.egLoading = false;
              this.callback && this.callback(res);
              this.$nextTick(() => {
                this.doLayout();
                this.setScrollPosition();
              });
              resolve();
            });
          } else if (this.pageing) {
            var index = this.pageNum * this.pageSize - this.deleteNum + this.pageSize;
            this.bindData = this.data.slice(0, index);
            this.recordTotal = this.data.length;
            this.loadedRecordTotal = this.bindData.length;
            this.store.commit('setData', this.bindData);
            resolve();
          }
        });
      },
      getQueryData() {
        this.nowQueryData = JSON.parse(JSON.stringify(this.queryData));
      },
      refresh(refdata, callback) {
        if (refdata.statusCode === this.$const.code.DELETE_SUCCESS) {
          this.delete(refdata, true);
          this.recordTotal--;
          this.loadedRecordTotal--;
         callback && callback(refdata.statusCode);
          return;
        }
        refdata['egGridviewGetRow'] = true;
        refdata['pageNum'] = 0;
        refdata['pageSize'] = 10;
        var postData = refdata;
        if (this.refreshBindQuery && window.$) {
          postData = window.$.extend({}, this.nowQueryData, refdata);
        }
        var options = {
          url: this.action,
          data: postData,
          jsontype: this.jsontype && 'json',
          type: 'post',
          success: function(result) {
            let res = refdata.statusCode;
            if (refdata.statusCode === this.$const.code.INSERT_SUCCESS && result[0].data && result[0].data[0]) {
              this.bindData.unshift(result[0].data[0]);
              this.recordTotal++;
              this.loadedRecordTotal++;
              result[0].data.length === 0 && (res = '');
            } else if (refdata.statusCode === this.$const.code.UPDATE_SUCCESS && result[0].data && result[0].data[0]) {
              var rowIndex = this.getRefreshRowIndex(
                result[0].data[0][this.primaryKey]
              );
              this.bindData.splice(rowIndex, 1, result[0].data[0]);
            } else {
              this.delete(refdata);
            }
            callback && callback(res);
            this.store.commit('setData', this.bindData);
            this.callback && this.callback(result);
          }
        };
        this.$axios && this.$axios.DTO(this.action, postData).then(res => {
          if (refdata.statusCode === this.$const.code.INSERT_SUCCESS && res[0].data && res[0].data[0]) {
            this.bindData.unshift(res[0].data[0]);
            if (!this.action) {
              this.data.push(res[0].data[0]);
            }
            this.recordTotal++;
            this.loadedRecordTotal++;
          } else if (refdata.statusCode === this.$const.code.UPDATE_SUCCESS && res[0].data && res[0].data[0]) {
            var rowIndex = this.getRefreshRowIndex(
              res[0].data[0][this.primaryKey]
            );
            this.bindData.splice(rowIndex, 1, res[0].data[0]);
            if (!this.action) {
              this.data.splice(rowIndex, 1, res[0].data[0]);
            }
          } else {
            this.delete(refdata);
          }
          this.store.commit('setData', this.bindData);
          this.$nextTick(() => {
            this.doLayout();
            this.setScrollPosition();
          });
          this.callback && this.callback(res);
        });
      },
      delete(result, trueDelete) {
        var rowIndex = this.getRefreshRowIndex(result[this.primaryKey]);
        if (!rowIndex && rowIndex !== 0) return;
        this.bindData.splice(rowIndex, 1);
        this.store.commit('setData', this.bindData);
        if (!this.action) {
          this.data.splice(rowIndex, 1);
        }
        trueDelete && this.deleteNum++;
      },
      getRefreshRowIndex(val) {
        for (var i = 0; i < this.bindData.length; i++) {
          if (this.bindData[i][this.primaryKey] === val) {
            return i;
          }
        }
      },
      getScrollTop() {
        return this.$refs.bodyWrapper ? this.$refs.bodyWrapper.scrollTop : -1;
      },
      tableScroll(ev) {
        if (this.action || this.pageing) {
          // 绑定远程滚动加载的处理
          let nDivHight = this.$refs.bodyWrapper ? this.$refs.bodyWrapper.offsetHeight : 0;
          let nScrollHight = this.$refs.bodyWrapper ? this.$refs.bodyWrapper.scrollHeight : 0;
          let nScrollTop = this.$refs.bodyWrapper ? this.$refs.bodyWrapper.scrollTop : -1;
          if (Math.ceil(nScrollTop) + Math.ceil(nDivHight) >= Math.floor(nScrollHight) && !this.egLoading && this.nodata === false) {
            this.pageNum += 1;
            this.dataBind();
          }
        }
        this.currentScroll = this.$refs.bodyWrapper && this.$refs.bodyWrapper.scrollTop;
        this.$emit('table-scroll', ev);
      },
      exportExcel() {
        if (this.exportAction !== '') {
          this.nowQueryData['pageNum'] = 0;
          this.nowQueryData['pageSize'] = 147483648;
          this.nowQueryData['orderBy'] = this.store.states.orderBy;
          this.nowQueryData['sortType'] = this.store.states.sortType;
          let exportData = this.nowQueryData;
          exportData['columns'] = this.egColumns;
          // var options = {
          //     url: this.exportAction,
          //     type: 'post',
          //     data: exportData,
          //     success: function(res) {
          //         window.location.href = '/rest/export/exportExcel?url=' + res.url + '&filename=' + res.fileName;
          //     }
          // };
          // this.$eg.ajax(null, options);
          this.$axios && this.$axios.DTO(this.exportAction, exportData).then(res => {
            window.location.href = '/rest/export/exportExcel?url=' + res.url + '&filename=' + res.fileName;
          });
        }
      },
      // 对外接口
      resetGrid() {
        // 重置数据
        this.nodata = false;
        this.bindData.splice(0, this.bindData.length);
        this.getQueryData();
        // 存储索引值初始化
        this.start = -1;
        this.pageNum = 0;
        this.deleteNum = 0;
        if (this.getScrollTop() === 0) {
          this.dataBind();
        } else {
          this.pageNum = -1;
        }
      },
      refreshGrid(obj) {
        // 更新表格数据
        this.refresh(obj);
      },
      // 改变位置
      changeWzh(data, newIndex) {
        let linq = this.$linq;
        if (!linq) {
          linq = require('linq');
        }
        const dataList = this.action ? this.bindData : this.data;
        const keys = linq.from(dataList).select((item) => {
          return item[this.primaryKey];
        }).toArray();
        let oldIndex = keys.indexOf(data[this.primaryKey]);
        try {
          $.extend(dataList[oldIndex], data);
        } catch (error) {
          
        }
        if (oldIndex !== -1 && newIndex >= 0 && newIndex < dataList.length) {
          dataList.splice(newIndex, 0, dataList.splice(oldIndex, 1)[0]);
          this.store.commit('setData', dataList);
        }
      },
      // 交换位置
      // exchangeWzh(data1, data2) {
      //   // 获取数据的位置
      //   Promise.all([getIndex.call(this, data1), getIndex.call(this, data2)]).then((results) => {
      //     console.log(1, results);
      //     results.sort((a, b) => {
      //       return a - b;
      //     });
      //     let index1 = results[0];
      //     let index2 = results[1];
      //     if (index1 > -1 && index2 > -1) {
      //       this.bindData.splice(index1, 1, this.bindData.splice(index2, 1, this.bindData[index1])[0]);
      //       this.store.commit('setData', this.bindData);
      //     }
          
      //   }).catch((results) => {
      //     console.log(2, results);
      //   })
      //   function getIndex(data) {
      //     return new Promise((resolve) => {
      //       let linq = this.$linq;
      //       if (!linq) {
      //         linq = require('linq');
      //       }
      //       const keys = linq.from(this.bindData).select((item) => {
      //         return item[this.primaryKey];
      //       }).toArray();
      //       let index = keys.indexOf(data[this.primaryKey]);
      //       if (index === -1) {
      //         // 不存在与当前数据中，请求新数据
      //         let obj = $.extend({statusCode: this.$const.code.INSERT_SUCCESS}, data);
      //         this.refresh(obj, (res) => {
      //           if (res) {
      //             resolve(0);
      //           } else {
      //             reject();
      //           }
      //         })
      //       } else {
      //         resolve(index);
      //       }
      //     });
      //   }
      // },
      orderGird(column) {
        // 排序
        this.nodata = false;
        this.bindData.splice(0, this.bindData.length);
        this.pageNum = 0;
         // 存储索引值初始化
        this.start = -1;
        this.store.states.orderBy = column.property;
        this.store.states.sortType = column.order === 'ascending' ? 'asc' : 'desc';
        if (this.getScrollTop() === 0) {
          this.dataBind();
        } else {
          this.pageNum = -1;
        }
      },
      /* 自已加的方法结束 */
      getMigratingConfig() {
        return {
          events: {
            expand: 'expand is renamed to expand-change'
          }
        };
      },
      setCurrentRow(row) {
        this.store.commit('setCurrentRow', row);
      },
      toggleRowSelection(row, selected) {
        this.store.toggleRowSelection(row, selected);
        this.store.updateAllSelected();
      },
      toggleRowExpansion(row, expanded) {
        this.store.toggleRowExpansion(row, expanded);
      },
      clearSelection() {
        this.store.clearSelection();
      },
      clearFilter() {
        this.store.clearFilter();
      },
      clearSort() {
        this.store.clearSort();
      },
      handleMouseLeave() {
        this.store.commit('setHoverRow', null);
        if (this.hoverState) this.hoverState = null;
      },
      updateScrollY() {
        this.layout.updateScrollY();
      },
      handleFixedMousewheel(event, data) {
        const bodyWrapper = this.bodyWrapper;
        if (Math.abs(data.spinY) > 0) {
          const currentScrollTop = bodyWrapper.scrollTop;
          if (data.pixelY < 0 && currentScrollTop !== 0) {
            event.preventDefault();
          }
          if (data.pixelY > 0 && bodyWrapper.scrollHeight - bodyWrapper.clientHeight > currentScrollTop) {
            event.preventDefault();
          }
          bodyWrapper.scrollTop += Math.ceil(data.pixelY / 5);
        } else {
          bodyWrapper.scrollLeft += Math.ceil(data.pixelX / 5);
        }
      },
      handleHeaderFooterMousewheel(event, data) {
        const {
          pixelX,
          pixelY
        } = data;
        if (Math.abs(pixelX) >= Math.abs(pixelY)) {
          event.preventDefault();
          this.bodyWrapper.scrollLeft += data.pixelX / 5;
        }
      },
      setScrollPosition() {
        const {
          headerWrapper,
          footerWrapper
        } = this.$refs;
        const refs = this.$refs;
        let self = this;
        if (!this.bodyWrapper) {
          return;
        }
        const scrollYWidth = this.layout.scrollY ? this.layout.gutterWidth : 0;
        if (headerWrapper) headerWrapper.scrollLeft = this.bodyWrapper.scrollLeft;
        if (footerWrapper) footerWrapper.scrollLeft = this.bodyWrapper.scrollLeft;
        if (refs.fixedBodyWrapper) refs.fixedBodyWrapper.scrollTop = this.bodyWrapper.scrollTop;
        if (refs.rightFixedBodyWrapper) refs.rightFixedBodyWrapper.scrollTop = this.bodyWrapper.scrollTop;
        const maxScrollLeftPosition = this.bodyWrapper.scrollWidth - this.bodyWrapper.offsetWidth + scrollYWidth;
        const scrollLeft = this.bodyWrapper.scrollLeft;
        // console.log('123', scrollLeft, maxScrollLeftPosition, this.bodyWrapper.scrollWidth, this.bodyWrapper.offsetWidth, scrollYWidth);
        if (scrollLeft >= maxScrollLeftPosition) {
          self.scrollPosition = 'right';
        } else if (scrollLeft === 0) {
          self.scrollPosition = 'left';
        } else {
          self.scrollPosition = 'middle';
        }
      },
      bindEvents() {
        var self = this;
        this.bodyWrapper.addEventListener('scroll', function() {
          self.setScrollPosition();
        });
        if (this.fit) {
          addResizeListener(this.$el, this.resizeListener);
          this.doLayout();
          this.egBodyWidth = this.$refs.bodyWrapper.offsetWidth;
        }
      },
      resizeListener() {
        if (!this.$ready) return;
        let shouldUpdateLayout = false;
        const el = this.$el;
        const {
          width: oldWidth,
          height: oldHeight
        } = this.resizeState;
        const width = el.clientWidth; // 原来是offsetWidth会取到border的宽度
        if (oldWidth !== width) {
          shouldUpdateLayout = true;
        }
        console.log('shouldUpdateLayout bodyWidth', shouldUpdateLayout, oldWidth, width);
        const height = el.offsetHeight;
        if ((this.height || this.shouldUpdateHeight) && oldHeight !== height) {
          shouldUpdateLayout = true;
        }
        if (this.fitHeight && !this.customPageSize) {
          this.pageSize = parseInt(this.$refs.bodyWrapper.clientHeight / 35, 10);
          this.pageSize = this.pageSize <= 1 ? 1 : this.pageSize;
        }
        if (shouldUpdateLayout) {
          this.resizeState.width = width;
          this.resizeState.height = height;
          this.doLayout();
        }

        this.setScrollPosition();
      },
      doLayout() {
        this.updateScrollY();
        this.layout.updateColumnsWidth();
        if (this.shouldUpdateHeight) {
          this.layout.updateElsHeight();
        }
        if (this.fitHeight) {
          this.layout.setHeight(this.$refs.bodyWrapper ? this.$refs.bodyWrapper.clientHeight : 0);
        }
        if (this.bindData.length > 0) {
          this.tableScroll(null);
        }
      }
    },
    created() {
      this.tableId = 'el-table_' + tableIdSeed++;
      this.debouncedUpdateLayout = debounce(50, () => this.doLayout());
      this.getQueryData();
      if (this.pageing) {
        this.store.commit('setData', []);
      }
    },
    computed: {
      /* start */
      fitHeightStyle() {
        return 'width:100%;height:100%;box-sizing:border-box;padding:' + (this.layout.headerHeight ? this.layout.headerHeight : 0) + 'px 0px ' + (this.layout.footerHeight ? this.layout.footerHeight : 0) + 'px';
      },
      fitHeightHeaderStyle() {
        return 'position:relative;top:-' + (this.layout.headerHeight ? this.layout.headerHeight : 0) + 'px';
      },
      fitHeightBodyStyle() {
        return 'position:relative;height:100%;top:-' + (this.layout.headerHeight ? this.layout.headerHeight : 0) + 'px';
      },
      fitHeightFooterStyle() {
        return 'width:100%;box-sizing:border-box;position:relative;top:-' + (this.layout.headerHeight ? this.layout.headerHeight : 0) + 'px';
      },
      fixedHeightFitHeight() {
        let style = {};
        if (this.layout.scrollX) {
          style = {
            height: 'auto',
            bottom: (this.layout.gutterWidth + this.layout.footerHeight) + 'px'
          };
        } else {
          style = {
            height: 'auto',
            bottom: this.layout.footerHeight + 'px'
          };
        }
        return style;
      },
      isShowTotal() {
        return this.action && this.actionShowTotal || this.showTotal;
      },
      /* end */
      tableSize() {
        return this.size || (this.$ELEMENT || {}).size;
      },
      bodyWrapper() {
        return this.$refs.bodyWrapper;
      },
      shouldUpdateHeight() {
        return this.height ||
          this.maxHeight ||
          this.fixedColumns.length > 0 ||
          this.rightFixedColumns.length > 0;
      },
      selection() {
        return this.store.states.selection;
      },
      columns() {
        return this.store.states.columns;
      },
      tableData() {
        return this.store.states.data;
      },
      fixedColumns() {
        return this.store.states.fixedColumns;
      },
      rightFixedColumns() {
        return this.store.states.rightFixedColumns;
      },
      bodyWidth() {
        const {
          bodyWidth,
          scrollY,
          gutterWidth
        } = this.layout;
        return bodyWidth ? bodyWidth - (scrollY ? gutterWidth : 0) + 'px' : '';
      },
      bodyHeight() {
        if (this.height) {
          return {
            height: this.layout.bodyHeight ? this.layout.bodyHeight + 'px' : ''
          };
        } else if (this.maxHeight) {
          return {
            'max-height': (this.showHeader ?
              this.maxHeight - this.layout.headerHeight - this.layout.footerHeight :
              this.maxHeight - this.layout.footerHeight) + 'px'
          };
        }
        return {};
      },
      fixedBodyHeight() {
        if (this.height) {
          return {
            height: this.layout.fixedBodyHeight ? this.layout.fixedBodyHeight + 'px' : ''
          };
        } else if (this.maxHeight) {
          let maxHeight = this.layout.scrollX ? this.maxHeight - this.layout.gutterWidth : this.maxHeight;
          if (this.showHeader) {
            maxHeight -= this.layout.headerHeight;
          }
          maxHeight -= this.layout.footerHeight;
          return {
            'max-height': maxHeight + 'px'
          };
        }
        return {};
      },
      fixedBodyHeightFitHeight() {
        let style = {
          height: 'auto',
          bottom: '0px',
          right: '0px'
        };
        return style;
      },
      fixedHeight() {
        if (this.maxHeight) {
          if (this.showSummary) {
            return {
              bottom: 0
            };
          }
          return {
            bottom: (this.layout.scrollX && this.data.length) ? this.layout.gutterWidth + 'px' : ''
          };
        } else {
          if (this.showSummary) {
            return {
              height: this.layout.tableHeight ? this.layout.tableHeight + 'px' : ''
            };
          }
          return {
            height: this.layout.viewportHeight ? this.layout.viewportHeight + 'px' : ''
          };
        }
      }
    },
    watch: {
      height: {
        immediate: true,
        handler(value) {
          this.layout.setHeight(value);
          /* start */
          // 根据设置的高度得到pageSize
          if (value && !this.customPageSize) {
            this.pageSize = parseInt(value / 35, 10);
            this.pageSize = this.pageSize <= 1 ? 1 : this.pageSize;
            this.layout.setHeight(value);
          }
          /* end */
        }
      },
      maxHeight: {
        immediate: true,
        handler(value) {
          this.layout.setMaxHeight(value);
        }
      },
      currentRowKey(newVal) {
        this.store.setCurrentRowKey(newVal);
      },
      data: {
        immediate: true,
        handler(value) {
          /* start */
          // if (!this.action) {
          //     this.store.commit('setData', value);
          // }
          if (!this.pageing) {
            // 不分页直接赋值
            this.recordTotal = value.length;
            this.loadedRecordTotal = value.length;
            this.store.commit('setData', value);
          }
          /* end */
          if (this.$ready) {
            this.$nextTick(() => {
              this.doLayout();
              this.setScrollPosition();
            });
          }
        }
      },
      expandRowKeys: {
        immediate: true,
        handler(newVal) {
          if (newVal) {
            this.store.setExpandRowKeys(newVal);
          }
        }
      },
      bindData(val) {
        // 当数据总长度小于pageSize自动请求
        let nScrollTop = this.$refs.bodyWrapper ? this.$refs.bodyWrapper.scrollTop : -1;
        if (!this.nodata && val.length && val.length < this.pageSize && !nScrollTop) {
          this.pageNum += 1;
          this.dataBind();
        }
      }
    },
    destroyed() {
      if (this.resizeListener) removeResizeListener(this.$el, this.resizeListener);
    },
    mounted() {
      /* start */
      this.$parent && (this.$parent['eg_dataOld'] = this.bindData);
      if (this.fitHeight && !this.customPageSize) {
        this.pageSize = parseInt(this.$refs.bodyWrapper.clientHeight / 35, 10);
        this.pageSize = this.pageSize <= 1 ? 1 : this.pageSize;
      }
      this.store.states.id = this.id;
      this.store.states.orderBy = this.orderBy;
      this.store.states.sortType = this.sortType;
      this.store.states.action = this.action;
      /* 兼容v8 */
      this.$emitter.on(this.id + '_grid_bind', () => {
        this.nodata = false;
        this.bindData.splice(0, this.bindData.length);
        this.pageNum = 0;
        this.deleteNum = 0;
        if (this.getScrollTop() === 0) {
          this.dataBind();
        } else {
          this.pageNum = -1;
        }
      });
      this.$emitter.on(this.id + '_refresh', data => this.refresh(data));
      /* 兼容v8 */
      this.$on('grid_orderby', column => {
        this.nodata = false;
        this.bindData.splice(0, this.bindData.length);
        this.pageNum = 0;
        this.store.states.orderBy = column.property;
        this.store.states.sortType = column.order === 'ascending' ? 'asc' : 'desc';
        if (this.getScrollTop() === 0) {
          this.dataBind();
        } else {
          this.pageNum = -1;
        }
      });
      /* end */
      this.bindEvents();
      this.store.updateColumns();
      this.doLayout();
      this.resizeState = {
        width: this.$el.offsetWidth,
        height: this.$el.offsetHeight
      };
      // init filters
      this.store.states.columns.forEach(column => {
        if (column.filteredValue && column.filteredValue.length) {
          this.store.commit('filterChange', {
            column,
            values: column.filteredValue,
            silent: true
          });
        }
        /* start */
        this.egColumns.push({
          'label': column.label,
          'property': column.property
        });
        /* end */
      });
      /* start */
      this.dataBind();
      /* end */
      this.$ready = true;
    },
    activated() {
      // start
      // 路由切换，组件被激活的时候滚动条复原
      if (this.currentScroll && this.$refs.bodyWrapper.scrollHeight >= this.currentScroll) {
        this.$refs.bodyWrapper.scrollTop = this.currentScroll;
      }
      // end
    },
    data() {
      const store = new TableStore(this, {
        rowKey: this.rowKey,
        defaultExpandAll: this.defaultExpandAll,
        selectOnIndeterminate: this.selectOnIndeterminate
      });
      const layout = new TableLayout({
        store,
        table: this,
        fit: this.fit,
        showHeader: this.showHeader
      });
      return {
        layout,
        store,
        isHidden: false,
        renderExpanded: null,
        resizeProxyVisible: false,
        resizeState: {
          width: null,
          height: null
        },
        // 是否拥有多级表头
        isGroup: false,
        scrollPosition: 'left',
        /* start */
        bindData: [], //  绑定的数据
        pageNum: 0, // 页码
        pageSize: this.customPageSize || 50, //  每页数据大小
        nodata: false, //  当前页已经没有数据，为true时说明数据已全部加载完成
        recordTotal: 0, // 记录总数
        loadedRecordTotal: 0, // 已加载记录数
        egColumns: [], // 获取列的集合，记录label和property,用于导出至excel
        egLoading: false, // 是否显示加载圈
        deleteNum: 0, // 删除的数据,
        currentScroll: 0, // 记录当前的滚动位置
        start: -1, // 用于记录客户端返回的当前加载条数
        nowQueryData: null
        /* end */
      };
    }
  };
</script>

<style>
  .EgGridView_BottomInfo_excel {
    width: 17px;
    height: 17px;
    cursor: pointer;
    background: url('data:image/gif;base64,R0lGODlhEQARAPcAAAAAAP////78/v7///v//O/68fH98+357/H38u/48Oz07efx6MXhx+Tw5SiFKqrNq63PrhF0EbnTuczezMnXye/67+jx6PD48O/17/n7+SSEISJyITV9MyN2IC9yLEGJPUeURE2bSVefVEl7R3CrbXuzeXWmc47Gi2B1X3OMcrvXusPcwtbo1UKYO0WFQVWeT0+TS2KyXF+nWWurZoe6hIq5h0tkSYm3hlZvVG+NbX+afYCbfsbjxMzmyt3q3ODs3x9hGSp2IkqWQkiBQ2SqXoC7e4e9gY3EiGOEYHmWdmF4X6zRqIejhMreyOTv4+bw5SZpHUqPQU2SRE+LSFubUoLBeoS8fXiqcnujdlJrT9Lj0Ovz6kZ+PUeAPk6HRVSMTIC2eI3EhJ2xmsndxtTn0dfl1dnm10F7NnCxZHGvZXawaoC6dWt7aMndxdHiztDhzdXl0tvr2NTj0djn1d/q3d7p3OLs4PX69PT580R+NkF0NWmrWWqqW1qMTs3fyc/gy+ny59fn09LizuPv4O727Pb69X6pcYCrc5C5g5S9h53EkaHIlaDHlKXLmabMmqnPnazQoe3060V1NHWgZnehaHijanulbHynbouzfZnBjJa9iZvBjrnSse707EZmOWqYWXCcYHSdZYKtcou2eoexd4u1e4+5foWtdoaud67QofP48WGRTGWTUWiWVWiVVWuXWW6ZXG2VW3KcYHihZnaeZHqjaXmiaH2mbHeeZ3+oboKrcY2oguzz6SxOGzBTHzFVIDRYIjdbJTpfKDldJ1aJPVWJPUFnL1mMQVqMQl6PRmGRS1V8QlmARlyESWGITmaNU2+ZW2mPVnObYHGYXu706ytNGUqCLUuBLUuCLi9RHU+EM1OGNzxgKT5jKz9jLERpMUdsM0lvNUhtNEZrM0txN0pvNkxyOE91OlF4PVF3PVV7QVmARV6FSmSKUGySWE2CL1CEMvD17f3+/P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAPMALAAAAAARABEAAAj/AE2NIiUqVy1a09w9c9Zsnbp058yZSvXI0SJFmRIhwoTq0KVKtnCZKwWJ0B08qi7E67QF0BMnTuTIMkfqUaEAOHFmGJBzAB1Y5HQ1kreERg0TEwJQyLFDh5hBr8LdYhRAhJUiRK4wwUIFRocNvFyBm7Wp0IoZR8LIGPIlhoYIEHyw+iZNU6cAKkgYWfNiShAHEgK4WWUsFqJIGQKUAAEmjRQoXBg8CJSsWzRMgAL0qNIihBo+UfR0uTHnmLB2p6jxcHHGCxAOaPYIkbQrULFg7AxhOIEEhRI2Iz70yePBU5xtwJhZ+iEgwAACAVgksYEjSwoy2n4to2QHgYItCxpYSEhgoECFA2OwZUM3SVAdM2XgaHnzx0+TNk04Wet1LhQoaJ+0wooyySBDzDbwXGPNO9WYYw455YgzzjfGeMPNMMEA84sv2fQSEAA7') no-repeat center center;
    position: absolute;
    margin-left: 10px;
  }
</style>
