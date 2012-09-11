(function (global) {
  var isGrids = false;

  function Graph(container) {
    this._container = container;
    this._data = new Array();
    /* Default */
    this._type = 'line';
    this._color = '#444';
    this._xScale = 50;
    this._yScale = 50;
    this._pointSize = 3;
    this._lineWidth = 2;
    this._barWidth = 30;
    this._leftOffset = 50;
    this._topOffset = 20;
    this._labelMargin = 10;
    this._grids = true;

    this._containerWidth = this._container.width;
    this._containerHeight = this._container.height;

    this._left = this._leftOffset;
    this._right = this._containerWidth - this._leftOffset;
    this._top = this._topOffset;
    this._bottom = this._containerHeight - this._topOffset;
  };

  /* Draw axes */
  Graph.prototype.drawAxes = function () {
    var ctx = this._container.getContext('2d');

    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.moveTo(this._left, this._top);
    ctx.lineTo(this._left, this._bottom);
    ctx.lineTo(this._right, this._bottom);
    ctx.lineTo(this._right, this._top);
    ctx.closePath();
    ctx.stroke();
  };

  /* Draw grids */
  Graph.prototype.drawGrids = function () {
    var ctx = this._container.getContext('2d');
    var i;

    ctx.beginPath();
    ctx.fillStyle = '#444';  // for Scales
    ctx.strokeStyle = '#bbb';  // for Grids
    ctx.lineWidth = .5;
    for (i = 0; i < (this._right - this._left) / this._xScale; i++) {
      ctx.fillText(i, this._left + i * this._xScale, this._bottom + this._labelMargin);
      ctx.moveTo(this._left + i * this._xScale,
                 this._top);
      ctx.lineTo(this._left + i * this._xScale,
                 this._bottom);
    }
    for (i = 0; i < (this._bottom - this._top) / this._yScale; i++) {
      ctx.fillText(i, this._left - this._labelMargin, this._bottom - i * this._yScale);
      ctx.moveTo(this._left,
                 this._bottom - i * this._yScale);
      ctx.lineTo(this._right,
                 this._bottom - i * this._yScale);
    }
    ctx.stroke();
  };

  /* Draw graph*/
  Graph.prototype.draw = function () {
    var ctx = this._container.getContext('2d');
    var i;

    if (this._grids && !isGrids) {
      this.drawAxes();
      this.drawGrids();
      isGrids = true;
    }

    /* Point */
    if (this._type.match(/point/ig)) {
      ctx.beginPath();
      ctx.fillStyle = this._color;
      for (i = 0; this._data[i]; ++i) {
        ctx.arc(this._left + this._data[i][0] * this._xScale,
                this._bottom - this._data[i][1] * this._yScale,
                this._pointSize, 0, Math.PI*2, false);
      }
      ctx.fill();
    }
    /* Line */
    if (this._type.match(/line/ig)) {
      ctx.beginPath();
      ctx.strokeStyle = this._color;
      ctx.lineWidth = this._lineWidth;
      ctx.moveTo(this._left + this._data[0][0] * this._xScale,
                 this._bottom - this._data[0][1] * this._yScale);
      for (i = 1; this._data[i]; ++i) {
        ctx.lineTo(this._left + this._data[i][0] * this._xScale,
                   this._bottom - this._data[i][1] * this._yScale);
      }
      ctx.stroke();
    }
    /* Bar */
    if (this._type.match(/bar/ig)) {
      ctx.fillStyle = this._color;
      for (i = 0; this._data[i]; ++i) {
        ctx.fillRect((this._left + this._data[i][0] * this._xScale) - this._barWidth / 2,
                     this._bottom - this._data[i][1] * this._yScale,
                     this._barWidth,
                     this._data[i][1] * this._yScale);
      }
    }
  };

  /* Clear canvas */
  Graph.prototype.clear = function () {
    var ctx = this._container.getContext('2d');
    ctx.clearRect(0, 0, this._containerWidth, this._containerHeight);
    if (this._grids) {
      this.drawAxes();
      this.drawGrids();
      isGrids = true;
    }
  };

  /* Setter */
  Graph.prototype.setData = function (data) {
    this._data = data;
  };
  Graph.prototype.setType = function (type) {
    this._type = type;
  };
  Graph.prototype.setColor = function (color) {
    this._color = color;
  };
  Graph.prototype.setXScale = function (xScale) {
    this._xScale = xScale;
  };
  Graph.prototype.setYScale = function (yScale) {
    this._yScale = yScale;
  };
  Graph.prototype.setPointSize = function (poinsSize) {
    this._pointSize = poinsSize;
  };
  Graph.prototype.setBarWidth = function (barWidth) {
    this._barWidth = barWidth;
  };

  /* Options */
  Graph.prototype.hideGrids = function () {
    this._grids = false;
  };

  var resizeCanvas = function (container, width, height) {
    container.width = width;
    container.height = height;
  };

  global.Graph = Graph;
  global.resizeCanvas = resizeCanvas;
})(window);
