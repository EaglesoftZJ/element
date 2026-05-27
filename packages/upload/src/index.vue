<script>
import UploadList from './upload-list';
import uploadListDragger from './upload-list-dragger.vue';
import Upload from './upload';
import IframeUpload from './iframe-upload';
import ElProgress from 'element-ui/packages/progress';
import ElTooltipDef from 'element-ui/packages/tooltip';
import Migrating from 'element-ui/src/mixins/migrating';
import Locale from 'element-ui/src/mixins/locale';
import Vue from 'vue';

function noop() {}

export default {
  name: 'ElUpload',

  mixins: [Migrating, Locale],

  components: {
    ElProgress,
    UploadList,
    uploadListDragger,
    Upload,
    IframeUpload
  },

  provide() {
    return {
      uploader: this
    };
  },

  inject: {
    elForm: {
      default: ''
    }
  },

  props: {
    action: {
      type: String,
      required: true
    },
    headers: {
      type: Object,
      default() {
        return {};
      }
    },
    data: Object,
    multiple: Boolean,
    name: { // file的key
      type: String,
      default: 'file'
    },
    saveFileNameFn: { // 上传的文件名自定义函数
      type: Function
    },
    drag: Boolean,
    dragInTextList: Boolean, // showFileList && listType === 'text' && dragInTextList 则拖拽交互在el-upload-list--text上执行
    dragger: Boolean,
    withCredentials: Boolean,
    showFileList: {
      type: Boolean,
      default: true
    },
    accept: String,
    type: {
      type: String,
      default: 'select'
    },
    beforeUpload: Function,
    beforeRemove: Function,
    onRemove: {
      type: Function,
      default: noop
    },
    onChange: {
      type: Function,
      default: noop
    },
    onPreview: {
      type: Function
    },
    onSuccess: {
      type: Function,
      default: noop
    },
    onProgress: {
      type: Function,
      default: noop
    },
    onError: {
      type: Function,
      default: noop
    },
    fileList: {
      type: Array,
      default() {
        return [];
      }
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    listType: {
      type: String,
      default: 'text' // text,picture,picture-card
    },
    httpRequest: Function,
    disabled: Boolean,
    limit: Number,
    onExceed: {
      type: Function,
      default: noop
    },
    compressPic: {
      // 压缩图片
      type: Boolean
    },
    limitPicMB: {
      // compressPic为true的情况生效 允许图片的大小 超过则压缩
      type: Number,
      default: 1
    },
    quality: { // 图片质量
      type: Number,
      default: 0.9
    },
    props: { // 文件字段映射 20200509
      type: Object,
      default() {
        return {};
      }
    },
    draggable: { // 文件列表是否可拖动排序
      type: Boolean,
      default: false
    },
    pasteable: { // 是否开启粘贴上传
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      uploadFiles: [],
      dragOver: false,
      draging: false,
      tempIndex: 1,
      pasteHover: false // 鼠标是否悬停在上传容器上
    };
  },

  computed: {
    uploadDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
    calProps() {
      const props = {
        name: 'name',
        url: 'url'
      };
      for (const key in props) {
        if (this.props[key]) {
          props[key] = this.props[key];
        }
      }
      return props;
    },
    pasteTipText() {
      // 粘贴上传提示文案（全局配置 > 多语言适配）
      return this.$ELEMENT.uploadPasteTip || this.t('el.upload.pasteTip');
    },
    formatErrorText() {
      // 粘贴上传格式校验失败提示文案（多语言适配）
      return this.t('el.upload.formatError');
    },
    actualPasteable() {
      const hasPasteableProp = this.$options.propsData && 'pasteable' in this.$options.propsData;
      if (hasPasteableProp) {
        return this.pasteable;
      }
      if (this.dragInTextList) {
        return true;
      }
      return this.pasteable;
    },
    // 当前是否允许粘贴交互：actualPasteable 控制功能开关，uploadDisabled 控制禁用状态
    pasteActive() {
      return this.actualPasteable && !this.uploadDisabled;
    }
  },

  watch: {
    fileList: {
      immediate: true,
      handler(fileList) {
        this.uploadFiles = fileList.map(item => {
          item.uid = item.uid || Date.now() + this.tempIndex++;
          item.status = item.status || 'success';
          return item;
        });
      }
    },
    pasteHover(val) {
      // 同步驱动命令式 Tooltip 实例的显隐
      if (this._pasteTooltip) {
        this._pasteTooltip.showPopper = val;
      }
    },
    pasteTipText(val) {
      // 多语言切换时同步更新 content
      if (this._pasteTooltip) {
        this._pasteTooltip.content = val;
      }
    },
    pasteActive(val) {
      if (val) {
        // 粘贴交互变为可用：懒创建 tooltip 实例（已存则跳过）
        if (!this._pasteTooltip) {
          this._initPasteTooltip();
        }
      } else {
        // 粘贴交互失效时（功能关闭或禁用）统一复位状态
        this.pasteHover = false;
        document.removeEventListener('paste', this._onContainerPaste);
      }
    }
  },

  methods: {
    handleStart(rawFile) {
      rawFile.uid = Date.now() + this.tempIndex++;
      let file = {
        status: 'ready',
        name: rawFile.name,
        size: rawFile.size,
        percentage: 0,
        uid: rawFile.uid,
        raw: rawFile
      };

      try {
        file.url = URL.createObjectURL(rawFile);
      } catch (err) {
        console.error(err);
        return;
      }

      this.uploadFiles.push(file);
      this.onChange(file, this.uploadFiles);
    },
    handleProgress(ev, rawFile) {
      const file = this.getFile(rawFile);
      this.onProgress(ev, file, this.uploadFiles);
      file.status = 'uploading';
      file.percentage = ev.percent || 0;
    },
    handleSuccess(res, rawFile) {
      const file = this.getFile(rawFile);

      if (file) {
        file.status = 'success';
        file.response = res;

        this.onSuccess(res, file, this.uploadFiles);
        this.onChange(file, this.uploadFiles);
      }
    },
    handleError(err, rawFile) {
      const file = this.getFile(rawFile);
      const fileList = this.uploadFiles;

      file.status = 'fail';

      fileList.splice(fileList.indexOf(file), 1);

      this.onError(err, file, this.uploadFiles);
      this.onChange(file, this.uploadFiles);
    },
    handleRemove(file, raw) {
      if (raw) {
        file = this.getFile(raw);
      }
      let doRemove = () => {
        // this.abort(file);
        let fileList = this.uploadFiles;
        // fileList.splice(fileList.indexOf(file), 1);
        let removeData = () => {
          this.abort(file);
          fileList.splice(fileList.indexOf(file), 1);
        };
        if (this.onRemove) {
          var before = this.onRemove(file, fileList);
          if (before && before.then) {
            before.then(
              () => {
                removeData();
              },
              () => {
                // do nothing
              }
            );
          } else if (before) {
            removeData();
          } else {
            // do nothing
          }
        } else {
          removeData();
        }
        // this.onRemove(file, fileList);
      };

      if (!this.beforeRemove) {
        doRemove();
      } else if (typeof this.beforeRemove === 'function') {
        const before = this.beforeRemove(file, this.uploadFiles);
        if (before && before.then) {
          before.then(() => {
            doRemove();
          }, noop);
        } else if (before !== false) {
          doRemove();
        }
      }
    },
    getFile(rawFile) {
      let fileList = this.uploadFiles;
      let target;
      fileList.every(item => {
        target = rawFile.uid === item.uid ? item : null;
        return !target;
      });
      return target;
    },
    abort(file) {
      this.$refs['upload-inner'].abort(file);
    },
    clearFiles() {
      this.uploadFiles = [];
    },
    submit() {
      this.uploadFiles
        .filter(file => file.status === 'ready')
        .forEach(file => {
          this.$refs['upload-inner'].upload(file.raw);
        });
    },
    getMigratingConfig() {
      return {
        props: {
          'default-file-list': 'default-file-list is renamed to file-list.',
          'show-upload-list': 'show-upload-list is renamed to show-file-list.',
          'thumbnail-mode':
            'thumbnail-mode has been deprecated, you can implement the same effect according to this case: http://element.eleme.io/#/zh-CN/component/upload#yong-hu-tou-xiang-shang-chuan'
        }
      };
    },
    handleSortChange({ oldIndex, newIndex, file, files }) {
      // 同步内部 uploadFiles 数组顺序
      const moved = this.uploadFiles.splice(oldIndex, 1)[0];
      this.uploadFiles.splice(newIndex, 0, moved);
      // 向外 emit
      this.$emit('sort-change', { oldIndex, newIndex, file, files: this.uploadFiles });
    },
    // ---- 粘贴上传：mouseenter/leave 直接在根容器上管理 ----
    _handlePasteMouseEnter() {
      if (!this.pasteActive) return;
      this.pasteHover = true;
      document.addEventListener('paste', this._onContainerPaste);
    },
    _handlePasteMouseLeave() {
      if (!this.pasteActive) return;
      this.pasteHover = false;
      document.removeEventListener('paste', this._onContainerPaste);
    },
    /**
     * 校验文件是否符合当前组件设置的 accept 规则
     * 忽略大小写，支持验证扩展名 (如 .png)、泛型 MIME 类型 (如 image/*) 以及具体 MIME 类型 (如 image/jpeg)
     * @param {File} fileObj 待验证的 File 对象
     * @returns {Boolean} 校验是否通过
     */
    _checkAccept(fileObj) {
      if (!this.accept) return true;
      const accepts = this.accept.split(',').map(a => a.trim().toLowerCase());
      const fileType = (fileObj.type || '').toLowerCase();
      const fileName = (fileObj.name || '').toLowerCase();

      return accepts.some(type => {
        if (type.startsWith('.')) return fileName.endsWith(type);
        if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', '/'));
        return fileType === type;
      });
    },
    /**
     * 推断截图文件应该使用的扩展名
     * 规则：如果 accept 未配置、设置为 image/* 或明确包含 png，则首选 png；
     * 否则，从 accept 允许的列表中回退寻找其他已知图片格式（如 jpg, gif, webp, bmp）；
     * 如果都不匹配且 accept 明确限制了其他非图片格式，则返回 null。
     * @returns {String|null} 对应的文件扩展名（如 'png', 'jpg'），不符合限制时返回 null
     */
    _getScreenshotExt() {
      if (!this.accept) return 'png';
      const accepts = this.accept.split(',').map(a => a.trim().toLowerCase());
      if (accepts.some(a => a === 'image/png' || a === '.png' || a === 'image/*')) return 'png';

      const fallback = accepts.find(a =>
        a === 'image/jpeg' || a === '.jpg' || a === '.jpeg' ||
        a === 'image/gif' || a === '.gif' ||
        a === 'image/webp' || a === '.webp' ||
        a === 'image/bmp' || a === '.bmp'
      );
      if (fallback) {
        return fallback.replace('image/', '').replace('.', '');
      }
      return null; // 当前 accept 配置不允许任何已知图片格式
    },
    /**
     * 预处理粘贴事件提取出的 File 对象
     * 核心目的：识别系统截图操作并进行优化处理。
     * 1. 截图判定：默认名称为 image.png/jpg 且最后修改时间在 1000ms 内。
     * 2. 处理逻辑：将截图重命名为全局唯一的 GUID 以防止同名覆盖，并根据 accept 推断正确的扩展名及 MIME 类型。
     * @param {File} file 剪贴板提取的原始 File 对象
     * @returns {File|null} 若为非截图则直接返回原文件；若为截图则返回重命名/格式化后的新 File；若格式被 accept 拒绝则返回 null
     */
    _processScreenshotFile(file) {
      // 截图通常被浏览器命名为 image.png / image.jpg 等
      const isDefaultName = ['image.png', 'image.jpg', 'image.jpeg'].includes(file.name);
      // 截图是在粘贴瞬间创建的，lastModified 会无限接近当前时间
      const isJustCreated = Math.abs(Date.now() - file.lastModified) <= 1000;

      if (!isDefaultName || !isJustCreated) return file; // 不是截图，直接返回原文件

      const ext = this._getScreenshotExt();
      if (!ext) return null; // 无法匹配到允许的图片后缀

      const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });

      const mimeTypeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp' };
      const mimeType = mimeTypeMap[ext] || file.type;

      return new File([file], `${guid}.${ext}`, { type: mimeType });
    },
    _onContainerPaste(e) {
      if (this.uploadDisabled) return;
      const fileItems = Array.from((e.clipboardData || {}).items || []).filter(item => item.kind === 'file');
      if (!fileItems.length) return;

      const files = [];
      let hasError = false;

      for (const item of fileItems) {
        const file = item.getAsFile();
        if (!file) continue;

        const processedFile = this._processScreenshotFile(file);

        if (!processedFile || !this._checkAccept(processedFile)) {
          hasError = true;
          break; // 只要有一个文件不符合规范就报错并终止
        }
        files.push(processedFile);
      }

      if (hasError) {
        this.$message && this.$message.error(this.formatErrorText);
        return;
      }

      if (files.length) {
        e.preventDefault();
        this.$refs['upload-inner'].uploadFiles(files);
      }
    },
    // ---- 粘贴 Tooltip 实例管理 ----
    _initPasteTooltip() {
      if (this.$isServer || !this.actualPasteable) return;
      // 命令式创建 Tooltip 实例，避免作为根元素影响 $parent 关系
      const TooltipCtor = Vue.extend(ElTooltipDef);
      this._pasteTooltip = new TooltipCtor({
        propsData: {
          placement: 'bottom-start',
          popperClass: 'el-upload-paste-tooltip',
          manual: true
        }
      });
      this._pasteTooltip.$mount();
      // 将 popper 挂到 body，referenceElm 指向本组件根元素
      document.body.appendChild(this._pasteTooltip.$el);
      this._pasteTooltip.referenceElm = this.$el;
      // 同步初始 content
      this._pasteTooltip.content = this.pasteTipText;
    },
    _destroyPasteTooltip() {
      if (!this._pasteTooltip) return;
      this._pasteTooltip.showPopper = false;
      Vue.nextTick(() => {
        if (this._pasteTooltip) {
          this._pasteTooltip.$destroy();
          if (this._pasteTooltip.$el && this._pasteTooltip.$el.parentNode) {
            this._pasteTooltip.$el.parentNode.removeChild(this._pasteTooltip.$el);
          }
          this._pasteTooltip = null;
        }
      });
    }
  },
  mounted() {
    this._initPasteTooltip();
  },
  beforeDestroy() {
    document.removeEventListener('paste', this._onContainerPaste);
    this._destroyPasteTooltip();
  },

  render(h) {
    let uploadList;
    let listDraggable = false;
    const trigger = this.$slots.trigger || this.$slots.default;
    if (this.showFileList) {
      listDraggable = this.listType === 'text' && this.dragInTextList;
      const listProps = {
        listType: this.listType,
        files: this.uploadFiles,
        handlePreview: this.onPreview,
        props: this.calProps,
        draggable: this.draggable,
        disabled: this.uploadDisabled
      };
      const options = {
        props: listProps,
        attrs: listProps,
        on: {
          remove: this.handleRemove,
          'sort-change': this.handleSortChange
        },
        scopedSlots: {
          btn: (props) => {
            return this.$scopedSlots.btn && this.$scopedSlots.btn(props);
          },
          file: (props) => {
            return this.$scopedSlots.file && this.$scopedSlots.file(props);
          },
          suffixName: (props) => {
            return this.$scopedSlots.suffixName && this.$scopedSlots.suffixName(props);
          },
          default() {
            return trigger;
          }
        }
      };
      if (listDraggable) {
        options.scopedSlots.tip = () => {
          return this.$slots.tip;
        };
      }
      uploadList = listDraggable ? (
        <uploadListDragger
          { ...options }
        >
        </uploadListDragger>
      ) : (
        <UploadList
          { ...options }
        >
        </UploadList>
      );
    }

    const uploadData = {
      props: {
        type: this.type,
        drag: this.drag,
        action: this.action,
        multiple: this.multiple,
        'before-upload': this.beforeUpload,
        'with-credentials': this.withCredentials,
        headers: this.headers,
        name: this.name,
        data: this.data,
        accept: this.accept,
        fileList: this.uploadFiles,
        autoUpload: this.autoUpload,
        listType: this.listType,
        disabled: this.uploadDisabled,
        limit: this.limit,
        compressPic: this.compressPic,
        limitPicMB: this.limitPicMB,
        quality: this.quality,
        'on-exceed': this.onExceed,
        'on-start': this.handleStart,
        'on-progress': this.handleProgress,
        'on-success': this.handleSuccess,
        'on-error': this.handleError,
        'on-preview': this.onPreview,
        'on-remove': this.handleRemove,
        'http-request': this.httpRequest,
        saveFileNameFn: this.saveFileNameFn
      },
      ref: 'upload-inner'
    };

    const uploadComponent =
      typeof FormData !== 'undefined' || this.$isServer ? (
        <upload {...uploadData}>{listDraggable ? '' : trigger}</upload>
      ) : (
        <iframeUpload {...uploadData}>{listDraggable ? '' : trigger}</iframeUpload>
      );

    const showInTop = this.listType === 'picture-card' || listDraggable;
    const pasteEvents = this.pasteActive ? {
      mouseenter: this._handlePasteMouseEnter,
      mouseleave: this._handlePasteMouseLeave
    } : {};
    return (
      <div {...{on: pasteEvents}}>
        {showInTop ? uploadList : ''}
        {this.$slots.trigger
          ? [uploadComponent, this.$slots.default]
          : uploadComponent}
        {!listDraggable && this.$slots.tip}
        {!showInTop ? uploadList : ''}
      </div>
    );
  }
};
</script>
