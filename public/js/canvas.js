(function (global) {
  var socket = io.connect();

  function draw(container) {
    var beforeX
      , beforeY
      , clicking = false;
    socket.on('location', function (data) {
      var ctx = container.getContext('2d');
      var x = data.x;
      var y = data.y;
      ctx.beginPath();
      ctx.strokeStyle = getRandomColor();
      ctx.lineWidth = 5;
      ctx.moveTo(beforeX, beforeY);
      ctx.lineTo(x, y);
      ctx.stroke();

      beforeX = x;
      beforeY = y;
    });

    socket.on('clear', function (data) {
      if (document.getElementById(data.id) === container && data.clear) {
        var ctx = container.getContext('2d');
        ctx.clearRect(0, 0, container.width, container.height);
      }
    });

    // TODO: Generalize id
    $('#canvas').mousedown(function () {
      clicking = true;
    });
    $(document).mouseup(function () {
      clicking = false;
      socket.emit('location', {
        beforeX: undefined
      , beforeY: undefined
      });
    });
    // TODO: Generalize id
    $('#canvas').mousemove(function (e) {
      if (clicking) {
        socket.emit('location', {
          x: e.pageX
        , y: e.pageY
        });
      }
    });
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
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.zIndex = '1';
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
