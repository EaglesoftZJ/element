export default {
  doUpload(option, resolve, xhr) {
    const formData = new FormData();
    const { action } = option;

    if (option.data) {
      Object.keys(option.data).forEach(key => {
        formData.append(key, option.data[key]);
      });
    }
    if (!option.chunkUpload) { // 非分片上传，则直接传整个文件
      formData.append(option.filename, option.file);
    }

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
    resolve(xhr);
  }
}