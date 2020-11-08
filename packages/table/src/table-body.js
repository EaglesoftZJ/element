import { getCell, getColumnByCell, getRowIdentity } from './util';
import { hasClass, addClass, removeClass } from 'element-ui/src/utils/dom';
import ElCheckbox from 'element-ui/packages/checkbox';
import ElTooltip from 'element-ui/packages/tooltip';
import debounce from 'throttle-debounce/debounce';
import LayoutObserver from './layout-observer';

export default {
  name: 'ElTableBody',

  mixins: [LayoutObserver],

  components: {
    ElCheckbox,
    ElTooltip
  },

  props: {
    store: {
      required: true
    },
    stripe: Boolean,
    context: {},
    rowClassName: [String, Function],
    rowStyle: [Object, Function],
    fixed: String,
    highlight: Boolean,
    tooltipPlacement: String
  },

  render(h) {
    // const { treeData, lazyTreeNodeMap, childrenColumnName, rowKey } = store.states;
    const columnsHidden = this.columns.map((column, index) => this.isColumnHidden(index));
    let rows = this.data;
    console.log('rows', rows);
    const { lazyColumnIdentifier, childrenColumnName } = this.store.states;
    if (this.store.states.lazy && Object.keys(this.store.states.lazyTreeNodeMap).length) {
      rows = rows.reduce((prev, item) => {
        prev.push(item);
        const rowKey = this.store.table.getRowKey(item);
        const parent = this.store.states.treeData[rowKey];
        if (parent && parent.children) {
          const tmp = [];
          const traverse = (children) => {
            if (!children) return;
            children.forEach(key => {
              tmp.push(this.store.states.lazyTreeNodeMap[key]);
              if (this.store.states.treeData[key]) {
                traverse(this.store.states.treeData[key].children);
              }
            });
          };
          traverse(parent.children);
          prev = prev.concat(tmp);
        }
        return prev;
      }, []);
    }
    console.log('columns', this.columns);
    return (
      <table
        class="el-table__body"
        cellspacing="0"
        cellpadding="0"
        border="0">
        <colgroup>
          {
            this._l(this.columns, column => <col name={ column.id } />)
          }
          {
            this.hasGutter ? <col name="gutter" /> : ''
          }
        </colgroup>
        <tbody>
          {
            this._l(rows, (row, $index) =>{
              const rowKey = this.table.primaryKey ? row[this.table.primaryKey] : this.table.rowKey ? this.getKeyOfRow(row, $index) : $index;
              const treeNode = this.treeData[rowKey];
              const rowClasses = this.getRowClass(row, $index);
              console.log('treeNode', treeNode);
              if (treeNode) {
                rowClasses.push('el-table__row--level-' + treeNode.level);
              }
              return [<tr
                v-show={ treeNode ? treeNode.display : true }
                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                key={ rowKey }
                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                on-click={ ($event) => this.handleClick($event, row) }
                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                on-mouseenter={ _ => this.handleMouseEnter($index) }
                on-mouseleave={ _ => this.handleMouseLeave() }
                class={ [rowClasses, {'current-row': this.table.highlightCurrentRow && this.store.states.currentRow && this.table.primaryKey && row[this.table.primaryKey] === this.store.states.currentRow[this.table.primaryKey]}] }>
                {
                  this._l(this.columns, (column, cellIndex) => {
                    const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex);
                    if (!rowspan || !colspan) {
                      return '';
                    } else {
                      const data = {
                        store: this.store,
                        _self: this.context || this.table.$vnode.context,
                        row,
                        column,
                        $index
                      };
                      if (cellIndex === this.firstDefaultColumnIndex && treeNode) {
                        data.treeNode = {
                          hasChildren: treeNode.hasChildren || (treeNode.children && treeNode.children.length),
                          expanded: treeNode.expanded,
                          indent: treeNode.level * this.treeIndent,
                          level: treeNode.level,
                          loaded: treeNode.loaded,
                          rowKey
                        };
                      }
                      return (
                        <td
                          style={ this.getCellStyle($index, cellIndex, row, column) }
                          class={ this.getCellClass($index, cellIndex, row, column) }
                          rowspan={ rowspan }
                          colspan={ colspan }
                          on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row, column) }
                          on-mouseleave={ ($event) => this.handleCellMouseLeave($event, column) }>
                          {
                            column.renderCell.call(
                              this._renderProxy,
                              h,
                              data,
                              columnsHidden[cellIndex]
                            )
                          }
                        </td>
                      );
                    }
                  })
                }
              </tr>,
              this.store.isRowExpanded(row)
                ? (<tr>
                  <td colspan={ this.columns.length } class="el-table__expanded-cell">
                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                  </td>
                </tr>)
                : ''
              ];
            }).concat(
              [
                <el-tooltip effect={ this.table.tooltipEffect } placement={ this.tooltipPlacement } ref="tooltip" content={ this.tooltipContent }></el-tooltip>,
                <el-popover popper-class={ this.customClass } ref="popover" content={ this.tooltipContent } placement={ this.tooltipPlacement } trigger="hover"><span slot="reference"></span></el-popover>
              ]
            )
          }
        </tbody>
      </table>
    );
  },

  watch: {
    'store.states.hoverRow'(newVal, oldVal) {
      if (!this.store.states.isComplex) return;
      const el = this.$el;
      if (!el) return;
      const tr = el.querySelector('tbody').children;
      const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'));
      const oldRow = rows[oldVal];
      const newRow = rows[newVal];
      if (oldRow) {
        removeClass(oldRow, 'hover-row');
      }
      if (newRow) {
        addClass(newRow, 'hover-row');
      }
    },
    'store.states.currentRow'(newVal, oldVal) {
      if (!this.highlight) return;
      const el = this.$el;
      if (!el) return;
      const data = this.store.states.data;
      const tr = el.querySelector('tbody').children;
      const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'));
      const oldRow = rows[data.indexOf(oldVal)];
      const newRow = rows[data.indexOf(newVal)];
      if (oldRow) {
        removeClass(oldRow, 'current-row');
      } else {
        [].forEach.call(rows, row => removeClass(row, 'current-row'));
      }
      if (newRow) {
        addClass(newRow, 'current-row');
      }
    }
  },

  computed: {
    table() {
      return this.$parent;
    },

    data() {
      return this.store.states.data;
    },

    treeData() {
      return this.store.states.treeData;
    },

    columnsCount() {
      return this.store.states.columns.length;
    },

    leftFixedLeafCount() {
      return this.store.states.fixedLeafColumnsLength;
    },

    rightFixedLeafCount() {
      return this.store.states.rightFixedLeafColumnsLength;
    },

    leftFixedCount() {
      return this.store.states.fixedColumns.length;
    },

    rightFixedCount() {
      return this.store.states.rightFixedColumns.length;
    },

    columns() {
      return this.store.states.columns;
    },
    firstDefaultColumnIndex() {
      for (let index = 0; index < this.columns.length; index++) {
        if (this.columns[index].type === 'default') {
          return index;
        }
      }
      return 0;
    },

    treeIndent() {
      return this.store.states.indent;
    }
  },

  data() {
    return {
      tooltipContent: '',
      customClass: ''
    };
  },

  created() {
    this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper());
    this.activatePopover = debounce(50, popover => popover.handleMouseEnter());
  },

  methods: {
    getKeyOfRow(row, index) {
      const rowKey = this.table.rowKey;
      if (rowKey) {
        return getRowIdentity(row, rowKey);
      }
      return index;
    },

    isColumnHidden(index) {
      if (this.fixed === true || this.fixed === 'left') {
        return index >= this.leftFixedLeafCount;
      } else if (this.fixed === 'right') {
        return index < this.columnsCount - this.rightFixedLeafCount;
      } else {
        return (index < this.leftFixedLeafCount) || (index >= this.columnsCount - this.rightFixedLeafCount);
      }
    },

    getSpan(row, column, rowIndex, columnIndex) {
      let rowspan = 1;
      let colspan = 1;

      const fn = this.table.spanMethod;
      if (typeof fn === 'function') {
        const result = fn({
          row,
          column,
          rowIndex,
          columnIndex
        });

        if (Array.isArray(result)) {
          rowspan = result[0];
          colspan = result[1];
        } else if (typeof result === 'object') {
          rowspan = result.rowspan;
          colspan = result.colspan;
        }
      }

      return {
        rowspan,
        colspan
      };
    },

    getRowStyle(row, rowIndex) {
      const rowStyle = this.table.rowStyle;
      if (typeof rowStyle === 'function') {
        return rowStyle.call(null, {
          row,
          rowIndex
        });
      }
      return rowStyle;
    },

    getRowClass(row, rowIndex) {
      const classes = ['el-table__row'];
      if (this.table.highlightCurrentRow && row === this.store.states.currentRow) {
        classes.push('current-row');
      }

      if (rowIndex === this.store.states.hoverRow) {
        classes.push('hover-row');
      }

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('el-table__row--striped');
      }
      const rowClassName = this.table.rowClassName;
      if (typeof rowClassName === 'string') {
        classes.push(rowClassName);
      } else if (typeof rowClassName === 'function') {
        classes.push(rowClassName.call(null, {
          row,
          rowIndex
        }));
      }

      if (this.store.states.expandRows.indexOf(row) > -1) {
        classes.push('expanded');
      }

      return classes;
    },

    getCellStyle(rowIndex, columnIndex, row, column) {
      const cellStyle = this.table.cellStyle;
      if (typeof cellStyle === 'function') {
        return cellStyle.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        });
      }
      return cellStyle;
    },

    getCellClass(rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.align, column.className];

      if (this.isColumnHidden(columnIndex)) {
        classes.push('is-hidden');
      }

      const cellClassName = this.table.cellClassName;
      if (typeof cellClassName === 'string') {
        classes.push(cellClassName);
      } else if (typeof cellClassName === 'function') {
        classes.push(cellClassName.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        }));
      }

      return classes.join(' ');
    },

    handleCellMouseEnter(event, row, column) {
      const table = this.table;
      const cell = getCell(event);

      if (cell) {
        const column = getColumnByCell(table, cell);
        const hoverState = table.hoverState = {cell, column, row};
        table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event);
      }

      // 判断是否text-overflow, 如果是就显示tooltip | popover
      const cellChild = event.target.querySelector('.cell');

      this.customClass = column.popoverCustomClass;

      let tooltip = column.showOverflowTooltip || column.showTooltipWhenOverflow;
      let popover = column.showOverflowPopover;

      if (tooltip && cellChild.scrollWidth > cellChild.offsetWidth && this.$refs.tooltip) {
        const tooltip = this.$refs.tooltip;
        // TODO 会引起整个 Table 的重新渲染，需要优化
        this.tooltipContent = cell.textContent || cell.innerText;
        tooltip.referenceElm = cell;
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none');
        tooltip.doDestroy();
        tooltip.setExpectedState(true);
        this.activateTooltip(tooltip);
      } else if (popover && cellChild.scrollWidth > cellChild.offsetWidth && this.$refs) {
        const popover = this.$refs.popover;
        this.tooltipContent = cell.textContent || cell.innerText;
        popover.referenceElm = cell;
        // popover.$refs.popper && (popover.$refs.popper.style.display = 'none');
        popover.showPopper = false;
        popover.doDestroy();
        this.activatePopover(popover);

      }
    },

    handleCellMouseLeave(event, column) {
      // const tooltip = this.$refs.tooltip;
      let tooltip = column.showOverflowTooltip || column.showTooltipWhenOverflow;
      let popover = column.showOverflowPopover;
      if (tooltip && this.$refs.tooltip) {
        this.$refs.tooltip.setExpectedState(false);
        this.$refs.tooltip.handleClosePopper();
      } else if (popover) {
        this.$refs.popover.handleMouseLeave();
      }
      const cell = getCell(event);
      if (!cell) return;

      const oldHoverState = this.table.hoverState || {};
      this.table.$emit('cell-mouse-leave', oldHoverState.row, oldHoverState.column, oldHoverState.cell, event);
    },

    handleMouseEnter(index) {
      this.store.commit('setHoverRow', index);
    },

    handleMouseLeave() {
      this.store.commit('setHoverRow', null);
    },

    handleContextMenu(event, row) {
      this.handleEvent(event, row, 'contextmenu');
    },

    handleDoubleClick(event, row) {
      this.handleEvent(event, row, 'dblclick');
    },

    handleClick(event, row) {
      this.store.commit('setCurrentRow', row);
      this.handleEvent(event, row, 'click');
    },

    handleEvent(event, row, name) {
      const table = this.table;
      const cell = getCell(event);
      let column;
      if (cell) {
        column = getColumnByCell(table, cell);
        if (column) {
          table.$emit(`cell-${name}`, row, column, cell, event);
        }
      }
      table.$emit(`row-${name}`, row, event, column);
    },

    handleExpandClick(row, e) {
      e.stopPropagation();
      this.store.toggleRowExpansion(row);
    }
  }
};
