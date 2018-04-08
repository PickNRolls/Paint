class ElementCoordinate {
  constructor(elem) {
    this.elem = elem;
    this.refresh();
  }

  refresh() {
    this.top = this.elem.getBoundingClientRect().top + pageYOffset;
    this.left = this.elem.getBoundingClientRect().left + pageXOffset;
  }
}

class Widget {
  constructor(config) {
    this.elem = config.element;
    if (typeof config.classes === 'string') {
      var arr = [];
      arr.push(config.classes);
      this.classes = arr;
    } else {
      this.classes = config.classes;
    }
  } 

  start() {
    return new Error('Method start must be overriden!')
  }

  getElement() {
    return this.elem;
  }

  getClassList(likeString) {
    if(likeString) return this.classes.join(' ');
    return this.classes;
  }

  init() {
    for (var i = 0, len = this.classes; i < len; i++) {
      this.elem.classList.add(this.classes[i]);
    }
  }
}

class ScrollSlider extends Widget {
  constructor(config) {
    super(config);
    this._mousemove = this._mousemove.bind(this);
    this._mouseup = this._mouseup.bind(this);
    this._classes.push('scroll-slider');
    this._scroll = null;
    this._sliderWidth = null;
    this._sliderCoord = null;
    this._scrollWidth = null;
    this._scrollCoord = null;
    this._scrollWidth = null;
    this._dragged = false;
  }

  start() {
    this._init();
    return this._handleListeners();
  }

  _init() {
    super._init();
    if (!this._elem.querySelector('[data-scroll-slider]')) {
      this._scroll = document.createElement('div');
      this._scroll.setAttribute('data-scroll-slider', 'on');
      this._scroll.classList.add('scroll');
      this._elem.insertBefore(this._scroll, this._elem.firstChild);
    }
    this._sliderWidth = this._elem.offsetWidth;
    this._sliderCoord = new ElementCoordinate(this._elem);
    return this._scrollWidth = this._scroll.offsetWidth;
  }

  _handleListeners() {
    this._elem.addEventListener('mousedown', (e) => {
      this._mousedown(e);
      document.addEventListener('mousemove', this._mousemove);
      this._elem.ondrag = function() {
        return false;
      };
      return document.addEventListener('mouseup', this._mouseup);
    });
    return this._elem.addEventListener('click', (e) => {
      var target;
      target = e.target;
      if (!target.classList.contains('scroll-slider') || target.getAttribute('data-scroll-slider')) {
        return;
      }
      return this._scroll.style.left = e.pageX - this._sliderCoord.left - this._scrollWidth / 2 + 'px';
    });
  }

  _mousedown(e) {
    var target;
    target = e.target;
    if (!target.classList.contains('scroll')) {
      return;
    }
    this._scrollCoord = new ElementCoordinate(target);
    document.body.style.cursor = 'pointer';
    return this._dragged = true;
  }

  _mousemove(e) {
    boundMethodCheck(this, ScrollSlider);
    if (!this._dragged) {
      return;
    }
    this._scroll.style.left = e.pageX - this._sliderCoord.left + 'px';
    this._scrollCoord.refresh();
    return this._checkEdges();
  }

  _mouseup() {
    boundMethodCheck(this, ScrollSlider);
    document.removeEventListener('mousemove', this._mousemove);
    document.removeEventListener('mouseup', this._mouseup);
    this._dragged = false;
    return document.body.style.cursor = '';
  }

  _checkEdges() {
    var leftEdge, rightEdge;
    rightEdge = this._sliderWidth - this._scrollWidth;
    leftEdge = this._scrollCoord.left - this._sliderCoord.left;
    if (leftEdge < 0) {
      this._scroll.style.left = 0;
    }
    if (leftEdge > rightEdge) {
      return this._scroll.style.left = rightEdge + 'px';
    }
  }
}

class Panel {
  constructor(world) {
    this.world = world;
    this.placeToAppend = world.wrap;
    this.elem = document.createElement('div');
    this.elem.classList.add('panel');
    this.buttons = [];

    this.placeToAppend.append(this.elem);
  }

  addButton(buttonInstance) {
    buttonInstance.panel = this;
    buttonInstance.append(this.elem);
    this.buttons.push(buttonInstance);
  }
}

