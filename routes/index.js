var Data = require('../models/data.js');
var face = require('../models/face.js');

var fs = require('fs');
//var buf = new Buffer(1024000);

var express = require('express'),
    router = express.Router(),
    formidable = require('formidable'),
    fs = require('fs'),
    TITLE = '客官买车吗？',
    AVATAR_UPLOAD_FOLDER = '/avatar/'

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: TITLE });
});

router.post('/', function (req, res) {

    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;     //设置上传目录
    form.keepExtensions = true;     //保留后缀
    form.maxFieldsSize = 1 * 1024 * 1024;   //文件大小

    form.parse(req, function (err, fields, files) {

        if (err) {
            //res.locals.error = err;
            //res.render('index', { title: TITLE });
            //console.log('form parse response reached!');
            res.send('form parse response reached!');
            return;
        }

        var extName = 'jpg';
        var avatarName = Math.random() + '.' + extName;
        var newPath = form.uploadDir + avatarName;

        console.log(newPath);
        fs.renameSync(files.imagefile.path, newPath);  //rename image uploaded

        //image binary data

        var avatarBinary = {
            value: fs.readFileSync(newPath),
            meta: { filename: avatarName }
        };

        //Prepare log
        var logMessage = null;




        //Prepare JSON response
        var resJSON = {
            serviceStat: 0,
            faceExist: 0, //
            resultId: null,
            imgUrl: null,
            webTitle: null,
            webContent: null,

        };

        //Start face recognition
        face.result(avatarBinary, function (err, faceAttribute) {
            if (err) {
                //console.log('Facial Service Error!')
                resJSON.serviceStat = 0;
                resJSON.resultDesc = 'Facial Service Error!'
                logMessage = 'Facial Service Error: ' + err.message;

                res.json(resJSON);
                console.log(resJSON);

                Data.log(logMessage, function (err, result) {
                    console.log(logMessage);
                    console.log('Log added: ' + result);
                });
                /*Data.log('Facial Service Error: ' + err.message, function (err, result) {
                    console.log('Error Log added: ' + result);
                });*/
            }
            else if (faceAttribute) {
                console.log('Face++ Result:');
                console.log(faceAttribute.gender);
                console.log(faceAttribute.age);
                console.log(faceAttribute.smiling);
                console.log(faceAttribute.glass);
                console.log(faceAttribute.race);
                console.log(faceAttribute.pose);


                Data.getResult(faceAttribute.gender.value,
                    faceAttribute.age.value,
                    faceAttribute.smiling.value,
                    faceAttribute.race.value,
                    faceAttribute.glass.value,
                    function (err, rows) {
                        if (err) {
                            //console.log("Result Mapping Error");
                            resJSON.serviceStat = 0;
                            resJSON.resultDesc = 'Result Mapping Error';
                            logMessage = 'Result Mapping Error: ' + err.message;

                            /*Data.log('Result Mapping Error: ' + err.message, function (err, result) {
                                console.log('Error Log added: ' + result);
                            });*/
                        }
                        else {
                            resJSON.serviceStat = 1;
                            resJSON.faceExist = 1;
                            resJSON.resultId = rows[0].result_id;
                            resJSON.imgUrl = rows[0].img_url;
                            resJSON.resultDesc = rows[0].result_desc;
                            resJSON.webTitle = rows[0].web_title;
                            resJSON.webContent = rows[0].web_content;

                            logMessage = 'Face Result: ' + faceAttribute.gender.value + ' | ' + faceAttribute.age.value + ' | ' + faceAttribute.smiling.value + ' | ' + faceAttribute.race.value + ' | ' + faceAttribute.glass.value;
                        }
                        res.json(resJSON);
                        console.log(resJSON);

                        Data.log(logMessage, function (err, result) {
                            console.log(logMessage);
                            console.log('Log added: ' + result);
                        });
                    })
            }
            else {
                resJSON.serviceStat = 1;
                resJSON.faceExist = 0;
                resJSON.resultDesc = 'No Face Detected!';
                Data.log('No face detected.', function (err, result) {
                    console.log('Error Log added: ' + result);
                });
                res.json(resJSON);
                console.log(resJSON);

                Data.log(logMessage, function (err, result) {
                    console.log(logMessage);
                    console.log('Log added: ' + result);
                });
            };

        });

        //res.locals.success = '上传成功';
        //res.render('cardisplay', { title: 'Upload Success!' });
        //res.send('Test XHR response');
    });
});




module.exports = router;