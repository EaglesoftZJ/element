<template>
  <div class="el-table"
    :id="id + '_table'"
    v-loading="egLoading"
    :class="{
      'el-table--fit': fit,
      'el-table--striped': stripe,
      'el-table--border': border || isGroup,
      'el-table--hidden': isHidden,
      'el-table--group': isGroup,
      'el-table--fluid-height': maxHeight,
      'el-table--fit-height': fitHeight,
      'el-table--enable-row-hover': !store.states.isComplex,
      'el-table--enable-row-transition': true || (store.states.data || []).length !== 0 && (store.states.data || []).length < 100
    }"
    @mouseleave="handleMouseLeave($event)"
    :style="fitHeight ? fitHeightStyle  : ''">
    <div class="hidden-columns" ref="hiddenColumns"><slot></slot></div>
    <div :class="{ 
      'el-table__header-wrapper': true
      }"
       ref="headerWrapper" v-if="showHeader" :style="fitHeight ? fitHeightHeaderStyle  : ''">
      <table-header
        :id="id + '_head'"
        :store="store"
        :border="border"
        :default-sort="defaultSort"
        :style="{
          width: layout.bodyWidth ? layout.bodyWidth + 'px' : ''
        }">
      </table-header>
    </div>
    <div
      :id="id + '_content'"
      :class="{ 
      'el-table__body-wrapper': true
      }"
      @scroll="tableScroll"
      ref="bodyWrapper"
      :style="fitHeight ? fitHeightBodyStyle  : [bodyHeight]">
      <table-body
        :context="context"
        :store="store"
        :stripe="stripe"
        :row-class-name="rowClassName"
        :row-style="rowStyle"
        :highlight="highlightCurrentRow"
        :style="{
           width: bodyWidth
        }">
      </table-body>
      <div :style="{ width: bodyWidth }" class="el-table__empty-block" v-if="(!data || data.length === 0) &&  bindData.length === 0">
        <span class="el-table__empty-text"><slot name="empty">{{ emptyText || t('el.table.emptyText') }}</slot></span>
      </div>
    </div>
    <div :style="{ }"  
    :class="{ 
      'el-table__footer-wrapper': false,
      'el-table__footer-wrapper-egfooter': true
      }" v-if="showTotal" ref="footerWrapper"
      :style="fitHeight ? fitHeightFooterStyle  : 'width:100%;box-sizing:border-box;' ;width: bodyWidth + 'px'">
      <span class="EgGridView_BottomInfo_recordCount">
        共约&nbsp;<font color="red" id="GV_Show_recordCount">{{ recordTotal }}</font>&nbsp;条记录
      </span> 
      ,
      <span class="EgGridView_BottomInfo_loadedCount">
        已加载&nbsp;<font color="red" id="GV_Show_loadedCount">{{ loadedRecordTotal }}</font>&nbsp;条
      </span>
      <span v-if="exportAction !== ''" class="EgGridView_BottomInfo_excel" title="导出excel。如果数据多，可能需要一段时间，请耐心等待！" 
        @click="exportExcel">
    </div>
    <div class="el-table__footer-wrapper" ref="footerWrapper" v-else-if="showSummary" v-show="data && data.length > 0">
      <table-footer
        :store="store"
        :border="border"
        :sum-text="sumText || t('el.table.sumText')"
        :summary-method="summaryMethod"
        :default-sort="defaultSort"
        :style="{
          width: layout.bodyWidth ? layout.bodyWidth + 'px' : ''
        }">
      </table-footer>
    </div>
    <div class="el-table__fixed " ref="fixedWrapper"
      v-if="fixedColumns.length > 0"
      :style="[
        { width: layout.fixedWidth ? layout.fixedWidth + 'px' : '' },
        fitHeight ? fixedHeightFitHeight :fixedHeight
      ]">
      <div class="el-table__fixed-header-wrapper" ref="fixedHeaderWrapper" v-if="showHeader">
        <table-header
          ref="fixedTableHeader"
          fixed="left"
          :border="border"
          :store="store"
          :style="{
            width: bodyWidth
          }"></table-header>
      </div>
      <div class="el-table__fixed-body-wrapper" ref="fixedBodyWrapper"
        :style="[
          { top: layout.headerHeight + 'px' },
          fitHeight ? fixedBodyHeightFitHeight : fixedBodyHeight,
        ]">
        <table-body
          fixed="left"
          :store="store"
          :stripe="stripe"
          :highlight="highlightCurrentRow"
          :row-class-name="rowClassName"
          :row-style="rowStyle"
          :style="{
            width: bodyWidth
          }">
        </table-body>
        <div
          v-if="$slots.append"
          class="el-table__append-gutter"
          :style="{
            height: layout.appendHeight + 'px'
          }"></div>
      </div>
      <div
        v-if="showSummary"
        v-show="data && data.length > 0"
        class="el-table__fixed-footer-wrapper"
        ref="fixedFooterWrapper">
        <table-footer
          fixed="left"
          :border="border"
          :sum-text="sumText || t('el.table.sumText')"
          :summary-method="summaryMethod"
          :store="store"
          :style="{
            width: bodyWidth
          }"></table-footer>
      </div>
    </div>
    <div
      v-if="rightFixedColumns.length > 0"
      :style="[
        { width: layout.rightFixedWidth ? layout.rightFixedWidth + 'px' : '' },
        { right: layout.scrollY ? (border ? layout.gutterWidth : (layout.gutterWidth || 1)) + 'px' : '' },
        fitHeight ? fixedHeightFitHeight :fixedHeight
      ]">
      <div class="el-table__fixed-header-wrapper" ref="rightFixedHeaderWrapper" v-if="showHeader">
        <table-header
          ref="rightFixedTableHeader"
          fixed="right"
          :border="border"
          :store="store"
          :style="{
            width: bodyWidth
          }"></table-header>
      </div>
      <div class="el-table__fixed-body-wrapper"   ref="rightFixedBodyWrapper"
        :style="[
          { top: layout.headerHeight + 'px' },
          fitHeight ? fixedBodyHeightFitHeight : fixedBodyHeight,

        ]">
        <table-body
          fixed="right"
          :store="store"
          :stripe="stripe"
          :row-class-name="rowClassName"
          :row-style="rowStyle"
          :highlight="highlightCurrentRow"
          :style="{
            width: bodyWidth
          }">
        </table-body>
      </div>
      <div
        v-if="showSummary"
        v-show="data && data.length > 0"
        class="el-table__fixed-footer-wrapper"
        ref="rightFixedFooterWrapper">
        <table-footer
          fixed="right"
          :border="border"
          :sum-text="sumText || t('el.table.sumText')"
          :summary-method="summaryMethod"
          :store="store"
          :style="{
            width: bodyWidth
          }"></table-footer>
      </div>
    </div>
    <div
      v-if="rightFixedColumns.length > 0"
      class="el-table__fixed-right-patch"
      ref="rightFixedPatch"
      :style="{
        width: layout.scrollY ? layout.gutterWidth + 'px' : '0',
        height: layout.headerHeight + 'px'
      }"></div>
    <div class="el-table__column-resize-proxy" ref="resizeProxy" v-show="resizeProxyVisible"></div>
  </div>
