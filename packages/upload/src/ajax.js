function getError(action, option, xhr) {
  let msg;
  if (xhr.response) {
    msg = `${xhr.response.error || xhr.response}`;
  } else if (xhr.responseText) {
    msg = `${xhr.responseText}`;
  } else {
    msg = `fail to post ${action} ${xhr.status}`;
  }

  const err = new Error(msg);
  err.status = xhr.status;
  err.method = 'post';
  err.url = action;
  return err;
}

function getBody(xhr) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

function photoCompress(file, w, objDiv) {
  var ready = new FileReader();
  /* 开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
  ready.readAsDataURL(file);
  ready.onload = function() {
    var re = this.result;
    canvasDataURL(re, w, objDiv);
  };
}

function canvasDataURL(path, obj, callback) {
  var img = new Image();
  img.src = path;
  img.onload = function() {
    var that = this;
    // 默认按比例压缩
    var w = that.width;
    var h = that.height;
    var scale = w / h;
    w = obj.width || w;
    h = obj.height || (w / scale);
    var quality = 0.7; // 默认图片质量为0.7
    // 生成canvas
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    // 创建属性节点
    var anw = document.createAttribute('width');
    anw.nodeValue = w;
    var anh = document.createAttribute('height');
    anh.nodeValue = h;
    canvas.setAttributeNode(anw);
    canvas.setAttributeNode(anh);
    ctx.drawImage(that, 0, 0, w, h);
    // 图像质量
    if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
      quality = obj.quality;
    }
    // quality值越小，所绘制出的图像越模糊
    var base64 = canvas.toDataURL('image/jpeg', quality);
    // 回调函数返回base64的值
    callback(base64);
  };
}
/**
 * 将以base64的图片url数据转换为Blob
 * @param urlData
 * 用url方式表示的base64图片数据
 */
// function convertBase64UrlToBlob(urlData) {
//   var arr = urlData.split(',');
//   var mime = arr[0].match(/:(.*?);/)[1];
//   var bstr = atob(arr[1]);
//   var n = bstr.length;
//   var u8arr = new window.Uint8Array(n);
//   while (n--) {
//     u8arr[n] = bstr.charCodeAt(n);
//   }
//   return new Blob([u8arr], {
//     type: mime
//   });
// }

function convertBase64UrlToFile(urlData, name) {
  var arr = urlData.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8arr = new window.Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], name, {
    type: mime
  });
}

export default function upload(option) {
  var promise = new window.Promise((reslove, reject) => {
    if (typeof XMLHttpRequest === 'undefined') {
      return;
    }
    const xhr = new XMLHttpRequest();
    const action = option.action;
    if (xhr.upload) {
      xhr.upload.onprogress = function progress(e) {
        if (e.total > 0) {
          e.percent = e.loaded / e.total * 100;
        }
        option.onProgress(e);
      };
    }
    var imgType = ['jpg', 'jpeg', 'png', 'bmp'];
    var reg = new RegExp(imgType.join('|'));

    if (option.compressPic && reg.test(option.file.type) && option.file.size > option.limitPicMB * 1024 * 1024) {
      // 图片并且大于限定尺寸压缩文件
      photoCompress(option.file, {
        quality: option.quality,
        w: 1920
      }, (dataUrl) => {
        option.file = convertBase64UrlToFile(dataUrl, option.file.name);
        doUpload();
        // window.open(URL.createObjectURL(file));
      });
    } else {
      doUpload();
    }

    function doUpload() {
      const formData = new FormData();

      if (option.data) {
        Object.keys(option.data).forEach(key => {
          formData.append(key, option.data[key]);
        });
      }

      formData.append(option.filename, option.file);

      xhr.onerror = function error(e) {
        option.onError(e);
      };

      xhr.onload = function onload() {
        if (xhr.status < 200 || xhr.status >= 300) {
          return option.onError(getError(action, option, xhr));
        }

        option.onSuccess(getBody(xhr));
      };

      xhr.open('post', action, true);

      if (option.withCredentials && 'withCredentials' in xhr) {
        xhr.withCredentials = true;
      }

      const headers = option.headers || {};

      for (let item in headers) {
        if (headers.hasOwnProperty(item) && headers[item] !== null) {
          xhr.setRequestHeader(item, headers[item]);
        }
      }
      xhr.send(formData);
      reslove(xhr);
    }
  });
  return promise;
}
