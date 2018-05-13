import {
  type
} from 'os';
import vue from 'vue';
import $ from 'jquery';

/*eslint-disable*/
/**
 * Created by tree on 2016/12/9.
 * 用于跟后台的交互
 */

let tokenTimeout = 0; // ajax请求错误弹窗次数
let ajaxCount = 0; // ajax请求计数
let loadingInstance = null;

function plugin(Vue) {

  if (plugin.installed) {
    return;
  }

  Object.defineProperties(Vue.prototype, {

    $eg: {
      get() {
        let Vue = this;
        let vm = new vue({
          router: Vue.$routerInstance
        });
        return {
          data() {
            return Vue.$data;
          },
          getAjaxCount() {
            // 获取正在请求的接口个数
            return ajaxCount;
          },
          //获取vue中的data数据
          getModel: function () {
            return $.extend(true, {}, Vue.$data)
          },
          gridBind(gvid) {
            Vue.$emitter.emit(gvid + "_grid_bind");
          },
          setModel(key, data) {
            var _key = data ? key : 'data';
            var _data = data ? data : key;
            for (var o in Vue.$data[_key]) {
              console.log('setModel:key:', o);
              console.log('setModel:value', _data[o]);
              if (_data[o] !== null && _data[o] !== undefined) {
                Vue.$data[_key][o] = _data[o];
              }
            }

            // console.log('setModel:result:', Vue.$data[_key]);
            Vue.$data["eg_dataOld"] = JSON.parse(JSON.stringify(_data));
          },
          extend(dataOld, dataNew) {
            dataNew["eg_dataOld"] = $.extend(true, {}, dataNew);
            return $.extend(true, dataOld, dataNew);
          },
          clearModel() {
            for (var o in Vue.$data.data) {
              if (typeof (Vue.$data.data[o]) === "string") {
                Vue.$data.data[o] = '';
              } else {
                Vue.$data.data[o] = null;
              }
            }
          },
          ajax(evt, options, reqType) {
            /*
            1:创建XMLHttpRequest对象
            2:注册回调函数
            reqType update|insert|delete|page
            */
            options = {
              name: options.name || "ajax",
              data: options.data || '',
              GridViewStateData: options.gridViewStateData || null,
              type: options.type || "POST",
              async: options.async == null ? true : options.async,
              url: options.url || window.location.toString().replace(/(.*\/)/g, ""),
              cache: options.cache == null ? false : options.cache,
              timeout: options.timeout || -1,
              before: options.before || function () {}, //ajax请求之前
              success: options.success || function () {}, // 请求成功，结果成功
              fail: options.fail || function () {}, // 请求成功，结果失败
              complete: options.complete || function () {}, //ajax请求完全结束
              timeoutfn: options.timeoutfn,
              jsontype: options.jsontype || null
              // RefreshGrid: options.RefreshGrid || '',
              // rowIndex: options.rowIndex || 0
            };
            /* 添加log */
            var obj = {
              reqType,
              data: {}
            };
            var data = options.data;
            if (reqType === 'update') {
              obj.data = [];
              for (var key in data) {
                if (data.hasOwnProperty(key) && Vue['eg_dataOld'].hasOwnProperty(key) && key !== 'log' && data[key] !== Vue['eg_dataOld'][key]) {
                  obj.data.push({
                    key,
                    oldVal: Vue['eg_dataOld'][key],
                    newVal: data[key]
                  });
                }
              }
            } else if (reqType === 'insert') {
              obj.data = data;
            } else if (reqType === 'delete' && Array.isArray(Vue['eg_dataOld'])) {
              var arr = Vue.$linq.from(Vue['eg_dataOld']).where('$.bh ===' + data.bh).toArray();
              obj.data = arr[0];
            }
            obj.data = JSON.stringify(obj.data);
            console.log('reqType========================', options.url, reqType);
            reqType && reqType !== 'page' && (options.data['log'] = obj);
            console.log('================data', Vue['eg_dataOld'], JSON.stringify(options.data));
            /* 添加log */



            console.log(options);
            var currObj = null;

            //发起请求前把当前按钮禁用，禁止重复提交
            if (evt !== null && typeof (evt) !== 'string') {
              currObj = evt.currentTarget;
              currObj.disabled = true;
              $(currObj).addClass("is-disabled");
              $(currObj).attr("disabled", "true");
            }

            // console.log(JSON.stringify(options.data));
            // var a=eval("(" + JSON.stringify(options.data) + ")");
            // alert(a.name);

            if (typeof (options.data) == "object" && Object.prototype.toString.call(options.data).toLowerCase() == "[object object]" && !options.data.length) {
              // options.data['loginInfo'] = Vue.$store.loginInfo;
              options.data['location'] = document.location.href;

            }

            // 如果evt是string，说明用户希望自己通过v-loading自行加载显示loading
            if (typeof (evt) !== 'string') {
              //请求前显示loading
              loadingInstance = loadingInstance ? loadingInstance : Vue.$loading({
                customClass: 'eg-loading'
              });

              ajaxCount++;
              console.log('ajaxCount', ajaxCount);
            }
            // let contentType = options.contentType; 
            // if (contentType == null) {  
            //     contentType = "application/json";
            // }
            let type = options.jsontype;

            console.log('测试测试测试===============', Vue.$data);

            // options.data['eg_dataOld'] = Vue.$data["eg_dataOld"];


            $.ajax({
              type: options.type,
              contentType: type == 'json' ? "application/x-www-form-urlencoded; charset=utf-8" : "application/json; charset=utf-8",
              //contentType: "application/json",//"application/json",//"application/x-www-form-urlencoded"
              url: options.url,
              cache: options.cache,
              async: options.async,
              //data:JSON.stringify({data:Vue.$utils.base64_encode(JSON.stringify(options.data))}),
              //data:JSON.stringify(options.data),
              data: type == 'json' ? options.data : JSON.stringify(options.data),
              dataType: 'json',
              //beforeSend:function(){},
              complete: function () {
                console.log('complete', ajaxCount);
                //请求结束恢复按钮，从而可以继续发起请求
                if (currObj != null) {
                  currObj.disabled = false;
                  $(currObj).removeClass("is-disabled");
                  $(currObj).removeAttr("disabled");
                }

                if (typeof (evt) !== 'string') {
                  ajaxCount--;
                }
                ajaxCount === 0 && Vue.$emit('ajaxReady');
                if (loadingInstance !== null && ajaxCount === 0) {
                  //请求完成关闭loading
                  loadingInstance.close();
                  loadingInstance = null;
                }
                options.complete;
              },
              success: (result) => {
                /* 添加log */
                if (!reqType) {
                  // 存储查询数据
                  console.log('存储查询数据', Vue['eg_dataOld']);
                  Vue['eg_dataOld'] = JSON.parse(JSON.stringify(result));
                } else if (reqType === 'update') {
                  // update后更新原始数据
                  Vue['eg_dataOld'] = JSON.parse(JSON.stringify(options.data));
                }
                /* 添加log */

                console.info('返回的结果集：', result);
                // ajaxCount--;
                console.log('success', ajaxCount);
                if (result['statusCode'] === Vue.$code.TOKEN_ERROR) {
                  // token失效
                  tokenTimeout++;
                  if (tokenTimeout <= 1) {
                    console.log('tokenTimeout', tokenTimeout);
                    Vue.$alert('登录超时，请重新登录', '提示', {
                      confirmButtonText: '确定',
                      callback: action => {
                        tokenTimeout = 0;
                        vm.$router.replace('/login');
                      }
                    });
                  }
                } else if (result['statusCode'] && result['statusCode'] > 400) {
                  options.fail.call(Vue, result);
                  this.defaultSuccess(result);
                } else {
                  options.success.call(Vue, result);
                }
                // Vue.$store.preToken = tokenInfo.token;
              },
              error: function (result) {
                console.log('ajax error:', result);

                if (!options.error && result.status) {
                  if (result.status === 500) {
                    Vue.$message({
                      message: '服务器处理出错',
                      type: 'error'
                    });
                  } else if (result.status === 404) {
                    Vue.$message({
                      message: '服务端不存在此Webservice，请联系管理员',
                      type: 'error'
                    });
                  }
                } else if (typeof (options.error) === 'function') {
                  options.error.call(Vue, result);
                }
                // ajaxCount--;
                console.log('error', ajaxCount);
              }
            });
          },


          eval: (expr) => {
            console.log('FormData', Vue.FormData);
            return eval(expr);
          },
          defaultSuccess: function (result) {
            // if(result.type == "AjaxDataBind"){
            // //把数据推送给gridview
            // if(result.data instanceof Array){
            //     if(options.RefreshGrid!=''){
            //         result["$rowIndex"] = options.rowIndex;
            //         this.$emitter.emit(options.RefreshGrid + "_refresh",result);
            //     }
            // }
            var c = Vue.$code;
            console.log('statusCode', result.statusCode);
            switch (result.statusCode) {
              case c.INSERT_SUCCESS:
              case c.UPDATE_SUCCESS:
              case c.EXCHANGE_SUCCESS:
                Vue.$message({
                  message: result.errorReason || '保存成功',
                  type: 'success'
                });
                break;
              case c.DELETE_SUCCESS:
                Vue.$message({
                  message: result.errorReason == '' ? '删除成功' : result.errorReason,
                  type: 'success'
                });
                break;
              case c.INSERT_FAIL:
              case c.UPDATE_FAIL:
              case c.EXCHANGE_FAIL:
                Vue.$message({
                  message: result.errorReason == '' ? '保存失败' : result.errorReason,
                  type: 'warning'
                });
                break;
              case c.DELETE_FAIL:
                Vue.$message({
                  message: result.errorReason == '' ? '删除失败' : result.errorReason,
                  type: 'warning'
                });
                break;
              case c.INSERT_ERROR:
              case c.UPDATE_ERROR:
                Vue.$message({
                  message: result.errorReason == '' ? '保存出错' : result.errorReason,
                  type: 'error'
                });
                break;
              case c.DELETE_ERROR:
                Vue.$message({
                  message: result.errorReason == '' ? '删除出错' : result.errorReason,
                  type: 'error'
                });
                break;
            }
          },
          // },
          refreshGrid: function (gvid, data) {
            Vue.$emitter.emit(gvid + "_refresh", data);
          }
        }
      }
    }

  });
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}
export default plugin;

