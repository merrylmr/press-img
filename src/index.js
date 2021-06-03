// 图片尺寸限制
// 图片size限制：如果压缩之后，大小在限制范围内，则直接上传
// 压缩之后，图片超出限制的大小，进行尺寸限制？

// 兼容性问题
// 图片压缩反而增大了

// 上传之前，压缩图片
const util = {
    pressImg: pressImg,
    file2DataUrl: file2DataUrl,
    url2Image: url2Image,
    image2Canvas: image2Canvas,
    canvas2DataUrl: canvas2DataUrl,
    dataUrl2Image: dataUrl2Image,
    dataUrl2Blob: dataUrl2Blob,
    canvas2Blob: canvas2Blob,
    blob2DataUrl: blob2DataUrl,
    blob2Image: blob2Image,
    file2Image: file2Image
}

function pressImg(file) {
// 类型判断：图片类型才可以支持压缩
    const mimeType = ['image/jpeg', 'image/png', 'image/gif']
    console.log('file', file.type)
    const fileType = file && file.type;
    if (mimeType.includes(fileType)) {
        console.log('lallala');

    } else {
        console.error('文件类型不正确：', fileType)
    }
}

// 文件转base64格式
function file2DataUrl(file, callback) {
    let reader = new FileReader();
    reader.onload = function () {
        callback(reader.result);
    };
    reader.readAsDataURL(file);
}

// url路径转化成image对象
function url2Image(url, callback) {
    let image = new Image();
    image.src = url;
    image.onload = function () {
        callback(image)
    }
}

function file2Image(file, callback) {
    let image = new Image();
    let URL = window.webkitURL || window.URL;
    if (URL) {
        let url = URL.createObjectURL(file)
        image.onload = function () {
            callback(image)
            URL.revokeObjectURL(url)
        };
        image.src = url;
    } else {
        console.error('浏览器不支持URL方法')
    }
}

function imgAspectRadio(naturalW, naturalH, w, h) {
    const rate = naturalW / naturalH;
    let width = Math.max(w || 0) || naturalW;
    let height = Math.max(h || 0) || naturalH;

    if (height * rate > width) {
        height = width / rate;
    } else {
        width = height * rate;
    }
    return {width, height}
}
// 图片转canvas
function image2Canvas(image, width, height) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let rect = {
        width: image.naturalWidth,
        height: image.naturalHeight,
    }
    if (width || height) {
        rect = imgAspectRadio(
            image.naturalWidth,
            image.naturalHeight,
            width,
            height
        )
    }

    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function canvas2DataUrl(canvas, quality, type) {
    return canvas.toDataURL(type || 'image/jpeg', quality || 0.8)
}

function dataUrl2Image(dataUrl, callback) {
    let image = new Image();
    image.onload = function () {
        callback(image)
    }
    image.src = dataUrl
}


function dataUrl2Blob(dataUrl, type) {
    const data = dataUrl.splice(',')[1];
    const mimePattern = /^data:(.*?)(:base64)?,/;
    const mime = dataUrl.match(mimePattern)[1];

    const binStr = atob(data);
    const len = binStr.length;
    const arr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i)
    }
    return new Blob([arr], {type: type || mime})
}


function canvas2Blob(canvas, callback, quality, type) {
    canvas.toBlob(function (blob) {
        callback(blob)
    }, 'image/jpeg', quality || 0.8)
}

if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            let dataUrl = this.toDataURL(type, quality);
            callback(dataUrl2Blob(dataUrl))
        }
    })
}


function blob2DataUrl(blob, callback) {
    file2DataUrl(blob, callback)
}

function blob2Image(blob, callback) {
    file2Image(blob, callback)
}


const REGEXP_IMAGE_TYPE = /^image\//;
const utils = {};
const defaultOptions = {
    file: null,
    quality: 0.8
}

const isFunc = function (fn) {
    return typeof fn === 'function'
}

const isImageType = function (value) {
    return REGEXP_IMAGE_TYPE.test(value)
}

function SimpleImageCompressor(options) {
    console.log('SimpleImageCompressor instance', this.init);
    options = Object.assign({}, defaultOptions, options);
    this.options = options;
    this.file = options.file;
    this.init();
}

const _proto = SimpleImageCompressor.prototype;
window.SimpleImageCompressor = SimpleImageCompressor;


_proto.init = function init() {
    const _this = this;
    const file = this.file;

    const options = this.options;

    if (!file || !isImageType(file.type)) {
        console.error('请上传图片文件！')
        return
    }
    if (!isImageType(options.mimeType)) {
        options.mimeType = file.type
    }
    util.file2Image(file, (image) => {
        const canvas = util.image2Canvas(image, options.width, options.height);
        file.width = image.naturalWidth;
        file.height = image.naturalHeight;

        // todo:调用压缩之前的回调
        _this.beforeCompress(file, canvas);


        util.canvas2Blob(canvas, (blob) => {
            blob.width = canvas.width;
            blob.height = canvas.height;
            // todo：成功之后的回调
            options.success && options.success(blob);
            console.log('success', options.mimeType)
        }, options.quality, options.mimeType)
    })
}

_proto.beforeCompress = function () {
    if (isFunc(this.options.beforeCompress)) {
        this.options.beforeCompress(this.file, this.options);
    }
}
// 添加静态方法
for (let key in util) {
    if (util.hasOwnProperty(key)) {
        SimpleImageCompressor[key] = util[key]
    }
}


export default SimpleImageCompressor


