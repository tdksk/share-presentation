(function () {
  var _editor,
      _xmlHttp,
      _params = _getJsParam(),  // Load at first
      _user_id = _params.user_id,
      _presentation_id = _params.presentation_id;

  var _CONTENTS_ID = 'editor',
      _PRESENTATION_DIR = '/data';

  function initialize() {
    // Load file
    // FIXME: Enable newline
    _loadFile('/' + _user_id + '/' + _presentation_id + '.html');

    _editor = ace.edit('editor'),
    _editor.setShowPrintMargin(false);
    // _editor.setHighlightSelectedWord(false);
    // _editor.renderer.setShowGutter(false);
    _editor.session.setFoldStyle('markbeginend');

    _editor.session.setMode('ace/mode/html');
    _editor.setTheme('ace/theme/dreamweaver');

    _initCommands(_editor);

    // Resize
    _onResize();
    window.onresize = _onResize;
  }

  function _initCommands() {
    _editor.commands.removeCommands(['gotoline', 'replace']);
    _editor.commands.addCommand({
      name: "save",
      bindKey: {win: "Ctrl-S", mac: "Command-S"},
      exec: function(editor){onSaveFile(editor);}
    });
  }

  // TODO: Optimize size
  function _onResize() {
    var editorElem = document.getElementById('editor');
    var width = window.innerWidth - 200;
    var height = window.innerHeight - 150;

    editorElem.style.width = width + 'px';
    editorElem.style.height = height + 'px';
  }

  /**
   * Load file
   */
  function _loadFile(fileName) {
    if (window.XMLHttpRequest) {
      _xmlHttp = new XMLHttpRequest();
    } else {
      _xmlHttp = null;
    }

    _xmlHttp.onreadystatechange = _checkStatus;
    _xmlHttp.open('GET', _PRESENTATION_DIR + fileName, false);
    _xmlHttp.send(null);
  }

  function _checkStatus() {
    if (_xmlHttp.readyState == 4 && _xmlHttp.status == 200) {
      var contents = document.getElementById(_CONTENTS_ID);
      contents.innerText = _xmlHttp.responseText;
    }
  }

  /**
   * Utilities
   */
  // TODO: Integrate
  function _getJsParam() {
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
  }

  /**
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);
})();
