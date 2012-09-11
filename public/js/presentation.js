(function () {
  /**
   * Presentation
   */
  var socket = io.connect('/presentation');

  var _xmlHttp,
      _pages,
      _currentIndex = 0,
      _elemIndex = 0,
      _hideElems,
      _scriptArr = [],
      _beforeX,
      _beforeY,
      _isClicking,
      _canvas,
      _graphElement,
      _graph,
      _optionIsShown = true,
      _params = _getJsParam(),  // Load at first
      _user_type = _params.type,
      _user_id = _params.user_id,
      _presentation_id = _params.presentation_id;

  var _ANIMATION_TIME = '1s',
      _CONTAINER_ID = 'container',
      _CONTENTS_ID = 'contents',
      _CANVAS_ID = 'canvas',
      _GRAPH_ID = 'graph',
      _PRESENTATION_DIR = '/data';

  function initialize() {
    var container, width, height;

    // Initialize container
    container = document.getElementById(_CONTAINER_ID);
    if (container) {
      width = container.offsetWidth;
      height = container.offsetHeight;
      window.addEventListener('keydown', _keyPressAction, false);
      if ($$.isMobile()) {
        // Prevent default touch event
        // TODO: Optimize
        // TODO: Prevent default double tap event in buttons
        container.ontouchstart = function (e) {
          e.preventDefault();
        };
        // Set touch events
        _touchAction();
      }
    }

    // Initialize canvas
    _canvas = document.getElementById(_CANVAS_ID);
    if (_canvas && _user_type === 'presenter') {
      _canvas.addEventListener('mousedown', function (e) {_dragStart(e);}, false);
      _canvas.addEventListener('mousemove', function (e) {_dragging(e);}, false);
      document.addEventListener('mouseup', function (e) {_dragEnd(e);}, false);
    }
    _initCanvas(width, height);

    // Initialize graph
    _graphElement = document.getElementById(_GRAPH_ID);
    _initGraph();

    // Initialize contents
    _initContents();

    // For debug
    var debug = document.getElementById('user-type');
    debug.innerHTML += '<p>User type: ' + _user_type + '</p>';
  }

  /**
   * Load contents
   */
  function _initContents() {
    var pageNum, page;
    // Load user file
    _loadFile('/' + _user_id + '/' + _presentation_id + '.html');

    // Initialize page
    pageNum = _getCurrentIndex();
    _pages = document.querySelectorAll('#' + _CONTAINER_ID +' article');
    if (pageNum < 0 || pageNum >= _pages.length) {
      pageNum = 0;
    }
    _currentIndex = pageNum;
    page = _pages[_currentIndex];
    page.style.display = 'block';
    _initPage(_currentIndex);
  }

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
      contents.innerHTML = _xmlHttp.responseText;
    }
  }

  /**
   * Page actions
   */
  function _keyPressAction(e) {
    var code = e.keyCode;
    switch (code) {
      case 13:  // Enter
      case 32:  // Space
      case 40:  // Down arrow
      case 74:  // J
        if (_user_type === 'presenter') {
          _sendPageActionName('progress');
        }
        _progressPage();
        e.preventDefault();
        break;

      case 39:  // Right arrow
      case 76:  // L
        if (_user_type === 'presenter') {
          _sendPageActionName('next');
        }
        _nextPage();
        e.preventDefault();
        break;

      case 37:  // Left arrow
      case 72:  // H
        if (_user_type === 'presenter') {
          _sendPageActionName('prev');
        }
        _prevPage();
        e.preventDefault();
        break;

      case 71:  // G
        if (_user_type === 'listener') {
          _sendReactionName('good');
        }
        e.preventDefault();
        break;

      case 66:  // B
        if (_user_type === 'listener') {
          _sendReactionName('bad');
        }
        e.preventDefault();
        break;

      case 79:  // O
        _toggleOptions();  // For debug
        e.preventDefault();
        break;

      case 48:  // 0
        if (_user_type === 'presenter') {
          socket.emit('reset');  // For debug
        } else if (_user_type === 'listener'){
          _syncPage();
        }
        e.preventDefault();
        break;
    }
  }

  function _touchAction() {
    // Double tap
    $$('#' + _CONTAINER_ID).doubleTap(function () {
      if (_user_type === 'presenter') {
        _actionByName('progress');
      }
      _progressPage();
    });
    // Swipe left
    $$('#' + _CONTAINER_ID).swipeLeft(function () {
      if (_user_type === 'presenter') {
        _actionByName('next');
      }
      _nextPage();
    });
    // Swipe right
    $$('#' + _CONTAINER_ID).swipeRight(function () {
      if (_user_type === 'presenter') {
        _actionByName('prev');
      }
      _prevPage();
    });
  }

  function _actionByName(actionName) {
    switch (actionName) {
      case 'progress':
        _progressPage();
        break;
      case 'next':
        _nextPage();
        break;
      case 'prev':
        _prevPage();
        break;
    }
  }

  function _sendPageActionName(actionName) {
    socket.emit('page', {
      pageNum: _currentIndex
    , action: actionName
    });
  }

  function _sendReactionName(reactionName) {
    socket.emit('reaction', {
      pageNum: _currentIndex
    , type: reactionName
    });
  }

  function _nextPage() {
    _movePage(_currentIndex + 1);
  }

  function _prevPage(){
    _movePage(_currentIndex - 1, true);
  }

  function _movePage(toIndex, showFlg) {
    var currentPage, nextPage;

    if (_currentIndex === toIndex) return;
    if (_currentIndex < toIndex) {
      if (_currentIndex === _pages.length - 1) return;
    } else {
      if (_currentIndex === 0) return;
    }

    currentPage = _pages[_currentIndex];
    nextPage = _pages[toIndex];

    currentPage.removeEventListener('webkitAnimationEnd', _movedPage);
    nextPage.removeEventListener('webkitAnimationEnd', _movedPage);

    currentPage.addEventListener('webkitAnimationEnd', _movedPage);
    nextPage.style.display = 'block';

    if (_currentIndex < toIndex) {
      currentPage.className = 'move_to_left';
      nextPage.className = 'move_from_right';
    } else {
      currentPage.className = 'move_to_right';
      nextPage.className = 'move_from_left';
    }

    _discountIndex(_currentIndex);
    _currentIndex = toIndex;
    _initPage(_currentIndex, showFlg);
  }

  function _initPage(index, showFlg){
    var url, page, i, len, elem;

    url = location.href.replace(/#[0-9]+$/, '');
    location.href = url + '#' + String(index + 1);

    page = _pages[index];
    _hideElems = page.querySelectorAll('.wrapper > section > *, .wrapper > section li, .wrapper > section p.slide > *');
    _elemIndex = 0;
    for (i = 0, len = _hideElems.length; i < len; i++) {
      elem = _hideElems[i];
      elem.style.opacity = (showFlg) ? 1 : 0;
      delete elem.style.webkitTransition;
    }

    if (showFlg) {
      _hideElems = [];
    }

    _countIndex(index);
    _clearCanvas();
    socket.emit('get reaction');
  }

  function _movedPage(e) {
    var target = e.currentTarget;
    target.removeEventListener(e.type, arguments.callee);
    target.style.display = 'none';
  }

  function _progressPage() {
    var elem = _hideElems[_elemIndex];
    if (!elem) {
      _nextPage();
      return;
    }

    elem.style.webkitTransition = 'all 0.5s ease-out';
    elem.style.opacity = 1;

    _elemIndex++;
  }

  function _syncPage() {
    socket.emit('sync page', _currentIndex);
  }

  /**
   * Page count
   */
  function _countIndex(index) {
    socket.emit('count', {
      pageNum: index
    , userType: _user_type
    , action: 'count'
    });
  }

  function _discountIndex(index) {
    socket.emit('count', {
      pageNum: index
    , userType: _user_type
    , action: 'discount'
    });
  }

  /**
   * Canvas
   */
  function _initCanvas(width, height) {
    _canvas.width = width;
    _canvas.height = height;
    _canvas.style.position = 'relative';
    _canvas.style.left = '0';
    _canvas.style.top = '0';
    _canvas.style.zIndex = '1000';
    _canvas.style.float = 'left';
  }

  function _clearCanvas() {
    var ctx = _canvas.getContext('2d');
    ctx.clearRect(0, 0, _canvas.width, _canvas.height);
  }

  function _dragStart(e) {
    e.preventDefault();
    _isClicking = true;
  }

  function _dragging(e) {
    if (!_isClicking) return;

    socket.emit('location', {
      pageNum: _currentIndex
    , x: e.offsetX
    , y: e.offsetY
    });
  }

  function _dragEnd(e) {
    _isClicking = false;
    socket.emit('location', {
      pageNum: _currentIndex
    , _beforeX: undefined
    , _beforeY: undefined
    });
  }

  /**
   * Graph
   */
  // TODO: Fix position and size
  function _initGraph() {
    _graphElement.width = 165;
    _graphElement.height = 600;
    _graphElement.style.position = 'absolute';
    _graphElement.style.right = '0';
    _graphElement.style.bottom = '50px';
    _graphElement.style.zIndex = '1001';

    _graph = new Graph(_graphElement);
  }

  // TODO: グラフ長がウィンドウ超えた時も常に数値を表示
  function _drawReactionGraph(count) {
    var type,
        arr;
    _graph.hideGrids();
    _graph.clear();
    for (type in count) {
      var data = [];
      arr = count[type];
      if (!arr.length) continue;

      // For graph
      if (type === 'good') {
        data[0] = [0, arr[_currentIndex]];
      } else if (type === 'bad') {
        data[0] = [0, 0];
        data[1] = [1, arr[_currentIndex]];
      }

      // Set data
      _graph.setData(data);
      // Set styles
      if (type === 'good') {
        _graph.setColor('');
        _graph.setColor('rgba(108, 190, 110, .8)');
      } else if (type === 'bad') {
        _graph.setColor('rgba(224, 74, 40, .8)');
      }
      _graph.setType('bar');
      _graph.setBarWidth(30);
      _graph.setScale(70, 10);
      _graph.showValue();
      // Draw graph
      _graph.draw();
    }
  }

  /**
   * Show options
   */
  function _toggleOptions() {
    var options = document.getElementById('options');
    var buttons = document.getElementById('buttons');
    var graph = document.getElementById(_GRAPH_ID);
    if (_optionIsShown) {
      options.style.display = 'none';
      if (_user_type === 'listener') {
        buttons.style.display = 'none';
      }
      graph.style.display = 'none';
      _optionIsShown = false;
    } else {
      options.style.display = 'block';
      if (_user_type === 'listener') {
        buttons.style.display = 'block';
      }
      graph.style.display = 'block';
      _optionIsShown = true;
    }
  }

  /**
   * Utilities
   */
  function _getCurrentIndex() {
    var match = location.href.match(/#([0-9]+)$/);
    return (match) ? parseInt(match[1], 10) - 1 : 0;
  }

  function _getRandomColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }

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
   * Receive events
   */
  socket.on('page', function (data) {
    if (_currentIndex === data.pageNum) {
      _actionByName(data.action);
    }
  });

  socket.on('sync page', function (data) {
    _movePage(data);
  });

  socket.on('user count', function (data) {
    // For debug
    var debug = document.getElementById('user-count');
    debug.innerHTML = '<p>View this page (listener): ' + data.listener[_currentIndex] + '</p>';
  });

  socket.on('reaction count', function (data) {
    _drawReactionGraph(data);
    // For debug
    // var debug = document.getElementById('reaction-count');
    // debug.innerHTML = '<p>Good: ' + data.good[_currentIndex] + '</p>'
    //                   + '<p>Bad: ' + data.bad[_currentIndex] + '</p>';
  });

  socket.on('location', function (data) {
    if (_currentIndex === data.pageNum) {
      var ctx = _canvas.getContext('2d'),
          currentX = data.x,
          currentY = data.y;
      // Set styles
      ctx.strokeStyle = 'rgba(209, 72, 54, .8)';
      // ctx.strokeStyle = _getRandomColor();  // For debug
      ctx.lineWidth = 5;
      // Draw line
      ctx.beginPath();
      ctx.moveTo(_beforeX, _beforeY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      _beforeX = currentX;
      _beforeY = currentY;
    }
  });

  socket.on('reset', function () {
    location.reload(true);
  });

  /**
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);

  /**
   * Export
   */
  window.sendReactionName = _sendReactionName;
  window.syncPage = _syncPage;
})();
