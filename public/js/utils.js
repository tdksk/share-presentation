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
