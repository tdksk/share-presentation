(function (global) {
  var socket = io.connect();

  function draw(container) {
    var beforeX
      , beforeY
      , isClicking = false;
    socket.on('location', function (data) {
      var ctx = container.getContext('2d');
      var currentX = data.x;
      var currentY = data.y;
      ctx.beginPath();
      ctx.strokeStyle = getRandomColor();
      ctx.lineWidth = 5;
      ctx.moveTo(beforeX, beforeY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      beforeX = currentX;
      beforeY = currentY;
    });

    socket.on('clear', function (data) {
      if (document.getElementById(data.id) === container && data.clear) {
        var ctx = container.getContext('2d');
        ctx.clearRect(0, 0, container.width, container.height);
      }
    });

    container.addEventListener('mousedown', function (e) {dragStart(e);}, false);
    container.addEventListener('mousemove', function (e) {dragging(e);}, false);
    document.addEventListener('mouseup', function (e) {dragEnd(e);}, false);

    function dragStart(e) {
      isClicking = true;
    }
    function dragging(e) {
      if (!isClicking) {
        return;
      }
      socket.emit('location', {
        x: e.offsetX
      , y: e.offsetY
      });
    }
    function dragEnd(e) {
      isClicking = false;
      socket.emit('location', {
        beforeX: undefined
      , beforeY: undefined
      });
    }
  }

  function clearCanvas(id) {
    var container = document.getElementById(id);
    var ctx = container.getContext('2d');
    ctx.clearRect(0, 0, container.width, container.height);
    socket.emit('clear', {
      id: id
    , clear: true
    });
  }

  function init(container, width, height) {
    container.width = width;
    container.height = height;
    container.style.position = 'relative';
    container.style.left = '0';
    container.style.top = '0';
    container.style.zIndex = '1000';
    container.style.float = 'left';
  }

  function getRandomColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }

  global.draw = draw;
  global.clearCanvas = clearCanvas;
  global.init = init;
})(window);
