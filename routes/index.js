var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("rendering page")

  res.render(
    'index',
    {
       title: 'Cafe Log Viewer',
    }
  );
});

module.exports = router;
