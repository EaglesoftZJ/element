<template>
  <UploadDragger class="el-upload-dragger__list" :class="{'is-disabled': disabled, 'has-tip': hasTip }" :disabled="disabled" @file="uploadFiles" @click.native="handleUploadClick">
    <uploadList :disabled="disabled" v-bind="$attrs" v-on="$listeners">
      <template slot="btn" slot-scope="{ file }">
        <slot name="btn" :file="file"></slot>
      </template>
    </uploadList>
    <div v-if="!disabled">
      <slot></slot>
      <!-- <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div> -->
    </div>
    <div class="el-upload-dragger__list_tip" @click.stop v-if="hasTip">
      <slot name="tip"></slot>
    </div>
  </UploadDragger>
</template>
<script>
  import UploadDragger from './upload-dragger.vue';
  import uploadList from './upload-list.vue';

  export default {
    data() {
      return {
      };
    },
    components: { uploadList, UploadDragger },

    props: {
      disabled: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      hasTip() {
        return this.$scopedSlots.tip();
      }
    },
    methods: {
      uploadFiles() {
        this.$parent.$refs['upload-inner'].uploadFiles(...arguments);
      },
      handleUploadClick() {
        this.$parent.$refs['upload-inner'].handleClick();
      }
    }
  };
</script>
