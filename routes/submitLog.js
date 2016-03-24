var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  console.log("rendering page")

  console.log(req.body.logLineInput);
});

module.exports = router;