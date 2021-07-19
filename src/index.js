// 图片尺寸限制
// 图片size限制：如果压缩之后，大小在限制范围内，则直接上传
// 压缩之后，图片超出限制的大小，进行尺寸限制？
const REGEXP_IMAGE_TYPE = /^image\//;
const defaultOptions = {
    file: null,
    quality: 0.8,
    maxFileSize: 2 * 1024 * 1024,
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

    file2DataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result)
            };
            reader.readAsDataURL(file);
        })
    }


    url2Image(url) {
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

    blob2Image(blob) {
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

    image2Canvas(image, rect) {
        return new Promise((resolve, reject) => {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = rect.width || image.naturalWidth;
            canvas.height = rect.height || image.naturalHeight;
            ctx.drawImage(image, 0, 0, rect.width, rect.height);
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

    getImgRect(image, options) {
        const aspectRatio = image.width / image.height;

        let maxWidth = Math.max(options.maxWidth, 0) || Infinity;
        let maxHeight = Math.max(options.maxHeight, 0) || Infinity;
        let minWidth = Math.max(options.minWidth, 0) || 0;
        let minHeight = Math.max(options.minHeight, 0) || 0;

        if (maxWidth < Infinity && maxHeight < Infinity) {
            if (maxHeight * aspectRatio > maxWidth) {
                maxHeight = maxWidth / aspectRatio;
            } else {
                maxWidth = maxHeight * aspectRatio;
            }
        } else if (maxWidth < Infinity) {
            maxHeight = maxWidth / aspectRatio;
        } else if (maxHeight < Infinity) {
            maxWidth = maxHeight * aspectRatio;
        }


        if (minWidth > 0 && minHeight > 0) {
            if (minHeight * aspectRatio > minWidth) {
                minHeight = minWidth / aspectRatio;
            } else {
                minWidth = minHeight * aspectRatio;
            }
        } else if (minWidth > 0) {
            minHeight = minWidth / aspectRatio;
        } else if (minHeight > 0) {
            minWidth = minHeight * aspectRatio;
        }

        let width = Math.max(options.width, 0) || image.width;
        let height = Math.max(options.height, 0) || image.height;

        if (height * aspectRatio > width) {
            height = width / aspectRatio;
        } else {
            width = height * aspectRatio;
        }

        width = Math.floor(Math.min(Math.max(width, minWidth), maxWidth));
        height = Math.floor(Math.min(Math.max(height, minHeight), maxHeight));

        return {
            width,
            height
        }
    }

    async process() {
        if (!this.file || !isImageType(this.file.type)) {
            console.error('请上传图片文件！')
            return
        }

        if (this.file.size <= this.config.maxFileSize) {
            return
        }
        const image = await this.file2Image(this.file);
        const rect = this.getImgRect(image, this.config)
        const canvas = await this.image2Canvas(image, rect);
        const dataUrl = this.canvas2DataUrl(canvas);
        const blob = this.dataUrl2Blob(dataUrl);
        // 压缩之后的大小与maxFileSize相比较，如果
        return blob;
    }
}

const compressImage = (file, options) => new Compress(file, options)
window.compressImage = compressImage;
export default compressImage





