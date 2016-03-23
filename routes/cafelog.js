var express = require('express');
var router = express.Router();

router.get('/cafelog', function(req, res, next) {
  res.render('cafelog', { title: 'Cafe Log Viewer' });
});

module.exports = router;