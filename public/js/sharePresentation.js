(function () {
  var socket = io.connect();

  var sharePresentation = (function () {
    socket.on('page', function (data) {
      var match
    , currentIndex;
      match = location.href.match(/#([0-9]+)$/);
      currentIndex = (match) ? parseInt(match[1], 10) - 1 : 0;
      if (currentIndex == data.pageNum) {
        keyPressActionByKeyCode(data.keyCode);
      }
    });

    window.addEventListener('keydown', function (e) {
      // If assined key is pressed
      if (isKeyPressAction(e)) {
        var match
      , pageNum;
        match = location.href.match(/#([0-9]+)$/);
        pageNum = (match) ? parseInt(match[1], 10) - 1 : 0;
        socket.emit('page', {
          pageNum: pageNum
        , keyCode: e.keyCode
        });
      }
    }, false);
  })();
})();
