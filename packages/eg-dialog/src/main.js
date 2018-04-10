const defaults = {
  title: undefined,
  message: '',
  type: '',
  showInput: false,
  showClose: true,
  lockScroll: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  inputValue: null,
  inputPlaceholder: '',
  inputPattern: null,
  inputValidator: null,
  inputErrorMessage: '',
  customClass: '',
  beforeClose: null,
  beforeShow: null,
  style: '',
  modal: true,
  contentStyle: '',
  dialogStyle: '',
  messageStyle: '',
  animate: 'egdlg-fade',
  btnsStyle: '',
  transitionCallback: null
};

import Vue from 'vue';
import msgboxVue from './main.vue';
import merge from 'element-ui/src/utils/merge';
import { isVNode } from 'element-ui/src/utils/vdom';

const MessageBoxConstructor = Vue.extend(msgboxVue);

let currentMsg, instance;
let msgQueue = [];
let instanceManager = {};
const defaultCallback = action => {
  // console.log('resolve', currentMsg);
  if (currentMsg) {
    let callback = currentMsg.callback;
    if (typeof callback === 'function') {
      if (instance.showInput) {
        callback(instance.inputValue, action);
      } else {
        callback(action);
      }
    }

    // console.log('resolve', currentMsg.resolve);
    if (currentMsg.resolve) {
      // let $type = currentMsg.options.$type;
      // if ($type === 'confirm' || $type === 'prompt') {
      //   if (action === 'confirm') {
      //     if (instance.showInput) {
      //       currentMsg.resolve({ value: instance.inputValue, action });
      //     } else {
      //       currentMsg.resolve(action);
      //     }
      //   } else if (action === 'cancel' && currentMsg.reject) {
      //     currentMsg.reject(action);
      //   }
      // } else {
      //   currentMsg.resolve(action);
      // }

      // currentMsg.resolve(instance.$slots.default[0].componentInstance);
    }
  }
};

const initInstance = () => {
  instance = new MessageBoxConstructor({
    el: document.createElement('div')
  });
  // console.log('instance', instance);
  instanceManager[instance._uid] = instance;
  instance.callback = defaultCallback;
};

const showNextMsg = () => {

  initInstance();
  
  instance.action = '';

  if (!instance.visible || instance.closeTimer) {
    if (msgQueue.length > 0) {
      currentMsg = msgQueue.shift();

      let options = currentMsg.options;
      for (let prop in options) {
        if (options.hasOwnProperty(prop)) {
          instance[prop] = options[prop];
        }
      }
      // console.log('options.callback', options.callback);
      if (options.callback === undefined) {
        instance.callback = defaultCallback;
      }

      let oldCb = instance.callback;
      // console.log('instance.callback', instance.callback);
      instance.callback = (action, instance) => {
        // console.log('docallback');
        oldCb(action, instance);
        showNextMsg();
      };
      if (isVNode(instance.message)) {
        instance.$slots.default = [instance.message];
        instance.message = null;
      } else {
        delete instance.$slots.default;
      }
      ['modal', 'showClose', 'closeOnClickModal', 'closeOnPressEscape'].forEach(prop => {
        if (instance[prop] === undefined) {
          instance[prop] = true;
        }
      });
      document.body.appendChild(instance.$el);

      Vue.nextTick(() => {
        instance.visible = true;
      });
    }
  }
};

const EgDialog = function(options, callback) {
  if (Vue.prototype.$isServer) return;
  if (typeof options === 'string') {
    options = {
      message: options
    };
    if (arguments[1]) {
      options.title = arguments[1];
    }
    if (arguments[2]) {
      options.type = arguments[2];
    }
  } else if (options.callback && !callback) {
    callback = options.callback;
  }

  if (typeof Promise !== 'undefined') {
    return new Promise((resolve, reject) => { // eslint-disable-line
      msgQueue.push({
        options: merge({}, defaults, EgDialog.defaults, options),
        callback: callback,
        resolve: resolve,
        reject: reject
      });

      showNextMsg();
    });
  } else {
    msgQueue.push({
      options: merge({}, defaults, EgDialog.defaults, options),
      callback: callback
    });

    showNextMsg();
  }
};

EgDialog.setDefaults = defaults => {
  EgDialog.defaults = defaults;
};

EgDialog.alert = (message, title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  }
  return EgDialog(merge({
    title: title,
    message: message,
    $type: 'alert',
    closeOnPressEscape: false,
    closeOnClickModal: false
  }, options));
};

EgDialog.confirm = (message, title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  }
  return EgDialog(merge({
    title: title,
    message: message,
    $type: 'confirm',
    showCancelButton: true
  }, options));
};

EgDialog.prompt = (message, title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  }
  return EgDialog(merge({
    title: title,
    message: message,
    showCancelButton: true,
    showInput: true,
    $type: 'prompt'
  }, options));
};

EgDialog.close = () => {
  instance.visible = false;
  instance.doClose();
  msgQueue = [];
  currentMsg = null;
};

EgDialog.closeAll = () => {
  console.log('instanceManager', instanceManager);
  for (var key in instanceManager) {
     instanceManager[key].close();
  }
  msgQueue = [];
  currentMsg = null;
};

export default EgDialog;
export { EgDialog };
