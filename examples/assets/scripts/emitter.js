/**
 * Created by tree on 2016/12/7.
 * 用于组件之间的数据通信
 */
import Vue from 'vue';

export default {
    EgEmitter: new Vue(),
    emit: function(name, ...val) {
        this.EgEmitter.$nextTick(() => {
            this.EgEmitter.$emit(name, ...val);
        });
    },
    on: function(name, fn) {
        this.EgEmitter.$on(name, fn);
    },
    off: function(name, fn) {
        this.EgEmitter.$off(name, fn);
    }
};
