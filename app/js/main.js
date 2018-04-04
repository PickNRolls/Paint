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

    this.toolsPanel = new ToolsPanel(this.wrap);
    this.palette = new Palette(this.wrap);
  }
}

class Panel {
  constructor(placeToAppend) {
    this.placeToAppend = placeToAppend;
    this.elem = document.createElement('div');
    this.elem.classList.add('panel');
    this.buttons = [];

    this.placeToAppend.append(this.elem);
  }

  addButton(buttonInstance) {
    buttonInstance.append(this.elem);
  }
}

class ToolsPanel extends Panel {
  constructor(placeToAppend) {
    super(placeToAppend);
    this.elem.classList.add('tools-panel');
    this.addButton( new Button('Pen', ['tools-panel__button']) );
    this.addButton( new Button('Eraser', ['tools-panel__button']) );
    this.addButton( new Button('Fill', ['tools-panel__button']) );
  }
}

class Palette extends Panel {
  constructor(placeToAppend) {
    super(placeToAppend);
    this.elem.classList.add('palette');
    this.addButton( new Button('', ['palette__button']).fill('#fff') );
    this.addButton( new Button('', ['palette__button']).fill('#000') );
    this.addButton( new Button('', ['palette__button']).fill('#828282') );
    this.addButton( new Button('', ['palette__button']).fill('#ef4343') );
    this.addButton( new Button('', ['palette__button']).fill('#2b59f2') );
    this.addButton( new Button('', ['palette__button']).fill('#5bdb25') );
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
}

var world = new World('personalID');