// (function (global, factory) {
//     typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
//         typeof define === 'function' && define.amd ? define(factory) :
//             (global.VueResource = factory());
// }(this, (function () { 'use strict';
//     var eaglesoft=function(Vue){
//         var eg={
//             data () {
//                 return Vue.$data;
//             },
//             //获取vue中的data数据
//             getModel:function () {
//                 return $.extend(true, {}, Vue.$data)
//             },
//             gridBind(gvid){
//                 Vue.$emitter.emit(gvid + "_grid_bind");
//             },
//             setModel(data){
//                 for(var o in Vue.$data.data){
//                     if(data[o]!=null){
//                         Vue.$data.data[o]=data[o];
//                     }
//                 }

//                 Vue.$data["eg_dataOld"] = $.extend(true, {}, Vue.$data["data"]);
//             },
//             clearModel(){
//                 for(var o in Vue.$data.data){
//                     Vue.$data.data[o]='';
//                 }
//             },
//             ajax : function(evt, options)
//             {
//                 /*
//                  1:创建XMLHttpRequest对象
//                  2:注册回调函数
//                  */
//                 options =
//                 {
//                     name: options.name || "ajax",
//                     data: options.data || '',
//                     GridViewStateData: options.gridViewStateData || null,
//                     type: options.type || "POST",
//                     async: options.async == null ? true : options.async,
//                     url: options.url || window.location.toString().replace(/(.*\/)/g, ""),
//                     cache: options.cache == null ? false : options.cache,
//                     timeout: options.timeout || -1,
//                     before: options.before || function() { }, //ajax请求之前
//                     success: options.success || function() { },
//                     complete: options.complete || function() { }, //ajax请求完全结束
//                     error: options.error || function() { },
//                     timeoutfn: options.timeoutfn
//                     // RefreshGrid: options.RefreshGrid || '',
//                     // rowIndex: options.rowIndex || 0
//                 };

