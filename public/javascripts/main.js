function loadingStart(tipsContent, errorTips, iconUrl, jump) {
    var isSupportTouch = window.supportTouch;
    $("#loadingSection .body div").unbind(isSupportTouch ? "touchend" : "click");
    if (tipsContent != null) {
        $("#loadingSection .body p").html(tipsContent);
        if (errorTips === true) {
            $("#loadingSection .body img")[0].className = "";
            $("#loadingSection .body div").css("display", "");
        } else {
            $("#loadingSection .body div").css("display", "none");
        }
    } else {
        $("#loadingSection .body div").css("display", "none");
        $("#loadingSection .body p").text("加载中请稍候");
    }
    $("#loadingSection").css("display", "");
    $("#loadingSection").css("opacity", 1);
}
function loadingStop() {
    $("#loadingSection").animate({
        opacity: 0
    }, "fast", function () {
        $("#loadingSection").css("display", "none");
    });
}



function fileChanged(evt) {
    if (this.files.length <= 0) {
        //Do something
    }

    var file = this.files[0];
    fileType = file.type;
    var reader = new FileReader();
    reader.onload = function () {
        // 转换二进制数据
        var binary = this.result;
        var binaryData = new BinaryFile(binary);
        // 获取exif信息
        var imgExif = EXIF.readFromBinaryFile(binaryData);

        var fullScreenImg = new Image();
        fullScreenImg.onload = function () {
            cropLoaded(this);
            //loadingStop();
        }
        var mpImg = new MegaPixImage(file);
        mpImg.render(fullScreenImg, { maxWidth: 960, maxHeight: 960, orientation: imgExif.Orientation });
    }
    reader.readAsBinaryString(file);
    //return preventEventPropagation(evt);
}


function cropLoaded(img) {
    cropGesture = new EZGesture($("#cropLayer")[0], $("#cropImg")[0], { targetMinWidth: 442, targetMinHeight: 540 });
    var $canvas = $("#cropCanvas");
    canvasDom = $canvas[0];
    canvasCtx = canvasDom.getContext("2d");


    var isSupportTouch = false;

    $("#cropSection").css("display", "");

    var $cropLayer = $("#cropLayer");

    var cropSectionHeight = $("#cropSection").height();
    var cropBarHeight = $("#cropBar").height();
    var cropLayerHeight = $cropLayer.height();
    var cropLayerOriginY = (cropSectionHeight - cropBarHeight - cropLayerHeight) * 0.5;
    $cropLayer.css("top", [cropLayerOriginY * 100 / cropSectionHeight, "%"].join(""));
    if (cropLayerOriginY > 0) {
        $("#cropMaskUp").css("height", [cropLayerOriginY * 100 / cropSectionHeight, "%"].join(""));
        $("#cropMaskUp").css("top", 0);
        $("#cropMaskUp").css("visibility", "visible");
        $("#cropMaskDown").css("height", [cropLayerOriginY * 100 / cropSectionHeight, "%"].join(""));
        $("#cropMaskDown").css("top", [(cropLayerOriginY + cropLayerHeight) * 100 / cropSectionHeight, "%"].join(""));
        $("#cropMaskDown").css("visibility", "visible");
    } else {
        $("#cropMaskUp").css("visibility", "hidden");
        $("#cropMaskDown").css("visibility", "hidden");
    }

    var imgWidth = img.width;
    var imgHeight = img.height;
    var ratioWidth = $cropLayer.width() / imgWidth;
    var ratioHeight = $cropLayer.height() / imgHeight;
    var ratio = ratioWidth > ratioHeight ? ratioWidth : ratioHeight;

    cropGesture.targetMinWidth = imgWidth * ratio;
    cropGesture.targetMinHeight = imgHeight * ratio;

    var imgOriginX = ($cropLayer.width() - cropGesture.targetMinWidth) * 0.5;
    var imgOriginY = ($cropLayer.height() - cropGesture.targetMinHeight) * 0.5;

    var $cropImg = $("#cropImg");
    $cropImg.css("display", "");
    $cropImg.width(cropGesture.targetMinWidth);
    $cropImg.height(cropGesture.targetMinHeight);
    $cropImg.css("left", [imgOriginX, "px"].join(""));
    $cropImg.css("top", [imgOriginY, "px"].join(""));
    $cropImg[0].src = img.src;

    cropGesture.unbindEvents();
    cropGesture.bindEvents();
    $("#cropBar .cancel-btn").unbind("click");
    $("#cropBar .cancel-btn").on("click", cropStop);
    $("#cropBar .confirm-btn").unbind("click");
    $("#cropBar .confirm-btn").on("click", cropConfirm);

    return false;
}



