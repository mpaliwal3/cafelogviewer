var express = require('express');
var router = express.Router();

var defaultLogData = '2016-03-02T01:00:08.793Z,84d75cf4-1f26-4afa-9ef7-b23ef455020a,15,1,427,16,,Ews,pod51091.outlook.com,/ews/<PII:H101(Jp1vUJ/pGPfeVmejFF4zUjl5FTeSIUz6FpGAxZrSwD4=)>,,LiveIdBasic,True,<PII:H101(0155te0jzUDY7tQfEXkzJkOl5ufGBfpJWn8Upl2twvI=)>@namp102e15.o365.exchangemon.net,namp102e15.o365.exchangemon.net,LiveIdMemberName:<PII:H101(0155te0jzUDY7tQfEXkzJkOl5ufGBfpJWn8Upl2twvI=)>@namp102e15.o365.exchangemon.net;|,OBD_AMProbe/OutsideIn/ae0f15d0-1d13-4637-a1b9-bbd981314a57 (ExchangeServicesClient/15.01.0435.000),<PII:H101(mZXMBbg44bmhnWRWn3utwp55lPSAL26G8ILI+iXcwRM=):S101(UP1kb3Z5jfqm1TK3UwzeDvRK0Ty8Jrs+Ot5xuJOg7g4=)>,BY1P102CA0002,200,200,,POST,Backend,DM2P102MB0013.NAMP102.PROD.OUTLOOK.COM,15.01.0403.000,,LogonUser|,,,0,791,475,,,,0,,0,,0,,0,,0;1;0;,1,,0,0,80,0,162,,0,1,,,,,245,,,87,250,,,,BeginRequest=2016-03-02T01:00:08.543Z;SharedCache=Op <PII:H101(EMWCFAGSz1lkR1LbKXmGFES0+6B0uMIfS0gwQi3vJ2M=)>@namp102e15.o365.exchangemon.net|;SelectedRoutingKey=<PII:H101(0155te0jzUDY7tQfEXkzJkOl5ufGBfpJWn8Upl2twvI=)>@namp102e15.o365.exchangemon.net;RoutingEntry=LiveIdMemberName:<PII:H101(0155te0jzUDY7tQfEXkzJkOl5ufGBfpJWn8Upl2twvI=)>%40namp102e15.o365.exchangemon.net%3B DatabaseGuid:<PII:H101(OgvrVnGaKOS6M4gPer6qwdkrGbazMHnYpLy1nKQapHU=)>%40namp102e15.o365.exchangemon.net%40NAMP102.PROD.OUTLOOK.COM%400@131013540085434297;RoutingEntry=CafeArrayDbGuid:<PII:H101(OgvrVnGaKOS6M4gPer6qwdkrGbazMHnYpLy1nKQapHU=)>%40namp102e15.o365.exchangemon.net%40NAMP102.PROD.OUTLOOK.COM CafeArray:-1%2C-1%2C-1%2C-1+True@131013540085434297;RoutingEntry=DatabaseGuid:<PII:H101(OgvrVnGaKOS6M4gPer6qwdkrGbazMHnYpLy1nKQapHU=)>%40namp102e15.o365.exchangemon.net%40NAMP102.PROD.OUTLOOK.COM Server:DM2P102MB0013.NAMP102.PROD.OUTLOOK.COM+1942061459@635920790824095460;MailboxServerByServerGuard_DM2P102MB0013.NAMP102.PROD.OUTLOOK.COM=1;MailboxServerByForestGuard_NAMP102.PROD.OUTLOOK.COM=1;TotalMailboxServerGuard=1;SharedCacheGuard=0;ProxyStats_Event_Timestamps=1/1/1/2/1/1/2/82/83/83/83/83/83/83/83/83/83/83/245/246/247/246/247/246/247/246/247/246/247/246/247/-1/247/247/;ProxyStats_Streaming_Latencies=0/1/0/80/0/0/0/;ProxyStats_Event_Counters=1/4/1/5/4/;ProxyStats_Stream_Stats=791/0/475/1/;ProxyStats_BufferSizeFootprints_Request=791/;ProxyStats_BufferSizeFootprints_Response=8192/;NewConnection=141.251.181.209;;,,';
var logfileExtension = ".txt";

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("rendering page")

  renderIndexPage(res, defaultLogData);
});

// Get requestID
router.get('/request/:requestId', function(req, res, next) {
  var inputRequestID = req.params.requestId;
  var logFileFolder = req.app.locals.requestFilesFolder;
  console.log("/requests/" + inputRequestID);
  console.log("applocalget:" + logFileFolder);
  var requestData = readRequestData(logFileFolder, inputRequestID);

  if(requestData == null)
  {
    requestData = "RequestID:" + inputRequestID + " does not exist, please input the log line again";
  }

  renderIndexPage(res, requestData);
});

// Post submit log
// hack the request ID extraction
router.post('/submitLog', function(req, res, next) {
  var requestData = req.body.logLineInput;
  var requestID = requestData.split(',')[1];
  var logFileFolder = req.app.locals.requestFilesFolder;
  console.log("submitLog, requestID: " + requestID);

  var fileName = getFileNameFromRequestID(logFileFolder, requestID);
  writeRequestData(fileName, requestData);

  res.redirect('/request/' + requestID);
});

function renderIndexPage(res, data) {
    res.render(
    'index',
    {
       title: 'Cafe Log Viewer',
       defaultData: data
    }
  );
}

function writeRequestData(fileName, data) {
  console.log("WriteFile: "+ fileName);

  // simple FIle IO for now.
  if(doesFileExist(fileName))
  {
    console.log(fileName + " already exists. Overwriting file" );
  }

  var fs = require('fs');
  fs.writeFile(fileName, data, function (err) {
    if (err) console.error("Error writing file: " + err);
    console.log("successful write");
  });
}

function readRequestData(folderPath, requestId) {
  // simple FIle IO for now.
  var logFileName = getFileNameFromRequestID(folderPath, requestId);
  if(doesFileExist(logFileName))
  {
    return readFileData(logFileName);
  }

  return null;
}

function getFileNameFromRequestID(logFileFolder, requestId) {
  var filePath = logFileFolder + requestId + logfileExtension;
  //console.log("filePath:" + filePath);
  return filePath;
}

function readFileData(filePath) {
  var fs = require('fs');
  var fileData = fs.readFileSync(filePath);

  //console.log("readFileData::" + fileData);
  return fileData;
}

function doesFileExist(filePath) {
  var returnValue = false;
    try {
      // Query the entry
      var fs = require('fs');
      stats = fs.lstatSync(filePath);
      // Is it a directory?
      if (stats.isFile()) {
          returnValue = true;
      }
  }
  catch (e) {
      console.error("Error reading file: " + e);
  }

  console.log("DoesFileExist::" + returnValue);
  return returnValue;
}

module.exports = router;
