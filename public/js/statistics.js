(function () {
  /**
   * Statistics
   */
  var socket = io.connect('/statistics');

  var canvas,
      graph;

  var _CANVAS_ID = 'canvas',
      _CANVAS_WIDTH = 900,
      _CANVAS_HEIGHT = 400;

  function initialize() {
    _initCanvas(_CANVAS_WIDTH, _CANVAS_HEIGHT);
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
    var user_type,
        arr,
        total_user_count = {
          presenter: 0
        , listener : 0
        };

    // Draw graph
    // TODO: グラフの長さを動的に変える
    // TODO: 凡例つける
    graph.clear();
    for (user_type in count) {
      var data = [];
      arr = count[user_type];
      if (!arr.length) continue;

      for (var i = 0, length = arr.length; i < length; i++) {
        // For graph
        data[i] = [i + 1, arr[i]];
        // For total count
        total_user_count[user_type] += arr[i];
      }

      // Set data
      graph.setData(data);
      // Set styles
      if (user_type === 'presenter') {
        graph.setColor('rgba(224, 74, 40, .5)');
        // graph.setColor('rgba(244, 192, 4, .5)');
        graph.setBarWidth(50);
      } else if (user_type === 'listener') {
        graph.setColor('rgba(0, 122, 255, .8)');
        graph.setBarWidth(30);
      }
      graph.setType('bar');
      // Draw graph
      graph.draw();
    }

    // Show total count
    var user_count = document.getElementById('user-count');
    user_count.innerHTML = '<p>Listener: ' + total_user_count.listener + '</p>';
  });

  /**
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);
})();
