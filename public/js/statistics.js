(function () {
  /**
   * Statistics
   */
  var canvas,
      graph;

  var socket = io.connect();

  var _CANVAS_ID = 'canvas';

  function initialize() {
    _initCanvas(900, 400);
  }

  function _initCanvas(width, height) {
    canvas = document.getElementById(_CANVAS_ID);
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = 'relative';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = '1000';
    canvas.style.float = 'left';

    graph = new Graph(canvas);
  }

  /**
   * Receive events
   */
  socket.on('statistics', function (count) {
    // TODO: グラフの長さを動的に変える
    console.log(count);  // for debug
    var data = [];
    for (var i = 0, length = count.length; i < length; i++) {
      data[i] = [i + 1, count[i]];
    }
    graph.clear();
    graph.setData(data);
    graph.setType('bar');
    graph.setColor('#007aff');
    graph.draw();
  });

  /**
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);
})();
