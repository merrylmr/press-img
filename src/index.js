// 图片尺寸限制
// 图片size限制：如果压缩之后，大小在限制范围内，则直接上传
// 压缩之后，图片超出限制的大小，进行尺寸限制？
const REGEXP_IMAGE_TYPE = /^image\//;
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
class Compress {
    constructor(file, config) {
        this.config = {
            ...defaultOptions,
            ...config
        }
        this.file = file
    }

    static file2DataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result)
            };
            reader.readAsDataURL(file);
        })
    }


    static user2Image(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = url;
            image.onload = function () {
                resolve(image)
            }
            image.onerror = function (err) {
                reject(err)
            }
        })
    }

    static blob2Image(blob) {
        return this.file2Image(blob)
    }

    file2Image(file) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            let URL = window.webkitURL || window.URL;
            if (URL) {
                let url = URL.createObjectURL(file)
                image.onload = function () {
                    resolve(image)
                    URL.revokeObjectURL(url)
                };
                image.onerror = () => {
                    reject('image load error')
                }
                image.src = url;
            } else {
                reject('浏览器不支持URL方法')
            }
        })
    }


    image2Canvas(image) {
        return new Promise((resolve, reject) => {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas)
        })
    }

    canvas2DataUrl(canvas) {
        return canvas.toDataURL(this.config.type || 'image/jpeg', this.config.quality || 0.8)
    }

    dataUrl2Blob(dataUrl) {
        const data = dataUrl.split(',')[1];
        const mimePattern = /^data:(.*?)(:base64)?,/;
        const mime = dataUrl.match(mimePattern)[1];
        const binStr = atob(data);
        const len = binStr.length;
        const arr = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i)
        }
        return new Blob([arr], {type: this.config.type || mime})
    }


    async process() {
        if (!this.file || !isImageType(this.file.type)) {
            console.error('请上传图片文件！')
            return
        }
        const image = await this.file2Image(this.file);
        console.log('image', image);
        const canvas = await this.image2Canvas(image);
        console.log('canvas', canvas);
        const dataUrl = this.canvas2DataUrl(canvas);
        const blob = this.dataUrl2Blob(dataUrl);
        return blob;
    }
}

const compressImage = (file, options) => new Compress(file, options).process()
window.compressImage = compressImage;

window.a = 1;
export default compressImage





