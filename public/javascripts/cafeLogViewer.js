// column schema
var columnSchema = "DateTime,RequestId,MajorVersion,MinorVersion,BuildVersion,RevisionVersion,ClientRequestId,Protocol,UrlHost,UrlStem,ProtocolAction,AuthenticationType,IsAuthenticated,AuthenticatedUser,Organization,AnchorMailbox,UserAgent,ClientIpAddress,ServerHostName,HttpStatus,BackendStatus,ErrorCode,Method,ProxyAction,TargetServer,TargetServerVersion,RoutingType,RoutingHint,BackendCookie,ServerLocatorHost,ServerLocatorLatency,RequestBytes,ResponseBytes,TargetOutstandingRequests,AuthModulePerfContext,HttpPipelineLatency,CalculateTargetBackEndLatency,GlsLatencyBreakup,TotalGlsLatency,AccountForestLatencyBreakup,TotalAccountForestLatency,ResourceForestLatencyBreakup,TotalResourceForestLatency,ADLatency,SharedCacheLatencyBreakup,TotalSharedCacheLatency,ActivityContextLifeTime,ModuleToHandlerSwitchingLatency,ClientReqStreamLatency,BackendReqInitLatency,BackendReqStreamLatency,BackendProcessingLatency,BackendRespInitLatency,BackendRespStreamLatency,ClientRespStreamLatency,KerberosAuthHeaderLatency,HandlerCompletionLatency,RequestHandlerLatency,HandlerToModuleSwitchingLatency,ProxyTime,CoreLatency,RoutingLatency,HttpProxyOverhead,TotalRequestTime,RouteRefresherLatency,UrlQuery,BackEndGenericInfo,GenericInfo,GenericErrors,EdgeTraceId".split(',');
var routingFilter = ["DateTime", "RequestId", "AnchorMailbox", "Protocol", "HttpStatus", "BackendStatus", "ErrorCode", "RoutingType", "RoutingHint", "BackendCookie", "TargetServer", "HttpProxyOverhead", "TotalRequestTime", "GenericInfo", "GenericErrors"];
var routingComputedEvents = ["CafeV2", "IsEdgeRequest", "CafeError", "RoutingKeysEvaluated", "SelectedRoutingKey", "RoutingEntries", "UserDBCacheHit", "DBBECacheHit", "RoutingError", "RUMUpdate", "CafeRequestRetry" ];

var latencyFilter = [""]
var proxyEventsTimestamps = ["IIS_MapHandler","IIS_ExecuteHandler","WinHttp_Pre_SendRequest","WinHttp_Post_SendRequest","WinHttp_NameResolving","WinHttp_NameResolved","WinHttp_Connecting","WinHttp_Connected","IIS_BeginRead_First","IIS_BeginRead_Last","IIS_ReadComplete_First","IIS_ReadComplete_Last","WinHttp_SendRequestComplete","WinHttp_BeginWrite_First","WinHttp_BeginWrite_Last","WinHttp_WriteComplete_First","WinHttp_WriteComplete_Last","WinHttp_ReceiveResponse","WinHttp_HeadersAvailable","WinHttp_QueryData_First","WinHttp_QueryData_Last","WinHttp_DataAvailable_First","WinHttp_DataAvailable_Last","WinHttp_BeginRead_First","WinHttp_BeginRead_Last","WinHttp_ReadComplete_First","WinHttp_ReadComplete_Last","IIS_BeginWrite_First","IIS_BeginWrite_Last","IIS_WriteComplete_First","IIS_WriteComplete_Last","WinHttp_RequestError","Proxy_CompleteRequest","IIS_CompleteRequest"];

//console.log("loading cafelogviewer.js")

// Callbacks
function onButtonClick() {
  //alert("buttonclicked");
  parseCafeLog(columnSchema, null);
}

function onSharingButtonClick() {
  var log = getInputText();
}

function onRoutingButtonClick() {
  //alert("onRoutingButtonClick");
  parseCafeLog(routingFilter, routingComputedEvents);
}

