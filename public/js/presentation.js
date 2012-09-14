(function () {
  /**
   * Presentation
   */
  // TODO: Sync hide elements

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
      _graphLeft,
      _graphRight,
      _graphL,
      _graphR,
      _optionIsShown = true,
      _params = getJsParam(),  // Load at first
      _user_type = _params.type,
      _user_id = _params.user_id,
      _presentation_id = _params.presentation_id,
      _filePath;

  var socket = io.connect('/presentation');

  var _ANIMATION_TIME = '1s',
      _CONTAINER_ID = 'container',
      _CONTENTS_ID = 'contents',
      _CANVAS_ID = 'canvas',
      _GRAPH_LEFT_ID = 'graph-left',
      _GRAPH_RIGHT_ID = 'graph-right',
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
    _graphLeft = document.getElementById(_GRAPH_LEFT_ID);
    _graphRight = document.getElementById(_GRAPH_RIGHT_ID);
    _initGraph();

    // Initialize contents
    _initContents();
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
   * Load contents
   */
  function _initContents() {
    var pageNum, page;
    // Load user file
    _filePath = _PRESENTATION_DIR + '/' + _user_id + '/' + _presentation_id + '.html';
    _loadFile(_filePath);

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
      case 74:  // j
        if (_user_type === 'presenter') {
          // _sendPageActionName('progress');
          _sendPageActionName('next');
        }
        // _progressPage();
        _nextPage();
        e.preventDefault();
        break;

      case 39:  // Right arrow
      case 76:  // l
        if (_user_type === 'presenter') {
          _sendPageActionName('next');
        }
        _nextPage();
        e.preventDefault();
        break;

      case 37:  // Left arrow
      case 72:  // h
      case 75:  // k
        if (_user_type === 'presenter') {
          _sendPageActionName('prev');
        }
        _prevPage();
        e.preventDefault();
        break;

      case 71:  // g
        if (_user_type === 'listener') {
          _sendReactionName('good');
        }
        e.preventDefault();
        break;

      case 66:  // b
        if (_user_type === 'listener') {
          _sendReactionName('bad');
        }
        e.preventDefault();
        break;

      case 79:  // o
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
    /*
    $$('#' + _CONTAINER_ID).doubleTap(function () {
      if (_user_type === 'presenter') {
        _sendPageActionName('progress');
      }
      _progressPage();
    });
    */
    // Swipe left
    $$('#' + _CONTAINER_ID).swipeLeft(function () {
      if (_user_type === 'presenter') {
        _sendPageActionName('next');
      }
      _nextPage();
    });
    // Swipe right
    $$('#' + _CONTAINER_ID).swipeRight(function () {
      if (_user_type === 'presenter') {
        _sendPageActionName('prev');
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

    /*
    _hideElems = page.querySelectorAll('.wrapper > section > *, .wrapper > section li, .wrapper > section p.slide > *');
    _elemIndex = 0;
    for (i = 0, len = _hideElems.length; i < len; i++) {
      elem = _hideElems[i];
      elem.style.opacity = (showFlg) ? 1 : 0;
      delete elem.style.webkitTransition;
    }
    */

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
    _graphLeft.width = 100;
    _graphLeft.height = 600;
    _graphLeft.style.position = 'absolute';
    _graphLeft.style.left = '0';
    _graphLeft.style.bottom = '50px';
    _graphLeft.style.zIndex = '1001';

    _graphRight.width = 165;
    _graphRight.height = 600;
    _graphRight.style.position = 'absolute';
    _graphRight.style.right = '0';
    _graphRight.style.bottom = '50px';
    _graphRight.style.zIndex = '1001';

    _graphL = new Graph(_graphLeft);
    _graphR = new Graph(_graphRight);
  }

  // TODO: グラフ長がウィンドウ超えた時も常に数値を表示
  function _drawUserGraph(count) {
    var arr,
        data = [];
    _graphL.hideGrids();
    _graphL.clear();
    arr = count.listener;
    // Set data
    data[0] = [0, arr[_currentIndex]];
    _graphL.setData(data);
    // Set styles
    _graphL.setColor('rgba(0, 122, 255, .8)');
    _graphL.setType('bar');
    _graphL.setBarWidth(30);
    _graphL.setScale(70, 10);
    _graphL.showValue();
    // Draw graph
    _graphL.draw();
  }

  function _drawReactionGraph(count) {
    var type,
        arr;
    _graphR.hideGrids();
    _graphR.clear();
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
      _graphR.setData(data);
      // Set styles
      if (type === 'good') {
        _graphR.setColor('rgba(108, 190, 110, .8)');
      } else if (type === 'bad') {
        _graphR.setColor('rgba(224, 74, 40, .8)');
      }
      _graphR.setType('bar');
      _graphR.setBarWidth(30);
      _graphR.setScale(70, 10);
      _graphR.showValue();
      // Draw graph
      _graphR.draw();
    }
  }

  /**
   * Show options
   */
  function _toggleOptions() {
    var buttonsLeft = document.getElementById('buttons-left');
    var buttonsRight = document.getElementById('buttons-right');
    var graphLeft = document.getElementById(_GRAPH_LEFT_ID);
    var graphRight = document.getElementById(_GRAPH_RIGHT_ID);
    if (_optionIsShown) {
      buttonsLeft.style.display = 'none';
      buttonsRight.style.display = 'none';
      graphLeft.style.display = 'none';
      graphRight.style.display = 'none';
      _optionIsShown = false;
    } else {
      buttonsLeft.style.display = 'block';
      buttonsRight.style.display = 'block';
      graphLeft.style.display = 'block';
      graphRight.style.display = 'block';
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
    _drawUserGraph(data);
  });

  socket.on('reaction count', function (data) {
    _drawReactionGraph(data);
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
  // Initialize room before loading DOM content
  initRoom();
  // Initialize after loading DOM content
  window.addEventListener('DOMContentLoaded', initialize, false);

  /**
   * Export
   */
  window.sendReactionName = _sendReactionName;
  window.syncPage = _syncPage;
})();
