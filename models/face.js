var facepp = require('faceplusplus');

//Start Recoginition

var config = {
  api_key: '28baade38914fdffd06d1e715f43b877',
  api_secret: 'hT7CtW7e1dmGmZ4PDJcVmFwz3Uhs9eUs',
  attribute: 'age,glass,smiling,gender,race,pose'
};

var client = new facepp(config);

module.exports = facepp;

facepp.result = function result(imageBinary, callback) {

  console.log("Detection Started! Waiting for result...")

  var data = {
    img: imageBinary
  };

  client.postMulti('detection/detect', data, function (err, response, body) {
    //console.log(body);
    if (body) {

      if (body.face[0]) {
        var faceAttribute = body.face[0].attribute;
      }
      else {
        var faceAttribute
        console.log('No Face Detected.')
      }
    }
    else{
      console.log('SERVICE ERROR: Unable to connect to FACE++ Service!')
    }
      /*console.log(body.face[0].attribute.age);
      console.log(body.face[0].attribute.smiling);
      console.log(body.face[0].attribute.glass);
      console.log(body.face[0].attribute.race);
      console.log(body.face[0].attribute.gender);
      console.log(body.face[0].attribute.pose);
      */

      callback(err, faceAttribute); // to be updated for error handling.
  });

};