class ToolsPanel extends Panel {
  constructor(world) {
    super(world);
    this.elem.classList.add('tools-panel');
    this.addButton( new Button('Pen', ['tools-panel__button']) );
    this.addButton( new Button('Eraser', ['tools-panel__button']) );
    this.addButton( new Button('Fill', ['tools-panel__button']) );

    this.currentTool = null;
    this.strategies = [];
    this.strategy = null;

    this.addStrategy({
      tool: 'Pen',
      strategy: function() {
        var ctx = this.world.ctx;
        var canvas = this.world.canvas;
        var mouseDowned = false;
        ctx.strokeStyle = this.world.palette.currentColor;

        canvas.onmousedown = function() {
          mouseDowned = true;
          ctx.beginPath();
        };

        canvas.onmousemove = function(e) {
          if (mouseDowned) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
          }
        };

        canvas.onmouseup = function() {
          mouseDowned = false;
        };
      }
    }).addStrategy({
      tool: 'Eraser',
      strategy: function() {
        var ctx = this.world.ctx;
        var canvas = this.world.canvas;
        var mouseDowned = false;
        ctx.strokeStyle = '#fff';

        canvas.onmousedown = function() {
          mouseDowned = true;
          ctx.beginPath();
        };

        canvas.onmousemove = function(e) {
          if (mouseDowned) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
          }
        };

        canvas.onmouseup = function() {
          mouseDowned = false;
        };
      }
    }).addStrategy({
      tool: 'Fill',
      strategy: function() {
        var world = this.world;
        var ctx = world.ctx;
        ctx.fillStyle = world.palette.currentColor;
        this.world.canvas.onclick = function() {
          ctx.beginPath();
          ctx.rect(0, 0, world.width, world.height);
          ctx.fill();
        };
      }
    });

    this._initListeners();
  }

  _initListeners() {
    for (var i = 0, len = this.buttons.length; i < len; i++) {
      this.buttons[i].elem.addEventListener('click', this.changeStrategy.bind(this));
    }

    this.world.canvas.addEventListener('mousedown', this.useCurrentTool.bind(this));
  }

  addStrategy(strategy) {
    this.strategies.push(strategy);
    return this;
  }

  changeStrategy(clickEvent) {
    var c = this.world.canvas;
    c.onmousedown = c.mouseup = c.mousemove = c.onclick = null;

    this.currentTool = clickEvent.target.textContent;
    this.strategy = this.findStrategy(this.currentTool).strategy;
    this.strategy.call(this);
  }

  findStrategy(name) {
    for (var i = 0, len = this.strategies.length; i < len; i++) {
      if (this.strategies[i].tool === name) return this.strategies[i];
    }
  }

  useCurrentTool() {
    this.strategy();
  }
}

class Palette extends Panel {
  constructor(world) {
    super(world);
    this.elem.classList.add('palette');
    this.addButton( new Button('', ['palette__button']).fill('#fff') );
    this.addButton( new Button('', ['palette__button']).fill('#000') );
    this.addButton( new Button('', ['palette__button']).fill('#828282') );
    this.addButton( new Button('', ['palette__button']).fill('#ef4343') );
    this.addButton( new Button('', ['palette__button']).fill('#2b59f2') );
    this.addButton( new Button('', ['palette__button']).fill('#5bdb25') );

    this.currentColor = null;
    this._initListeners();
  }

  _initListeners() {
    var palette = this;
    for (var i = 0, len = this.buttons.length; i < len; i++) {
      var button = this.buttons[i];
      button.elem.addEventListener('click', function() {
        palette.changeColor(this.color);
      }.bind(button));
    }
  }

  changeColor(color) {
    this.currentColor = color;
  }
}

class Button {
  constructor(name, classList) {
    this.elem = document.createElement('button');
    this.elem.textContent = name;
    this.elem.classList.add('button');

    if (classList) {
      for (var i = 0, len = classList.length; i < len; i++) {
        this.elem.classList.add(classList[i]);
      }
    }
  }

  append(to) {
    to.append(this.elem);
  }

  fill(color) {
    this.elem.style.backgroundColor = this.color = color;
    return this;
  }

  // addEvent(typeOfEvent, callback) {
  //   this.elem.addEventListener(typeOfEvent, callback);
  // }
}

class World {
  constructor(canvasID) {
    this.wrap = document.createElement('div');
    this.wrap.classList.add('world-wrap');
    this.canvas = document.createElement('canvas');
    this.canvas.id = canvasID;
    this.canvas.classList.add('world');
    this.wrap.append(this.canvas);
    document.body.append(this.wrap);

    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = 1280;
    this.height = this.canvas.height = 720;
    this._init(canvasID);
  }

  _init(canvasID) {
    var ctx = this.ctx;
    ctx.rect(0, 0, this.width, this.height);
    ctx.fillStyle = '#000';
    ctx.fill();

    this.toolsPanel = new ToolsPanel(this);
    this.palette = new Palette(this);
  }
}

var world = new World('personalID');