//                 var currObj = null;

//                 //发起请求前把当前按钮禁用，禁止重复提交
//                 if(evt != null){
//                     currObj = evt.currentTarget;
//                     currObj.disabled=true;
//                     $(currObj).addClass("is-disabled");
//                     $(currObj).attr("disabled","true");
//                 }

//                 // console.log(JSON.stringify(options.data));
//                 // var a=eval("(" + JSON.stringify(options.data) + ")");
//                 // alert(a.name);
//                 $.ajax
//                 ({
//                     type: options.type,
//                     contentType: "application/json",//"application/json",//"application/x-www-form-urlencoded"
//                     url: options.url,
//                     cache:options.cache,
//                     async:options.async,
//                     data:JSON.stringify({data:Vue.$utils.base64_encode(JSON.stringify(options.data))}),
//                     // data:JSON.stringify(options.data),
//                     dataType: 'json',
//                     beforeSend:function(){},
//                     complete:function(){
//                         //请求结束恢复按钮，从而可以继续发起请求
//                         if(currObj != null){
//                             currObj.disabled=false;
//                             $(currObj).removeClass("is-disabled");
//                             $(currObj).removeAttr("disabled");
//                         }
//                         options.complete;
//                     } ,
//                     success:function(result)
//                     {
//                         console.log('返回的结果集：', result);
//                         options.success.call(Vue,result);
//                     },
//                     error:function (result) {
//                         options.error.call(Vue,result);
//                     }
//                 });
//             },
//             jq:$,
//             defaultSuccess:function (result) {
//                 if(result.type == "AjaxDataBind"){
//                     // //把数据推送给gridview
//                     // if(result.data instanceof Array){
//                     //     if(options.RefreshGrid!=''){
//                     //         result["$rowIndex"] = options.rowIndex;
//                     //         this.$emitter.emit(options.RefreshGrid + "_refresh",result);
//                     //     }
//                     // }

