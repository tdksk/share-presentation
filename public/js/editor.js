(function () {
  'use strict';
  /**
   * Editor
   */
  var _editor,
      _xmlHttp,
      _contentsElem,
      _changeElem,
      _params = getJsParam(),  // Load at first
      _user_id = _params.user_id,
      _presentation_id = _params.presentation_id,
      _isSaved = true;

  var _CONTENTS_ID = 'editor',
      _CHANGE_ID = 'change';

  function confirm(event) {
    event = event || window.event;
    if (!_isSaved) return event.returnValue = '保存していない場合、変更が破棄されます';
  }

  function initialize() {
    // Get DOM element
    _contentsElem = document.getElementById(_CONTENTS_ID);
    _changeElem = document.getElementById(_CHANGE_ID);

    /* Initialze editor */
    _editor = ace.edit('editor');

    // Set styles
    _editor.setShowPrintMargin(false);
    // _editor.setHighlightSelectedWord(false);
    // _editor.renderer.setShowGutter(false);
    _editor.session.setFoldStyle('markbeginend');

    // Set mode and theme
    _editor.session.setMode('ace/mode/markdown');
    _editor.setTheme('ace/theme/chrome');

    // Resize
    _onResize();
    window.onresize = _onResize;

    // Set commands
    _initCommands();

    // Set action
    _editor.session.on('change', function () {
      if (_isSaved) _onChange();
    });
  }

  function _initCommands() {
    _editor.commands.removeCommands(['gotoline', 'replace']);
    _editor.commands.addCommand({
      name: "save",
      bindKey: {win: "Ctrl-S", mac: "Command-S"},
      exec: function(){_onSaveFile();}
    });
  }

  // TODO: Optimize size
  function _onResize() {
    var width = 870;
    var height = window.innerHeight - 180;

    _contentsElem.style.width = width + 'px';
    _contentsElem.style.height = height + 'px';
  }

  function _onSaveFile() {
    // Display informations while saving file
    _changeElem.disabled = true;
    _changeElem.innerText = 'Saving...';
    // Save data
    var data = _editor.session.getValue();
    _executeAjax('POST', '/presentation/update', {
      user_id: _user_id
    , presentation_id: _presentation_id
    , presentation_data: data
    }, function () {
      _afterSaveFile();
    });
  }

  function _afterSaveFile() {
    _changeElem.disabled = true;
    _changeElem.className = 'disabled';
    _changeElem.innerText = 'Saved!';
    _isSaved = true;
  }

  function _onChange() {
    _changeElem.innerText = 'Save';
    _changeElem.disabled = false;
    _changeElem.className = null;
    _isSaved = false;
  }

  /**
   * Utilities
   */
  function _executeAjax(type, url, data, callback) {
    var async = (type === 'GET') ? false : true,
        sendContent = null;

    _xmlHttp = _createHttpRequest();

    _xmlHttp.onreadystatechange = function () {
      var READYSTATE_COMPLETED = 4,
          HTTP_STATUS_OK = 200;
      if (_xmlHttp.readyState == READYSTATE_COMPLETED
          && _xmlHttp.status == HTTP_STATUS_OK) {
        if (callback) callback();
      }
    };

    _xmlHttp.open(type, url, async);

    if (type === 'POST') {
      _xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
      sendContent = _encodeHTMLForm(data);
    }

    _xmlHttp.send(sendContent);
  }

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

  /**
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);
  window.addEventListener('beforeunload', confirm, false);

  /**
   * Export
   */
  window.onSaveFile = _onSaveFile;
})();
