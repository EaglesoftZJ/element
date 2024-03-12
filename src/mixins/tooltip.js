// 手动显示隐藏tooltip的通用方法
export default {
  methods: {
    showTooltip(target) {
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        tooltip.referenceElm = target;
        const startShowPopper = tooltip.showPopper; // 获取初始popper显示状态，如果为true，则在show后不会执行watch设置的处理方法
        tooltip.show(); // 内置的显示方法，各种状态参数的设置
        if (startShowPopper && tooltip.popperJS) { // 手动执行watch处理方法
          tooltip.popperJS._reference = target; // popperJS实例初始化后reference固定，这里手动替换reference，指向当前target
          tooltip.updatePopper(); // 更新popperJS实例 计算当前reference的位置大小等
        }
      }
    },
    hideTooltip() {
      const tooltip = this.$refs.tooltip;
      if (tooltip) tooltip.hide(); // 内置的隐藏方法，为去抖延迟隐藏
    },
    addEvent() {
      // 内容动态改变时，实时更新popper位置等信息状态(这里主要是arrow)
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        tooltip.$watch('content', (val) => {
          this.$nextTick(() => {
            tooltip.popperJS && tooltip.updatePopper();
          });
        });
      }
    }
  },
  mounted() {
    this.addEvent();
  }
}