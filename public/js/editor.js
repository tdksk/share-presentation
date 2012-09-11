(function () {
  var _editor = ace.edit('editor');

  function initialize() {
    _editor.setShowPrintMargin(false);
    // _editor.setHighlightSelectedWord(false);
    // _editor.renderer.setShowGutter(false);
    _editor.session.setFoldStyle('markbeginend');

    _editor.session.setMode('ace/mode/html');
    _editor.setTheme('ace/theme/dreamweaver');

    _initCommands(editor);

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
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);
})();
