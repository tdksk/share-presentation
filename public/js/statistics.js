(function () {
  'use strict';
  /**
   * Statistics
   */
  var socket = io.connect('/statistics');

  var _canvas,
      _graph,
      _params = getJsParam(),  // Load at first
      _user_id = _params.user_id,
      _presentation_id = _params.presentation_id;

  var _CANVAS_ID = 'canvas',
      _CANVAS_WIDTH = 870,
      _CANVAS_HEIGHT = 400;

  function initialize() {
    _initCanvas(_CANVAS_WIDTH, _CANVAS_HEIGHT);
  }

  /**
   * Room
   */
  function initRoom() {
    socket.emit('init', {
      user_id: _user_id
    , presentation_id: _presentation_id
    });
  }

  /**
   * Canvas
   */
  function _initCanvas(width, height) {
    _canvas = document.getElementById(_CANVAS_ID);
    _canvas.width = width;
    _canvas.height = height;
    _canvas.style.position = 'relative';
    _canvas.style.left = '0';
    _canvas.style.top = '0';
    _canvas.style.zIndex = '1';
    _canvas.style.float = 'left';

    // Before loaded
    var ctx = _canvas.getContext('2d');
    ctx.fillText('Now Loading...', width / 2, height / 2);
    ctx.fill();

    // Set graph
    _graph = new Graph(_canvas);
    _graph.setType('bar');
    _graph.setScale(15, 10);
  }

  /**
   * Receive events
   */
  socket.on('statistics', function (count) {
    var data, arr, i, length,
        presenterIndex,
        total_user_count = {
          presenter: 0
        , listener : 0
        };

    /* Draw graph */
    // TODO: グラフの長さを動的に変える
    // TODO: 凡例つける
    _graph.clear();

    // Draw presenter page index
    if (count.presenter.length !== 0) {
      data = [];
      arr = count.presenter;
      presenterIndex = arr.indexOf(Math.max.apply(null, arr));
      for (i = 0, length = arr.length; i < length; i++) {
        data[i] = (arr[i]) ? [i + 1, 36] : [i + 1, 0];
      }
      // Set data
      _graph.setData(data);
      // Set styles
      _graph.setColor('rgba(224, 74, 40, .5)');
      _graph.setBarWidth(2);
      _graph.hideValue();
      // Draw graph
      _graph.draw();
    }

    // Draw listener page view count
    if (count.listener.length !== 0) {
      data = [];
      arr = count.listener;
      for (i = 0, length = arr.length; i < length; i++) {
        // For graph
        data[i] = [i + 1, arr[i]];
        // For total count
        total_user_count.listener += arr[i];
      }
      // Set data
      _graph.setData(data);
      // Set styles
      _graph.setColor('rgba(0, 122, 255, .8)');
      _graph.setBarWidth(10);
      _graph.showValue();
      // Draw graph
      _graph.draw();
    }

    // Show total count
    var user_count = document.getElementById('user-count');
    user_count.innerHTML = '<p>Total Listener: ' + total_user_count.listener + '</p>';
  });

  /**
   * Initialize
   */
  // Initialize room before loading DOM content
  initRoom();
  // Initialize after loading DOM content
  window.addEventListener('DOMContentLoaded', initialize, false);
})();
