'use strict';
const ioHook = require('iohook');

ioHook.on("mousemove", event => {
  console.log(event);
  // result: {type: 'mousemove',x: 700,y: 400}
});
ioHook.on("keypress", event => {
  console.log(event);
  if (event.rawcode === 65) {
    event.preventDefault();
  }
  // result: {keychar: 'f', keycode: 19, rawcode: 15, type: 'keypress'}
});
//Register and stark hook 
ioHook.start();