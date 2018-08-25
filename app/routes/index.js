var express = require('express');
const fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //changIndexHtml();
  //写入记录
  var ipAddress = req.connection.remoteAddress;
  console.log(ipAddress);
  fs.appendFile('ip.log', 'ip: ' + ipAddress + ' ' + getTimeId() + ': 访问\n', 'utf8', function (err) {
    if (err) {
        console.log(err);
    }
});
  res.render('index');
});
function getTimeId() {
  var timeId = '';
  var now = new Date();
  timeId = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + '-' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  return timeId;
}



module.exports = router;
