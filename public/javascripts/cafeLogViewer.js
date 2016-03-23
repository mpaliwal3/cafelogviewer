// column schema
var columnSchema = "DateTime,RequestId,MajorVersion,MinorVersion,BuildVersion,RevisionVersion,ClientRequestId,Protocol,UrlHost,UrlStem,ProtocolAction,AuthenticationType,IsAuthenticated,AuthenticatedUser,Organization,AnchorMailbox,UserAgent,ClientIpAddress,ServerHostName,HttpStatus,BackendStatus,ErrorCode,Method,ProxyAction,TargetServer,TargetServerVersion,RoutingType,RoutingHint,BackendCookie,ServerLocatorHost,ServerLocatorLatency,RequestBytes,ResponseBytes,TargetOutstandingRequests,AuthModulePerfContext,HttpPipelineLatency,CalculateTargetBackEndLatency,GlsLatencyBreakup,TotalGlsLatency,AccountForestLatencyBreakup,TotalAccountForestLatency,ResourceForestLatencyBreakup,TotalResourceForestLatency,ADLatency,SharedCacheLatencyBreakup,TotalSharedCacheLatency,ActivityContextLifeTime,ModuleToHandlerSwitchingLatency,ClientReqStreamLatency,BackendReqInitLatency,BackendReqStreamLatency,BackendProcessingLatency,BackendRespInitLatency,BackendRespStreamLatency,ClientRespStreamLatency,KerberosAuthHeaderLatency,HandlerCompletionLatency,RequestHandlerLatency,HandlerToModuleSwitchingLatency,ProxyTime,CoreLatency,RoutingLatency,HttpProxyOverhead,TotalRequestTime,RouteRefresherLatency,UrlQuery,BackEndGenericInfo,GenericInfo,GenericErrors,EdgeTraceId".split(',');
var routingFilter = ["DateTime", "RequestId", "AnchorMailbox", "Protocol", "HttpStatus", "BackendStatus", "ErrorCode", "RoutingType", "RoutingHint", "BackendCookie", "TargetServer", "HttpProxyOverhead", "TotalRequestTime", "GenericInfo", "GenericErrors"];
var routingComputedEvents = ["CafeV2", "IsEdgeRequest", "CafeError", "RoutingKeysEvaluated", "SelectedRoutingKey", "RoutingEntries", "UserDBCacheHit", "DBBECacheHit", "RoutingError", "RUMUpdate", "CafeRequestRetry" ];

// Callbacks
function onButtonClick() {
  //alert("buttonclicked")
  parseCafeLog(columnSchema, null);
}

function onRoutingButtonClick() {
  //alert("onRoutingButtonClick");
  parseCafeLog(routingFilter, routingComputedEvents);
}

function onLatencyButtonClick() {
  //alert("This section is not ready");
  var resulttable = $("#resulttable");
  var computedTable = $("#computedTable");
  resulttable.empty();
  computedTable.empty();
  var dict = {"LogColumn": "Section under contruction" };
  printDictionaryAsTable(dict, resulttable, ["LogColumn"]);
}

// private functions
function parseCafeLog(schemaFilter, eventsToCompute) {
  var log = document.getElementById("logLineInput").value
  var schematizedLog = getSchematizedFullLog(log);
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
  if (genericInfo.indexOf("ProxyStats_Event_Timestamps") != -1 || genericInfo.indexOf("ProxyStats_Event_Timestamps"))
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

function searchStringInArray (str, strArray) {
    for (var j=0; j < strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}
function tokenizeData(data, seperator, tokenSplitter) {
  var returnValue = [];
  var tokens = String(data).split(seperator);
  for(var i = 0; i < tokens.length; i++)
  { 
    if(tokens[i] != "")
    {
      var tokenindex = tokens[i].indexOf(tokenSplitter);
      var tokenKey = tokens[i].substring(0, tokenindex);
      var tokenValue = tokens[i].substring(tokenindex+1, tokens[i].length);

      if(returnValue[tokenKey] == null)
      {
        returnValue[tokenKey] = [];
      }

      returnValue[tokenKey].push(tokenValue);
    }
  }

  return returnValue;
}

function printDictionaryAsTable(dictionary, table, filter) {
  for(var key in dictionary) {
    if(filter.indexOf(key) != -1)
    {
      var tr = formatTableRow(key, dictionary[key])
      table.append(tr);
    }  
  }
}

function formatTableRow(key, value) {
  var dataValue = [];
  if(value != null)
  {
    if (key == "GenericInfo")
    {
      for (var index in value) {
        dataValue.push(index + '=' + value[index]);
      }
      dataValue = dataValue.join('\\n');
    }
    else
    {
      dataValue = value;
    }
  }
  else
  {
    value = "";
  }

  var tr = "<tr><td>" + key + "</td><td class=\"td\">" + htmlEntities(dataValue) + "</td></tr>"
  return tr;
}  

function getSchematizedFullLog(logLine) {
  var logArray = logLine.split(',');

  var schematizedLog = [];
  for(var i = 0; i < logArray.length; ++i) {
    var value = logArray[i];
    if(columnSchema[i] == "GenericInfo")
    {
      value = tokenizeData(logArray[i], ';', '=');
    }
    schematizedLog[columnSchema[i]] = value;
  }

  return schematizedLog;
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').split('\\n').join('<br>');
}