function onLatencyButtonClick() {
  //alert("This section is not ready");
  var log = getInputText();
  var schematizedLog = getSchematizedFullLog(log, columnSchema);
  var resulttable = $("#resulttable");
  var computedTable = $("#computedTable");
  resulttable.empty();
  computedTable.empty();
  var genericInfo = schematizedLog["GenericInfo"];
  var eventTimestamps = genericInfo["ProxyStats_Event_Timestamps"];
  timestamps = [];
  if(eventTimestamps == null)
  {
    timestamps = {"NotCafeV2Request": "No data from Proxy Module"};
    printDictionaryAsTable(timestamps, resulttable, "NotCafeV2Request");
  }
  else
  {
    timestamps = parseProxyEventTimestamps(eventTimestamps[0]);
    printDictionaryAsTable(timestamps, resulttable, proxyEventsTimestamps, false);
  }
}

function parseProxyEventTimestamps(eventTimestamps)
{
  returnValue = [];
  var data = eventTimestamps.split('/');
  for(var i = 0; i < proxyEventsTimestamps.length; i++) {
    returnValue[proxyEventsTimestamps[i]] = data[i];
  }

  return returnValue;
}

// private functions
function parseCafeLog(schemaFilter, eventsToCompute) {
  var log = getInputText();
  var schematizedLog = getSchematizedFullLog(log, columnSchema);
  var resulttable = $("#resulttable");
  var computedTable = $("#computedTable");
  resulttable.empty();
  computedTable.empty();
  if (eventsToCompute != null)
  {
    var computedEvents = computeEvents(schematizedLog, eventsToCompute);
    printDictionaryAsTable(computedEvents, computedTable, eventsToCompute)
  } 

  printDictionaryAsTable(schematizedLog, resulttable, schemaFilter)
}

function getInputText() {
  // read value of textarea before submit
  // .value will not work because the text area is inside a form
  return $("#logLineInput").val();
}

function computeEvents(schematizedLog, eventsToCompute) {
  var resultEvents = [];
  for(var i = 0; i < eventsToCompute.length; i++) {
    var keyName = eventsToCompute[i];
    var value;
    switch(keyName)
    {
      case "CafeV2": value = isCafeV2(schematizedLog);
                    break;
      case "CafeError": value = isCafeError(schematizedLog);
                    break;
      case "RoutingKeysEvaluated": value = parseRoutingKey(schematizedLog);
                    break;
      case "SelectedRoutingKey": value = schematizedLog["GenericInfo"]["SelectedRoutingKey"];
                    break;
      case "RoutingEntries": value = parseRoutingEntries(schematizedLog);
                    break;
      case "RoutingError": value = parseRoutingError(schematizedLog);
                    break;
      case "RUMUpdate": value = parseRUMUpdate(schematizedLog);
                    break;
      case "CafeRequestRetry": value = isCafeRetry(schematizedLog);
                    break;
      case "UserDBCacheHit": value = schematizedLog["AccountForestLatencyBreakup"] == "";
                    break;
      case "DBBECacheHit": value = schematizedLog["ServerLocatorHost"] == "";
                    break;
      case "IsEdgeRequest": value = schematizedLog["EdgeTraceId"] != "";
                    break;

    }

    resultEvents[keyName] = value;
  }

  return resultEvents;
}

// compute Events functions
var isCafeV2 = function(schematizedLog) {
  var returnValue = false;
  var genericInfo = schematizedLog["GenericInfo"];
  if (genericInfo["ProxyStats_Event_Timestamps"] != null)
  {
    returnValue = true;
  }

  return returnValue;
}

var isCafeError = function(schematizedLog) {
  return (schematizedLog["HttpStatus"] != schematizedLog["BackendStatus"]) && (schematizedLog["HttpStatus"] != 200);
}

var parseRoutingEntries = function(schematizedLog) {
  return schematizedLog["GenericInfo"]["RoutingEntry"];
}

var parseRoutingKey = function(schematizedLog) {
  return schematizedLog["RoutingHint"] + "\n" + schematizedLog["AnchorMailbox"] + "\n";
}

var parseRoutingError = function(schematizedLog) {
  return schematizedLog["GenericInfo"]["RoutingError"];
}

var parseRUMUpdate = function(schematizedLog) {
  var routingErrors = parseRoutingError(schematizedLog);
  if(routingErrors != null)
  { 
    var search = searchStringInArray("X-RoutingEntryUpdate", routingErrors);
    if(search != -1)
      return routingErrors[search];
  }
}

var isCafeRetry = function(schematizedLog) {
  return schematizedLog["GenericInfo"];
}