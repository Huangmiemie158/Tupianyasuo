document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = null;

    // 定义 handleFile 函数
    function handleFile(file) {
        console.log('处理文件:', file);
        if (!file.type.match('image.*')) {
            alert('请上传图片文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = new Image();
            originalImage.onload = () => {
                previewContainer.style.display = 'block';
                originalSize.textContent = formatFileSize(file.size);
                compressImage(originalImage);
            };
            originalImage.src = e.target.result;
            originalPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 定义 formatFileSize 函数
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 定义 compressImage 函数
    function compressImage(image) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        
        ctx.drawImage(image, 0, 0);
        
        const quality = qualitySlider.value / 100;
        
        // 根据原始图片类型决定压缩后的格式
        const originalFormat = fileInput.files[0].type;
        const outputFormat = originalFormat === 'image/png' ? 'image/png' : 'image/jpeg';
        
        const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
        compressedPreview.src = compressedDataUrl;
        
        const compressedSize = Math.round((compressedDataUrl.length - `data:${outputFormat};base64,`.length) * 3/4);
        document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);
    }

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        console.log('点击上传区域');
        fileInput.click();
    });

    // 文件选择事件
    fileInput.addEventListener('change', (e) => {
        console.log('选择了文件');
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 质量滑块变化事件
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
        if (originalImage) {
            compressImage(originalImage);
        }
    });

    // 下载按钮点击事件
    downloadBtn.addEventListener('click', () => {
        const originalFile = fileInput.files[0];
        const originalFormat = originalFile.type;
        const extension = originalFormat === 'image/png' ? 'png' : 'jpg';
        
        const originalFileName = originalFile?.name || 'compressed';
        const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");
        const timestamp = new Date().getTime();
        const newFileName = `${fileNameWithoutExt}_compressed_${timestamp}.${extension}`;
        
        const base64Data = compressedPreview.src;
        const blob = base64ToBlob(base64Data);
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = newFileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
    });

    // 添加 base64 转 Blob 的辅助函数
    function base64ToBlob(base64Data) {
        // 移除 base64 URL 的头部
        const base64String = base64Data.split(',')[1];
        
        // 将 base64 转换为原始二进制数据
        const byteString = atob(base64String);
        
        // 创建 Uint8Array
        const ab = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ab[i] = byteString.charCodeAt(i);
        }
        
        // 创建 Blob
        return new Blob([ab], { type: 'image/jpeg' });
    }
}); 