function cropConfirm(evt) {
    var canvasScale = canvasDom.height / $("#cropLayer").height();
    var $cropImg = $("#cropImg");
    var imgOrigin = { x: parseInt($cropImg.css("left")) || 0, y: parseInt($cropImg.css("top")) || 0 };
    var imgSize = { width: $cropImg.width(), height: $cropImg.height() };
    canvasCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
    canvasCtx.drawImage($cropImg[0], imgOrigin.x * canvasScale, imgOrigin.y * canvasScale, imgSize.width * canvasScale, imgSize.height * canvasScale);
    var dataURL = "";
    if (window.isAndroid) {
        var imgEncoder = new JPEGEncoder();
        dataURL = imgEncoder.encode(canvasCtx.getImageData(0, 0, canvasDom.width, canvasDom.height), 85, true);
    } else {
        dataURL = canvasDom.toDataURL("image/jpeg", 0.85);
    }

    jumpToMiddlePage(dataURL);
    //pageRecordClick("sng.tu.pupils.confirm");

    //return preventEventPropagation(evt);
}


function jumpToMiddlePage(dataURL) {
    $("#indexSection").css("display", "none");
    $("#cropSection").css("display", "none");
    $("#middleSection").css("display", "");
    $("#middleSection .user-photo").attr("src", dataURL);

    var dataComponent = dataURL.split(",");
    var imgData = dataComponent[1];

    $("#middleSection .detect-btn").on("click", function () {
        //userSex = 1;
        cropUploadWithData(imgData, fileType);
        //pageRecordClick("sng.tu.pupils.male");
    });

}


/*function cropUploadWithData(imgData) {
    //loadingStart("正在制作请稍等");
    console.log("正在制作请稍等");
    //var hairstyle = cosIndex;
    //if(userSex == 1) hairstyle += 3;
    var startTime = (new Date()).valueOf();
    $.ajax({
        type:"POST",
        url:"/imageupload",
        data:imgData,
        dataType:"json",
        timeout:30000,
        success:function(data, status, xhr){
            console.log('successfully uploaded');
            console.log(status);
        },
        error:function(xhr, errorType, error){
            //haboReport(-1, -1);
            console.log("服务器没有响应 请检查网络！");
            //loadingStart("服务器没有响应<br />请检查网络！", true);
        }
    });
}
*/
function cropUploadWithData(imgData, fileType) {
    loadingStart("正在给您挑车<br />请稍等");

    var text = window.atob(imgData);
    var buffer = new Uint8Array(text.length);
    //var pecent = 0, loop = null;
    for (var i = 0; i < text.length; i++) {
        buffer[i] = text.charCodeAt(i);
    }
    var blob = getBlob([buffer], fileType);
    var xhr = new XMLHttpRequest();
    var formdata = getFormData();
    formdata.append('imagefile', blob);
    xhr.open('post', '/');

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            resultDisplay(result);
            //var jsonData = JSON.parse(result);
        }
        else {
            loadingStart("店小二家的服务器扑街啦！<br />请客官稍后再试", true);
        }
    };
    /*xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        console.warn(xhr.responseText)
        var jsonData = JSON.parse(xhr.responseText);
        var imagedata = jsonData[0] || {};
        var text = imagedata.path ? '上传成功' : '上传失败';
        console.log(text + '：' + imagedata.path);
        clearInterval(loop);
        //当收到该消息时上传完毕
        if (!imagedata.path) return;
        }
    };*/
    xhr.send(formdata);
}

