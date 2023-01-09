import * as egUtils from 'eg-private-utils';
import SparkMD5 from 'spark-md5';
import utils from './ajax/utils';
// 生成文件hash值 file.size + file.name + file.lastModified;
function nameHash(file) {
  // lastModified 最后修改日期,时间戳
  const str = file.size + file.name + file.lastModified;
  return egUtils.md5(str);
}
// 创建文件分片，并生成hash2第一个分片+每个分片前后两个字节+最后一个分片
function createFileChunks({ file, size = 2 * 1024 * 1024, chunkProps }) {
  const fileChunkList = [];
  const chunkNum = Math.ceil(file.size / size); // 分片数量
  const lastChunkSize = size * chunkNum - file.size; // 最后一片分片的长度
  const nameMd5 = nameHash(file);
  let fileMd5 = '';
  chunkProps = getChunkProps(chunkProps);
  const spark = new SparkMD5.ArrayBuffer();
  const fileReader = new FileReader();
  const i = 0; // 当前分片下标
  fileReader.onload = function(e) {
    spark.append(e.target.result); 
    if (i < chunkNum - 1) {
      i++;
      loadNext();
    } else { // 全部分片处理完毕，hash生成完毕
      fileMd5 = spark.end();
    }
  }
  loadNext();
  function loadNext() {
    const currentChunkSize = i === chunkNum - 1 ? lastChunkSize : size;
    const start = i * size;
    const end = start + currentChunkSize;
    const obj = {
      [chunkProps.fileName]: file.slice(start, end), // 分片内容
      [chunkProps.fileSize]: file.size,
      [chunkProps.index]: index,
      [chunkProps.size]: currentChunkSize,
      [chunkProps.nameMd5]: nameMd5,
      [chunkProps.fileMd5]: null, // 暂时指向一个对象，上传的时候进行赋值
    }
    fileChunkList.push(obj);
    if (i === 0 || i === chunkNum - 1) { // hash2第一个分片+每个分片前后两个字节+最后一个分片
      fileReader.readAsArrayBuffer(obj.file);
    } else {
      const c1 = obj.file.slice(start, start + 2);
      const c2 = obj.file.slice(end - 2, end);
      const merge = new Blob([c1, c2]);
      fileReader.readAsArrayBuffer(merge);
    }
  }
}
function getChunkProps(chunkProps) {
  return {
    fileName: 'file', // file内容key
    fileSize: 'fileSize', // 文件总大小
    index: 'segmentIndex', // 分片索引
    size: 'segmentSize', // 分片大小
    nameMd5: 'md5NameKey', // 文件名称组成的hash
    fileMd5: 'md5FielKey', // 文件内容组成的hash
    ...chunkProps
  }
}

export default function upload(option) {
  return new Promise((resolve, reject) => {
    if (typeof XMLHttpRequest === 'undefined') {
      return;
    }
    const xhr = new XMLHttpRequest();
    const fileChunkList = createFileChunks(option);
    chunkProps = getChunkProps(chunkProps);
    const currentIndex = 0;
    
    fileChunkList.forEach(obj => {
      obj[chunkProps.fileMd5] = fileMd5;
      utils.upload({
        ...option,
        data: {
          ...option.data,
          ...obj
        },
        onSuccess() { // 片段上传成功后
        }
      }, resolve, xhr);
      function uploadChunk() {

      }
    });
  })
  
}