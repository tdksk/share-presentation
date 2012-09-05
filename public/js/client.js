(function () {
  /**
   * Presentation
   */
  var _pages,
      _currentIndex = 0,
      _elemIndex = 0,
      _hideElems,
      _scriptArr = [],
      _beforeX,
      _beforeY,
      _isClicking,
      canvas,
      params = getJsParam(),  // Load at first
      user_type = params.type;

  var socket = io.connect();

  var _ANIMATION_TIME = '1s',
      _CONTAINER_ID = 'container',
      _CANVAS_ID = 'canvas';

  function initialize() {
    var pageNum, page, container, width, height;

    pageNum = currentIndex();
    _pages = document.querySelectorAll('#' + _CONTAINER_ID + ' article');

    container = document.getElementById(_CONTAINER_ID);
    if (container) {
      width = container.offsetWidth;
      height = container.offsetHeight;
      window.addEventListener('keydown', _keyPressAction, false);
      if ($$.isMobile() && user_type !== 'presenter') {
        // Prevent default touch event
        window.ontouchmove = function (e) {
          e.preventDefault();
        };
        // Set touch events
        _touchAction();
      }
    }

    canvas = document.getElementById(_CANVAS_ID);
    console.log(user_type);
    if (canvas && user_type === 'presenter') {
      canvas.addEventListener('mousedown', function (e) {_dragStart(e);}, false);
      canvas.addEventListener('mousemove', function (e) {_dragging(e);}, false);
      document.addEventListener('mouseup', function (e) {_dragEnd(e);}, false);
    }

    if (pageNum < 0 || pageNum >= _pages.length) {
      pageNum = 0;
    }

    _currentIndex = pageNum;
    page = _pages[_currentIndex];
    page.style.display = 'block';

    _initCanvas(width, height);
    _initPage(_currentIndex);

    // For debug
    debug.innerHTML = '<ul>';
    debug.innerHTML += '<li>User type: ' + user_type;
  }

  function _initCanvas(width, height) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = 'relative';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = '1000';
    canvas.style.float = 'left';
  }

  function _keyPressAction(e) {
    var code = e.keyCode;
    switch (code) {
      //Enter
      case 13 :
        if (user_type === 'presenter') _sendKeyCode(code);
        _progressPage();
        break;
      //Right
      case 39 :
        if (user_type === 'presenter') _sendKeyCode(code);
        _nextPage();
        break;
      //Left
      case 37 :
        if (user_type === 'presenter') _sendKeyCode(code);
        _prevPage();
        break;
      //0
      case 48 :
        if (user_type === 'presenter') socket.emit('reset');
    }
  }

  function _keyPressActionByKeyCode(code) {
    switch (code) {
      //Enter
      case 13 :
        _progressPage();
        break;
      //Right
      case 39 :
        _nextPage();
        break;
      //Left
      case 37 :
        _prevPage();
        break;
    }
  }

  function _sendKeyCode(code) {
    socket.emit('page', {
      pageNum: currentIndex()
    , keyCode: code
    });
  }

  function _touchAction() {
    $$('#' + _CONTAINER_ID).doubleTap(function () {
      if (user_type === 'presenter') _sendKeyCode(13);  // Enter
      _progressPage();
    });

    $$('#' + _CONTAINER_ID).swipeLeft(function () {
      if (user_type === 'presenter') _sendKeyCode(39);  // Right
      _nextPage();
    });

    $$('#' + _CONTAINER_ID).swipeRight(function () {
      if (user_type === 'presenter') _sendKeyCode(37);  // Left
      _prevPage();
    });
  }

  function _nextPage(showFlg) {
    var currentPage, nextPage;
    if (_currentIndex === _pages.length - 1) {
      return;
    }

    currentPage = _pages[_currentIndex];
    nextPage = _pages[_currentIndex + 1];

    currentPage.removeEventListener('webkitAnimationEnd', _movedPage);
    nextPage.removeEventListener('webkitAnimationEnd', _movedPage);

    currentPage.addEventListener('webkitAnimationEnd', _movedPage);
    nextPage.style.display = 'block';

    currentPage.className = 'move_to_left';
    nextPage.className = 'move_from_right';

    _discountIndex(_currentIndex);
    _currentIndex++;
    _initPage(_currentIndex);
  }

  function _prevPage(){
    var currentPage, nextPage;
    if (_currentIndex === 0) {
      return;
    }

    currentPage = _pages[_currentIndex];
    nextPage = _pages[_currentIndex - 1];

    currentPage.removeEventListener('webkitAnimationEnd', _movedPage);
    nextPage.removeEventListener('webkitAnimationEnd', _movedPage);

    currentPage.addEventListener('webkitAnimationEnd', _movedPage);
    nextPage.style.display = 'block';

    currentPage.className = 'move_to_right';
    nextPage.className = 'move_from_left';

    _discountIndex(_currentIndex);
    _currentIndex--;
    _initPage(_currentIndex, true);
  }

  function _initPage(index, showFlg){
    var url, page, i, len, elem;

    url = location.href.replace(/#[0-9]+$/, '');
    location.href = url + '#' + String(index + 1);

    page = _pages[index];
    _hideElems = page.querySelectorAll('.wrapper > section > *, .wrapper > section li, .wrapper > section p.slide > *');
    _elemIndex = 0;
    for(i = 0, len = _hideElems.length; i < len; i++){
      elem = _hideElems[i];
      if(elem.tagName == 'UL'){
        //console.log(elem.children);
      }
      elem.style.opacity = (showFlg) ? 1 : 0;
      delete elem.style.webkitTransition;
    }

    if(showFlg){
      _hideElems = [];
    }

    _countIndex(index);
    _clearCanvas();
  }

  function _movedPage(e){
    var target = e.currentTarget;
    target.removeEventListener(e.type, arguments.callee);
    target.style.display = 'none';
  }

  function _progressPage(){
    var elem = _hideElems[_elemIndex];
    if(!elem){
      _nextPage();
      return;
    }

    elem.style.webkitTransition = 'all 0.5s ease-out';
    elem.style.opacity = 1;

    _elemIndex++;
  }

  function _clearCanvas() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function _dragStart(e) {
    _isClicking = true;
  }

  function _dragging(e) {
    if (!_isClicking) return;

    socket.emit('location', {
      pageNum: currentIndex()
    , x: e.offsetX
    , y: e.offsetY
    });
  }

  function _dragEnd(e) {
    _isClicking = false;
    socket.emit('location', {
      pageNum: currentIndex()
    , _beforeX: undefined
    , _beforeY: undefined
    });
  }

  function _countIndex(index) {
    socket.emit('count', {
      pageNum: index
    , action: 'count'
    });
  }

  function _discountIndex(index) {
    socket.emit('count', {
      pageNum: index
    , action: 'discount'
    });
  }

  function currentIndex() {
    var match = location.href.match(/#([0-9]+)$/);
    return (match) ? parseInt(match[1], 10) - 1 : 0;
  }

  function getRandomColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }

  function getJsParam() {
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
    if (currentIndex() === data.pageNum) {
      _keyPressActionByKeyCode(data.keyCode);
    }
  });

  socket.on('reset', function () {
    location.reload(true);
  });

  socket.on('location', function (data) {
    if (currentIndex() === data.pageNum) {
      var ctx = canvas.getContext('2d'),
          _currentX = data.x,
          _currentY = data.y;
      // Set styles
      ctx.strokeStyle = getRandomColor();
      ctx.lineWidth = 5;
      // Draw line
      ctx.beginPath();
      ctx.moveTo(_beforeX, _beforeY);
      ctx.lineTo(_currentX, _currentY);
      ctx.stroke();

      _beforeX = _currentX;
      _beforeY = _currentY;
    }
  });

  /**
   * Initialize
   */
  window.addEventListener('DOMContentLoaded', initialize, false);
})();