function getBlob(buffer, format) {
    try {
        return new Blob(buffer, { type: format });
    } catch (e) {
        var bb = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder);
        buffer.forEach(function (buf) {
            bb.append(buf);
        });
        return bb.getBlob(format);
    }
}
/**
 * 获取formdata
 */
function getFormData() {
    var isNeedShim = ~navigator.userAgent.indexOf('Android')
        && ~navigator.vendor.indexOf('Google')
        && !~navigator.userAgent.indexOf('Chrome')
        && navigator.userAgent.match(/AppleWebKit\/(\d+)/).pop() <= 534;
    return isNeedShim ? new FormDataShim() : new FormData()
}
/**
 * formdata 补丁, 给不支持formdata上传blob的android机打补丁
 * @constructor
 */
function FormDataShim() {
    console.warn('using formdata shim');
    var o = this,
        parts = [],
        boundary = Array(21).join('-') + (+new Date() * (1e16 * Math.random())).toString(36),
        oldSend = XMLHttpRequest.prototype.send;
    this.append = function (name, value, filename) {
        parts.push('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"');
        if (value instanceof Blob) {
            parts.push('; filename="' + (filename || 'blob') + '"\r\nContent-Type: ' + value.type + '\r\n\r\n');
            parts.push(value);
        }
        else {
            parts.push('\r\n\r\n' + value);
        }
        parts.push('\r\n');
    };
    // Override XHR send()
    XMLHttpRequest.prototype.send = function (val) {
        var fr,
            data,
            oXHR = this;
        if (val === o) {
            // Append the final boundary string
            parts.push('--' + boundary + '--\r\n');
            // Create the blob
            data = getBlob(parts);
            // Set up and read the blob into an array to be sent
            fr = new FileReader();
            fr.onload = function () {
                oldSend.call(oXHR, fr.result);
            };
            fr.onerror = function (err) {
                throw err;
            };
            fr.readAsArrayBuffer(data);
            // Set the multipart content type and boudary
            this.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
            XMLHttpRequest.prototype.send = oldSend;
        }
        else {
            oldSend.call(this, val);
        }
    };
}


function cropStop(evt) {
    var isSupportTouch = false;

    cropGesture.unbindEvents();
    $("#cropBar .cancel-btn").unbind(isSupportTouch ? "touchend" : "click");
    $("#cropBar .confirm-btn").unbind(isSupportTouch ? "touchend" : "click");

    $("#cropSection").css("display", "none");
    $("#cropMaskUp").css("visibility", "hidden");
    $("#cropMaskDown").css("visibility", "hidden");
    $("#cropImg").css("display", "none");
    $("#cropImg").attr("src", "about:blank");

    $("#uploadInput").unbind("change");

    //loadingStop();

    //return preventEventPropagation(evt);
}


function resultDisplay(resultJSON) {
    if (resultJSON.serviceStat == 0) {
        loadingStop();
        $("#middleSection").css("display", "none");
        $("#resultSection .retry-btn").css("display", "");
        $("#resultSection .result-title").html("小二家的服务器扑街啦~请客官稍后再来噢！");
        $("#resultSection .result-title").css("top", "22%")
        $("#resultSection").css("display", "");
    }
    else {
        if (resultJSON.faceExist == 1) {
            loadingStop();
            $("#middleSection").css("display", "none");
            $("#resultSection .result-bg").css("display", "");
            $("#resultSection .photo-result").attr("src", resultJSON.imgUrl);
            $("#resultSection .retry-btn").css("display", "");
            $("#resultSection .result-title").html(resultJSON.webTitle);
            $("#resultSection .result-content").html(resultJSON.webContent);
            $("#resultSection").css("display", "");
        } else {
            loadingStop();
            $("#middleSection").css("display", "none");
            $("#resultSection .retry-btn").css("display", "");
            $("#resultSection .result-title").html("检测失败，请重新上传一张美照试试~");
            $("#resultSection .result-title").css("top", "22%")
            $("#resultSection").css("display", "");
        }
    }
}