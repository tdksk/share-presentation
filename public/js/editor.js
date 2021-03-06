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

    // Save
    _onSaveFile();

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
    ajax({
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
    ajax({
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
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);
  window.addEventListener('beforeunload', confirm, false);
})();