//                     switch(result.resultType){
//                         case "InsertSuccess":
//                         case "UpdateSuccess":
//                             Vue.$message({
//                                 message: '保存成功',
//                                 type: 'success'
//                             });
//                             break;
//                         case "DeleteSuccess":
//                             Vue.$message({
//                                 message: result.data=='' ? '删除成功':result.data,
//                                 type: 'success'
//                             });
//                             break;
//                         case "InsertFail":
//                         case "UpdateFail":
//                             Vue.$message({
//                                 message: result.data=='' ? '保存失败':result.data,
//                                 type: 'warning'
//                             });
//                             break;
//                         case "DeleteFail":
//                             Vue.$message({
//                                 message: result.data=='' ? '删除失败':result.data,
//                                 type: 'warning'
//                             });
//                             break;
//                         case "InsertError":
//                         case "UpdateError":
//                             this.$message.error(result.data=='' ? '保存出错':result.data);
//                             break;
//                         case "DeleteError":
//                             this.$message.error(result.data=='' ? '删除出错':result.data);
//                             break;
//                     }
//                 }
//             },
//             refreshGrid:function (gvid,data){
//                 Vue.$emitter.emit(gvid + "_refresh",data);
//             }

//         };

//         return eg;
//     };

//     function plugin(Vue) {
//         if (plugin.installed) {
//             return;
//         }
//         plugin.installed = true;

//         Object.defineProperties(Vue.prototype, {

//             $eg: {
//                 get: function () {
//                     // alert(this.$data.msg);
//                     return eaglesoft(this);
//                 }
//             },
//         });
//     }

//     if (typeof window !== 'undefined' && window.Vue) {
//         window.Vue.use(plugin);
//     }

//     return plugin;

// })));