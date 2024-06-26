<script>
import UploadList from './upload-list';
import uploadListDragger from './upload-list-dragger.vue';
import Upload from './upload';
import IframeUpload from './iframe-upload';
import ElProgress from 'element-ui/packages/progress';
import Migrating from 'element-ui/src/mixins/migrating';


function noop() {}

export default {
  name: 'ElUpload',

  mixins: [Migrating],

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
    name: {
      type: String,
      default: 'file'
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
    }
  },

  data() {
    return {
      uploadFiles: [],
      dragOver: false,
      draging: false,
      tempIndex: 1
    };
  },

  computed: {
    uploadDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
    calProps() {
      const props = {
        name: 'name',
        url: 'url',
      };
      for (const key in props) {
        if (this.props[key]) {
          props[key] = this.props[key];
        }
      }
      return props;
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
    }
  },

  render(h) {
    let uploadList;
    let listDraggable = false;
    const trigger = this.$slots.trigger || this.$slots.default;
    if (this.showFileList) {
      listDraggable = this.listType === 'text' && this.dragInTextList;
      const options = {
        attrs: {
          listType: this.listType,
          files: this.uploadFiles,
          handlePreview: this.onPreview,
          props: this.calProps
        },
        props: {
          disabled: this.uploadDisabled,
        },
        on: {
          remove: this.handleRemove
        },
        scopedSlots: {
          btn: (props) => {
            return this.$scopedSlots.btn && this.$scopedSlots.btn(props);
          },
          default() {
            return trigger;
          }
        }
      }
      uploadList = listDraggable ? (
        <uploadListDragger
         { ...options }
        >
        </uploadListDragger>
      ): (
        <UploadList
         { ...options }
        >
          {props => {
            return this.$scopedSlots.btn && this.$scopedSlots.btn(props);
          }}
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
        'http-request': this.httpRequest
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
    return (
      <div>
        {showInTop ? uploadList : ''}
        {this.$slots.trigger
          ? [uploadComponent, this.$slots.default]
          : uploadComponent}
        {this.$slots.tip}
        {!showInTop ? uploadList : ''}
      </div>
    );
  }
};
</script>
