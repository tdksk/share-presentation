(function () {
  var socket = io.connect();

  socket.on('page', function (data) {
    if (currentIndex() == data.pageNum) {
      keyPressActionByKeyCode(data.keyCode);
    }
  });

  window.addEventListener('keydown', function (e) {
    // If assined key is pressed
    if (isKeyPressAction(e)) {
      socket.emit('page', {
        pageNum: currentIndex()
      , keyCode: e.keyCode
      });

      // TODO: Generalize id
      clearCanvas('canvas');
    }
  }, false);

  socket.on('showCount', function (count) {
    console.log(count);
  });

  socket.on('reload', function () {
    location.reload(true);
  });

  function currentIndex() {
    var match = location.href.match(/#([0-9]+)$/);
    return (match) ? parseInt(match[1], 10) - 1 : 0;
  }

  function countIndex(index) {
    socket.emit('count', {
      pageNum: index
    , action: 'count'
    });
  }
  function discountIndex(index) {
    socket.emit('count', {
      pageNum: index
    , action: 'discount'
    });
  }

  // '0' is reset button
  window.addEventListener('keydown', function (e) {
    if (e.keyCode == 48) {
      socket.emit('reset');
    }
  });

  window.countIndex = countIndex;
  window.discountIndex = discountIndex;
})();