</template>

<script type="text/babel">
  import ElCheckbox from 'element-ui/packages/checkbox';
  import debounce from 'throttle-debounce/debounce';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
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

    mixins: [Locale, Migrating],

    directives: {
      Mousewheel
    },

    props: {
      id: {
        required: true
      },
      query_data: Object,
      primaryKey: {
          required: true
      },
      orderBy: String,
      sortType: String,
      showTotal: {
        type: Boolean,
        default: true
      },

      data: {
        type: Array,
        default: function() {
          return [];
        }
      },

      size: String,

      width: [String, Number],

      height: [String, Number],

      maxHeight: [String, Number],

      fit: {
        type: Boolean,
        default: true
      },

      fitHeight: {
        type: Boolean,
        default: false
      },

      stripe: Boolean,

      border: {
        type: Boolean,
        default: true
      },

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
      }
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
        if (this.action !== '') {
          this.egLoading = true;
          this.query_data['pageNum'] = this.pageNum * this.pageSize - this.deleteNum;
          this.query_data['pageSize'] = this.pageSize;
          this.query_data['orderBy'] = this.store.states.orderBy;
          this.query_data['sortType'] = this.store.states.sortType;
          var options = {
              url: this.action,
              data: this.query_data,
              jsontype: this.jsontype && 'json',
              success: function(res) {
                  res[0].data.forEach((row)=>{
                      this.bindData.push(row);
                  });

                  this.recordTotal = res[0].total;
                  this.loadedRecordTotal = this.bindData.length;

                  if ((res[0].data.length === 0) || (res[0].data.length < this.pageSize)) {
                    this.nodata = true;
                  }

                  this.store.commit('setData', this.bindData);

                  this.doLayout();

                  this.egLoading = false;

                  this.callback && this.callback(res);
              }
          };
          this.$eg.ajax('table', options);
        } else {
          // 数据分页
          var size = this.pageNum * this.pageSize + this.pageSize;
          var arr = this.data.slice(0, size);  
          this.store.commit('setData', arr);
          this.recordTotal = this.data.length;
          this.loadedRecordTotal = size > this.data.length ? this.data.length : size;
        }
      },
      refresh(refdata) {
          if (refdata.statusCode === this.$code.DELETE_SUCCESS) {
              this.delete(refdata);
              return;
          }

          refdata['egGridviewGetRow'] = true;
          refdata['pageNum'] = 0;
          refdata['pageSize'] = 10;
          var options = {
              url: this.action,
              data: refdata,
              jsontype: this.jsontype && 'json',
              success: function(result) {
                  if (refdata.statusCode === this.$code.INSERT_SUCCESS) {
                      this.bindData.unshift(result[0].data[0]);
                      this.recordTotal++;
                      this.loadedRecordTotal++;
                  } else if (refdata.statusCode === this.$code.UPDATE_SUCCESS) {
                      var rowIndex = this.getRefreshRowIndex(result[0].data[0][this.primaryKey]);
                      this.bindData.splice(rowIndex, 1, result[0].data[0]);
                  }
                  this.store.commit('setData', this.bindData);
                  this.callback && this.callback(result);
              }
          };
          this.$eg.ajax(null, options);
      },
      delete(result) {
          var rowIndex = this.getRefreshRowIndex(result[this.primaryKey]);
          this.bindData.splice(rowIndex, 1);
          this.store.commit('setData', this.bindData);
          this.deleteNum++;
      },
      getRefreshRowIndex(val) {
          for (var i = 0; i < this.bindData.length; i++) {
              if (this.bindData[i][this.primaryKey] === val) {
                  return i;
              }
          }
      },
      getScrollTop() {
        return document.getElementById(this.id + '_content') ? document.getElementById(this.id + '_content').scrollTop : -1;
      },
      tableScroll(ev) {

        let nDivHight = document.getElementById(this.id + '_content') ? document.getElementById(this.id + '_content').offsetHeight : 0;
        let nScrollHight = document.getElementById(this.id + '_content') ? document.getElementById(this.id + '_content').scrollHeight : 0;
        let nScrollTop = document.getElementById(this.id + '_content') ? document.getElementById(this.id + '_content').scrollTop : -1;
        if (Math.ceil(nScrollTop) + Math.ceil(nDivHight) >= Math.floor(nScrollHight) && !this.egLoading && this.nodata === false) {
            this.pageNum += 1;
            this.dataBind();
        }

        this.$emit('table-scroll', ev);
      },
      exportExcel() {
        if (this.exportAction !== '') {
          this.query_data['pageNum'] = 0;
          this.query_data['pageSize'] = 147483648;
          this.query_data['orderBy'] = this.store.states.orderBy;
          this.query_data['sortType'] = this.store.states.sortType;

          let exportData = this.query_data;
          exportData['columns'] = this.egColumns;

          var options = {
              url: this.exportAction,
              data: exportData,
              success: function(res) {
                  window.location.href = '/rest/export/exportExcel?url=' + res.url + '&filename=' + res.fileName;
              }
          };
          this.$eg.ajax(null, options);
        }
      },
      /* 自已加的方法结束 */

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
        const { pixelX, pixelY } = data;
        if (Math.abs(pixelX) >= Math.abs(pixelY)) {
          event.preventDefault();
          this.bodyWrapper.scrollLeft += data.pixelX / 5;
        }
      },

      bindEvents() {
        const { headerWrapper, footerWrapper } = this.$refs;
        const refs = this.$refs;
        let self = this;

        this.bodyWrapper.addEventListener('scroll', function() {
          if (headerWrapper) headerWrapper.scrollLeft = this.scrollLeft;
          if (footerWrapper) footerWrapper.scrollLeft = this.scrollLeft;
          if (refs.fixedBodyWrapper) refs.fixedBodyWrapper.scrollTop = this.scrollTop;
          if (refs.rightFixedBodyWrapper) refs.rightFixedBodyWrapper.scrollTop = this.scrollTop;
          const maxScrollLeftPosition = this.scrollWidth - this.offsetWidth - 1;
          const scrollLeft = this.scrollLeft;
          if (scrollLeft >= maxScrollLeftPosition) {
            self.scrollPosition = 'right';
          } else if (scrollLeft === 0) {
            self.scrollPosition = 'left';
          } else {
            self.scrollPosition = 'middle';
          }
        });

        if (this.fit) {
          addResizeListener(this.$el, this.resizeListener);
        }
      },

      resizeListener() {
        if (!this.$ready) return;
        let shouldUpdateLayout = false;
        const el = this.$el;
        const { width: oldWidth, height: oldHeight } = this.resizeState;

        const width = el.offsetWidth;
        if (oldWidth !== width) {
          shouldUpdateLayout = true;
        }

        const height = el.offsetHeight;
        if ((this.height || this.shouldUpdateHeight) && oldHeight !== height) {
          shouldUpdateLayout = true;
        }

        if (this.fit) {
          this.windowResizeListener = throttle(50, () => {
            if (this.$ready) {
              this.doLayout();
              this.egBodyWidth = document.getElementById(this.id + '_content').offsetWidth;
            };
          });
          addResizeListener(this.$el, this.windowResizeListener);
        }
      },

      doLayout() {
        
        this.store.updateColumns();
        this.layout.update();
        this.updateScrollY();

        // console.log('layout2', this.layout);
        this.$nextTick(() => {
          if (this.height) {
            this.layout.setHeight(this.height - 1);
          } else if (this.maxHeight) {
            this.layout.setMaxHeight(this.maxHeight);
          } else if (this.shouldUpdateHeight) {
            this.layout.updateHeight();
          }
          if (this.fitHeight) {
            this.layout.setHeight(this.$refs.bodyWrapper ? this.$refs.bodyWrapper.clientHeight : 0);
          }
          if (this.bindData.length > 0) {
            this.tableScroll(null);
          }
        });


      },
      // 对外接口
      resetGrid() {
        // 重置数据
        this.nodata = false;
        this.bindData.splice(0, this.bindData.length);
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
      }
      // deleteData() {
      //   // 删除数据
      //   this.refresh(data)
      // },
      // addData() {
      //   // 添加数据
      //   this.refresh(data)
      // },
      // editData() {
      //   // 修改数据
      //   this.refresh(data)
      // }
    },

    created() {
      this.tableId = 'el-table_' + tableIdSeed++;
      this.debouncedUpdateLayout = debounce(50, () => this.doLayout());
    },

     

    computed: {
      tableSize() {
        return this.size || (this.$ELEMENT || {}).size;
      },

      bodyWrapper() {
        return this.$refs.bodyWrapper;
      },

      fitHeightStyle() {
        // console.log('style', this.layout, 'height:100%;padding:' + (this.layout.headerHeight ? this.layout.headerHeight : 0) + 'px 0px ' + (this.layout.footerHeight ? this.layout.footerHeight : 0) + 'px');
        return 'width:100%;height:100%;box-sizing:border-box;padding:' + (this.layout.headerHeight ? this.layout.headerHeight : 0) + 'px 0px ' + (this.layout.footerHeight ? this.layout.footerHeight : 0) + 'px' ;
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

      bodyHeight() {
        
        let style = {};

      bodyHeight() {
        if (this.height) {
          return {
            height: this.layout.bodyHeight ? this.layout.bodyHeight + 'px' : ''
          };
        } else if (this.maxHeight) {
          return {
            'max-height': (this.showHeader
              ? this.maxHeight - this.layout.headerHeight - this.layout.footerHeight
              : this.maxHeight - this.layout.footerHeight) + 'px'
          };
        }
       
        return style;
      },

      bodyWidth() {
        const { bodyWidth, scrollY, gutterWidth } = this.layout;
        // console.log('layout', this.layout);
        return bodyWidth ? bodyWidth - (scrollY ? gutterWidth : 0) + 'px' : '';
      },

      fixedBodyHeight() {
        let style = {};


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
    
        // if (this.layout.scrollX) {
        //   style = {
        //     height: 'auto',
        //     bottom: (this.layout.gutterWidth + this.layout.footerHeight) + 'px',

        //     right: this.layout.gutterWidth + 'px'
        //   };
        // } else {
        //   style = {
        //     height: 'auto',
        //     bottom: this.layout.footerHeight + 'px',
        //     right: this.layout.gutterWidth + 'px'
        //   };
        // }
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

        return style;
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
      }
    },

    watch: {
      height: {
        immediate: true,
        handler(value) {
          if (value) {
            this.pageSize = parseInt(value / 35, 10);
            this.pageSize = this.pageSize <= 1 ? 1 : this.pageSize;
            // console.log('pageSize:' + this.pageSize);

            this.layout.setHeight(value);
          }
         
        }
      },

      currentRowKey(newVal) {
        this.store.setCurrentRowKey(newVal);
      },

      data: {
        immediate: true,
        handler(val) {
          if (this.action) {
            this.store.commit('setData', val); 
          } else {
            this.pageNum = 0;
            this.dataBind();
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
      }
    },

    destroyed() {
      if (this.resizeListener) removeResizeListener(this.$el, this.resizeListener);
    },

    mounted() {
      this.$nextTick(() => {

            if (this.fitHeight) {

                this.pageSize = parseInt(this.$refs.bodyWrapper.clientHeight / 35, 10) ;
                this.pageSize = this.pageSize <= 1 ? 1 : this.pageSize;  
            }

            this.store.states.id = this.id;
            this.store.states.orderBy = this.orderBy;
            this.store.states.sortType = this.sortType;

             // console.log('table' + this.layout);

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
            this.$emitter.on(this.id + '_grid_orderby', (column) => {
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
            this.$emitter.on(this.id + '_refresh', (data) => this.refresh(data));

            this.bindEvents();
            this.doLayout();

            this.egBodyWidth = document.getElementById(this.id + '_content').offsetWidth;

            // init filters
            this.store.states.columns.forEach(column => {
              if (column.filteredValue && column.filteredValue.length) {
                this.store.commit('filterChange', {
                  column,
                  values: column.filteredValue,
                  silent: true
                });
              }

              // console.log(column.label, column.property);
              this.egColumns.push({'label': column.label, 'property': column.property});
         
          });

          this.dataBind();

          this.$ready = true;
        });

    // if (this.fitHeight) {
    //   $(window).on('resize', () => {
    //     this.pageSize = parseInt(this.$refs.bodyWrapper.clientHeight / 35, 10) ;
    //     this.pageSize = this.pageSize <= 1 ? 1 : this.pageSize;
    //   });
    // }   
    
    
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
        bindData: [], //  绑定的数据
        pageNum: 0,   //  页码
        pageSize: 50, //  每页数据大小
        nodata: false, //  当前页已经没有数据，为true时说明数据已全部加载完成
        egBodyWidth: 0, // 表格主体的实际宽度(0ffsetWidth)
        recordTotal: 0, // 记录总数
        loadedRecordTotal: 0, // 已加载记录数
        egColumns: [], // 获取列的集合，记录label和property,用于导出至excel
        egLoading: false, // 是否显示加载圈
        deleteNum: 0 // 删除的数据
      };
    }
  };
</script>
<style scoped>
.EgGridView_BottomInfo_excel {
    width: 17px;
    height: 17px;
    cursor: pointer;
    background: url('../../../../images/excel.gif') no-repeat center center;
    position: absolute;
    margin-left: 10px;
}
</style>
