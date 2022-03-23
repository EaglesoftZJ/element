// import Vue from 'Vue';
// import merge from './merge';

/**
 * Created by xx on 2017/6/25.
 * 自定义dialog
 */

 function plugin(Vue) {

  if (plugin.installed) {
      return;
  }

  // Vue.$store.dlg_Postion_From_ = '#el_row_content';

  Object.defineProperties(Vue.prototype, {

      $edlg: {
          get() {
              let Vue = this;

              // if (Vue.$store.dlg_Postion_From === null || Vue.$store.dlg_Base_Position === undefined) {
              //     Vue.$store.dlg_Postion_From = '#el_row_content';
              //     var baseId = Vue.$store.dlg_Postion_From;
              //     var width = $(baseId)[0].offsetWidth;
              //     var height = $(baseId)[0].offsetHeight;
              //     var offSet = $(baseId).offset();
              //     var clientHeight = $(window).height();
              //     var clientWidth = $(window).width();

              //     Vue.$store.dlg_Base_Position = {
              //         width: width + 'px',
              //         height: height + 'px',
              //         top: offSet.top + 'px',
              //         left: offSet.left + 'px',
              //         clientHeight: clientHeight + 'px',
              //         clientWidth: clientWidth + 'px'
              //     };
              // }

              // var position = Vue.$store.dlg_Base_Position;

              // let background_image = Vue.$store.background_image;

              let openType = {};
              openType.FullScreen = {
                  showConfirmButton: false,
                  showCancelButton: false,
                  closeOnClickModal: false,
                  modal: false,
                  style: 'width:100%;height:100%;display: none;background-color: rgb(255,255,255);background:url("' + 111 + '")',
                  dialogStyle: 'width:100%;height:100%;padding:0px;box-sizing:content-box;background-color: rgba(255,255,255,1);',
                  contentStyle: 'width:100%;height:100%;padding: 0px;top: 0px;overflow:hidden;background-color: rgba(255,255,255,1);',
                  messageStyle: 'width:100%;height:100%;background-color: rgba(255,255,255,0);',
                  btnsStyle: 'display:none;',
                  wrapperClass: 'el-eg-dialog__fullscreen'
              };
              openType.ContentArea = {
                  showConfirmButton: false,
                  showCancelButton: false,
                  closeOnClickModal: false,
                  modal: false,
                  // style: 'background-color: rgba(255,255,255,0);width:100%;height:100%;display: none;box-sizing:border-box; padding-left:' + position.left + '; padding-top:' + position.top + ';display:none;pointer-events:none;',
                  style: 'background-color: rgba(255,255,255,0);width:100%;height:100%;display: none;box-sizing:border-box;display:none;pointer-events:none;',
                  dialogStyle: 'background-color: rgba(255,255,255,0);padding:0px;width:100%;height:100%;box-sizing:border-box;pointer-events:auto',
                  contentStyle: 'background-color: rgba(255,255,255,0);padding: 0px;top: 0px;width:100%;height:100%;overflow:hidden',
                  messageStyle: 'background-color: rgba(255,255,255,0);width:100%;height:100%;',
                  btnsStyle: 'height:0;padding:0',
                  wrapperClass: 'el-eg-dialog__contentArea'
              };

              openType.Default = {
                  style: 'width:100%;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:center;display:flex',
                  dialogStyle: 'width:auto;height:auto;pointer-events:auto;box-sizing:content-box;position:relative',
                  contentStyle: 'padding: 20px;top: 0px;width:100%;height:100%;overflow:auto;max-height:' + ($(window).height() - 200) + 'px;max-width:' + ($(window).width() - 100) + 'px;',
                  btnsStyle: 'bottom:0px',
                  showConfirmButton: false,
                  showCancelButton: false,
                  closeOnClickModal: false
              };

              openType.WindowSize = {
                  style: 'width:100%;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:center;display:flex',
                  // dialogStyle: 'width:auto;height:auto;pointer-events:auto;box-sizing:border-box;top:100px; position:relative',
                  contentStyle: 'padding: 20px; padding-top: 60px; box-sizing: border-box; position: relative; width:100%;height:100%;overflow:auto;',
                  messageStyle: 'width:100%;height:100%;',
                  btnsStyle: 'height:0;padding:0',
                  showConfirmButton: false,
                  showCancelButton: false,
                  closeOnClickModal: false
              };
              
              // const wWidth = $(window).width();
              const wHeight = $(window).height();

              openType.fitHeight = {
                style: `width:100%;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:center;display:flex`,
                dialogStyle: `width:auto;height:${wHeight - 40}px;pointer-events:auto;box-sizing:content-box; position:relative`,
                contentStyle: 'padding: 20px; padding-top: 60px; padding-bottom: 60px; box-sizing: border-box; position: relative; width:100%;height:100%;overflow:auto;',
                messageStyle: 'width:100%;height:100%;',
                btnsStyle: 'position: absolute;right: 0px; bottom:0px;',
                showConfirmButton: false,
                showCancelButton: false,
                closeOnClickModal: false
            };
              return {
                  data() {
                      return $.extend(Vue.$data, { 'aaa': 111 });
                  },
                  ResetData(BaseElementId) {
                      Vue.$store.dlg_Postion_From = BaseElementId;

                  },
                  ResetPosition() {
                      var baseId = Vue.$store.dlg_Postion_From;
                      var width = $(baseId)[0].offsetWidth;
                      var height = $(baseId)[0].offsetHeight;
                      var offSet = $(baseId).offset();
                      var clientHeight = $(window).height();
                      var clientWidth = $(window).width();

                      Vue.$store.dlg_Base_Position = {
                          width: width + 'px',
                          height: height + 'px',
                          top: offSet.top + 'px',
                          left: offSet.left + 'px',
                          clientHeight: clientHeight + 'px',
                          clientWidth: clientWidth + 'px'
                      };
                  },
                  validateData() {
                      if (Vue.$store.dlg_Postion_From === null || Vue.$store.dlg_Base_Position === undefined) {
                          this.ResetData('#el_row_content');
                          this.ResetPosition();
                      }
                  },
                  validateWidth(width) {
                      var position = Vue.$store.dlg_Base_Position;
                      var maxWidth = (parseInt(position.clientWidth, 0) - 100);
                      return (maxWidth < width ? maxWidth : width) + 'px';

                  },
                  validateHeight(height) {
                      var position = Vue.$store.dlg_Base_Position;
                      var maxHeight = (parseInt(position.clientWidth, 0) - 100);
                      return (maxHeight < height ? maxHeight : height) + 'px';

                  },

                  open(Optional) {
                      // // console.log(11111111, Optional);
                      const h = Vue.$createElement;
                      if (Optional.type === 'WindowSize') {
                          Optional.dialogStyle = 'pointer-events:auto;box-sizing:border-box;top:100px; position:relative;' + 'width:' + Optional.width + 'px;height:' + Optional.height + 'px;top:' + Optional.top + 'px;';

                      }
                      // 滚动条统一处理
                      var handleTransitionCallback = Optional.transitionCallback;
                      Optional.transitionCallback = (type, dlgBox, slot) => {
                        if (type === 'afterEnter') {
                          // slot.$sbar.use(slot.$refs, slot);
                        }
                        if (type === 'afterLeave') {
                          // slot.$sbar.destroy(slot);
                        }
                        handleTransitionCallback && handleTransitionCallback(type, dlgBox, slot);
                      };
                      Optional.message = Optional.vnode;
                      Optional.parentInstance = Vue; // 把打开当前弹窗的实例记录下来，这样虽有弹窗可以通过parentInstance连成一条线
                      if (!Optional.vnode.nodeName) {
                        Optional.message = h(Optional.vnode,
                          {
                              props: Optional.props ? Optional.props : {},
                              on: Optional.on ? Optional.on : {}
                          }
                        );
                      }
                      Optional = $.extend(Optional,
                          {
                            message: Optional.message,
                            removeContent: true
                          },
                          Optional.type ? openType[Optional.type] : {}
                      );
                      // 调整按钮顺序
                      // if (Optional.buttons && Optional.buttons.length > 0) {
                      //   Optional.buttons.forEach((item) => {
                      //     item.size = window.$egFlow.options.size;
                      //   });
                      //   Optional.buttons = Optional.buttons.reverse();
                      // }
                      return Vue.$egdlg(Optional);

                  },
                  closeAll() {
                    Vue.$egdlg.closeAll();
                  }
              };
          }
      }

  });
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

export default plugin;

// let Optional = {
//     vnode: VueComponentNode, // 引入的组件节点,
//     props: { // 需要传递给子组件初始化的数据,

//     },
//     type: 'FullScreen', // ContentArea/Default/WindowSize/fitHeight
//     buttons: [{
//         text: '确定', // 显示名称
//         type: 'primary', // 类型
//         size: 'normal', // 大小
//         icon: '', // 图标,
//         callback: (dlgBox, slot)=>{ // 弹出窗实例和打开的组件实例
//         }
//     }],
//     beforeShow: (dlgBox, slot)=>{ // 弹出窗实例和打开的组件实例

//     },
//     transitionCallback: (type, dlgBox, slot) => { // type为下面最右字符串内容
//         // v-on:before-enter="transitionCallback('beforeEnter')"
//         // v-on:enter="transitionCallback('enter')"
//         // v-on:after-enter="transitionCallback('afterEnter')"
//         // v-on:enter-cancelled="transitionCallback('cancelledEnter')"
//         // v-on:before-leave="transitionCallback('beforeLeave')"
//         // v-on:leave="transitionCallback('leave')"
//         // v-on:after-leave="transitionCallback('afterLeave')"
//         // v-on:leave-cancelled="transitionCallback('cancelledLeave')"
//     },
//     title: title, // 标题
//     // 若选择了type 则以下全部无效
//     closeOnClickModal: false, // 点击蒙版是否关闭窗口
//     modal: false, // 是否显示蒙版
//     style: '', // wrapper style
//     wrapperClass: '', // 最外层内容区域类名
//     dialogStyle: '', // dialogStyle
//     contentStyle: '', // 内容区域style
//     messageStyle: '', // 真·内容区style
//     btnsStyle: '', // 按钮区域style
//     width: 100px, // windowSize下起作用
//     height:100px // windowSize下起作用
// };
