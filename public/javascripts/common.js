// library functions

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

function getSchematizedFullLog(logLine, logSchema) {
  var logArray = logLine.split(',');

  var schematizedLog = [];
  for(var i = 0; i < logArray.length; ++i) {
    var value = logArray[i];
    if(logSchema[i] == "GenericInfo")
    {
      value = tokenizeData(logArray[i], ';', '=');
    }
    schematizedLog[logSchema[i]] = value;
  }

  return schematizedLog;
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').split('\\n').join('<br>');
}