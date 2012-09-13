(function () {
  'use strict';
  /**
   * Editor
   */
  var _editor,
      _xmlHttp,
      _params = getJsParam(),  // Load at first
      _user_id = _params.user_id,
      _presentation_id = _params.presentation_id,
      _filePath;

  var _CONTENTS_ID = 'editor',
      _CHANGE_ID = 'change',
      _PRESENTATION_DIR = '/data',
      _TEMPLATE_FILE_PATH = _PRESENTATION_DIR + '/template.html';

  function confirm(event) {
    event = event || window.event;
    return event.returnValue = '保存していない場合、変更が破棄されます';
  }

  function initialize() {
    // Load file
    _filePath = _PRESENTATION_DIR + '/' + _user_id + '/' + _presentation_id + '.html';
    _loadFile(_filePath);
    // Template file is loaded at first
    if (!document.getElementById(_CONTENTS_ID).innerHTML) {
      _loadFile(_TEMPLATE_FILE_PATH);
    }

    /* Initialze editor */
    _editor = ace.edit('editor'),

    // Set styles
    _editor.setShowPrintMargin(false);
    // _editor.setHighlightSelectedWord(false);
    // _editor.renderer.setShowGutter(false);
    _editor.session.setFoldStyle('markbeginend');

    // Set mode and theme
    _editor.session.setMode('ace/mode/html');
    _editor.setTheme('ace/theme/dreamweaver');

    // Resize
    _onResize();
    window.onresize = _onResize;

    // Set commands
    _initCommands();

    // Set action
    _editor.session.on('change', function () {
      _onChange();
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
    var editorElem = document.getElementById('editor');
    var width = 870;
    var height = window.innerHeight - 180;

    editorElem.style.width = width + 'px';
    editorElem.style.height = height + 'px';
  }

  function _onSaveFile() {
    var contents = _editor.session.getValue();
    _execPost('/utils/write', {
      user_id: _user_id
    , filePath: _filePath
    , contents: contents
    });
  }

  function _onChange() {
    var change = document.getElementById(_CHANGE_ID);
    change.disabled = false;
    change.className = null;
  }

  /**
   * Load file
   */
  function _loadFile(filePath) {
    if (window.XMLHttpRequest) {
      _xmlHttp = new XMLHttpRequest();
    } else {
      _xmlHttp = null;
    }

    _xmlHttp.onreadystatechange = _checkStatus;
    _xmlHttp.open('GET', filePath, false);
    _xmlHttp.send(null);
  }

  function _checkStatus() {
    if (_xmlHttp.readyState == 4 && _xmlHttp.status == 200) {
      var contents = document.createTextNode(_xmlHttp.responseText);
      document.getElementById(_CONTENTS_ID).appendChild(contents);
    }
  }

  /**
   * Utilities
   */
  function _execPost(action, data) {
    // Create form
    var form = document.createElement('form');
    form.setAttribute('action', action);
    form.setAttribute('method', 'post');
    form.style.display = 'none';
    document.body.appendChild(form);
    // Configure parameters
    if (data !== undefined) {
      for (var paramName in data) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', paramName);
        input.setAttribute('value', data[paramName]);
        form.appendChild(input);
      }
    }
    // submit
    form.submit();
  }

  /**
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);
  // TODO: Disable confirm when saving
  // window.addEventListener('beforeunload', confirm, false);

  /**
   * Export
   */
  window.onSaveFile = _onSaveFile;
})();
