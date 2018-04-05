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
        
      }
    });

    this._initListeners();
  }

  _initListeners() {
    for (var i = 0, len = this.buttons.length; i < len; i++) {
      this.buttons[i].addEvent('click', this.changeTool, this);
    }

    this.world.canvas.addEventListener('mousedown', this.useCurrentTool.bind(this));
  }

  addStrategy(strategy) {
    this.strategies.push(strategy);
  }

  changeStrategy(clickEvent) {
    this.currentTool = clickEvent.target.textContent;
    for (var i = 0, len = this.strategies.length; i < len; i++) {
      if (this.strategies[i].tool === this.currentTool)
        this.strategy = this.strategies[i];
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
    this.elem.style.backgroundColor = color;
    return this;
  }

  addEvent(event, callback, bind) {
    if (bind) {
      this.elem.addEventListener(event, callback.bind(bind));
      return;
    }
    this.elem.addEventListener(event, callback);
  }
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