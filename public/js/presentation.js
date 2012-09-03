(function(){
  var _pages,
      _currentIndex = 0,
      _elemIndex = 0,
      _hideElems,
      _scriptArr = [];

  var _ANIMATION_TIME = '1s';

  function initialize(){
    var match, pageNum;
    match = location.href.match(/#([0-9]+)$/);
    pageNum = (match) ? parseInt(match[1], 10) - 1 : 0;
    _pages = document.querySelectorAll('#container article');

    window.addEventListener('keydown', _keyPressAction, false);

    if(pageNum < 0 || pageNum >= _pages.length){
      pageNum = 0;
    }

    _currentIndex = pageNum;
    page = _pages[_currentIndex];
    page.style.display = 'block';

    _initScripts();
    _initPage(_currentIndex);
  }

  function _initScripts(){
    var pres = document.getElementsByTagName('pre'),
        i, len, pre, btn;

    for(i = 0, len = pres.length; i < len; i++){
      pre = pres[i];
      pre.addEventListener('click', _executeScript, false);
    }
  }

  function _executeScript(e){
    var target = e.currentTarget,
        code = target.getElementsByTagName('code')[0],
        script = document.createElement('script');

    script.type = 'text/javascript';
    script.innerHTML = code.innerHTML.replace(/&lt;/,"<");
    document.body.appendChild(script);
    document.body.removeChild(script);
  }

  function _keyPressAction(e){
    var code = e.keyCode;
    switch(code){
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

  function _keyPressActionByKeyCode(code){
    switch(code){
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

  function _isKeyPressAction(e){
    var code = e.keyCode;
    switch(code){
      //Enter
      case 13 :
        return true;
      //Right
      case 39 :
        return true;
      //Left
      case 37 :
        return true;
        break;
      default :
        return false;
    }
  }

  function _nextPage(showFlg){
    var currentPage, nextPage;
    if(_currentIndex === _pages.length - 1){
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

    discountIndex(_currentIndex);
    _currentIndex++;
    _initPage(_currentIndex);
  }

  function _prevPage(){
    if(_currentIndex === 0){
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

    discountIndex(_currentIndex);
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

    countIndex(index);
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

  window.addEventListener('DOMContentLoaded', initialize, false);
  window.isKeyPressAction = _isKeyPressAction;
  window.keyPressActionByKeyCode = _keyPressActionByKeyCode;
}());
