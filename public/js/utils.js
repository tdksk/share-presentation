'use strict';
/**
 * Utilities
 */
/* Get parameters for JS */
var getJsParam = function () {
  var scripts = document.getElementsByTagName('script');
  var src = scripts[scripts.length - 1].src;

  var query = src.substring(src.indexOf('?') + 1);
  var parameters = query.split('&');

  var result = new Object();
  for (var i = 0, length =  parameters.length; i < length; i++) {
    var element = parameters[i].split('=');

    var paramName = decodeURIComponent(element[0]);
    var paramValue = decodeURIComponent(element[1]);

    result[paramName] = decodeURIComponent(paramValue);
  }

  return result;
};

/* Load CSS */
var loadCss = function (href) {
  var head = document.getElementsByTagName('head')[0];
  var css = document.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('href', href);
  head.appendChild(css);
};

/* Ajax */
var ajax = function (options) {
  options = options || {};

  var async = (options.type === 'GET') ? false : true,
      sendContent = null;

  var _xmlHttp = _createHttpRequest();

  _xmlHttp.onreadystatechange = function () {
    var READYSTATE_COMPLETED = 4,
        HTTP_STATUS_OK = 200;
    if (_xmlHttp.readyState == READYSTATE_COMPLETED) {
      if (_xmlHttp.status == HTTP_STATUS_OK) {
        if (options.success) options.success(_xmlHttp);
      } else {
        if (options.error) options.error(_xmlHttp);
      }
    }
  };

  _xmlHttp.open(options.type, options.url, async);

  if (options.type === 'POST') {
    _xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    sendContent = _encodeHTMLForm(options.data);
  }

  _xmlHttp.send(sendContent);

  function _createHttpRequest() {
    var x = null;
    if (window.XMLHttpRequest) return new XMLHttpRequest();
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {
        x = null;
      }
    }
    return x;
  }

  function _encodeHTMLForm(data) {
    var params = [],
        name;
    for (name in data) {
      var value = data[name];
      var param = encodeURIComponent( name ).replace(/%20/g, '+')
            + '=' + encodeURIComponent( value ).replace(/%20/g, '+');
      params.push(param);
    }
    return params.join('&');
  }
};
