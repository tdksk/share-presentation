(function () {
  'use strict';
  /**
   * Editor
   */
  var _editor,
      _xmlHttp,
      _editorElem,
      _changeElem,
      _previewElem,
      _params = getJsParam(),  // Load at first
      _user_id = _params.user_id,
      _presentation_id = _params.presentation_id,
      _isSaved = false;

  var _EDITOR_ID = 'editor',
      _CHANGE_ID = 'change',
      _PREVIEW_ID = 'preview';

  function confirm(event) {
    event = event || window.event;
    if (!_isSaved) return event.returnValue = '保存していない場合、変更が破棄されます';
  }

  function initialize() {
    // Get DOM element
    _editorElem = document.getElementById(_EDITOR_ID);
    _changeElem = document.getElementById(_CHANGE_ID);
    _previewElem = document.getElementById(_PREVIEW_ID);

    /* Initialze editor */
    _editor = ace.edit(_EDITOR_ID);

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
      _onSaveFile();
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
    var editorWidth = 590;
    var editorHeight = window.innerHeight - 70;
    var previewHeight = (editorHeight - 40) / 0.3;

    _editorElem.style.width = editorWidth + 'px';
    _editorElem.style.height = editorHeight + 'px';
    _previewElem.style.height = previewHeight + 'px';
  }

  function _onSaveFile() {
    // Display informations while saving file
    _changeElem.className = null;
    _changeElem.innerText = 'Saving...';
    // Save data
    var data = _editor.session.getValue();
    _ajax({
      type: 'POST',
      url: '/presentation/update',
      data: {
        user_id: _user_id
      , presentation_id: _presentation_id
      , presentation_data: data
      },
      success: function (data) {
        _afterSaveFile();
      },
      error: function (data) {
        _changeElem.innerText = 'ERROR!';
        _changeElem.className = 'error';
        _isSaved = false;
      }
    });
  }

  function _afterSaveFile() {
    _changeElem.innerText = 'Saved!';
    _isSaved = true;

    // Show preview
    var previewUrl = '/p/' + _user_id + '/' + _presentation_id + '/';
    _ajax({
      type: 'GET',
      url: previewUrl,
      success: function (data) {
        var contents = data.responseText;
        contents = contents.split(/<!-- Contents -->((?:.|\n|\r)*)<!-- End of Contents -->/i)[1];
        document.getElementById('preview').innerHTML = contents;
      }
    });
  }

  /**
   * Utilities
   */
  function _ajax(options) {
    options = options || {};

    var async = (options.type === 'GET') ? false : true,
        sendContent = null;

    _xmlHttp = _createHttpRequest();

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
  window.addEventListener('DOMContentLoaded', _onSaveFile, false);
  window.addEventListener('beforeunload', confirm, false);
})();
