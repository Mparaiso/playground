!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.outlet=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("C:\\Users\\mark prades\\AppData\\Roaming\\npm\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"C:\\Users\\mark prades\\AppData\\Roaming\\npm\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":3,"inherits":2}],6:[function(_dereq_,module,exports){
var util = _dereq_("util");var type = (function(obj){
return (function() {if(number_p_(obj)) {return "\uFDD1number"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(boolean_p_(obj)) {return "\uFDD1boolean"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(string_p_(obj)) {return "\uFDD1string"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(obj)) {return "\uFDD1null"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_p_(obj)) {return "\uFDD1list"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(vector_p_(obj)) {return "\uFDD1vector"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(obj)) {return "\uFDD1dict"; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var number_p_ = (function(obj){
return _eq__eq_(typeof obj,"number"); // Line 16 Column 3
});
var string_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && not(_eq__eq_(obj[0],"\uFDD0")) && not(_eq__eq_(obj[0],"\uFDD1"))); // Line <unknown undefined> Column <unknown undefined>
});
var symbol_p_ = (function(obj){
return ((_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD1"))); // Line <unknown undefined> Column <unknown undefined>
});
var key_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD0")); // Line <unknown undefined> Column <unknown undefined>
});
var boolean_p_ = (function(obj){
return (eq_p_(obj,true) || eq_p_(obj,false)); // Line <unknown undefined> Column <unknown undefined>
});
var null_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && eq_p_(obj["length"],1) && eq_p_(vector_dash_ref(obj,0),null)); // Line <unknown undefined> Column <unknown undefined>
});
var list_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && not(eq_p_(obj["list"],undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var vector_p_ = (function(obj){
return (not(list_p_(obj)) && not(null_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && not(eq_p_(obj["length"],undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var dict_p_ = (function(obj){
return (not(symbol_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && eq_p_(obj["length"],undefined)); // Line <unknown undefined> Column <unknown undefined>
});
var function_p_ = (function(obj){
return eq_p_(typeof obj,"function"); // Line 60 Column 3
});
var literal_p_ = (function(x){
return (key_p_(x) || number_p_(x) || string_p_(x) || boolean_p_(x) || null_p_(x)); // Line <unknown undefined> Column <unknown undefined>
});
var str = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return fold((function(el,acc){
return (acc + (function() {if(string_p_(el)) {return el; // Line <unknown undefined> Column <unknown undefined>
} else {return inspect(el); // Line 75 Column 36
}})()
); // Line <unknown undefined> Column <unknown undefined>
}),"",args); // Line 73 Column 5
});
var symbol_dash__gt_key = (function(sym){
return ("\uFDD0" + sym["substring"](1)); // Line <unknown undefined> Column <unknown undefined>
});
var key_dash__gt_symbol = (function(sym){
return ("\uFDD1" + sym["substring"](1)); // Line <unknown undefined> Column <unknown undefined>
});
var string_dash__gt_key = (function(str){
return ("\uFDD0" + str); // Line <unknown undefined> Column <unknown undefined>
});
var key_dash__gt_string = (function(key){
return key["substring"](1); // Line 89 Column 3
});
var string_dash__gt_symbol = (function(str){
return ("\uFDD1" + str); // Line <unknown undefined> Column <unknown undefined>
});
var symbol_dash__gt_string = (function(sym){
return sym["substring"](1); // Line 95 Column 3
});
var _emptylst = [null];
var list = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return args; // Line <unknown undefined> Column <unknown undefined>
});
var cons = (function(obj,lst){
return ((function() {var o1 = (function(res){
res.list = true;return res; // Line <unknown undefined> Column <unknown undefined>
});
var o2 = [obj, lst];
return o1(o2); // Line 106 Column 2
}))(); // Line 106 Column 2
});
var car = (function(lst){
return lst[0]});
var cdr = (function(lst){
return lst[1]});
var cadr = (function(lst){
return car(cdr(lst)); // Line 116 Column 20
});
var cddr = (function(lst){
return cdr(cdr(lst)); // Line 117 Column 20
});
var cdar = (function(lst){
return cdr(car(lst)); // Line 118 Column 20
});
var caddr = (function(lst){
return car(cdr(cdr(lst))); // Line 119 Column 21
});
var cdddr = (function(lst){
return cdr(cdr(cdr(lst))); // Line 120 Column 21
});
var cadar = (function(lst){
return car(cdr(car(lst))); // Line 121 Column 21
});
var cddar = (function(lst){
return cdr(cdr(car(lst))); // Line 122 Column 21
});
var caadr = (function(lst){
return car(car(cdr(lst))); // Line 123 Column 21
});
var cdadr = (function(lst){
return cdr(car(cdr(lst))); // Line 124 Column 21
});
var list_dash_ref = (function(lst,i){
return ((function() {var loop = (function(lst,i){
return (function() {if(null_p_(lst)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(eq_p_(i,0)) {return car(lst); // Line 127 Column 2
} else {return loop(cdr(lst),(i - 1)); // Line 127 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o3 = lst;
var o4 = i;
return loop(o3,o4); // Line 127 Column 2
}))(); // Line 127 Column 2
});
var length = (function(lst){
return fold((function(el,acc){
return (acc + 1); // Line <unknown undefined> Column <unknown undefined>
}),0,lst); // Line 135 Column 3
});
var list_dash_append = (function(){
var lsts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
var l_star_ = (function() {if(null_p_(lsts)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return lsts; // Line <unknown undefined> Column <unknown undefined>
}})()
;
return (function() {if(null_p_(l_star_)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(cdr(l_star_))) {return car(l_star_); // Line 144 Column 11
} else {return _list_dash_append(car(l_star_),apply(list_dash_append,cdr(l_star_))); // Line 145 Column 11
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _list_dash_append = (function(lst1,lst2){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return lst2; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(car(lst),loop(cdr(lst))); // Line 149 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o5 = lst1;
return loop(o5); // Line 149 Column 2
}))(); // Line 149 Column 2
});
var list_dash_find = (function(lst,val){
var rst = vector_dash__gt_list(Array.prototype.slice.call(arguments, 2));
return ((function() {var o6 = (function(access){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(access(car(lst)),val)) {return lst; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cdr(lst)); // Line 156 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o8 = lst;
return loop(o8); // Line 156 Column 2
}))(); // Line 156 Column 2
});
var o7 = (function() {if(null_p_(rst)) {return (function(x){
return x; // Line <unknown undefined> Column <unknown undefined>
}); // Line <unknown undefined> Column <unknown undefined>
} else {return car(rst); // Line 156 Column 2
}})()
;
return o6(o7); // Line 156 Column 2
}))(); // Line 156 Column 2
});
var map = (function(func,lst){
return (function() {if(null_p_(lst)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(func(car(lst)),map(func,cdr(lst))); // Line 167 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var for_dash_each = (function(func,lst){
return ((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {func(car(lst)); // Line 171 Column 2
return loop(cdr(lst)); // Line 171 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o9 = lst;
return loop(o9); // Line 171 Column 2
}))(); // Line 171 Column 2
});
var fold = (function(func,acc,lst){
return (function() {if(null_p_(lst)) {return acc; // Line <unknown undefined> Column <unknown undefined>
} else {return fold(func,func(car(lst),acc),cdr(lst)); // Line 180 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var reverse = (function(lst){
return (function() {if(null_p_(lst)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return list_dash_append(reverse(cdr(lst)),list(car(lst))); // Line 187 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash__gt_list = (function(vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return cons(vector_dash_ref(vec,i),loop((i + 1))); // Line 193 Column 2
} else {return _emptylst}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o10 = 0;
return loop(o10); // Line 193 Column 2
}))(); // Line 193 Column 2
});
var make_dash_vector = (function(count){
var val = arguments[1] || false;
return ((function() {var o11 = (function(v){
return (function() {if(val) {return ((function() {var loop = (function(i){
return (function() {if((i < count)) {vector_dash_put_excl_(v,i,val); // Line 202 Column 2
return loop((i + 1)); // Line 202 Column 2
} else {return v; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o13 = 0;
return loop(o13); // Line 202 Column 2
}))(); // Line 202 Column 2
} else {return v; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o12 = new Array(count);
return o11(o12); // Line 202 Column 2
}))(); // Line 202 Column 2
});
var vector = (function() {return Array.prototype.slice.call(arguments)});
var vector_dash_ref = (function(vec,i){
return vec[i]});
var vector_dash_put_excl_ = (function(vec,i,obj){
return vec[i] = obj});
var vector_dash_concat = (function(){
var vecs = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var loop = (function(lst,res){
return (function() {if(null_p_(lst)) {return res; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cdr(lst),res["concat"](car(lst))); // Line 222 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o14 = cdr(vecs);
var o15 = car(vecs);
return loop(o14,o15); // Line 222 Column 2
}))(); // Line 222 Column 2
});
var vector_dash_slice = (function(vec,start){
var end = arguments[2] || false;
return vec.slice(start, end || undefined)});
var vector_dash_push_excl_ = (function(vec,obj){
return vec.push(obj)});
var vector_dash_find = (function(vec,val){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return (function() {if(eq_p_(vector_dash_ref(vec,i),val)) {return i; // Line <unknown undefined> Column <unknown undefined>
} else {return loop((i + 1)); // Line 236 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o16 = 0;
return loop(o16); // Line 236 Column 2
}))(); // Line 236 Column 2
});
var vector_dash_length = (function(vec){
return vec["length"]; // Line <unknown undefined> Column <unknown undefined>
});
var list_dash__gt_vector = (function(lst){
var res = [];
for_dash_each((function(el){
return res["push"](el); // Line 248 Column 15
}),lst); // Line 247 Column 3
return res; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash_map = (function(func,vec){
var res = [];
((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {res["push"](func(vector_dash_ref(vec,i))); // Line 254 Column 2
return loop((i + 1)); // Line 254 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o17 = 0;
return loop(o17); // Line 254 Column 2
}))(); // Line 254 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash_for_dash_each = (function(func,vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {func(vector_dash_ref(vec,i)); // Line 262 Column 2
return loop((i + 1)); // Line 262 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o18 = 0;
return loop(o18); // Line 262 Column 2
}))(); // Line 262 Column 2
});
var vector_dash_fold = (function(func,acc,vec){
return ((function() {var loop = (function(i,acc){
return (function() {if((i < vector_dash_length(vec))) {return loop((i + 1),func(vector_dash_ref(vec,i),acc)); // Line 269 Column 2
} else {return acc; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o19 = 0;
var o20 = acc;
return loop(o19,o20); // Line 269 Column 2
}))(); // Line 269 Column 2
});
var dict = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
var res = {};
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o22 = (function(key,val){
dict_dash_put_excl_(res,key,val); // Line 281 Column 4
return loop(cddr(lst)); // Line 281 Column 4
});
var o23 = car(lst);
var o24 = cadr(lst);
return o22(o23,o24); // Line 281 Column 4
}))(); // Line 281 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o21 = args;
return loop(o21); // Line 281 Column 4
}))(); // Line 281 Column 4
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash_put_excl_ = (function(dct,k,v){
return dct[k.substring(1)] = v});
var dict_dash_ref = (function(dct,k){
return dct[k.substring(1)]});
var dict_dash_map = (function(func,dct){
var res = dict();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o26 = (function(k){
dict_dash_put_excl_(res,k,func(dict_dash_ref(dct,k))); // Line 297 Column 2
return loop(cdr(lst)); // Line 297 Column 2
});
var o27 = car(lst);
return o26(o27); // Line 297 Column 2
}))(); // Line 297 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o25 = keys(dct);
return loop(o25); // Line 297 Column 2
}))(); // Line 297 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash_merge = (function(){
var dcts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var o28 = (function(res){
for_dash_each((function(dct){
return for_dash_each((function(k){
return dict_dash_put_excl_(res,k,dict_dash_ref(dct,k)); // Line 306 Column 2
}),keys(dct)); // Line 306 Column 2
}),dcts); // Line 306 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var o29 = dict();
return o28(o29); // Line 306 Column 2
}))(); // Line 306 Column 2
});
var dict_dash__gt_vector = (function(dct){
var res = vector();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {vector_dash_push_excl_(res,car(lst)); // Line 316 Column 2
vector_dash_push_excl_(res,dict_dash_ref(dct,car(lst))); // Line 316 Column 2
return loop(cdr(lst)); // Line 316 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o30 = keys(dct);
return loop(o30); // Line 316 Column 2
}))(); // Line 316 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash__gt_list = (function(dct){
return vector_dash__gt_list(dict_dash__gt_vector(dct)); // Line 325 Column 3
});
var keys = (function(dct){
return ((function() {var o31 = (function(res){
for(var k in dct) {
       res = cons(string_dash__gt_key(k), res);
    }return res; // Line <unknown undefined> Column <unknown undefined>
});
var o32 = _emptylst;
return o31(o32); // Line 328 Column 2
}))(); // Line 328 Column 2
});
var vals = (function(dct){
return map((function(k){
return dict_dash_ref(dct,k); // Line 335 Column 20
}),keys(dct)); // Line 335 Column 3
});
var zip = (function(keys,vals){
var res = dict();
((function() {var loop = (function(ks,vs){
return (function() {if(not(null_p_(ks))) {dict_dash_put_excl_(res,car(ks),car(vs)); // Line 340 Column 2
return loop(cdr(ks),cdr(vs)); // Line 340 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o33 = keys;
var o34 = vals;
return loop(o33,o34); // Line 340 Column 2
}))(); // Line 340 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var not = (function(obj){
return (typeof obj !== 'number' && !obj); // Line <unknown undefined> Column <unknown undefined>
});
var _eq__eq_ = (function(obj1,obj2){
return obj1 === obj2});
var _eq_ = (function(obj1,obj2){
return (function() {if((list_p_(obj1) && list_p_(obj2))) {return ((function() {var loop = (function(lst1,lst2){
var n1 = null_p_(lst1);
var n2 = null_p_(lst2);
return (function() {if((n1 && n2)) {return true; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if((n1 || n2)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(equal_p_(car(lst1),car(lst2))) {return loop(cdr(lst1),cdr(lst2)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o35 = obj1;
var o36 = obj2;
return loop(o35,o36); // Line 360 Column 2
}))(); // Line 360 Column 2
} else {return (function() {if((vector_p_(obj1) && vector_p_(obj2))) {return (function() {if(not(_eq_(obj1["length"],obj2["length"]))) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return ((function() {var loop = (function(i){
return (function() {if((i < obj1["length"])) {return (function() {if(_eq_(vector_dash_ref(obj1,i),vector_dash_ref(obj2,i))) {return loop((i + 1)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return true; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o37 = 0;
return loop(o37); // Line 360 Column 2
}))(); // Line 360 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if((dict_p_(obj1) && dict_p_(obj2))) {return ((function() {var o38 = (function(keys1,keys2){
return (eq_p_(length(keys1),length(keys2)) && ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return true; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(equal_p_(dict_dash_ref(obj1,car(lst)),dict_dash_ref(obj2,car(lst)))) {return loop(cdr(lst)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o41 = keys1;
return loop(o41); // Line 360 Column 2
}))()); // Line <unknown undefined> Column <unknown undefined>
});
var o39 = keys(obj1);
var o40 = keys(obj2);
return o38(o39,o40); // Line 360 Column 2
}))(); // Line 360 Column 2
} else {return eq_p_(obj1,obj2); // Line 360 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var eq_p_ = _eq__eq_;
var equal_p_ = _eq_;
var print = (function(msg){
return util["print"](msg); // Line 408 Column 3
});
var println = (function(msg){
return util["puts"](msg); // Line 411 Column 3
});
var pp = (function(obj){
return println(inspect(obj)); // Line 414 Column 3
});
var _per_inspect_dash_non_dash_sequence = (function(obj){
return (function() {if(number_p_(obj)) {return ("" + obj); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(string_p_(obj)) {obj = obj["replace"](RegExp("\\\\","g"),"\\\\");
obj = obj["replace"](RegExp("\n","g"),"\\n");
obj = obj["replace"](RegExp("\r","g"),"\\r");
obj = obj["replace"](RegExp("\t","g"),"\\t");
obj = obj["replace"](RegExp("\"","g"),"\\\"");
return ("\"" + obj + "\""); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(key_p_(obj)) {return (":" + symbol_dash__gt_string(obj)); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(symbol_p_(obj)) {return symbol_dash__gt_string(obj); // Line 418 Column 2
} else {return (function() {if(boolean_p_(obj)) {return (function() {if(obj) {return "#t"; // Line <unknown undefined> Column <unknown undefined>
} else {return "#f"; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(obj)) {return "()"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(function_p_(obj)) {return "<function>"; // Line <unknown undefined> Column <unknown undefined>
} else {return ("<unknown " + obj + ">"); // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _per_recur_dash_protect = (function(obj,arg,func,halt){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 4));
return ((function() {var o42 = (function(parents){
return (function() {if(list_dash_find(parents,obj)) {return halt; // Line <unknown undefined> Column <unknown undefined>
} else {return func(obj,arg,(function(el,arg){
return _per_recur_dash_protect(el,arg,func,halt,cons(obj,parents)); // Line 435 Column 2
})); // Line 435 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o43 = (function() {if(null_p_(rest)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return car(rest); // Line 435 Column 2
}})()
;
return o42(o43); // Line 435 Column 2
}))(); // Line 435 Column 2
});
var _per_space = (function(obj){
return _per_recur_dash_protect(obj,false,(function(obj,arg,recur){
return (function() {if(list_p_(obj)) {return (length(obj) + 1 + fold((function(el,acc){
return (acc + recur(el,false)); // Line <unknown undefined> Column <unknown undefined>
}),0,obj)); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(obj)) {return recur(dict_dash__gt_list(obj),false); // Line 448 Column 5
} else {return (function() {if(vector_p_(obj)) {return recur(vector_dash__gt_list(obj),false); // Line 448 Column 5
} else {return vector_dash_length(_per_inspect_dash_non_dash_sequence(obj)); // Line 448 Column 5
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),vector_dash_length("<circular>")); // Line 444 Column 3
});
var inspect = (function(obj){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 1));
return ((function() {var o44 = (function(no_dash_newlines){
return _per_recur_dash_protect(obj,1,(function(obj,i,recur){
var buffer = "";
var get_dash_buffer = (function() {return buffer; // Line <unknown undefined> Column <unknown undefined>
});
var disp = (function(s){
buffer = (buffer + s);
});
var pad = (function(n){
return vector_dash_for_dash_each((function(_){
return disp(" "); // Line 468 Column 2
}),make_dash_vector(n)); // Line 468 Column 2
});
return (function() {if(list_p_(obj)) {return ((function() {var o46 = (function(sp,first){
disp("("); // Line 468 Column 2
for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(el,(i + 1))); // Line 468 Column 2
first = false;
}),obj); // Line 468 Column 2
disp(")"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o47 = (_per_space(obj) > 30);
var o48 = true;
return o46(o47,o48); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return (function() {if(vector_p_(obj)) {return ((function() {var o49 = (function(sp,first){
disp("["); // Line 468 Column 2
vector_dash_for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(el,(i + 1))); // Line 468 Column 2
first = false;
}),obj); // Line 468 Column 2
disp("]"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o50 = (_per_space(obj) > 30);
var o51 = true;
return o49(o50,o51); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return (function() {if(dict_p_(obj)) {return ((function() {var o52 = (function(sp,first){
disp("{"); // Line 468 Column 2
for_dash_each((function(k){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(k,i)); // Line 468 Column 2
disp(" "); // Line 468 Column 2
disp(recur(dict_dash_ref(obj,k),(i + 3 + vector_dash_length(symbol_dash__gt_string(k))))); // Line 468 Column 2
first = false;
}),keys(obj)); // Line 468 Column 2
disp("}"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o53 = (_per_space(obj) > 30);
var o54 = true;
return o52(o53,o54); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return _per_inspect_dash_non_dash_sequence(obj); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),"<circular>"); // Line 468 Column 2
});
var o45 = (function() {if(null_p_(rest)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return car(rest); // Line 468 Column 2
}})()
;
return o44(o45); // Line 468 Column 2
}))(); // Line 468 Column 2
});
var apply = (function(func,args){
return func.apply(null,list_dash__gt_vector(args)); // Line 542 Column 3
});
var trampoline_dash_result_p_ = (function(value){
return (vector_p_(value) && _eq_(vector_dash_ref(value,0),"__tco_call")); // Line <unknown undefined> Column <unknown undefined>
});
var trampoline = (function(value){
while(trampoline_dash_result_p_(value)) { value = value[1](); }return value; // Line <unknown undefined> Column <unknown undefined>
});
var _per_gensym_dash_base = 0;
var gensym_dash_fresh = (function() {_per_gensym_dash_base = 10000;
});
var gensym = (function() {_per_gensym_dash_base = (_per_gensym_dash_base + 1);
return string_dash__gt_symbol(("o" + _per_gensym_dash_base)); // Line 563 Column 3
});
var _per_breakpoints_dash_flag = true;
var breakpoint = (function(thunk_dash_msg){
_per_next_dash_thunk = thunk_dash_msg;
return debugger_dash_step(vector_dash_ref(thunk_dash_msg,1)); // Line 571 Column 3
});
var debugger_dash_step_p_ = false;
var start_dash_stepping = (function() {debugger_dash_step_p_ = true;
});
var stop_dash_stepping = (function() {debugger_dash_step_p_ = false;
});
var debugger_dash_stepping_p_ = (function() {return not(_eq__eq_(_per_next_dash_thunk,false)); // Line 581 Column 3
});
var enable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = true;
});
var disable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = false;
});
var debugger_dash_continue = (function() {return ((function() {var o55 = (function(thunk){
_per_next_dash_thunk = false;
return cps_dash_trampoline(thunk); // Line 590 Column 2
});
var o56 = vector_dash_ref(_per_next_dash_thunk,2)();
return o55(o56); // Line 590 Column 2
}))(); // Line 590 Column 2
});
var _per_next_dash_thunk = false;
var cps_dash_trampoline = (function(thunk_msg){
while(thunk_msg) {
     if(_per_breakpoints_dash_flag && (thunk_msg[0] || debugger_dash_step_p_)) {
       breakpoint(thunk_msg);
       break;
     }
     thunk_msg = thunk_msg[2](); }return false; // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_jump = (function(breakpoint,msg,to){
return vector(breakpoint,msg,to); // Line 617 Column 2
});
var cps_dash_halt = (function(v){
return list(list("\uFDD1lambda",_emptylst,v,false)); // Line 620 Column 4
});


var vec_dash_getter = (function(i){
return (function(vec){
return vector_dash_ref(vec,i); // Line 3 Column 5
}); // Line <unknown undefined> Column <unknown undefined>
});
var unique_dash_obj = list(false);
var make_dash_node = (function(type,data,lineno,colno){
return vector(unique_dash_obj,type,data,false,lineno,colno); // Line 8 Column 2
});
var make_dash_node_dash_w_slash_extra = (function(type,data,extra,lineno,colno){
return vector(unique_dash_obj,type,data,extra,lineno,colno); // Line 11 Column 2
});
var copy_dash_node = (function(node,data){
return make_dash_node_dash_w_slash_extra(node_dash_type(node),data,node_dash_extra(node),node_dash_lineno(node),node_dash_colno(node)); // Line 14 Column 3
});
var node_dash_type = vec_dash_getter(1);
var node_dash_data = vec_dash_getter(2);
var node_dash_extra = vec_dash_getter(3);
var node_dash_lineno = vec_dash_getter(4);
var node_dash_colno = vec_dash_getter(5);
var assert_dash_node = (function(node){
return (function() {if(not((vector_p_(node) && _eq__eq_(vector_dash_ref(node,0),unique_dash_obj)))) {pp(node); // Line 30 Column 9
throw(Error(str("not a node"))); // Line 31 Column 9
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var assert_dash_type = (function(node,type){
return (function() {if(not(_eq__eq_(node_dash_type(node),type))) {throw(Error(str("expected node type ",type,": ",node))); // Line 35 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var is_dash_type_p_ = (function(node,type){
assert_dash_node(node); // Line 38 Column 3
return _eq__eq_(node_dash_type(node),type); // Line 39 Column 3
});
var is_dash_atom_p_ = (function(node){
return (is_dash_type_p_(node,"\uFDD1ATOM") || (is_dash_type_p_(node,"\uFDD1LIST") && null_p_(node_dash_data(node)))); // Line <unknown undefined> Column <unknown undefined>
});
var is_dash_list_p_ = (function(node){
return (is_dash_type_p_(node,"\uFDD1LIST") && not(null_p_(node_dash_data(node)))); // Line <unknown undefined> Column <unknown undefined>
});
var is_dash_vector_p_ = (function(node){
return is_dash_type_p_(node,"\uFDD1VECTOR"); // Line 47 Column 27
});
var is_dash_dict_p_ = (function(node){
return is_dash_type_p_(node,"\uFDD1DICT"); // Line 48 Column 25
});
var is_dash_empty_dash_list_p_ = (function(node){
return (is_dash_type_p_(node,"\uFDD1LIST") && null_p_(node_dash_data(node))); // Line <unknown undefined> Column <unknown undefined>
});
var make_dash_atom = (function(type,parent){
return make_dash_node("\uFDD1ATOM",type,node_dash_lineno(parent),node_dash_colno(parent)); // Line 55 Column 3
});
var make_dash_list = (function(){
var children = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return make_dash_list_star_(children); // Line 60 Column 3
});
var make_dash_list_star_ = (function(children){
return ((function() {var o1 = (function(first){
return make_dash_node("\uFDD1LIST",children,node_dash_lineno(first),node_dash_colno(first)); // Line 63 Column 2
});
var o2 = car(children);
return o1(o2); // Line 63 Column 2
}))(); // Line 63 Column 2
});
var make_dash_empty_dash_list = (function(parent){
return make_dash_node("\uFDD1LIST",_emptylst,node_dash_lineno(parent),node_dash_colno(parent)); // Line 69 Column 3
});
var prepend = (function(node,lst){
return make_dash_node("\uFDD1LIST",cons(node,node_dash_data(lst)),node_dash_lineno(node),node_dash_colno(node)); // Line 74 Column 3
});
var map_dash_children = (function(func,lst){
return make_dash_node("\uFDD1LIST",map(func,node_dash_data(lst)),node_dash_lineno(lst),node_dash_colno(lst)); // Line 80 Column 3
});
var first = (function(node){
return car(node_dash_data(node)); // Line 86 Column 3
});
var first_star_ = (function(node){
return node_dash_data(car(node_dash_data(node))); // Line 89 Column 3
});
module["exports"] = dict("\uFDD0make-node",make_dash_node,"\uFDD0make-node-w/extra",make_dash_node_dash_w_slash_extra,"\uFDD0copy-node",copy_dash_node,"\uFDD0node-type",node_dash_type,"\uFDD0node-data",node_dash_data,"\uFDD0node-extra",node_dash_extra,"\uFDD0node-lineno",node_dash_lineno,"\uFDD0node-colno",node_dash_colno,"\uFDD0type?",is_dash_type_p_,"\uFDD0atom?",is_dash_atom_p_,"\uFDD0list?",is_dash_list_p_,"\uFDD0vector?",is_dash_vector_p_,"\uFDD0dict?",is_dash_dict_p_,"\uFDD0empty-list?",is_dash_empty_dash_list_p_,"\uFDD0make-list",make_dash_list,"\uFDD0make-list*",make_dash_list_star_,"\uFDD0make-empty-list",make_dash_empty_dash_list,"\uFDD0make-atom",make_dash_atom,"\uFDD0prepend",prepend,"\uFDD0map-children",map_dash_children,"\uFDD0first",first,"\uFDD0first*",first_star_);


},{"util":5}],7:[function(_dereq_,module,exports){
(function (__dirname){
var util = _dereq_("util");var type = (function(obj){
return (function() {if(number_p_(obj)) {return "\uFDD1number"; 
} else {return (function() {if(boolean_p_(obj)) {return "\uFDD1boolean"; 
} else {return (function() {if(string_p_(obj)) {return "\uFDD1string"; 
} else {return (function() {if(null_p_(obj)) {return "\uFDD1null"; 
} else {return (function() {if(list_p_(obj)) {return "\uFDD1list"; 
} else {return (function() {if(vector_p_(obj)) {return "\uFDD1vector"; 
} else {return (function() {if(dict_p_(obj)) {return "\uFDD1dict"; 
} else {return false; 
}})()
; 
}})()
; 
}})()
; 
}})()
; 
}})()
; 
}})()
; 
}})()
; 
});
var number_p_ = (function(obj){
return _eq__eq_(typeof obj,"number"); 
});
var string_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && not(_eq__eq_(obj[0],"\uFDD0")) && not(_eq__eq_(obj[0],"\uFDD1"))); 
});
var symbol_p_ = (function(obj){
return ((_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD1"))); 
});
var key_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD0")); 
});
var boolean_p_ = (function(obj){
return (eq_p_(obj,true) || eq_p_(obj,false)); 
});
var null_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && eq_p_(obj["length"],1) && eq_p_(vector_dash_ref(obj,0),null)); 
});
var list_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && not(eq_p_(obj["list"],undefined))); 
});
var vector_p_ = (function(obj){
return (not(list_p_(obj)) && not(null_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && not(eq_p_(obj["length"],undefined))); 
});
var dict_p_ = (function(obj){
return (not(symbol_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && eq_p_(obj["length"],undefined)); 
});
var function_p_ = (function(obj){
return eq_p_(typeof obj,"function"); 
});
var literal_p_ = (function(x){
return (key_p_(x) || number_p_(x) || string_p_(x) || boolean_p_(x) || null_p_(x)); 
});
var str = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return fold((function(el,acc){
return (acc + (function() {if(string_p_(el)) {return el; 
} else {return inspect(el); 
}})()
); 
}),"",args); 
});
var symbol_dash__gt_key = (function(sym){
return ("\uFDD0" + sym["substring"](1)); 
});
var key_dash__gt_symbol = (function(sym){
return ("\uFDD1" + sym["substring"](1)); 
});
var string_dash__gt_key = (function(str){
return ("\uFDD0" + str); 
});
var key_dash__gt_string = (function(key){
return key["substring"](1); 
});
var string_dash__gt_symbol = (function(str){
return ("\uFDD1" + str); 
});
var symbol_dash__gt_string = (function(sym){
return sym["substring"](1); 
});
var _emptylst = [null];
var list = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return args; 
});
var cons = (function(obj,lst){
return ((function() {var o1 = (function(res){
res.list = true;return res; 
});
var o2 = [obj, lst];
return o1(o2); 
}))(); 
});
var car = (function(lst){
return lst[0]});
var cdr = (function(lst){
return lst[1]});
var cadr = (function(lst){
return car(cdr(lst)); 
});
var cddr = (function(lst){
return cdr(cdr(lst)); 
});
var cdar = (function(lst){
return cdr(car(lst)); 
});
var caddr = (function(lst){
return car(cdr(cdr(lst))); 
});
var cdddr = (function(lst){
return cdr(cdr(cdr(lst))); 
});
var cadar = (function(lst){
return car(cdr(car(lst))); 
});
var cddar = (function(lst){
return cdr(cdr(car(lst))); 
});
var caadr = (function(lst){
return car(car(cdr(lst))); 
});
var cdadr = (function(lst){
return cdr(car(cdr(lst))); 
});
var list_dash_ref = (function(lst,i){
return ((function() {var loop = (function(lst,i){
return (function() {if(null_p_(lst)) {return false; 
} else {return (function() {if(eq_p_(i,0)) {return car(lst); 
} else {return loop(cdr(lst),(i - 1)); 
}})()
; 
}})()
; 
});
var o3 = lst;
var o4 = i;
return loop(o3,o4); 
}))(); 
});
var length = (function(lst){
return fold((function(el,acc){
return (acc + 1); 
}),0,lst); 
});
var list_dash_append = (function(){
var lsts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
var l_star_ = (function() {if(null_p_(lsts)) {return _emptylst; 
} else {return lsts; 
}})()
;
return (function() {if(null_p_(l_star_)) {return _emptylst; 
} else {return (function() {if(null_p_(cdr(l_star_))) {return car(l_star_); 
} else {return _list_dash_append(car(l_star_),apply(list_dash_append,cdr(l_star_))); 
}})()
; 
}})()
; 
});
var _list_dash_append = (function(lst1,lst2){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return lst2; 
} else {return cons(car(lst),loop(cdr(lst))); 
}})()
; 
});
var o5 = lst1;
return loop(o5); 
}))(); 
});
var list_dash_find = (function(lst,val){
var rst = vector_dash__gt_list(Array.prototype.slice.call(arguments, 2));
return ((function() {var o6 = (function(access){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return false; 
} else {return (function() {if(_eq__eq_(access(car(lst)),val)) {return lst; 
} else {return loop(cdr(lst)); 
}})()
; 
}})()
; 
});
var o8 = lst;
return loop(o8); 
}))(); 
});
var o7 = (function() {if(null_p_(rst)) {return (function(x){
return x; 
}); 
} else {return car(rst); 
}})()
;
return o6(o7); 
}))(); 
});
var map = (function(func,lst){
return (function() {if(null_p_(lst)) {return _emptylst; 
} else {return cons(func(car(lst)),map(func,cdr(lst))); 
}})()
; 
});
var for_dash_each = (function(func,lst){
return ((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {func(car(lst)); 
return loop(cdr(lst)); 
}})()
; 
});
var o9 = lst;
return loop(o9); 
}))(); 
});
var fold = (function(func,acc,lst){
return (function() {if(null_p_(lst)) {return acc; 
} else {return fold(func,func(car(lst),acc),cdr(lst)); 
}})()
; 
});
var reverse = (function(lst){
return (function() {if(null_p_(lst)) {return _emptylst; 
} else {return list_dash_append(reverse(cdr(lst)),list(car(lst))); 
}})()
; 
});
var vector_dash__gt_list = (function(vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return cons(vector_dash_ref(vec,i),loop((i + 1))); 
} else {return _emptylst}})()
; 
});
var o10 = 0;
return loop(o10); 
}))(); 
});
var make_dash_vector = (function(count){
var val = arguments[1] || false;
return ((function() {var o11 = (function(v){
return (function() {if(val) {return ((function() {var loop = (function(i){
return (function() {if((i < count)) {vector_dash_put_excl_(v,i,val); 
return loop((i + 1)); 
} else {return v; 
}})()
; 
});
var o13 = 0;
return loop(o13); 
}))(); 
} else {return v; 
}})()
; 
});
var o12 = new Array(count);
return o11(o12); 
}))(); 
});
var vector = (function() {return Array.prototype.slice.call(arguments)});
var vector_dash_ref = (function(vec,i){
return vec[i]});
var vector_dash_put_excl_ = (function(vec,i,obj){
return vec[i] = obj});
var vector_dash_concat = (function(){
var vecs = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var loop = (function(lst,res){
return (function() {if(null_p_(lst)) {return res; 
} else {return loop(cdr(lst),res["concat"](car(lst))); 
}})()
; 
});
var o14 = cdr(vecs);
var o15 = car(vecs);
return loop(o14,o15); 
}))(); 
});
var vector_dash_slice = (function(vec,start){
var end = arguments[2] || false;
return vec.slice(start, end || undefined)});
var vector_dash_push_excl_ = (function(vec,obj){
return vec.push(obj)});
var vector_dash_find = (function(vec,val){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return (function() {if(eq_p_(vector_dash_ref(vec,i),val)) {return i; 
} else {return loop((i + 1)); 
}})()
; 
} else {return false; 
}})()
; 
});
var o16 = 0;
return loop(o16); 
}))(); 
});
var vector_dash_length = (function(vec){
return vec["length"]; 
});
var list_dash__gt_vector = (function(lst){
var res = [];
for_dash_each((function(el){
return res["push"](el); 
}),lst); 
return res; 
});
var vector_dash_map = (function(func,vec){
var res = [];
((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {res["push"](func(vector_dash_ref(vec,i))); 
return loop((i + 1)); 
}})()
; 
});
var o17 = 0;
return loop(o17); 
}))(); 
return res; 
});
var vector_dash_for_dash_each = (function(func,vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {func(vector_dash_ref(vec,i)); 
return loop((i + 1)); 
}})()
; 
});
var o18 = 0;
return loop(o18); 
}))(); 
});
var vector_dash_fold = (function(func,acc,vec){
return ((function() {var loop = (function(i,acc){
return (function() {if((i < vector_dash_length(vec))) {return loop((i + 1),func(vector_dash_ref(vec,i),acc)); 
} else {return acc; 
}})()
; 
});
var o19 = 0;
var o20 = acc;
return loop(o19,o20); 
}))(); 
});
var dict = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
var res = {};
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o22 = (function(key,val){
dict_dash_put_excl_(res,key,val); 
return loop(cddr(lst)); 
});
var o23 = car(lst);
var o24 = cadr(lst);
return o22(o23,o24); 
}))(); 
}})()
; 
});
var o21 = args;
return loop(o21); 
}))(); 
return res; 
});
var dict_dash_put_excl_ = (function(dct,k,v){
return dct[k.substring(1)] = v});
var dict_dash_ref = (function(dct,k){
return dct[k.substring(1)]});
var dict_dash_map = (function(func,dct){
var res = dict();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o26 = (function(k){
dict_dash_put_excl_(res,k,func(dict_dash_ref(dct,k))); 
return loop(cdr(lst)); 
});
var o27 = car(lst);
return o26(o27); 
}))(); 
}})()
; 
});
var o25 = keys(dct);
return loop(o25); 
}))(); 
return res; 
});
var dict_dash_merge = (function(){
var dcts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var o28 = (function(res){
for_dash_each((function(dct){
return for_dash_each((function(k){
return dict_dash_put_excl_(res,k,dict_dash_ref(dct,k)); 
}),keys(dct)); 
}),dcts); 
return res; 
});
var o29 = dict();
return o28(o29); 
}))(); 
});
var dict_dash__gt_vector = (function(dct){
var res = vector();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {vector_dash_push_excl_(res,car(lst)); 
vector_dash_push_excl_(res,dict_dash_ref(dct,car(lst))); 
return loop(cdr(lst)); 
}})()
; 
});
var o30 = keys(dct);
return loop(o30); 
}))(); 
return res; 
});
var dict_dash__gt_list = (function(dct){
return vector_dash__gt_list(dict_dash__gt_vector(dct)); 
});
var keys = (function(dct){
return ((function() {var o31 = (function(res){
for(var k in dct) {
       res = cons(string_dash__gt_key(k), res);
    }return res; 
});
var o32 = _emptylst;
return o31(o32); 
}))(); 
});
var vals = (function(dct){
return map((function(k){
return dict_dash_ref(dct,k); 
}),keys(dct)); 
});
var zip = (function(keys,vals){
var res = dict();
((function() {var loop = (function(ks,vs){
return (function() {if(not(null_p_(ks))) {dict_dash_put_excl_(res,car(ks),car(vs)); 
return loop(cdr(ks),cdr(vs)); 
}})()
; 
});
var o33 = keys;
var o34 = vals;
return loop(o33,o34); 
}))(); 
return res; 
});
var not = (function(obj){
return (typeof obj !== 'number' && !obj); 
});
var _eq__eq_ = (function(obj1,obj2){
return obj1 === obj2});
var _eq_ = (function(obj1,obj2){
return (function() {if((list_p_(obj1) && list_p_(obj2))) {return ((function() {var loop = (function(lst1,lst2){
var n1 = null_p_(lst1);
var n2 = null_p_(lst2);
return (function() {if((n1 && n2)) {return true; 
} else {return (function() {if((n1 || n2)) {return false; 
} else {return (function() {if(equal_p_(car(lst1),car(lst2))) {return loop(cdr(lst1),cdr(lst2)); 
} else {return false; 
}})()
; 
}})()
; 
}})()
; 
});
var o35 = obj1;
var o36 = obj2;
return loop(o35,o36); 
}))(); 
} else {return (function() {if((vector_p_(obj1) && vector_p_(obj2))) {return (function() {if(not(_eq_(obj1["length"],obj2["length"]))) {return false; 
} else {return ((function() {var loop = (function(i){
return (function() {if((i < obj1["length"])) {return (function() {if(_eq_(vector_dash_ref(obj1,i),vector_dash_ref(obj2,i))) {return loop((i + 1)); 
} else {return false; 
}})()
; 
} else {return true; 
}})()
; 
});
var o37 = 0;
return loop(o37); 
}))(); 
}})()
; 
} else {return (function() {if((dict_p_(obj1) && dict_p_(obj2))) {return ((function() {var o38 = (function(keys1,keys2){
return (eq_p_(length(keys1),length(keys2)) && ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return true; 
} else {return (function() {if(equal_p_(dict_dash_ref(obj1,car(lst)),dict_dash_ref(obj2,car(lst)))) {return loop(cdr(lst)); 
} else {return false; 
}})()
; 
}})()
; 
});
var o41 = keys1;
return loop(o41); 
}))()); 
});
var o39 = keys(obj1);
var o40 = keys(obj2);
return o38(o39,o40); 
}))(); 
} else {return eq_p_(obj1,obj2); 
}})()
; 
}})()
; 
}})()
; 
});
var eq_p_ = _eq__eq_;
var equal_p_ = _eq_;
var print = (function(msg){
return util["print"](msg); 
});
var println = (function(msg){
return util["puts"](msg); 
});
var pp = (function(obj){
return println(inspect(obj)); 
});
var _per_inspect_dash_non_dash_sequence = (function(obj){
return (function() {if(number_p_(obj)) {return ("" + obj); 
} else {return (function() {if(string_p_(obj)) {obj = obj["replace"](RegExp("\\\\","g"),"\\\\");
obj = obj["replace"](RegExp("\n","g"),"\\n");
obj = obj["replace"](RegExp("\r","g"),"\\r");
obj = obj["replace"](RegExp("\t","g"),"\\t");
obj = obj["replace"](RegExp("\"","g"),"\\\"");
return ("\"" + obj + "\""); 
} else {return (function() {if(key_p_(obj)) {return (":" + symbol_dash__gt_string(obj)); 
} else {return (function() {if(symbol_p_(obj)) {return symbol_dash__gt_string(obj); 
} else {return (function() {if(boolean_p_(obj)) {return (function() {if(obj) {return "#t"; 
} else {return "#f"; 
}})()
; 
} else {return (function() {if(null_p_(obj)) {return "()"; 
} else {return (function() {if(function_p_(obj)) {return "<function>"; 
} else {return ("<unknown " + obj + ">"); 
}})()
; 
}})()
; 
}})()
; 
}})()
; 
}})()
; 
}})()
; 
}})()
; 
});
var _per_recur_dash_protect = (function(obj,arg,func,halt){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 4));
return ((function() {var o42 = (function(parents){
return (function() {if(list_dash_find(parents,obj)) {return halt; 
} else {return func(obj,arg,(function(el,arg){
return _per_recur_dash_protect(el,arg,func,halt,cons(obj,parents)); 
})); 
}})()
; 
});
var o43 = (function() {if(null_p_(rest)) {return _emptylst; 
} else {return car(rest); 
}})()
;
return o42(o43); 
}))(); 
});
var _per_space = (function(obj){
return _per_recur_dash_protect(obj,false,(function(obj,arg,recur){
return (function() {if(list_p_(obj)) {return (length(obj) + 1 + fold((function(el,acc){
return (acc + recur(el,false)); 
}),0,obj)); 
} else {return (function() {if(dict_p_(obj)) {return recur(dict_dash__gt_list(obj),false); 
} else {return (function() {if(vector_p_(obj)) {return recur(vector_dash__gt_list(obj),false); 
} else {return vector_dash_length(_per_inspect_dash_non_dash_sequence(obj)); 
}})()
; 
}})()
; 
}})()
; 
}),vector_dash_length("<circular>")); 
});
var inspect = (function(obj){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 1));
return ((function() {var o44 = (function(no_dash_newlines){
return _per_recur_dash_protect(obj,1,(function(obj,i,recur){
var buffer = "";
var get_dash_buffer = (function() {return buffer; 
});
var disp = (function(s){
buffer = (buffer + s);
});
var pad = (function(n){
return vector_dash_for_dash_each((function(_){
return disp(" "); 
}),make_dash_vector(n)); 
});
return (function() {if(list_p_(obj)) {return ((function() {var o46 = (function(sp,first){
disp("("); 
for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); 
return pad(i); 
} else {return disp(" "); 
}})()
; 
}})()
; 
disp(recur(el,(i + 1))); 
first = false;
}),obj); 
disp(")"); 
return get_dash_buffer(); 
});
var o47 = (_per_space(obj) > 30);
var o48 = true;
return o46(o47,o48); 
}))(); 
} else {return (function() {if(vector_p_(obj)) {return ((function() {var o49 = (function(sp,first){
disp("["); 
vector_dash_for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); 
return pad(i); 
} else {return disp(" "); 
}})()
; 
}})()
; 
disp(recur(el,(i + 1))); 
first = false;
}),obj); 
disp("]"); 
return get_dash_buffer(); 
});
var o50 = (_per_space(obj) > 30);
var o51 = true;
return o49(o50,o51); 
}))(); 
} else {return (function() {if(dict_p_(obj)) {return ((function() {var o52 = (function(sp,first){
disp("{"); 
for_dash_each((function(k){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); 
return pad(i); 
} else {return disp(" "); 
}})()
; 
}})()
; 
disp(recur(k,i)); 
disp(" "); 
disp(recur(dict_dash_ref(obj,k),(i + 3 + vector_dash_length(symbol_dash__gt_string(k))))); 
first = false;
}),keys(obj)); 
disp("}"); 
return get_dash_buffer(); 
});
var o53 = (_per_space(obj) > 30);
var o54 = true;
return o52(o53,o54); 
}))(); 
} else {return _per_inspect_dash_non_dash_sequence(obj); 
}})()
; 
}})()
; 
}})()
; 
}),"<circular>"); 
});
var o45 = (function() {if(null_p_(rest)) {return false; 
} else {return car(rest); 
}})()
;
return o44(o45); 
}))(); 
});
var apply = (function(func,args){
return func.apply(null,list_dash__gt_vector(args)); 
});
var trampoline_dash_result_p_ = (function(value){
return (vector_p_(value) && _eq_(vector_dash_ref(value,0),"__tco_call")); 
});
var trampoline = (function(value){
while(trampoline_dash_result_p_(value)) { value = value[1](); }return value; 
});
var _per_gensym_dash_base = 0;
var gensym_dash_fresh = (function() {_per_gensym_dash_base = 10000;
});
var gensym = (function() {_per_gensym_dash_base = (_per_gensym_dash_base + 1);
return string_dash__gt_symbol(("o" + _per_gensym_dash_base)); 
});
var _per_breakpoints_dash_flag = true;
var breakpoint = (function(thunk_dash_msg){
_per_next_dash_thunk = thunk_dash_msg;
return debugger_dash_step(vector_dash_ref(thunk_dash_msg,1)); 
});
var debugger_dash_step_p_ = false;
var start_dash_stepping = (function() {debugger_dash_step_p_ = true;
});
var stop_dash_stepping = (function() {debugger_dash_step_p_ = false;
});
var debugger_dash_stepping_p_ = (function() {return not(_eq__eq_(_per_next_dash_thunk,false)); 
});
var enable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = true;
});
var disable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = false;
});
var debugger_dash_continue = (function() {return ((function() {var o55 = (function(thunk){
_per_next_dash_thunk = false;
return cps_dash_trampoline(thunk); 
});
var o56 = vector_dash_ref(_per_next_dash_thunk,2)();
return o55(o56); 
}))(); 
});
var _per_next_dash_thunk = false;
var cps_dash_trampoline = (function(thunk_msg){
while(thunk_msg) {
     if(_per_breakpoints_dash_flag && (thunk_msg[0] || debugger_dash_step_p_)) {
       breakpoint(thunk_msg);
       break;
     }
     thunk_msg = thunk_msg[2](); }return false; 
});
var cps_dash_jump = (function(breakpoint,msg,to){
return vector(breakpoint,msg,to); 
});
var cps_dash_halt = (function(v){
return list(list("\uFDD1lambda",_emptylst,v,false)); 
});


var fs = _dereq_("fs");var ast = _dereq_("../ast");var should_dash_return_p_ = (function(form){
return not((ast["list?"](form) && (_eq__eq_(ast["first*"](form),"\uFDD1throw") || _eq__eq_(ast["first*"](form),"\uFDD1set!") || _eq__eq_(ast["first*"](form),"\uFDD1define") || _eq__eq_(ast["first*"](form),"\uFDD1begin")))); 
});
var generator = (function(){
var optimizations = arguments[0] || false;
var code = vector();
(function() {if(not(optimizations)) {optimizations = 0;
}})()
; 
var make_dash_fresh = (function() {return generator(); 
});
var write = (function(src){
var eol = vector_dash__gt_list(Array.prototype.slice.call(arguments, 1));
return code["push"]((src + (function() {if(null_p_(eol)) {return ""; 
} else {return "\n"; 
}})()
)); 
});
var write_dash_runtime = (function(target){
var root = vector_dash__gt_list(Array.prototype.slice.call(arguments, 1));
return ((function() {var o1 = (function(root){
return (function() {if(not(equal_p_(target,"no-runtime"))) {(function() {if(not(equal_p_(target,"js-onlyeval"))) {return write(fs["readFileSync"](str(root,"/runtime.js"),"utf-8"),true); 
}})()
; 
return (function() {if(not(equal_p_(target,"js-noeval"))) {write(str("var __compiler = require('",root,"/compiler');"),true); 
write(str("var __generator = require('",root,"/backends/js');"),true); 
return write("var read = __compiler.read;",true); 
}})()
; 
}})()
; 
});
var o2 = (function() {if(null_p_(root)) {return str(__dirname,"/.."); 
} else {return car(root); 
}})()
;
return o1(o2); 
}))(); 
});
var inline_dash_writer = (function(str){
return ((function() {var o3 = (function(first){
return (function() {return (function() {if(first) {first = false;
} else {return write(str); 
}})()
; 
}); 
});
var o4 = true;
return o3(o4); 
}))(); 
});
var terminate_dash_expr = (function(expr_p_){
var node = vector_dash__gt_list(Array.prototype.slice.call(arguments, 1));
return ((function() {var o5 = (function(node){
return (function() {if(not(expr_p_)) {return write(str("; ","// Line ",ast["node-lineno"](node)," Column ",ast["node-colno"](node)),true); 
}})()
; 
});
var o6 = (function() {if(null_p_(node)) {return false; 
} else {return car(node); 
}})()
;
return o5(o6); 
}))(); 
});
var write_dash_number = (function(obj,expr_p_){
write(obj); 
return terminate_dash_expr(expr_p_); 
});
var write_dash_boolean = (function(obj,expr_p_){
(function() {if(obj) {return write("true"); 
} else {return write("false"); 
}})()
; 
return terminate_dash_expr(expr_p_); 
});
var write_dash_empty_dash_list = (function(obj,expr_p_){
write("_emptylst"); 
return terminate_dash_expr(expr_p_); 
});
var write_dash_string = (function(obj,expr_p_){
return ((function() {var o7 = (function(str){
str = str["replace"](RegExp("\\\\","g"),"\\\\");
str = str["replace"](RegExp("\n","g"),"\\n");
str = str["replace"](RegExp("\r","g"),"\\r");
str = str["replace"](RegExp("\t","g"),"\\t");
str = str["replace"](RegExp("\"","g"),"\\\"");
write(("\"" + str + "\"")); 
return terminate_dash_expr(expr_p_); 
});
var o8 = obj;
return o7(o8); 
}))(); 
});
var write_dash_symbol = (function(obj,expr_p_){
write(("\"\\uFDD1" + obj["substring"](1) + "\"")); 
return terminate_dash_expr(expr_p_); 
});
var write_dash_key = (function(obj,expr_p_){
write(("\"\\uFDD0" + obj["substring"](1) + "\"")); 
return terminate_dash_expr(expr_p_); 
});
var write_dash_term = (function(node,expr_p_){
return ((function() {var o9 = (function(exp,exp){
var name = exp["substring"](1);
var parts = name["split"](".");
((function() {var o12 = (function(name){
name = name["replace"](RegExp("-","g"),"_dash_");
name = name["replace"](RegExp("\\?","g"),"_p_");
name = name["replace"](RegExp("\\!","g"),"_excl_");
name = name["replace"](RegExp(">","g"),"_gt_");
name = name["replace"](RegExp("<","g"),"_lt_");
name = name["replace"](RegExp("%","g"),"_per_");
name = name["replace"](RegExp("=","g"),"_eq_");
name = name["replace"](RegExp("\\/","g"),"_slash_");
name = name["replace"](RegExp("\\*","g"),"_star_");
name = name["replace"](RegExp("\\+","g"),"_plus_");
return write(name); 
});
var o13 = vector_dash_ref(parts,0);
return o12(o13); 
}))(); 
vector_dash_for_dash_each((function(part){
return write(str("[\"",part,"\"]")); 
}),vector_dash_slice(parts,1)); 
return terminate_dash_expr(expr_p_); 
});
var o10 = ast["node-data"](node);
var o11 = (function() {if(_eq__eq_(o10,"\uFDD1var")) {return "\uFDD1_var_"; 
} else {return (function() {if(_eq__eq_(o10,"\uFDD1in")) {return "\uFDD1_in_"; 
} else {return o10; 
}})()
; 
}})()
;
return o9(o10,o11); 
}))(); 
});
var write_dash_define = (function(lval,rval,compile){
write("var "); 
return write_dash_set_excl_(lval,rval,compile); 
});
var write_dash_set_excl_ = (function(lval,rval,compile){
write_dash_term(lval,true); 
write(" = "); 
compile(rval,true); 
return write(";",true); 
});
var write_dash_if = (function(cnd,tru,alt,expr_p_,compile){
write("(function() {"); 
write("if("); 
compile(cnd,true); 
write(") {"); 
(function() {if(should_dash_return_p_(tru)) {return write("return "); 
}})()
; 
compile(tru); 
write("}"); 
(function() {if(alt) {write(" else {"); 
(function() {if(should_dash_return_p_(alt)) {return write("return "); 
}})()
; 
compile(alt); 
return write("}"); 
}})()
; 
write("})()",true); 
return terminate_dash_expr(expr_p_); 
});
var write_dash_lambda = (function(node,expr_p_,compile){
var name = car(ast["node-data"](node));
var args = cadr(ast["node-data"](node));
var body = cddr(ast["node-data"](node));
(function() {if(ast["list?"](args)) {var comma = inline_dash_writer(",");
var capture_dash_name = false;
var opt_dash_args = false;
var arg_dash_min = length(ast["node-data"](args));
var arg_dash_max = arg_dash_min;
var write_dash_args = (function(args,i){
return (function() {if(not(null_p_(args))) {return ((function() {var o14 = (function(arg){
return (function() {if(_eq__eq_(arg,"\uFDD1.")) {capture_dash_name = cadr(args);
arg_dash_min = i;
arg_dash_max = false;
} else {return (function() {if(_eq__eq_(arg,"\uFDD1&")) {opt_dash_args = cdr(args);
arg_dash_min = i;
arg_dash_max = (arg_dash_max - 1);
} else {comma(); 
write_dash_term(car(args),true); 
return write_dash_args(cdr(args),(i + 1)); 
}})()
; 
}})()
; 
});
var o15 = ast["node-data"](car(args));
return o14(o15); 
}))(); 
}})()
; 
});
write("(function("); 
write_dash_args(ast["node-data"](args),0); 
write("){",true); 
(function() {if((optimizations < 1)) {write(str("if(arguments.length < ",arg_dash_min,") {"),true); 
write(str("throw Error(\"",(ast["node-extra"](name) || "lambda"),": not enough arguments\")"),true); 
write("}",true); 
return (function() {if(arg_dash_max) {write(str("else if(arguments.length > ",arg_dash_max,") {"),true); 
write(str("throw Error(\"",(ast["node-extra"](name) || "lambda"),": too many arguments\");"),true); 
return write("}",true); 
}})()
; 
}})()
; 
return (function() {if(capture_dash_name) {write("var "); 
write_dash_term(capture_dash_name,true); 
write(" = "); 
write_dash_term(ast["make-atom"]("\uFDD1vector->list",capture_dash_name),true); 
return write(str("(Array.prototype.slice.call(arguments, ",arg_dash_min,"));"),true); 
} else {return (function() {if(opt_dash_args) {return fold((function(arg,i){
write("var "); 
write_dash_term(arg,true); 
write(str(" = arguments[",i,"] || false;"),true); 
return (i + 1); 
}),arg_dash_min,opt_dash_args); 
} else {return false; 
}})()
; 
}})()
; 
} else {return (function() {if(symbol_p_(ast["node-data"](args))) {write("(function() {",true); 
write("var "); 
write_dash_term(args,true); 
write(" = "); 
write_dash_term(ast["make-atom"]("\uFDD1vector->list",args),true); 
return write("(Array.prototype.slice.call(arguments));",true); 
} else {return (function() {if(null_p_(ast["node-data"](args))) {return write("(function() {"); 
} else {return false; 
}})()
; 
}})()
; 
}})()
; 
write_dash_statements(body,compile); 
write("})"); 
return terminate_dash_expr(expr_p_); 
});
var write_dash_statements = (function(expr_star_,compile){
return ((function() {var o16 = (function(i,len){
return for_dash_each((function(form){
(function() {if((_eq__eq_(i,(len - 1)) && should_dash_return_p_(form))) {return write("return "); 
}})()
; 
compile(form); 
i = (i + 1);
}),expr_star_); 
});
var o17 = 0;
var o18 = length(expr_star_);
return o16(o17,o18); 
}))(); 
});
var write_dash_func_dash_call = (function(func,args,expr_p_,compile){
(function() {if((ast["list?"](func) && _eq__eq_(ast["first*"](func),"\uFDD1lambda"))) {write("("); 
compile(func,true); 
return write(")"); 
} else {return compile(func,true); 
}})()
; 
write("("); 
((function() {var o19 = (function(comma){
return for_dash_each((function(arg){
comma(); 
return compile(arg,true); 
}),args); 
});
var o20 = inline_dash_writer(",");
return o19(o20); 
}))(); 
write(")"); 
return terminate_dash_expr(expr_p_,func); 
});
var write_dash_raw_dash_code = (function(node){
return write(ast["node-data"](node)); 
});
var write_dash_op = (function(op,vals,expr_p_,compile){
write("("); 
((function() {var o21 = (function(op_dash_writer){
return for_dash_each((function(arg){
op_dash_writer(); 
return compile(arg,true); 
}),vals); 
});
var o22 = inline_dash_writer(str(" ",op," "));
return o21(o22); 
}))(); 
write(")"); 
return terminate_dash_expr(expr_p_); 
});
var make_dash_op_dash_writer = (function(str){
return (function(vals,expr_p_,compile){
return write_dash_op(str,vals,expr_p_,compile); 
}); 
});
var write_dash_require = (function(args,expr_p_,compile){
return for_dash_each((function(el){
write("var "); 
write_dash_term(ast["first"](el),true); 
write(" = require("); 
write_dash_string(ast["node-data"](cadr(ast["node-data"](el))),true); 
return write(");"); 
}),args); 
});
return dict("\uFDD0write-runtime",write_dash_runtime,"\uFDD0write-number",write_dash_number,"\uFDD0write-string",write_dash_string,"\uFDD0write-boolean",write_dash_boolean,"\uFDD0write-term",write_dash_term,"\uFDD0write-symbol",write_dash_symbol,"\uFDD0write-key",write_dash_key,"\uFDD0write-empty-list",write_dash_empty_dash_list,"\uFDD0write-define",write_dash_define,"\uFDD0write-set!",write_dash_set_excl_,"\uFDD0write-if",write_dash_if,"\uFDD0write-lambda",write_dash_lambda,"\uFDD0write-statements",write_dash_statements,"\uFDD0write-func-call",write_dash_func_dash_call,"\uFDD0write-raw-code",write_dash_raw_dash_code,"\uFDD0write-require",write_dash_require,"\uFDD0write-and",make_dash_op_dash_writer("&&"),"\uFDD0write-or",make_dash_op_dash_writer("||"),"\uFDD0write-add",make_dash_op_dash_writer("+"),"\uFDD0write-subtract",make_dash_op_dash_writer("-"),"\uFDD0write-multiply",make_dash_op_dash_writer("*"),"\uFDD0write-divide",make_dash_op_dash_writer("/"),"\uFDD0write-gt",make_dash_op_dash_writer(">"),"\uFDD0write-lt",make_dash_op_dash_writer("<"),"\uFDD0write-gteq",make_dash_op_dash_writer(">="),"\uFDD0write-lteq",make_dash_op_dash_writer("<="),"\uFDD0write-mod",make_dash_op_dash_writer("%"),"\uFDD0write-rshift",make_dash_op_dash_writer(">>"),"\uFDD0write-lshift",make_dash_op_dash_writer("<<"),"\uFDD0write-bitwise-or",make_dash_op_dash_writer("|"),"\uFDD0write-bitwise-and",make_dash_op_dash_writer("&"),"\uFDD0make-fresh",make_dash_fresh,"\uFDD0get-code",(function() {return code["join"](""); 
})); 
});
module["exports"] = generator;


}).call(this,"/backends")
},{"../ast":6,"fs":1,"util":5}],8:[function(_dereq_,module,exports){
var util = _dereq_("util");var type = (function(obj){
return (function() {if(number_p_(obj)) {return "\uFDD1number"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(boolean_p_(obj)) {return "\uFDD1boolean"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(string_p_(obj)) {return "\uFDD1string"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(obj)) {return "\uFDD1null"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_p_(obj)) {return "\uFDD1list"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(vector_p_(obj)) {return "\uFDD1vector"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(obj)) {return "\uFDD1dict"; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var number_p_ = (function(obj){
return _eq__eq_(typeof obj,"number"); // Line 16 Column 3
});
var string_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && not(_eq__eq_(obj[0],"\uFDD0")) && not(_eq__eq_(obj[0],"\uFDD1"))); // Line <unknown undefined> Column <unknown undefined>
});
var symbol_p_ = (function(obj){
return ((_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD1"))); // Line <unknown undefined> Column <unknown undefined>
});
var key_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD0")); // Line <unknown undefined> Column <unknown undefined>
});
var boolean_p_ = (function(obj){
return (eq_p_(obj,true) || eq_p_(obj,false)); // Line <unknown undefined> Column <unknown undefined>
});
var null_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && eq_p_(obj["length"],1) && eq_p_(vector_dash_ref(obj,0),null)); // Line <unknown undefined> Column <unknown undefined>
});
var list_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && not(eq_p_(obj["list"],undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var vector_p_ = (function(obj){
return (not(list_p_(obj)) && not(null_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && not(eq_p_(obj["length"],undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var dict_p_ = (function(obj){
return (not(symbol_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && eq_p_(obj["length"],undefined)); // Line <unknown undefined> Column <unknown undefined>
});
var function_p_ = (function(obj){
return eq_p_(typeof obj,"function"); // Line 60 Column 3
});
var literal_p_ = (function(x){
return (key_p_(x) || number_p_(x) || string_p_(x) || boolean_p_(x) || null_p_(x)); // Line <unknown undefined> Column <unknown undefined>
});
var str = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return fold((function(el,acc){
return (acc + (function() {if(string_p_(el)) {return el; // Line <unknown undefined> Column <unknown undefined>
} else {return inspect(el); // Line 75 Column 36
}})()
); // Line <unknown undefined> Column <unknown undefined>
}),"",args); // Line 73 Column 5
});
var symbol_dash__gt_key = (function(sym){
return ("\uFDD0" + sym["substring"](1)); // Line <unknown undefined> Column <unknown undefined>
});
var key_dash__gt_symbol = (function(sym){
return ("\uFDD1" + sym["substring"](1)); // Line <unknown undefined> Column <unknown undefined>
});
var string_dash__gt_key = (function(str){
return ("\uFDD0" + str); // Line <unknown undefined> Column <unknown undefined>
});
var key_dash__gt_string = (function(key){
return key["substring"](1); // Line 89 Column 3
});
var string_dash__gt_symbol = (function(str){
return ("\uFDD1" + str); // Line <unknown undefined> Column <unknown undefined>
});
var symbol_dash__gt_string = (function(sym){
return sym["substring"](1); // Line 95 Column 3
});
var _emptylst = [null];
var list = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return args; // Line <unknown undefined> Column <unknown undefined>
});
var cons = (function(obj,lst){
return ((function() {var o1 = (function(res){
res.list = true;return res; // Line <unknown undefined> Column <unknown undefined>
});
var o2 = [obj, lst];
return o1(o2); // Line 106 Column 2
}))(); // Line 106 Column 2
});
var car = (function(lst){
return lst[0]});
var cdr = (function(lst){
return lst[1]});
var cadr = (function(lst){
return car(cdr(lst)); // Line 116 Column 20
});
var cddr = (function(lst){
return cdr(cdr(lst)); // Line 117 Column 20
});
var cdar = (function(lst){
return cdr(car(lst)); // Line 118 Column 20
});
var caddr = (function(lst){
return car(cdr(cdr(lst))); // Line 119 Column 21
});
var cdddr = (function(lst){
return cdr(cdr(cdr(lst))); // Line 120 Column 21
});
var cadar = (function(lst){
return car(cdr(car(lst))); // Line 121 Column 21
});
var cddar = (function(lst){
return cdr(cdr(car(lst))); // Line 122 Column 21
});
var caadr = (function(lst){
return car(car(cdr(lst))); // Line 123 Column 21
});
var cdadr = (function(lst){
return cdr(car(cdr(lst))); // Line 124 Column 21
});
var list_dash_ref = (function(lst,i){
return ((function() {var loop = (function(lst,i){
return (function() {if(null_p_(lst)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(eq_p_(i,0)) {return car(lst); // Line 127 Column 2
} else {return loop(cdr(lst),(i - 1)); // Line 127 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o3 = lst;
var o4 = i;
return loop(o3,o4); // Line 127 Column 2
}))(); // Line 127 Column 2
});
var length = (function(lst){
return fold((function(el,acc){
return (acc + 1); // Line <unknown undefined> Column <unknown undefined>
}),0,lst); // Line 135 Column 3
});
var list_dash_append = (function(){
var lsts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
var l_star_ = (function() {if(null_p_(lsts)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return lsts; // Line <unknown undefined> Column <unknown undefined>
}})()
;
return (function() {if(null_p_(l_star_)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(cdr(l_star_))) {return car(l_star_); // Line 144 Column 11
} else {return _list_dash_append(car(l_star_),apply(list_dash_append,cdr(l_star_))); // Line 145 Column 11
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _list_dash_append = (function(lst1,lst2){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return lst2; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(car(lst),loop(cdr(lst))); // Line 149 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o5 = lst1;
return loop(o5); // Line 149 Column 2
}))(); // Line 149 Column 2
});
var list_dash_find = (function(lst,val){
var rst = vector_dash__gt_list(Array.prototype.slice.call(arguments, 2));
return ((function() {var o6 = (function(access){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(access(car(lst)),val)) {return lst; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cdr(lst)); // Line 156 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o8 = lst;
return loop(o8); // Line 156 Column 2
}))(); // Line 156 Column 2
});
var o7 = (function() {if(null_p_(rst)) {return (function(x){
return x; // Line <unknown undefined> Column <unknown undefined>
}); // Line <unknown undefined> Column <unknown undefined>
} else {return car(rst); // Line 156 Column 2
}})()
;
return o6(o7); // Line 156 Column 2
}))(); // Line 156 Column 2
});
var map = (function(func,lst){
return (function() {if(null_p_(lst)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(func(car(lst)),map(func,cdr(lst))); // Line 167 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var for_dash_each = (function(func,lst){
return ((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {func(car(lst)); // Line 171 Column 2
return loop(cdr(lst)); // Line 171 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o9 = lst;
return loop(o9); // Line 171 Column 2
}))(); // Line 171 Column 2
});
var fold = (function(func,acc,lst){
return (function() {if(null_p_(lst)) {return acc; // Line <unknown undefined> Column <unknown undefined>
} else {return fold(func,func(car(lst),acc),cdr(lst)); // Line 180 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var reverse = (function(lst){
return (function() {if(null_p_(lst)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return list_dash_append(reverse(cdr(lst)),list(car(lst))); // Line 187 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash__gt_list = (function(vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return cons(vector_dash_ref(vec,i),loop((i + 1))); // Line 193 Column 2
} else {return _emptylst}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o10 = 0;
return loop(o10); // Line 193 Column 2
}))(); // Line 193 Column 2
});
var make_dash_vector = (function(count){
var val = arguments[1] || false;
return ((function() {var o11 = (function(v){
return (function() {if(val) {return ((function() {var loop = (function(i){
return (function() {if((i < count)) {vector_dash_put_excl_(v,i,val); // Line 202 Column 2
return loop((i + 1)); // Line 202 Column 2
} else {return v; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o13 = 0;
return loop(o13); // Line 202 Column 2
}))(); // Line 202 Column 2
} else {return v; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o12 = new Array(count);
return o11(o12); // Line 202 Column 2
}))(); // Line 202 Column 2
});
var vector = (function() {return Array.prototype.slice.call(arguments)});
var vector_dash_ref = (function(vec,i){
return vec[i]});
var vector_dash_put_excl_ = (function(vec,i,obj){
return vec[i] = obj});
var vector_dash_concat = (function(){
var vecs = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var loop = (function(lst,res){
return (function() {if(null_p_(lst)) {return res; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cdr(lst),res["concat"](car(lst))); // Line 222 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o14 = cdr(vecs);
var o15 = car(vecs);
return loop(o14,o15); // Line 222 Column 2
}))(); // Line 222 Column 2
});
var vector_dash_slice = (function(vec,start){
var end = arguments[2] || false;
return vec.slice(start, end || undefined)});
var vector_dash_push_excl_ = (function(vec,obj){
return vec.push(obj)});
var vector_dash_find = (function(vec,val){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return (function() {if(eq_p_(vector_dash_ref(vec,i),val)) {return i; // Line <unknown undefined> Column <unknown undefined>
} else {return loop((i + 1)); // Line 236 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o16 = 0;
return loop(o16); // Line 236 Column 2
}))(); // Line 236 Column 2
});
var vector_dash_length = (function(vec){
return vec["length"]; // Line <unknown undefined> Column <unknown undefined>
});
var list_dash__gt_vector = (function(lst){
var res = [];
for_dash_each((function(el){
return res["push"](el); // Line 248 Column 15
}),lst); // Line 247 Column 3
return res; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash_map = (function(func,vec){
var res = [];
((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {res["push"](func(vector_dash_ref(vec,i))); // Line 254 Column 2
return loop((i + 1)); // Line 254 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o17 = 0;
return loop(o17); // Line 254 Column 2
}))(); // Line 254 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash_for_dash_each = (function(func,vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {func(vector_dash_ref(vec,i)); // Line 262 Column 2
return loop((i + 1)); // Line 262 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o18 = 0;
return loop(o18); // Line 262 Column 2
}))(); // Line 262 Column 2
});
var vector_dash_fold = (function(func,acc,vec){
return ((function() {var loop = (function(i,acc){
return (function() {if((i < vector_dash_length(vec))) {return loop((i + 1),func(vector_dash_ref(vec,i),acc)); // Line 269 Column 2
} else {return acc; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o19 = 0;
var o20 = acc;
return loop(o19,o20); // Line 269 Column 2
}))(); // Line 269 Column 2
});
var dict = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
var res = {};
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o22 = (function(key,val){
dict_dash_put_excl_(res,key,val); // Line 281 Column 4
return loop(cddr(lst)); // Line 281 Column 4
});
var o23 = car(lst);
var o24 = cadr(lst);
return o22(o23,o24); // Line 281 Column 4
}))(); // Line 281 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o21 = args;
return loop(o21); // Line 281 Column 4
}))(); // Line 281 Column 4
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash_put_excl_ = (function(dct,k,v){
return dct[k.substring(1)] = v});
var dict_dash_ref = (function(dct,k){
return dct[k.substring(1)]});
var dict_dash_map = (function(func,dct){
var res = dict();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o26 = (function(k){
dict_dash_put_excl_(res,k,func(dict_dash_ref(dct,k))); // Line 297 Column 2
return loop(cdr(lst)); // Line 297 Column 2
});
var o27 = car(lst);
return o26(o27); // Line 297 Column 2
}))(); // Line 297 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o25 = keys(dct);
return loop(o25); // Line 297 Column 2
}))(); // Line 297 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash_merge = (function(){
var dcts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var o28 = (function(res){
for_dash_each((function(dct){
return for_dash_each((function(k){
return dict_dash_put_excl_(res,k,dict_dash_ref(dct,k)); // Line 306 Column 2
}),keys(dct)); // Line 306 Column 2
}),dcts); // Line 306 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var o29 = dict();
return o28(o29); // Line 306 Column 2
}))(); // Line 306 Column 2
});
var dict_dash__gt_vector = (function(dct){
var res = vector();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {vector_dash_push_excl_(res,car(lst)); // Line 316 Column 2
vector_dash_push_excl_(res,dict_dash_ref(dct,car(lst))); // Line 316 Column 2
return loop(cdr(lst)); // Line 316 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o30 = keys(dct);
return loop(o30); // Line 316 Column 2
}))(); // Line 316 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash__gt_list = (function(dct){
return vector_dash__gt_list(dict_dash__gt_vector(dct)); // Line 325 Column 3
});
var keys = (function(dct){
return ((function() {var o31 = (function(res){
for(var k in dct) {
       res = cons(string_dash__gt_key(k), res);
    }return res; // Line <unknown undefined> Column <unknown undefined>
});
var o32 = _emptylst;
return o31(o32); // Line 328 Column 2
}))(); // Line 328 Column 2
});
var vals = (function(dct){
return map((function(k){
return dict_dash_ref(dct,k); // Line 335 Column 20
}),keys(dct)); // Line 335 Column 3
});
var zip = (function(keys,vals){
var res = dict();
((function() {var loop = (function(ks,vs){
return (function() {if(not(null_p_(ks))) {dict_dash_put_excl_(res,car(ks),car(vs)); // Line 340 Column 2
return loop(cdr(ks),cdr(vs)); // Line 340 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o33 = keys;
var o34 = vals;
return loop(o33,o34); // Line 340 Column 2
}))(); // Line 340 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var not = (function(obj){
return (typeof obj !== 'number' && !obj); // Line <unknown undefined> Column <unknown undefined>
});
var _eq__eq_ = (function(obj1,obj2){
return obj1 === obj2});
var _eq_ = (function(obj1,obj2){
return (function() {if((list_p_(obj1) && list_p_(obj2))) {return ((function() {var loop = (function(lst1,lst2){
var n1 = null_p_(lst1);
var n2 = null_p_(lst2);
return (function() {if((n1 && n2)) {return true; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if((n1 || n2)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(equal_p_(car(lst1),car(lst2))) {return loop(cdr(lst1),cdr(lst2)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o35 = obj1;
var o36 = obj2;
return loop(o35,o36); // Line 360 Column 2
}))(); // Line 360 Column 2
} else {return (function() {if((vector_p_(obj1) && vector_p_(obj2))) {return (function() {if(not(_eq_(obj1["length"],obj2["length"]))) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return ((function() {var loop = (function(i){
return (function() {if((i < obj1["length"])) {return (function() {if(_eq_(vector_dash_ref(obj1,i),vector_dash_ref(obj2,i))) {return loop((i + 1)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return true; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o37 = 0;
return loop(o37); // Line 360 Column 2
}))(); // Line 360 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if((dict_p_(obj1) && dict_p_(obj2))) {return ((function() {var o38 = (function(keys1,keys2){
return (eq_p_(length(keys1),length(keys2)) && ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return true; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(equal_p_(dict_dash_ref(obj1,car(lst)),dict_dash_ref(obj2,car(lst)))) {return loop(cdr(lst)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o41 = keys1;
return loop(o41); // Line 360 Column 2
}))()); // Line <unknown undefined> Column <unknown undefined>
});
var o39 = keys(obj1);
var o40 = keys(obj2);
return o38(o39,o40); // Line 360 Column 2
}))(); // Line 360 Column 2
} else {return eq_p_(obj1,obj2); // Line 360 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var eq_p_ = _eq__eq_;
var equal_p_ = _eq_;
var print = (function(msg){
return util["print"](msg); // Line 408 Column 3
});
var println = (function(msg){
return util["puts"](msg); // Line 411 Column 3
});
var pp = (function(obj){
return println(inspect(obj)); // Line 414 Column 3
});
var _per_inspect_dash_non_dash_sequence = (function(obj){
return (function() {if(number_p_(obj)) {return ("" + obj); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(string_p_(obj)) {obj = obj["replace"](RegExp("\\\\","g"),"\\\\");
obj = obj["replace"](RegExp("\n","g"),"\\n");
obj = obj["replace"](RegExp("\r","g"),"\\r");
obj = obj["replace"](RegExp("\t","g"),"\\t");
obj = obj["replace"](RegExp("\"","g"),"\\\"");
return ("\"" + obj + "\""); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(key_p_(obj)) {return (":" + symbol_dash__gt_string(obj)); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(symbol_p_(obj)) {return symbol_dash__gt_string(obj); // Line 418 Column 2
} else {return (function() {if(boolean_p_(obj)) {return (function() {if(obj) {return "#t"; // Line <unknown undefined> Column <unknown undefined>
} else {return "#f"; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(obj)) {return "()"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(function_p_(obj)) {return "<function>"; // Line <unknown undefined> Column <unknown undefined>
} else {return ("<unknown " + obj + ">"); // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _per_recur_dash_protect = (function(obj,arg,func,halt){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 4));
return ((function() {var o42 = (function(parents){
return (function() {if(list_dash_find(parents,obj)) {return halt; // Line <unknown undefined> Column <unknown undefined>
} else {return func(obj,arg,(function(el,arg){
return _per_recur_dash_protect(el,arg,func,halt,cons(obj,parents)); // Line 435 Column 2
})); // Line 435 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o43 = (function() {if(null_p_(rest)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return car(rest); // Line 435 Column 2
}})()
;
return o42(o43); // Line 435 Column 2
}))(); // Line 435 Column 2
});
var _per_space = (function(obj){
return _per_recur_dash_protect(obj,false,(function(obj,arg,recur){
return (function() {if(list_p_(obj)) {return (length(obj) + 1 + fold((function(el,acc){
return (acc + recur(el,false)); // Line <unknown undefined> Column <unknown undefined>
}),0,obj)); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(obj)) {return recur(dict_dash__gt_list(obj),false); // Line 448 Column 5
} else {return (function() {if(vector_p_(obj)) {return recur(vector_dash__gt_list(obj),false); // Line 448 Column 5
} else {return vector_dash_length(_per_inspect_dash_non_dash_sequence(obj)); // Line 448 Column 5
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),vector_dash_length("<circular>")); // Line 444 Column 3
});
var inspect = (function(obj){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 1));
return ((function() {var o44 = (function(no_dash_newlines){
return _per_recur_dash_protect(obj,1,(function(obj,i,recur){
var buffer = "";
var get_dash_buffer = (function() {return buffer; // Line <unknown undefined> Column <unknown undefined>
});
var disp = (function(s){
buffer = (buffer + s);
});
var pad = (function(n){
return vector_dash_for_dash_each((function(_){
return disp(" "); // Line 468 Column 2
}),make_dash_vector(n)); // Line 468 Column 2
});
return (function() {if(list_p_(obj)) {return ((function() {var o46 = (function(sp,first){
disp("("); // Line 468 Column 2
for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(el,(i + 1))); // Line 468 Column 2
first = false;
}),obj); // Line 468 Column 2
disp(")"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o47 = (_per_space(obj) > 30);
var o48 = true;
return o46(o47,o48); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return (function() {if(vector_p_(obj)) {return ((function() {var o49 = (function(sp,first){
disp("["); // Line 468 Column 2
vector_dash_for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(el,(i + 1))); // Line 468 Column 2
first = false;
}),obj); // Line 468 Column 2
disp("]"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o50 = (_per_space(obj) > 30);
var o51 = true;
return o49(o50,o51); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return (function() {if(dict_p_(obj)) {return ((function() {var o52 = (function(sp,first){
disp("{"); // Line 468 Column 2
for_dash_each((function(k){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(k,i)); // Line 468 Column 2
disp(" "); // Line 468 Column 2
disp(recur(dict_dash_ref(obj,k),(i + 3 + vector_dash_length(symbol_dash__gt_string(k))))); // Line 468 Column 2
first = false;
}),keys(obj)); // Line 468 Column 2
disp("}"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o53 = (_per_space(obj) > 30);
var o54 = true;
return o52(o53,o54); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return _per_inspect_dash_non_dash_sequence(obj); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),"<circular>"); // Line 468 Column 2
});
var o45 = (function() {if(null_p_(rest)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return car(rest); // Line 468 Column 2
}})()
;
return o44(o45); // Line 468 Column 2
}))(); // Line 468 Column 2
});
var apply = (function(func,args){
return func.apply(null,list_dash__gt_vector(args)); // Line 542 Column 3
});
var trampoline_dash_result_p_ = (function(value){
return (vector_p_(value) && _eq_(vector_dash_ref(value,0),"__tco_call")); // Line <unknown undefined> Column <unknown undefined>
});
var trampoline = (function(value){
while(trampoline_dash_result_p_(value)) { value = value[1](); }return value; // Line <unknown undefined> Column <unknown undefined>
});
var _per_gensym_dash_base = 0;
var gensym_dash_fresh = (function() {_per_gensym_dash_base = 10000;
});
var gensym = (function() {_per_gensym_dash_base = (_per_gensym_dash_base + 1);
return string_dash__gt_symbol(("o" + _per_gensym_dash_base)); // Line 563 Column 3
});
var _per_breakpoints_dash_flag = true;
var breakpoint = (function(thunk_dash_msg){
_per_next_dash_thunk = thunk_dash_msg;
return debugger_dash_step(vector_dash_ref(thunk_dash_msg,1)); // Line 571 Column 3
});
var debugger_dash_step_p_ = false;
var start_dash_stepping = (function() {debugger_dash_step_p_ = true;
});
var stop_dash_stepping = (function() {debugger_dash_step_p_ = false;
});
var debugger_dash_stepping_p_ = (function() {return not(_eq__eq_(_per_next_dash_thunk,false)); // Line 581 Column 3
});
var enable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = true;
});
var disable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = false;
});
var debugger_dash_continue = (function() {return ((function() {var o55 = (function(thunk){
_per_next_dash_thunk = false;
return cps_dash_trampoline(thunk); // Line 590 Column 2
});
var o56 = vector_dash_ref(_per_next_dash_thunk,2)();
return o55(o56); // Line 590 Column 2
}))(); // Line 590 Column 2
});
var _per_next_dash_thunk = false;
var cps_dash_trampoline = (function(thunk_msg){
while(thunk_msg) {
     if(_per_breakpoints_dash_flag && (thunk_msg[0] || debugger_dash_step_p_)) {
       breakpoint(thunk_msg);
       break;
     }
     thunk_msg = thunk_msg[2](); }return false; // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_jump = (function(breakpoint,msg,to){
return vector(breakpoint,msg,to); // Line 617 Column 2
});
var cps_dash_halt = (function(v){
return list(list("\uFDD1lambda",_emptylst,v,false)); // Line 620 Column 4
});


var reader = _dereq_("./reader");var ast = _dereq_("./ast");var js = _dereq_("./backends/js");var cps = _dereq_("./cps");var self_dash_evaluating_p_ = (function(exp){
return (number_p_(exp) || string_p_(exp) || boolean_p_(exp) || null_p_(exp) || key_p_(exp)); // Line <unknown undefined> Column <unknown undefined>
});
var alternating_dash_map = (function(func,lst){
var former_p_ = vector_dash__gt_list(Array.prototype.slice.call(arguments, 2));
return ((function() {var loop = (function(lst,acc){
return (function() {if((null_p_(lst) || null_p_(cdr(lst)))) {return acc; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cddr(lst),cons((function() {if(not(null_p_(former_p_))) {return func(car(lst)); // Line 14 Column 2
} else {return car(lst); // Line 14 Column 2
}})()
,cons((function() {if(null_p_(former_p_)) {return func(cadr(lst)); // Line 14 Column 2
} else {return cadr(lst); // Line 14 Column 2
}})()
,acc))); // Line 14 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o1 = lst;
var o2 = _emptylst;
return loop(o1,o2); // Line 14 Column 2
}))(); // Line 14 Column 2
});
var opt = (function(arg,def){
return (function() {if(null_p_(arg)) {return def; // Line <unknown undefined> Column <unknown undefined>
} else {return car(arg); // Line 29 Column 23
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var assert = (function(cnd,msg){
return (function() {if(not(cnd)) {throw(msg); // Line 33 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var expand = (function(node){
return (function() {if(ast["atom?"](node)) {return node; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(ast["vector?"](node)) {return ast["copy-node"](node,map((function(e){
return expand(e); // Line 38 Column 2
}),ast["node-data"](node))); // Line 38 Column 2
} else {return (function() {if(ast["dict?"](node)) {return ast["copy-node"](node,map((function(e){
return expand(e); // Line 38 Column 2
}),ast["node-data"](node))); // Line 38 Column 2
} else {return (function() {if((_eq__eq_(ast["first*"](node),"\uFDD1quote") || _eq__eq_(ast["first*"](node),"\uFDD1quasiquote"))) {return node; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(ast["first*"](node),"\uFDD1lambda")) {return ast["copy-node"](node,cons(ast["first"](node),cons(cadr(ast["node-data"](node)),map((function(e){
return expand(e); // Line 38 Column 2
}),cddr(ast["node-data"](node)))))); // Line 38 Column 2
} else {return (function() {if(macro_p_(ast["first*"](node))) {return ((function() {var o3 = (function(res){
return expand(sourcify(res,ast["node-lineno"](node),ast["node-colno"](node))); // Line 38 Column 2
});
var o4 = macro_dash_function(ast["first*"](node))(desourcify(node));
return o3(o4); // Line 38 Column 2
}))(); // Line 38 Column 2
} else {return ast["copy-node"](node,map(expand,ast["node-data"](node))); // Line 38 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _per_macros = dict();
var macro_dash_function = (function(name){
return dict_dash_ref(_per_macros,name); // Line 70 Column 3
});
var install_dash_macro = (function(name,f){
return dict_dash_put_excl_(_per_macros,name,f); // Line 73 Column 3
});
var macro_p_ = (function(name){
return (symbol_p_(name) && dict_dash_ref(_per_macros,symbol_dash__gt_key(name)) && true); // Line <unknown undefined> Column <unknown undefined>
});
var macro_dash_generator = false;
var make_dash_macro = (function(pattern,body){
return ((function() {var o5 = (function(x){
return ((function() {var o7 = (function(s,p){
return eval(p); // Line 83 Column 2
});
var o8 = list("\uFDD1lambda",list(x),list("\uFDD1apply",list_dash_append(list("\uFDD1lambda",pattern),body),list("\uFDD1cdr",x)));
var o9 = compile_dash_program(o8,macro_dash_generator["make-fresh"]());
return o7(o8,o9); // Line 83 Column 2
}))(); // Line 83 Column 2
});
var o6 = gensym();
return o5(o6); // Line 83 Column 2
}))(); // Line 83 Column 2
});
var sourcify = (function(exp,lineno,colno){
return (function() {if((self_dash_evaluating_p_(exp) || symbol_p_(exp))) {return ast["make-node"]("\uFDD1ATOM",exp,lineno,colno); // Line 94 Column 2
} else {return (function() {if(vector_p_(exp)) {return ast["make-node"]("\uFDD1VECTOR",map((function(e){
return sourcify(e,lineno,colno); // Line 94 Column 2
}),vector_dash__gt_list(exp)),lineno,colno); // Line 94 Column 2
} else {return (function() {if(dict_p_(exp)) {return ast["make-node"]("\uFDD1DICT",map((function(e){
return sourcify(e,lineno,colno); // Line 94 Column 2
}),dict_dash__gt_list(exp)),lineno,colno); // Line 94 Column 2
} else {return ast["make-node"]("\uFDD1LIST",map((function(e){
return sourcify(e,lineno,colno); // Line 94 Column 2
}),exp),lineno,colno); // Line 94 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var desourcify = (function(node){
return (function() {if(ast["atom?"](node)) {return ast["node-data"](node); // Line 114 Column 2
} else {return (function() {if(ast["vector?"](node)) {return list_dash__gt_vector(map(desourcify,ast["node-data"](node))); // Line 114 Column 2
} else {return (function() {if(ast["dict?"](node)) {return apply(dict,map(desourcify,ast["node-data"](node))); // Line 114 Column 2
} else {return (function() {if(ast["list?"](node)) {return map(desourcify,ast["node-data"](node)); // Line 114 Column 2
} else {throw(str("unknown node type: ",node)); // Line 114 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
install_dash_macro("\uFDD1define-macro",(function(form){
return ((function() {var o10 = (function(sig){
return ((function() {var o12 = (function(name,pattern,body){
install_dash_macro(name,make_dash_macro(pattern,body)); // Line 127 Column 3
return false; // Line <unknown undefined> Column <unknown undefined>
});
var o13 = car(sig);
var o14 = cdr(sig);
var o15 = cddr(form);
return o12(o13,o14,o15); // Line 127 Column 3
}))(); // Line 127 Column 3
});
var o11 = cadr(form);
return o10(o11); // Line 127 Column 3
}))(); // Line 127 Column 3
})); // Line 124 Column 1
install_dash_macro("\uFDD1cond",(function(form){
return (function() {if(null_p_(cdr(form))) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return ((function() {var o16 = (function(forms){
return ((function() {var o18 = (function(f){
return (function() {if(eq_p_(car(f),"\uFDD1else")) {return list_dash_append(list("\uFDD1begin"),cdr(f)); // Line 140 Column 7
} else {return list("\uFDD1if",car(f),list_dash_append(list("\uFDD1begin"),cdr(f)),list_dash_append(list("\uFDD1cond"),cdr(forms))); // Line 140 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o19 = car(forms);
return o18(o19); // Line 140 Column 7
}))(); // Line 140 Column 7
});
var o17 = cdr(form);
return o16(o17); // Line 140 Column 7
}))(); // Line 140 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
})); // Line 135 Column 1
install_dash_macro("\uFDD1case",(function(form){
return ((function() {var o20 = (function(c,variants){
return list_dash_append(list("\uFDD1cond"),map((function(exp){
return (function() {if(_eq__eq_(car(exp),"\uFDD1else")) {return exp; // Line <unknown undefined> Column <unknown undefined>
} else {return list_dash_append(list(list("\uFDD1list-find",list("\uFDD1quote",car(exp)),c)),cdr(exp)); // Line 151 Column 3
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),variants)); // Line 151 Column 3
});
var o21 = cadr(form);
var o22 = cddr(form);
return o20(o21,o22); // Line 151 Column 3
}))(); // Line 151 Column 3
})); // Line 148 Column 1
install_dash_macro("\uFDD1let",(function(form){
var replace = (function(expr,old,sym){
return (function() {if(symbol_p_(expr)) {return (function() {if(_eq__eq_(expr,old)) {return sym; // Line <unknown undefined> Column <unknown undefined>
} else {return expr; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(literal_p_(expr)) {return expr; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(expr)) {return dict_dash_map((function(e){
return replace(e,old,sym); // Line 166 Column 5
}),expr); // Line 166 Column 5
} else {return (function() {if(vector_p_(expr)) {return vector_dash_map((function(e){
return replace(e,old,sym); // Line 166 Column 5
}),expr); // Line 166 Column 5
} else {return (function() {if(list_p_(expr)) {return map((function(e){
return replace(e,old,sym); // Line 166 Column 5
}),expr); // Line 166 Column 5
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var generate_dash_defs = (function(syms,exprs){
return reverse(((function() {var loop = (function(lst,forms,vars,acc){
return (function() {if(null_p_(lst)) {return acc; // Line <unknown undefined> Column <unknown undefined>
} else {return ((function() {var o27 = (function(sym,name,code){
return loop(cdr(lst),cdr(forms),dict_dash_merge(vars,dict(name,sym)),cons(list("\uFDD1define",car(lst),fold((function(el,acc){
return replace(acc,key_dash__gt_symbol(el),dict_dash_ref(vars,el)); // Line 180 Column 6
}),code,keys(vars))),acc)); // Line 180 Column 6
});
var o28 = car(lst);
var o29 = car(car(forms));
var o30 = cadar(forms);
return o27(o28,o29,o30); // Line 180 Column 6
}))(); // Line 180 Column 6
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o23 = syms;
var o24 = exprs;
var o25 = dict();
var o26 = _emptylst;
return loop(o23,o24,o25,o26); // Line 180 Column 6
}))()); // Line 179 Column 6
});
var tco = (function(exprs,exit){
var if_p_ = (function(expr){
return (list_p_(expr) && _eq__eq_(car(expr),"\uFDD1if")); // Line <unknown undefined> Column <unknown undefined>
});
var let_p_ = (function(expr){
return (list_p_(expr) && _eq__eq_(car(expr),"\uFDD1let")); // Line <unknown undefined> Column <unknown undefined>
});
var begin_p_ = (function(expr){
return (list_p_(expr) && _eq__eq_(car(expr),"\uFDD1begin")); // Line <unknown undefined> Column <unknown undefined>
});
var tco_p_ = (function(expr){
return (list_p_(expr) && _eq__eq_(car(expr),exit)); // Line <unknown undefined> Column <unknown undefined>
});
var process_dash_if = (function(expr,transform){
return (function() {if(null_p_(cdddr(expr))) {return list("\uFDD1if",cadr(expr),transform(caddr(expr))); // Line 218 Column 13
} else {return list("\uFDD1if",cadr(expr),transform(caddr(expr)),transform(car(cdddr(expr)))); // Line 220 Column 13
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
return ((function() {var o31 = (function(rexprs){
return ((function() {var o33 = (function(bottom){
return (function() {if(if_p_(bottom)) {return reverse(cons(process_dash_if(bottom,(function(expr){
return (function() {if(begin_p_(expr)) {return tco(expr,exit); // Line 224 Column 5
} else {return (function() {if(let_p_(expr)) {return tco(expr,exit); // Line 224 Column 5
} else {return car(tco(list(expr),exit)); // Line 224 Column 5
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
})),cdr(rexprs))); // Line 224 Column 5
} else {return (function() {if(let_p_(bottom)) {return reverse(cons(tco(bottom,exit),cdr(rexprs))); // Line 224 Column 5
} else {return (function() {if((tco_p_(bottom) && false)) {return reverse(cons(list("\uFDD1vector","__tco_call",list("\uFDD1lambda",_emptylst,bottom)),cdr(rexprs))); // Line 224 Column 5
} else {return exprs; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o34 = car(rexprs);
return o33(o34); // Line 224 Column 5
}))(); // Line 224 Column 5
});
var o32 = reverse(exprs);
return o31(o32); // Line 224 Column 5
}))(); // Line 224 Column 5
});
var tco_dash_call_p_ = (function(name,expr){
var _tco_p_ = (function(expr){
return (list_p_(expr) && _eq_(car(expr),"\uFDD1vector") && _eq_(cadr(expr),"__tco_call") && ((function() {var o35 = (function(lamb){
return ((function() {var o37 = (function(body){
return _eq_(car(body),name); // Line 253 Column 12
});
var o38 = caddr(lamb);
return o37(o38); // Line 253 Column 12
}))(); // Line 253 Column 12
});
var o36 = caddr(expr);
return o35(o36); // Line 253 Column 12
}))()); // Line <unknown undefined> Column <unknown undefined>
});
return (function() {if(list_p_(expr)) {return (_tco_p_(expr) || fold((function(el,acc){
return (acc || tco_dash_call_p_(name,el)); // Line <unknown undefined> Column <unknown undefined>
}),false,expr)); // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
return ((function() {var o39 = (function(name,forms){
assert((null_p_(forms) || (list_p_(forms) && list_p_(car(forms)))),str("invalid let: ",form)); // Line 268 Column 3
return ((function() {var o42 = (function(syms,body){
return ((function() {var o45 = (function(tco_dash_ed){
return list(list_dash_append(list("\uFDD1lambda",_emptylst,list_dash_append(list("\uFDD1define",list_dash_append(list(name),map(car,forms))),tco_dash_ed)),list_dash_append(generate_dash_defs(syms,forms),(function() {if((tco_dash_call_p_(name,tco_dash_ed) && false)) {return list(list("\uFDD1trampoline",list_dash_append(list(name),syms))); // Line 268 Column 3
} else {return list(list_dash_append(list(name),syms)); // Line 268 Column 3
}})()
))); // Line 268 Column 3
});
var o46 = tco(body,name);
return o45(o46); // Line 268 Column 3
}))(); // Line 268 Column 3
});
var o43 = map((function(el){
return gensym(); // Line 268 Column 3
}),forms);
var o44 = (function() {if(symbol_p_(cadr(form))) {return cdddr(form); // Line 268 Column 3
} else {return cddr(form); // Line 268 Column 3
}})()
;
return o42(o43,o44); // Line 268 Column 3
}))(); // Line 268 Column 3
});
var o40 = (function() {if(symbol_p_(cadr(form))) {return cadr(form); // Line 268 Column 3
} else {return gensym(); // Line 268 Column 3
}})()
;
var o41 = (function() {if(symbol_p_(cadr(form))) {return caddr(form); // Line 268 Column 3
} else {return cadr(form); // Line 268 Column 3
}})()
;
return o39(o40,o41); // Line 268 Column 3
}))(); // Line 268 Column 3
})); // Line 162 Column 1
install_dash_macro("\uFDD1eval",(function(form){
return list(list("\uFDD1%raw","eval"),list("\uFDD1__compiler.compile-program",cadr(form),list("\uFDD1__generator"))); // Line 301 Column 5
})); // Line 298 Column 1
var _natives_ = dict();
var native_dash_function = (function(name){
return dict_dash_ref(_natives_,name); // Line 317 Column 3
});
var install_dash_native = (function(name,func,validator){
return dict_dash_put_excl_(_natives_,name,(function(node,gen,expr_p_,compile_star_){
validator(node); // Line 323 Column 16
return dict_dash_ref(gen,func)(cdr(ast["node-data"](node)),expr_p_,compile_star_); // Line 324 Column 16
})); // Line 320 Column 3
});
var native_p_ = (function(name){
return (symbol_p_(name) && not(_eq__eq_(dict_dash_ref(_natives_,symbol_dash__gt_key(name)),undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var verify_dash_not_dash_single = (function(node){
return assert((length(ast["node-data"](node)) > 1),str("form requires at least one operand:",inspect(desourcify(node)))); // Line 332 Column 3
});
install_dash_native("\uFDD0and","\uFDD1write-and",verify_dash_not_dash_single); // Line 336 Column 1
install_dash_native("\uFDD0or","\uFDD1write-or",verify_dash_not_dash_single); // Line 337 Column 1
install_dash_native("\uFDD0+","\uFDD1write-add",verify_dash_not_dash_single); // Line 338 Column 1
install_dash_native("\uFDD0-","\uFDD1write-subtract",verify_dash_not_dash_single); // Line 339 Column 1
install_dash_native("\uFDD0*","\uFDD1write-multiply",verify_dash_not_dash_single); // Line 340 Column 1
install_dash_native("\uFDD0/","\uFDD1write-divide",verify_dash_not_dash_single); // Line 341 Column 1
install_dash_native("\uFDD0>","\uFDD1write-gt",verify_dash_not_dash_single); // Line 342 Column 1
install_dash_native("\uFDD0<","\uFDD1write-lt",verify_dash_not_dash_single); // Line 343 Column 1
install_dash_native("\uFDD0<=","\uFDD1write-lteq",verify_dash_not_dash_single); // Line 344 Column 1
install_dash_native("\uFDD0>=","\uFDD1write-gteq",verify_dash_not_dash_single); // Line 345 Column 1
install_dash_native("\uFDD0>>","\uFDD1write-rshift",verify_dash_not_dash_single); // Line 346 Column 1
install_dash_native("\uFDD0<<","\uFDD1write-lshift",verify_dash_not_dash_single); // Line 347 Column 1
install_dash_native("\uFDD0bitwise-or","\uFDD1write-bitwise-or",verify_dash_not_dash_single); // Line 348 Column 1
install_dash_native("\uFDD0bitwise-and","\uFDD1write-bitwise-and",verify_dash_not_dash_single); // Line 349 Column 1
install_dash_native("\uFDD0%","\uFDD1write-mod",verify_dash_not_dash_single); // Line 350 Column 1
install_dash_native("\uFDD0require","\uFDD1write-require",(function(node){
verify_dash_not_dash_single(node); // Line 354 Column 19
return for_dash_each((function(el){
return assert((ast["list?"](el) && eq_p_(length(ast["node-data"](el)),2)),str("require needs a list of ","2 element lists: ",inspect(desourcify(el)))); // Line 357 Column 22
}),cdr(ast["node-data"](node))); // Line 355 Column 19
})); // Line 352 Column 1
var apply_dash_node = (function(func_dash_name,node){
var quoted_p_ = vector_dash__gt_list(Array.prototype.slice.call(arguments, 2));
return ((function() {var o47 = (function(quoted_p_){
return ast["prepend"](ast["make-atom"](func_dash_name,node),(function() {if(quoted_p_) {return ast["map-children"]((function(e){
return ast["make-list"](ast["make-atom"]("\uFDD1quote",node),e); // Line 369 Column 2
}),node); // Line 369 Column 2
} else {return node; // Line <unknown undefined> Column <unknown undefined>
}})()
); // Line 369 Column 2
});
var o48 = opt(quoted_p_,false);
return o47(o48); // Line 369 Column 2
}))(); // Line 369 Column 2
});
var apply_dash_w_slash_unquote = (function(func_dash_name,node){
return ast["prepend"](ast["make-atom"](func_dash_name,node),ast["map-children"]((function(e){
return (function() {if((ast["list?"](e) && _eq__eq_(ast["first*"](e),"\uFDD1unquote"))) {return cadr(ast["node-data"](e)); // Line 387 Column 11
} else {return (function() {if((ast["list?"](e) && _eq__eq_(ast["first*"](e),"\uFDD1key"))) {return ast["make-list"](ast["make-atom"]("\uFDD1quasiquote",node),cadr(ast["node-data"](e))); // Line 390 Column 15
} else {return ast["make-list"](ast["make-atom"]("\uFDD1quasiquote",node),e); // Line 392 Column 15
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),node)); // Line 381 Column 3
});
var split_dash_splices = (function(lst,func_dash_name){
var make_dash_splice = (function(lst){
return (function() {if((self_dash_evaluating_p_(lst) || symbol_p_(lst))) {return apply_dash_w_slash_unquote(func_dash_name,ast["make-list*"](list(lst))); // Line 399 Column 9
} else {return apply_dash_w_slash_unquote(func_dash_name,ast["make-list*"](lst)); // Line 400 Column 9
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
return ((function() {var loop = (function(nodes,slices,acc){
return (function() {if(null_p_(nodes)) {return reverse((function() {if(null_p_(acc)) {return slices; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(make_dash_splice(reverse(acc)),slices); // Line 402 Column 2
}})()
); // Line 402 Column 2
} else {return ((function() {var o52 = (function(node){
return (function() {if((ast["list?"](node) && _eq__eq_(ast["first*"](node),"\uFDD1unquote-splicing"))) {return ((function() {var o54 = (function(el){
return loop(cdr(nodes),cons(el,(function() {if(null_p_(acc)) {return slices; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(make_dash_splice(reverse(acc)),slices); // Line 402 Column 2
}})()
),_emptylst); // Line 402 Column 2
});
var o55 = cadr(ast["node-data"](node));
return o54(o55); // Line 402 Column 2
}))(); // Line 402 Column 2
} else {return loop(cdr(nodes),slices,cons(node,acc)); // Line 402 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o53 = car(nodes);
return o52(o53); // Line 402 Column 2
}))(); // Line 402 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o49 = lst;
var o50 = _emptylst;
var o51 = _emptylst;
return loop(o49,o50,o51); // Line 402 Column 2
}))(); // Line 402 Column 2
});
var quasiquote_dash_split = (function(append_dash_name,func_dash_name,node){
return ((function() {var o56 = (function(slices){
return (function() {if(_eq__eq_(length(slices),1)) {return car(slices); // Line 427 Column 2
} else {return apply_dash_node(append_dash_name,ast["make-list*"](slices)); // Line 427 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o57 = split_dash_splices(ast["node-data"](node),func_dash_name);
return o56(o57); // Line 427 Column 2
}))(); // Line 427 Column 2
});
var compile_dash_object = (function(node,generator,quoted_p_,expr_p_){
return ((function() {var o58 = (function(exp){
return (function() {if(key_p_(exp)) {return generator["write-key"](exp,expr_p_); // Line 433 Column 2
} else {return (function() {if(symbol_p_(exp)) {return generator["write-symbol"](exp,expr_p_); // Line 433 Column 2
} else {return (function() {if(number_p_(exp)) {return generator["write-number"](exp,expr_p_); // Line 433 Column 2
} else {return (function() {if(boolean_p_(exp)) {return generator["write-boolean"](exp,expr_p_); // Line 433 Column 2
} else {return (function() {if(string_p_(exp)) {return generator["write-string"](exp,expr_p_); // Line 433 Column 2
} else {return (function() {if(ast["dict?"](node)) {return compile(apply_dash_node("\uFDD1dict",node,quoted_p_),generator,expr_p_); // Line 433 Column 2
} else {return (function() {if(ast["vector?"](node)) {return compile(apply_dash_node("\uFDD1vector",node,quoted_p_),generator,expr_p_); // Line 433 Column 2
} else {return (function() {if(null_p_(exp)) {return generator["write-empty-list"](exp,expr_p_); // Line 433 Column 2
} else {return (function() {if(ast["list?"](node)) {return compile(apply_dash_node("\uFDD1list",node,quoted_p_),generator,expr_p_); // Line 433 Column 2
} else {throw(str("compile-object: unknown type: ",exp)); // Line 433 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o59 = ast["node-data"](node);
return o58(o59); // Line 433 Column 2
}))(); // Line 433 Column 2
});
var compile_dash_quasi = (function(node,generator,expr_p_){
return (function() {if(ast["list?"](node)) {return compile(quasiquote_dash_split("\uFDD1list-append","\uFDD1list",node),generator,expr_p_); // Line 452 Column 2
} else {return (function() {if(ast["vector?"](node)) {return compile(quasiquote_dash_split("\uFDD1vector-concat","\uFDD1vector",node),generator,expr_p_); // Line 452 Column 2
} else {return (function() {if(ast["dict?"](node)) {return compile(quasiquote_dash_split("\uFDD1dict-merge","\uFDD1dict",node),generator,expr_p_); // Line 452 Column 2
} else {return compile_dash_object(node,generator,true,expr_p_); // Line 452 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var compile_dash_reference = (function(node,generator){
var expr_p_ = vector_dash__gt_list(Array.prototype.slice.call(arguments, 2));
return generator["write-term"](node,opt(expr_p_,false)); // Line 463 Column 3
});
var compile_dash_if = (function(node,generator,expr_p_,compile_star_){
return ((function() {var o60 = (function(nodes,cnd,tru,alt){
return generator["write-if"](cnd,tru,alt,expr_p_,compile_star_); // Line 466 Column 2
});
var o61 = ast["node-data"](node);
var o62 = cadr(o61);
var o63 = caddr(o61);
var o64 = (function() {if(null_p_(cdddr(o61))) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return car(cdddr(o61)); // Line 466 Column 2
}})()
;
return o60(o61,o62,o63,o64); // Line 466 Column 2
}))(); // Line 466 Column 2
});
var compile_dash_lambda = (function(node,generator,expr_p_,compile_star_){
return generator["write-lambda"](node,expr_p_,compile_star_); // Line 475 Column 3
});
var compile_dash_set_excl_ = (function(node,generator,compile_star_){
return generator["write-set!"](cadr(ast["node-data"](node)),caddr(ast["node-data"](node)),compile_star_); // Line 478 Column 3
});
var compile_dash_define = (function(node,generator,compile_star_){
return ((function() {var o65 = (function(target){
return (function() {if(ast["list?"](target)) {return ((function() {var o67 = (function(name,args,body){
return generator["write-define"](name,ast["make-list*"](cons(ast["make-node-w/extra"]("\uFDD1ATOM","\uFDD1lambda",ast["node-data"](name),ast["node-lineno"](name),ast["node-colno"](name)),cons((function() {if(null_p_(args)) {return ast["make-empty-list"](name); // Line 483 Column 2
} else {return ast["make-list*"](args); // Line 483 Column 2
}})()
,body))),compile_star_); // Line 483 Column 2
});
var o68 = ast["first"](target);
var o69 = cdr(ast["node-data"](target));
var o70 = cddr(ast["node-data"](node));
return o67(o68,o69,o70); // Line 483 Column 2
}))(); // Line 483 Column 2
} else {return generator["write-define"](target,caddr(ast["node-data"](node)),compile_star_); // Line 483 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o66 = cadr(ast["node-data"](node));
return o65(o66); // Line 483 Column 2
}))(); // Line 483 Column 2
});
var compile_dash_begin = (function(node,generator,compile_star_,expr_p_,top_p_){
return ((function() {var o71 = (function(e_star_){
return (function() {if(expr_p_) {return compile_star_(ast["make-list"](ast["make-list*"](cons(ast["make-atom"]("\uFDD1lambda",node),cons(ast["make-empty-list"](node),e_star_)))),true); // Line 505 Column 2
} else {return (function() {if(top_p_) {return for_dash_each((function(e){
return compile_star_(e,expr_p_,top_p_); // Line 505 Column 2
}),e_star_); // Line 505 Column 2
} else {return generator["write-statements"](e_star_,compile_star_); // Line 505 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o72 = cdr(ast["node-data"](node));
return o71(o72); // Line 505 Column 2
}))(); // Line 505 Column 2
});
var compile = (function(node,generator){
var expr_p_ = arguments[2] || false;
var top_p_ = arguments[3] || false;
var compile_star_ = (function(node){
var expr_p_ = arguments[1] || false;
var top_p_ = arguments[2] || false;
return compile(node,generator,expr_p_,top_p_); // Line 525 Column 5
});
return (function() {if(self_dash_evaluating_p_(ast["node-data"](node))) {return compile_dash_object(node,generator,false,expr_p_); // Line 527 Column 2
} else {return (function() {if(symbol_p_(ast["node-data"](node))) {return compile_dash_reference(node,generator,expr_p_); // Line 527 Column 2
} else {return (function() {if(ast["vector?"](node)) {return compile_dash_object(node,generator,false,expr_p_); // Line 527 Column 2
} else {return (function() {if(ast["dict?"](node)) {return compile_dash_object(node,generator,false,expr_p_); // Line 527 Column 2
} else {return (function() {if(ast["list?"](node)) {return ((function() {var o73 = (function(sym){
return (function() {if(_eq__eq_(sym,"\uFDD1quote")) {return compile_dash_object(cadr(ast["node-data"](node)),generator,true,expr_p_); // Line 527 Column 2
} else {return (function() {if(_eq__eq_(sym,"\uFDD1quasiquote")) {return compile_dash_quasi(cadr(ast["node-data"](node)),generator,expr_p_); // Line 527 Column 2
} else {return (function() {if(_eq__eq_(sym,"\uFDD1if")) {return compile_dash_if(node,generator,expr_p_,compile_star_); // Line 527 Column 2
} else {return (function() {if(_eq__eq_(sym,"\uFDD1lambda")) {return compile_dash_lambda(node,generator,expr_p_,compile_star_); // Line 527 Column 2
} else {return (function() {if(_eq__eq_(sym,"\uFDD1set!")) {return compile_dash_set_excl_(node,generator,compile_star_); // Line 527 Column 2
} else {return (function() {if(_eq__eq_(sym,"\uFDD1define")) {return compile_dash_define(node,generator,compile_star_); // Line 527 Column 2
} else {return (function() {if(_eq__eq_(sym,"\uFDD1begin")) {return compile_dash_begin(node,generator,compile_star_,expr_p_,top_p_); // Line 527 Column 2
} else {return (function() {if(_eq__eq_(sym,"\uFDD1%raw")) {return generator["write-raw-code"](cadr(ast["node-data"](node))); // Line 527 Column 2
} else {return (function() {if(native_p_(sym)) {return native_dash_function(sym)(node,generator,expr_p_,compile_star_); // Line 527 Column 2
} else {(function() {if(not((symbol_p_(ast["first*"](node)) || list_p_(ast["first*"](node))))) {throw(str("operator is not a procedure: ",ast["first*"](node))); // Line 527 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
return generator["write-func-call"](ast["first"](node),cdr(ast["node-data"](node)),expr_p_,compile_star_); // Line 527 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o74 = ast["first*"](node);
return o73(o74); // Line 527 Column 2
}))(); // Line 527 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _per_optimize_dash_mode = 0;
var compile_dash_program = (function(src,generator){
(function() {if(not(macro_dash_generator)) {macro_dash_generator = generator;
}})()
; // Line <unknown undefined> Column <unknown undefined>
return ((function() {var o75 = (function(exp){
compile(expand(exp),generator,false,true); // Line 567 Column 2
return generator["get-code"](); // Line 567 Column 2
});
var o76 = (function() {if(string_p_(src)) {return reader["read"](src); // Line 567 Column 2
} else {return sourcify(src,0,0); // Line 567 Column 2
}})()
;
return o75(o76); // Line 567 Column 2
}))(); // Line 567 Column 2
});
module["exports"] = dict("\uFDD0read",(function(e){
return desourcify(reader["read"](e)); // Line 589 Column 41
}),"\uFDD0expand",expand,"\uFDD0compile",(function(e,g){
return compile(e,g,false,true); // Line 591 Column 46
}),"\uFDD0compile-program",compile_dash_program,"\uFDD0desourcify",desourcify,"\uFDD0sourcify",sourcify,"\uFDD0pp",pp,"\uFDD0set-macro-generator",(function(g){
return (function() {if(not(macro_dash_generator)) {macro_dash_generator = g;
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),"\uFDD0set-optimizations",(function(n){
_per_optimize_dash_mode = n;
}));


},{"./ast":6,"./backends/js":7,"./cps":9,"./reader":11,"util":5}],9:[function(_dereq_,module,exports){
var util = _dereq_("util");var type = (function(obj){
return (function() {if(number_p_(obj)) {return "\uFDD1number"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(boolean_p_(obj)) {return "\uFDD1boolean"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(string_p_(obj)) {return "\uFDD1string"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(obj)) {return "\uFDD1null"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_p_(obj)) {return "\uFDD1list"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(vector_p_(obj)) {return "\uFDD1vector"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(obj)) {return "\uFDD1dict"; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var number_p_ = (function(obj){
return _eq__eq_(typeof obj,"number"); // Line 16 Column 3
});
var string_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && not(_eq__eq_(obj[0],"\uFDD0")) && not(_eq__eq_(obj[0],"\uFDD1"))); // Line <unknown undefined> Column <unknown undefined>
});
var symbol_p_ = (function(obj){
return ((_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD1"))); // Line <unknown undefined> Column <unknown undefined>
});
var key_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD0")); // Line <unknown undefined> Column <unknown undefined>
});
var boolean_p_ = (function(obj){
return (eq_p_(obj,true) || eq_p_(obj,false)); // Line <unknown undefined> Column <unknown undefined>
});
var null_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && eq_p_(obj["length"],1) && eq_p_(vector_dash_ref(obj,0),null)); // Line <unknown undefined> Column <unknown undefined>
});
var list_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && not(eq_p_(obj["list"],undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var vector_p_ = (function(obj){
return (not(list_p_(obj)) && not(null_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && not(eq_p_(obj["length"],undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var dict_p_ = (function(obj){
return (not(symbol_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && eq_p_(obj["length"],undefined)); // Line <unknown undefined> Column <unknown undefined>
});
var function_p_ = (function(obj){
return eq_p_(typeof obj,"function"); // Line 60 Column 3
});
var literal_p_ = (function(x){
return (key_p_(x) || number_p_(x) || string_p_(x) || boolean_p_(x) || null_p_(x)); // Line <unknown undefined> Column <unknown undefined>
});
var str = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return fold((function(el,acc){
return (acc + (function() {if(string_p_(el)) {return el; // Line <unknown undefined> Column <unknown undefined>
} else {return inspect(el); // Line 75 Column 36
}})()
); // Line <unknown undefined> Column <unknown undefined>
}),"",args); // Line 73 Column 5
});
var symbol_dash__gt_key = (function(sym){
return ("\uFDD0" + sym["substring"](1)); // Line <unknown undefined> Column <unknown undefined>
});
var key_dash__gt_symbol = (function(sym){
return ("\uFDD1" + sym["substring"](1)); // Line <unknown undefined> Column <unknown undefined>
});
var string_dash__gt_key = (function(str){
return ("\uFDD0" + str); // Line <unknown undefined> Column <unknown undefined>
});
var key_dash__gt_string = (function(key){
return key["substring"](1); // Line 89 Column 3
});
var string_dash__gt_symbol = (function(str){
return ("\uFDD1" + str); // Line <unknown undefined> Column <unknown undefined>
});
var symbol_dash__gt_string = (function(sym){
return sym["substring"](1); // Line 95 Column 3
});
var _emptylst = [null];
var list = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return args; // Line <unknown undefined> Column <unknown undefined>
});
var cons = (function(obj,lst){
return ((function() {var o1 = (function(res){
res.list = true;return res; // Line <unknown undefined> Column <unknown undefined>
});
var o2 = [obj, lst];
return o1(o2); // Line 106 Column 2
}))(); // Line 106 Column 2
});
var car = (function(lst){
return lst[0]});
var cdr = (function(lst){
return lst[1]});
var cadr = (function(lst){
return car(cdr(lst)); // Line 116 Column 20
});
var cddr = (function(lst){
return cdr(cdr(lst)); // Line 117 Column 20
});
var cdar = (function(lst){
return cdr(car(lst)); // Line 118 Column 20
});
var caddr = (function(lst){
return car(cdr(cdr(lst))); // Line 119 Column 21
});
var cdddr = (function(lst){
return cdr(cdr(cdr(lst))); // Line 120 Column 21
});
var cadar = (function(lst){
return car(cdr(car(lst))); // Line 121 Column 21
});
var cddar = (function(lst){
return cdr(cdr(car(lst))); // Line 122 Column 21
});
var caadr = (function(lst){
return car(car(cdr(lst))); // Line 123 Column 21
});
var cdadr = (function(lst){
return cdr(car(cdr(lst))); // Line 124 Column 21
});
var list_dash_ref = (function(lst,i){
return ((function() {var loop = (function(lst,i){
return (function() {if(null_p_(lst)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(eq_p_(i,0)) {return car(lst); // Line 127 Column 2
} else {return loop(cdr(lst),(i - 1)); // Line 127 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o3 = lst;
var o4 = i;
return loop(o3,o4); // Line 127 Column 2
}))(); // Line 127 Column 2
});
var length = (function(lst){
return fold((function(el,acc){
return (acc + 1); // Line <unknown undefined> Column <unknown undefined>
}),0,lst); // Line 135 Column 3
});
var list_dash_append = (function(){
var lsts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
var l_star_ = (function() {if(null_p_(lsts)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return lsts; // Line <unknown undefined> Column <unknown undefined>
}})()
;
return (function() {if(null_p_(l_star_)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(cdr(l_star_))) {return car(l_star_); // Line 144 Column 11
} else {return _list_dash_append(car(l_star_),apply(list_dash_append,cdr(l_star_))); // Line 145 Column 11
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _list_dash_append = (function(lst1,lst2){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return lst2; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(car(lst),loop(cdr(lst))); // Line 149 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o5 = lst1;
return loop(o5); // Line 149 Column 2
}))(); // Line 149 Column 2
});
var list_dash_find = (function(lst,val){
var rst = vector_dash__gt_list(Array.prototype.slice.call(arguments, 2));
return ((function() {var o6 = (function(access){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(access(car(lst)),val)) {return lst; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cdr(lst)); // Line 156 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o8 = lst;
return loop(o8); // Line 156 Column 2
}))(); // Line 156 Column 2
});
var o7 = (function() {if(null_p_(rst)) {return (function(x){
return x; // Line <unknown undefined> Column <unknown undefined>
}); // Line <unknown undefined> Column <unknown undefined>
} else {return car(rst); // Line 156 Column 2
}})()
;
return o6(o7); // Line 156 Column 2
}))(); // Line 156 Column 2
});
var map = (function(func,lst){
return (function() {if(null_p_(lst)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(func(car(lst)),map(func,cdr(lst))); // Line 167 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var for_dash_each = (function(func,lst){
return ((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {func(car(lst)); // Line 171 Column 2
return loop(cdr(lst)); // Line 171 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o9 = lst;
return loop(o9); // Line 171 Column 2
}))(); // Line 171 Column 2
});
var fold = (function(func,acc,lst){
return (function() {if(null_p_(lst)) {return acc; // Line <unknown undefined> Column <unknown undefined>
} else {return fold(func,func(car(lst),acc),cdr(lst)); // Line 180 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var reverse = (function(lst){
return (function() {if(null_p_(lst)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return list_dash_append(reverse(cdr(lst)),list(car(lst))); // Line 187 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash__gt_list = (function(vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return cons(vector_dash_ref(vec,i),loop((i + 1))); // Line 193 Column 2
} else {return _emptylst}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o10 = 0;
return loop(o10); // Line 193 Column 2
}))(); // Line 193 Column 2
});
var make_dash_vector = (function(count){
var val = arguments[1] || false;
return ((function() {var o11 = (function(v){
return (function() {if(val) {return ((function() {var loop = (function(i){
return (function() {if((i < count)) {vector_dash_put_excl_(v,i,val); // Line 202 Column 2
return loop((i + 1)); // Line 202 Column 2
} else {return v; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o13 = 0;
return loop(o13); // Line 202 Column 2
}))(); // Line 202 Column 2
} else {return v; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o12 = new Array(count);
return o11(o12); // Line 202 Column 2
}))(); // Line 202 Column 2
});
var vector = (function() {return Array.prototype.slice.call(arguments)});
var vector_dash_ref = (function(vec,i){
return vec[i]});
var vector_dash_put_excl_ = (function(vec,i,obj){
return vec[i] = obj});
var vector_dash_concat = (function(){
var vecs = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var loop = (function(lst,res){
return (function() {if(null_p_(lst)) {return res; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cdr(lst),res["concat"](car(lst))); // Line 222 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o14 = cdr(vecs);
var o15 = car(vecs);
return loop(o14,o15); // Line 222 Column 2
}))(); // Line 222 Column 2
});
var vector_dash_slice = (function(vec,start){
var end = arguments[2] || false;
return vec.slice(start, end || undefined)});
var vector_dash_push_excl_ = (function(vec,obj){
return vec.push(obj)});
var vector_dash_find = (function(vec,val){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return (function() {if(eq_p_(vector_dash_ref(vec,i),val)) {return i; // Line <unknown undefined> Column <unknown undefined>
} else {return loop((i + 1)); // Line 236 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o16 = 0;
return loop(o16); // Line 236 Column 2
}))(); // Line 236 Column 2
});
var vector_dash_length = (function(vec){
return vec["length"]; // Line <unknown undefined> Column <unknown undefined>
});
var list_dash__gt_vector = (function(lst){
var res = [];
for_dash_each((function(el){
return res["push"](el); // Line 248 Column 15
}),lst); // Line 247 Column 3
return res; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash_map = (function(func,vec){
var res = [];
((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {res["push"](func(vector_dash_ref(vec,i))); // Line 254 Column 2
return loop((i + 1)); // Line 254 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o17 = 0;
return loop(o17); // Line 254 Column 2
}))(); // Line 254 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash_for_dash_each = (function(func,vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {func(vector_dash_ref(vec,i)); // Line 262 Column 2
return loop((i + 1)); // Line 262 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o18 = 0;
return loop(o18); // Line 262 Column 2
}))(); // Line 262 Column 2
});
var vector_dash_fold = (function(func,acc,vec){
return ((function() {var loop = (function(i,acc){
return (function() {if((i < vector_dash_length(vec))) {return loop((i + 1),func(vector_dash_ref(vec,i),acc)); // Line 269 Column 2
} else {return acc; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o19 = 0;
var o20 = acc;
return loop(o19,o20); // Line 269 Column 2
}))(); // Line 269 Column 2
});
var dict = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
var res = {};
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o22 = (function(key,val){
dict_dash_put_excl_(res,key,val); // Line 281 Column 4
return loop(cddr(lst)); // Line 281 Column 4
});
var o23 = car(lst);
var o24 = cadr(lst);
return o22(o23,o24); // Line 281 Column 4
}))(); // Line 281 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o21 = args;
return loop(o21); // Line 281 Column 4
}))(); // Line 281 Column 4
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash_put_excl_ = (function(dct,k,v){
return dct[k.substring(1)] = v});
var dict_dash_ref = (function(dct,k){
return dct[k.substring(1)]});
var dict_dash_map = (function(func,dct){
var res = dict();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o26 = (function(k){
dict_dash_put_excl_(res,k,func(dict_dash_ref(dct,k))); // Line 297 Column 2
return loop(cdr(lst)); // Line 297 Column 2
});
var o27 = car(lst);
return o26(o27); // Line 297 Column 2
}))(); // Line 297 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o25 = keys(dct);
return loop(o25); // Line 297 Column 2
}))(); // Line 297 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash_merge = (function(){
var dcts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var o28 = (function(res){
for_dash_each((function(dct){
return for_dash_each((function(k){
return dict_dash_put_excl_(res,k,dict_dash_ref(dct,k)); // Line 306 Column 2
}),keys(dct)); // Line 306 Column 2
}),dcts); // Line 306 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var o29 = dict();
return o28(o29); // Line 306 Column 2
}))(); // Line 306 Column 2
});
var dict_dash__gt_vector = (function(dct){
var res = vector();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {vector_dash_push_excl_(res,car(lst)); // Line 316 Column 2
vector_dash_push_excl_(res,dict_dash_ref(dct,car(lst))); // Line 316 Column 2
return loop(cdr(lst)); // Line 316 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o30 = keys(dct);
return loop(o30); // Line 316 Column 2
}))(); // Line 316 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash__gt_list = (function(dct){
return vector_dash__gt_list(dict_dash__gt_vector(dct)); // Line 325 Column 3
});
var keys = (function(dct){
return ((function() {var o31 = (function(res){
for(var k in dct) {
       res = cons(string_dash__gt_key(k), res);
    }return res; // Line <unknown undefined> Column <unknown undefined>
});
var o32 = _emptylst;
return o31(o32); // Line 328 Column 2
}))(); // Line 328 Column 2
});
var vals = (function(dct){
return map((function(k){
return dict_dash_ref(dct,k); // Line 335 Column 20
}),keys(dct)); // Line 335 Column 3
});
var zip = (function(keys,vals){
var res = dict();
((function() {var loop = (function(ks,vs){
return (function() {if(not(null_p_(ks))) {dict_dash_put_excl_(res,car(ks),car(vs)); // Line 340 Column 2
return loop(cdr(ks),cdr(vs)); // Line 340 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o33 = keys;
var o34 = vals;
return loop(o33,o34); // Line 340 Column 2
}))(); // Line 340 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var not = (function(obj){
return (typeof obj !== 'number' && !obj); // Line <unknown undefined> Column <unknown undefined>
});
var _eq__eq_ = (function(obj1,obj2){
return obj1 === obj2});
var _eq_ = (function(obj1,obj2){
return (function() {if((list_p_(obj1) && list_p_(obj2))) {return ((function() {var loop = (function(lst1,lst2){
var n1 = null_p_(lst1);
var n2 = null_p_(lst2);
return (function() {if((n1 && n2)) {return true; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if((n1 || n2)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(equal_p_(car(lst1),car(lst2))) {return loop(cdr(lst1),cdr(lst2)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o35 = obj1;
var o36 = obj2;
return loop(o35,o36); // Line 360 Column 2
}))(); // Line 360 Column 2
} else {return (function() {if((vector_p_(obj1) && vector_p_(obj2))) {return (function() {if(not(_eq_(obj1["length"],obj2["length"]))) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return ((function() {var loop = (function(i){
return (function() {if((i < obj1["length"])) {return (function() {if(_eq_(vector_dash_ref(obj1,i),vector_dash_ref(obj2,i))) {return loop((i + 1)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return true; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o37 = 0;
return loop(o37); // Line 360 Column 2
}))(); // Line 360 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if((dict_p_(obj1) && dict_p_(obj2))) {return ((function() {var o38 = (function(keys1,keys2){
return (eq_p_(length(keys1),length(keys2)) && ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return true; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(equal_p_(dict_dash_ref(obj1,car(lst)),dict_dash_ref(obj2,car(lst)))) {return loop(cdr(lst)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o41 = keys1;
return loop(o41); // Line 360 Column 2
}))()); // Line <unknown undefined> Column <unknown undefined>
});
var o39 = keys(obj1);
var o40 = keys(obj2);
return o38(o39,o40); // Line 360 Column 2
}))(); // Line 360 Column 2
} else {return eq_p_(obj1,obj2); // Line 360 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var eq_p_ = _eq__eq_;
var equal_p_ = _eq_;
var print = (function(msg){
return util["print"](msg); // Line 408 Column 3
});
var println = (function(msg){
return util["puts"](msg); // Line 411 Column 3
});
var pp = (function(obj){
return println(inspect(obj)); // Line 414 Column 3
});
var _per_inspect_dash_non_dash_sequence = (function(obj){
return (function() {if(number_p_(obj)) {return ("" + obj); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(string_p_(obj)) {obj = obj["replace"](RegExp("\\\\","g"),"\\\\");
obj = obj["replace"](RegExp("\n","g"),"\\n");
obj = obj["replace"](RegExp("\r","g"),"\\r");
obj = obj["replace"](RegExp("\t","g"),"\\t");
obj = obj["replace"](RegExp("\"","g"),"\\\"");
return ("\"" + obj + "\""); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(key_p_(obj)) {return (":" + symbol_dash__gt_string(obj)); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(symbol_p_(obj)) {return symbol_dash__gt_string(obj); // Line 418 Column 2
} else {return (function() {if(boolean_p_(obj)) {return (function() {if(obj) {return "#t"; // Line <unknown undefined> Column <unknown undefined>
} else {return "#f"; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(obj)) {return "()"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(function_p_(obj)) {return "<function>"; // Line <unknown undefined> Column <unknown undefined>
} else {return ("<unknown " + obj + ">"); // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _per_recur_dash_protect = (function(obj,arg,func,halt){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 4));
return ((function() {var o42 = (function(parents){
return (function() {if(list_dash_find(parents,obj)) {return halt; // Line <unknown undefined> Column <unknown undefined>
} else {return func(obj,arg,(function(el,arg){
return _per_recur_dash_protect(el,arg,func,halt,cons(obj,parents)); // Line 435 Column 2
})); // Line 435 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o43 = (function() {if(null_p_(rest)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return car(rest); // Line 435 Column 2
}})()
;
return o42(o43); // Line 435 Column 2
}))(); // Line 435 Column 2
});
var _per_space = (function(obj){
return _per_recur_dash_protect(obj,false,(function(obj,arg,recur){
return (function() {if(list_p_(obj)) {return (length(obj) + 1 + fold((function(el,acc){
return (acc + recur(el,false)); // Line <unknown undefined> Column <unknown undefined>
}),0,obj)); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(obj)) {return recur(dict_dash__gt_list(obj),false); // Line 448 Column 5
} else {return (function() {if(vector_p_(obj)) {return recur(vector_dash__gt_list(obj),false); // Line 448 Column 5
} else {return vector_dash_length(_per_inspect_dash_non_dash_sequence(obj)); // Line 448 Column 5
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),vector_dash_length("<circular>")); // Line 444 Column 3
});
var inspect = (function(obj){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 1));
return ((function() {var o44 = (function(no_dash_newlines){
return _per_recur_dash_protect(obj,1,(function(obj,i,recur){
var buffer = "";
var get_dash_buffer = (function() {return buffer; // Line <unknown undefined> Column <unknown undefined>
});
var disp = (function(s){
buffer = (buffer + s);
});
var pad = (function(n){
return vector_dash_for_dash_each((function(_){
return disp(" "); // Line 468 Column 2
}),make_dash_vector(n)); // Line 468 Column 2
});
return (function() {if(list_p_(obj)) {return ((function() {var o46 = (function(sp,first){
disp("("); // Line 468 Column 2
for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(el,(i + 1))); // Line 468 Column 2
first = false;
}),obj); // Line 468 Column 2
disp(")"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o47 = (_per_space(obj) > 30);
var o48 = true;
return o46(o47,o48); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return (function() {if(vector_p_(obj)) {return ((function() {var o49 = (function(sp,first){
disp("["); // Line 468 Column 2
vector_dash_for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(el,(i + 1))); // Line 468 Column 2
first = false;
}),obj); // Line 468 Column 2
disp("]"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o50 = (_per_space(obj) > 30);
var o51 = true;
return o49(o50,o51); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return (function() {if(dict_p_(obj)) {return ((function() {var o52 = (function(sp,first){
disp("{"); // Line 468 Column 2
for_dash_each((function(k){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(k,i)); // Line 468 Column 2
disp(" "); // Line 468 Column 2
disp(recur(dict_dash_ref(obj,k),(i + 3 + vector_dash_length(symbol_dash__gt_string(k))))); // Line 468 Column 2
first = false;
}),keys(obj)); // Line 468 Column 2
disp("}"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o53 = (_per_space(obj) > 30);
var o54 = true;
return o52(o53,o54); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return _per_inspect_dash_non_dash_sequence(obj); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),"<circular>"); // Line 468 Column 2
});
var o45 = (function() {if(null_p_(rest)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return car(rest); // Line 468 Column 2
}})()
;
return o44(o45); // Line 468 Column 2
}))(); // Line 468 Column 2
});
var apply = (function(func,args){
return func.apply(null,list_dash__gt_vector(args)); // Line 542 Column 3
});
var trampoline_dash_result_p_ = (function(value){
return (vector_p_(value) && _eq_(vector_dash_ref(value,0),"__tco_call")); // Line <unknown undefined> Column <unknown undefined>
});
var trampoline = (function(value){
while(trampoline_dash_result_p_(value)) { value = value[1](); }return value; // Line <unknown undefined> Column <unknown undefined>
});
var _per_gensym_dash_base = 0;
var gensym_dash_fresh = (function() {_per_gensym_dash_base = 10000;
});
var gensym = (function() {_per_gensym_dash_base = (_per_gensym_dash_base + 1);
return string_dash__gt_symbol(("o" + _per_gensym_dash_base)); // Line 563 Column 3
});
var _per_breakpoints_dash_flag = true;
var breakpoint = (function(thunk_dash_msg){
_per_next_dash_thunk = thunk_dash_msg;
return debugger_dash_step(vector_dash_ref(thunk_dash_msg,1)); // Line 571 Column 3
});
var debugger_dash_step_p_ = false;
var start_dash_stepping = (function() {debugger_dash_step_p_ = true;
});
var stop_dash_stepping = (function() {debugger_dash_step_p_ = false;
});
var debugger_dash_stepping_p_ = (function() {return not(_eq__eq_(_per_next_dash_thunk,false)); // Line 581 Column 3
});
var enable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = true;
});
var disable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = false;
});
var debugger_dash_continue = (function() {return ((function() {var o55 = (function(thunk){
_per_next_dash_thunk = false;
return cps_dash_trampoline(thunk); // Line 590 Column 2
});
var o56 = vector_dash_ref(_per_next_dash_thunk,2)();
return o55(o56); // Line 590 Column 2
}))(); // Line 590 Column 2
});
var _per_next_dash_thunk = false;
var cps_dash_trampoline = (function(thunk_msg){
while(thunk_msg) {
     if(_per_breakpoints_dash_flag && (thunk_msg[0] || debugger_dash_step_p_)) {
       breakpoint(thunk_msg);
       break;
     }
     thunk_msg = thunk_msg[2](); }return false; // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_jump = (function(breakpoint,msg,to){
return vector(breakpoint,msg,to); // Line 617 Column 2
});
var cps_dash_halt = (function(v){
return list(list("\uFDD1lambda",_emptylst,v,false)); // Line 620 Column 4
});


var __compiler = _dereq_('./compiler');
var __generator = _dereq_('./backends/js');
var read = __compiler.read;
var atom_p_ = (function(exp){
return (number_p_(exp) || string_p_(exp) || boolean_p_(exp) || null_p_(exp) || symbol_p_(exp)); // Line <unknown undefined> Column <unknown undefined>
});
var inspect_dash_short = (function(exp){
return vector_dash_slice(inspect(exp),0,100); // Line 9 Column 3
});
var cps_dash_quote = (function(data){
return (function(k){
return k(list("\uFDD1quote",data)); // Line 13 Column 5
}); // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_set_excl_ = (function(_var_,form){
return (function(k){
return cps(form)((function(a){
return list("\uFDD1begin",list("\uFDD1cps-jump",false,inspect_dash_short(list("\uFDD1set!",_var_,a)),list("\uFDD1lambda",_emptylst,list("\uFDD1set!",_var_,a),k(list("\uFDD1quote","\uFDD1void"))))); // Line 19 Column 9
})); // Line 17 Column 5
}); // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_define = (function(var_slash_func,body){
return (function() {if(list_p_(var_slash_func)) {return (function(k){
return cps(list_dash_append(list("\uFDD1lambda",cdr(var_slash_func)),body))((function(a){
return list("\uFDD1begin",list("\uFDD1define",car(var_slash_func),a),k(list("\uFDD1quote","\uFDD1void"))); // Line 32 Column 13
})); // Line 30 Column 9
}); // Line <unknown undefined> Column <unknown undefined>
} else {return (function(k){
return cps(car(body))((function(a){
return list("\uFDD1begin",list("\uFDD1define",var_slash_func,a),k(list("\uFDD1quote","\uFDD1void"))); // Line 38 Column 13
})); // Line 36 Column 9
}); // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_if = (function(bool,form1,form2){
return (function(k){
return cps(bool)((function(b){
return list("\uFDD1if",b,cps(form1)(k),(function() {if(_eq__eq_(form2,false)) {return k(list("\uFDD1quote","\uFDD1void")); // Line 49 Column 18
} else {return cps(form2)(k); // Line 50 Column 18
}})()
); // Line 46 Column 9
})); // Line 44 Column 5
}); // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_begin = (function(e){
return (function() {if(list_p_(e)) {return (function() {if(list_p_(cdr(e))) {return ((function() {var o1 = (function(v){
return (function(k){
return cps(car(e))((function(a){
return list(list("\uFDD1lambda",list(v),cps_dash_begin(cdr(e))((function(v){
return k(v); // Line 55 Column 10
}))),a); // Line 55 Column 10
})); // Line 55 Column 10
}); // Line <unknown undefined> Column <unknown undefined>
});
var o2 = gensym();
return o1(o2); // Line 55 Column 10
}))(); // Line 55 Column 10
} else {return cps(car(e)); // Line 66 Column 11
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return cps(_emptylst); // Line 67 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_application = (function(e){
return (function(k){
return (function() {if(list_dash_find(primitives,car(e))) {return cps_dash_terms(cdr(e))((function(t){
return list("\uFDD1cps-jump",false,inspect_dash_short(list_dash_append(list(car(e)),t)),list("\uFDD1lambda",_emptylst,k(list_dash_append(list(car(e)),t)))); // Line 74 Column 13
})); // Line 72 Column 9
} else {return cps_dash_terms(e)((function(t){
return ((function() {var o3 = (function(d){
return list("\uFDD1cps-jump",false,inspect_dash_short(list_dash_append(list(car(t)),cdr(t))),list("\uFDD1lambda",_emptylst,list_dash_append(list(car(t),list("\uFDD1lambda",list(d),k(d))),cdr(t)))); // Line 80 Column 11
});
var o4 = gensym();
return o3(o4); // Line 80 Column 11
}))(); // Line 80 Column 11
})); // Line 78 Column 9
}})()
; // Line <unknown undefined> Column <unknown undefined>
}); // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_terms = (function(e){
return (function() {if(list_p_(e)) {return (function(k){
return cps(car(e))((function(a){
return cps_dash_terms(cdr(e))((function(as){
return k(cons(a,as)); // Line 93 Column 15
})); // Line 91 Column 12
})); // Line 89 Column 9
}); // Line <unknown undefined> Column <unknown undefined>
} else {return (function(k){
return k(_emptylst); // Line 94 Column 19
}); // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_abstraction = (function(vars,body){
return (function(k){
return k(((function() {var o5 = (function(c){
return list("\uFDD1lambda",list_dash_append(list(c),vars),cps(cons("\uFDD1begin",body))((function(a){
return list(c,a); // Line 98 Column 7
}))); // Line 98 Column 7
});
var o6 = gensym();
return o5(o6); // Line 98 Column 7
}))()); // Line 98 Column 5
}); // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_tilde = (function(func,args){
return (function(k){
return cps_dash_terms(args)((function(t){
return list_dash_append(list(func),t,list(list("\uFDD1lambda",list("\uFDD1err","\uFDD1msg"),list("\uFDD1cps-trampoline",list("\uFDD1cps-jump",false,"<callback>",list("\uFDD1lambda",_emptylst,k("\uFDD1msg"),false)))))); // Line 107 Column 9
})); // Line 105 Column 5
}); // Line <unknown undefined> Column <unknown undefined>
});
var primitives = list("\uFDD1and","\uFDD1or","\uFDD1+","\uFDD1-","\uFDD1*","\uFDD1/","\uFDD1%","\uFDD1>","\uFDD1<","\uFDD1<=","\uFDD1>=","\uFDD1>>","\uFDD1<<","\uFDD1bitwise-or","\uFDD1bitwise-and","\uFDD1type","\uFDD1number?","\uFDD1string?","\uFDD1symbol?","\uFDD1key?","\uFDD1boolean?","\uFDD1null?","\uFDD1list?","\uFDD1vector?","\uFDD1dict?","\uFDD1function?","\uFDD1literal?","\uFDD1str","\uFDD1symbol->key","\uFDD1key->symbol","\uFDD1string->key","\uFDD1key->string","\uFDD1string->symbol","\uFDD1symbol->string","\uFDD1_emptylst","\uFDD1list","\uFDD1cons","\uFDD1car","\uFDD1cdr","\uFDD1cadr","\uFDD1cddr","\uFDD1cdar","\uFDD1caddr","\uFDD1cdddr","\uFDD1cadar","\uFDD1cddar","\uFDD1caadr","\uFDD1cdadr","\uFDD1list-ref","\uFDD1length","\uFDD1list-append","\uFDD1_list-append","\uFDD1list-find","\uFDD1map","\uFDD1for-each","\uFDD1fold","\uFDD1reverse","\uFDD1vector->list","\uFDD1make-vector","\uFDD1vector","\uFDD1vector-ref","\uFDD1vector-put!","\uFDD1vector-concat","\uFDD1vector-slice","\uFDD1vector-push!","\uFDD1vector-find","\uFDD1vector-length","\uFDD1list->vector","\uFDD1vector-map","\uFDD1vector-for-each","\uFDD1vector-fold","\uFDD1dict","\uFDD1dict-put!","\uFDD1dict-ref","\uFDD1dict-map","\uFDD1dict-merge","\uFDD1dict->vector","\uFDD1dict->list","\uFDD1keys","\uFDD1vals","\uFDD1zip","\uFDD1not","\uFDD1==","\uFDD1=","\uFDD1eq?","\uFDD1equal?","\uFDD1print","\uFDD1println","\uFDD1pp","\uFDD1%inspect-non-sequence","\uFDD1%recur-protect","\uFDD1%space","\uFDD1inspect","\uFDD1apply","\uFDD1trampoline-result?","\uFDD1trampoline","\uFDD1%gensym-base","\uFDD1gensym-fresh","\uFDD1gensym","\uFDD1cps-trampoline","\uFDD1cps-jump","\uFDD1cps-halt","\uFDD1disable-breakpoints","\uFDD1enable-breakpoints","\uFDD1alert","\uFDD1RegExp","\uFDD1s.match","\uFDD1fs.readFileSync","\uFDD1throw","\uFDD1parseInt","\uFDD1parseFloat","\uFDD1setTimeout","\uFDD1ctx.fillRect","\uFDD1document.addEventListener","\uFDD1document.getElementById","\uFDD1canvas.getContext","\uFDD1Math.random","\uFDD1Math.floor","\uFDD1process.stdin.on","\uFDD1process.stdin.pause","\uFDD1process.stdin.resume","\uFDD1client.set","\uFDD1client.get","\uFDD1client.end","\uFDD1console.log","\uFDD1redis.createClient");
var cps = (function(e){
return (function() {if((atom_p_(e) || dict_p_(e) || vector_p_(e))) {return (function(k){
return k(e); // Line 250 Column 19
}); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_dash_find(list("\uFDD1require"),car(e))) {return (function(k){
return list("\uFDD1begin",e,k(list("\uFDD1quote","\uFDD1void"))); // Line 251 Column 6
}); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_dash_find(list("\uFDD1throw"),car(e))) {return (function(k){
return list("\uFDD1begin",e,k(list("\uFDD1quote","\uFDD1void"))); // Line 251 Column 6
}); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_dash_find(list("\uFDD1debug"),car(e))) {return (function(k){
return ((function() {var o7 = (function(res){
return list("\uFDD1begin",list("\uFDD1cps-jump",true,inspect_dash_short(cadr(e)),list("\uFDD1lambda",_emptylst,cps(cadr(e))((function(r){
return list(list("\uFDD1lambda",list(res),list("\uFDD1println",list("\uFDD1str","result: ",res)),k(res)),r); // Line 251 Column 6
}))))); // Line 251 Column 6
});
var o8 = gensym();
return o7(o8); // Line 251 Column 6
}))(); // Line 251 Column 6
}); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_dash_find(list("\uFDD1callback"),car(e))) {return (function(k){
return k(list("\uFDD1lambda",cadr(e),list("\uFDD1cps-trampoline",list("\uFDD1cps-jump",false,inspect_dash_short(list_dash_append(list("\uFDD1lambda",cadr(e)),cddr(e))),list("\uFDD1lambda",_emptylst,cps(cons("\uFDD1begin",cddr(e)))((function(r){
return false; // Line <unknown undefined> Column <unknown undefined>
}))))))); // Line 251 Column 6
}); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_dash_find(list("\uFDD1~"),car(e))) {return cps_dash_tilde(cadr(e),cddr(e)); // Line 251 Column 6
} else {return (function() {if(list_dash_find(list("\uFDD1quote"),car(e))) {return cps_dash_quote(cadr(e)); // Line 251 Column 6
} else {return (function() {if(list_dash_find(list("\uFDD1if"),car(e))) {return cps_dash_if(cadr(e),caddr(e),(function() {if(null_p_(cdddr(e))) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return car(cdddr(e)); // Line 251 Column 6
}})()
); // Line 251 Column 6
} else {return (function() {if(list_dash_find(list("\uFDD1begin"),car(e))) {return cps_dash_begin(cdr(e)); // Line 251 Column 6
} else {return (function() {if(list_dash_find(list("\uFDD1set!"),car(e))) {return cps_dash_set_excl_(cadr(e),caddr(e)); // Line 251 Column 6
} else {return (function() {if(list_dash_find(list("\uFDD1define"),car(e))) {return cps_dash_define(cadr(e),cddr(e)); // Line 251 Column 6
} else {return (function() {if(list_dash_find(list("\uFDD1lambda"),car(e))) {return cps_dash_abstraction(cadr(e),cddr(e)); // Line 251 Column 6
} else {return cps_dash_application(e); // Line 251 Column 6
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
module["exports"] = dict("\uFDD0cps",cps);


},{"./backends/js":7,"./compiler":8,"util":5}],10:[function(_dereq_,module,exports){
exports.compiler = _dereq_('./compiler') 
exports.js = _dereq_('./backends/js')

},{"./backends/js":7,"./compiler":8}],11:[function(_dereq_,module,exports){
var util = _dereq_("util");var type = (function(obj){
return (function() {if(number_p_(obj)) {return "\uFDD1number"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(boolean_p_(obj)) {return "\uFDD1boolean"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(string_p_(obj)) {return "\uFDD1string"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(obj)) {return "\uFDD1null"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(list_p_(obj)) {return "\uFDD1list"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(vector_p_(obj)) {return "\uFDD1vector"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(obj)) {return "\uFDD1dict"; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var number_p_ = (function(obj){
return _eq__eq_(typeof obj,"number"); // Line 16 Column 3
});
var string_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && not(_eq__eq_(obj[0],"\uFDD0")) && not(_eq__eq_(obj[0],"\uFDD1"))); // Line <unknown undefined> Column <unknown undefined>
});
var symbol_p_ = (function(obj){
return ((_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD1"))); // Line <unknown undefined> Column <unknown undefined>
});
var key_p_ = (function(obj){
return (_eq__eq_(typeof obj,"string") && _eq__eq_(obj[0],"\uFDD0")); // Line <unknown undefined> Column <unknown undefined>
});
var boolean_p_ = (function(obj){
return (eq_p_(obj,true) || eq_p_(obj,false)); // Line <unknown undefined> Column <unknown undefined>
});
var null_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && eq_p_(obj["length"],1) && eq_p_(vector_dash_ref(obj,0),null)); // Line <unknown undefined> Column <unknown undefined>
});
var list_p_ = (function(obj){
return (!!obj && not(eq_p_(obj["length"],undefined)) && not(eq_p_(obj["list"],undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var vector_p_ = (function(obj){
return (not(list_p_(obj)) && not(null_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && not(eq_p_(obj["length"],undefined))); // Line <unknown undefined> Column <unknown undefined>
});
var dict_p_ = (function(obj){
return (not(symbol_p_(obj)) && !!obj && eq_p_(typeof obj,"object") && eq_p_(obj["length"],undefined)); // Line <unknown undefined> Column <unknown undefined>
});
var function_p_ = (function(obj){
return eq_p_(typeof obj,"function"); // Line 60 Column 3
});
var literal_p_ = (function(x){
return (key_p_(x) || number_p_(x) || string_p_(x) || boolean_p_(x) || null_p_(x)); // Line <unknown undefined> Column <unknown undefined>
});
var str = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return fold((function(el,acc){
return (acc + (function() {if(string_p_(el)) {return el; // Line <unknown undefined> Column <unknown undefined>
} else {return inspect(el); // Line 75 Column 36
}})()
); // Line <unknown undefined> Column <unknown undefined>
}),"",args); // Line 73 Column 5
});
var symbol_dash__gt_key = (function(sym){
return ("\uFDD0" + sym["substring"](1)); // Line <unknown undefined> Column <unknown undefined>
});
var key_dash__gt_symbol = (function(sym){
return ("\uFDD1" + sym["substring"](1)); // Line <unknown undefined> Column <unknown undefined>
});
var string_dash__gt_key = (function(str){
return ("\uFDD0" + str); // Line <unknown undefined> Column <unknown undefined>
});
var key_dash__gt_string = (function(key){
return key["substring"](1); // Line 89 Column 3
});
var string_dash__gt_symbol = (function(str){
return ("\uFDD1" + str); // Line <unknown undefined> Column <unknown undefined>
});
var symbol_dash__gt_string = (function(sym){
return sym["substring"](1); // Line 95 Column 3
});
var _emptylst = [null];
var list = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
return args; // Line <unknown undefined> Column <unknown undefined>
});
var cons = (function(obj,lst){
return ((function() {var o1 = (function(res){
res.list = true;return res; // Line <unknown undefined> Column <unknown undefined>
});
var o2 = [obj, lst];
return o1(o2); // Line 106 Column 2
}))(); // Line 106 Column 2
});
var car = (function(lst){
return lst[0]});
var cdr = (function(lst){
return lst[1]});
var cadr = (function(lst){
return car(cdr(lst)); // Line 116 Column 20
});
var cddr = (function(lst){
return cdr(cdr(lst)); // Line 117 Column 20
});
var cdar = (function(lst){
return cdr(car(lst)); // Line 118 Column 20
});
var caddr = (function(lst){
return car(cdr(cdr(lst))); // Line 119 Column 21
});
var cdddr = (function(lst){
return cdr(cdr(cdr(lst))); // Line 120 Column 21
});
var cadar = (function(lst){
return car(cdr(car(lst))); // Line 121 Column 21
});
var cddar = (function(lst){
return cdr(cdr(car(lst))); // Line 122 Column 21
});
var caadr = (function(lst){
return car(car(cdr(lst))); // Line 123 Column 21
});
var cdadr = (function(lst){
return cdr(car(cdr(lst))); // Line 124 Column 21
});
var list_dash_ref = (function(lst,i){
return ((function() {var loop = (function(lst,i){
return (function() {if(null_p_(lst)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(eq_p_(i,0)) {return car(lst); // Line 127 Column 2
} else {return loop(cdr(lst),(i - 1)); // Line 127 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o3 = lst;
var o4 = i;
return loop(o3,o4); // Line 127 Column 2
}))(); // Line 127 Column 2
});
var length = (function(lst){
return fold((function(el,acc){
return (acc + 1); // Line <unknown undefined> Column <unknown undefined>
}),0,lst); // Line 135 Column 3
});
var list_dash_append = (function(){
var lsts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
var l_star_ = (function() {if(null_p_(lsts)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return lsts; // Line <unknown undefined> Column <unknown undefined>
}})()
;
return (function() {if(null_p_(l_star_)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(cdr(l_star_))) {return car(l_star_); // Line 144 Column 11
} else {return _list_dash_append(car(l_star_),apply(list_dash_append,cdr(l_star_))); // Line 145 Column 11
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _list_dash_append = (function(lst1,lst2){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return lst2; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(car(lst),loop(cdr(lst))); // Line 149 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o5 = lst1;
return loop(o5); // Line 149 Column 2
}))(); // Line 149 Column 2
});
var list_dash_find = (function(lst,val){
var rst = vector_dash__gt_list(Array.prototype.slice.call(arguments, 2));
return ((function() {var o6 = (function(access){
return ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(access(car(lst)),val)) {return lst; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cdr(lst)); // Line 156 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o8 = lst;
return loop(o8); // Line 156 Column 2
}))(); // Line 156 Column 2
});
var o7 = (function() {if(null_p_(rst)) {return (function(x){
return x; // Line <unknown undefined> Column <unknown undefined>
}); // Line <unknown undefined> Column <unknown undefined>
} else {return car(rst); // Line 156 Column 2
}})()
;
return o6(o7); // Line 156 Column 2
}))(); // Line 156 Column 2
});
var map = (function(func,lst){
return (function() {if(null_p_(lst)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return cons(func(car(lst)),map(func,cdr(lst))); // Line 167 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var for_dash_each = (function(func,lst){
return ((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {func(car(lst)); // Line 171 Column 2
return loop(cdr(lst)); // Line 171 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o9 = lst;
return loop(o9); // Line 171 Column 2
}))(); // Line 171 Column 2
});
var fold = (function(func,acc,lst){
return (function() {if(null_p_(lst)) {return acc; // Line <unknown undefined> Column <unknown undefined>
} else {return fold(func,func(car(lst),acc),cdr(lst)); // Line 180 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var reverse = (function(lst){
return (function() {if(null_p_(lst)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return list_dash_append(reverse(cdr(lst)),list(car(lst))); // Line 187 Column 7
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash__gt_list = (function(vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return cons(vector_dash_ref(vec,i),loop((i + 1))); // Line 193 Column 2
} else {return _emptylst}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o10 = 0;
return loop(o10); // Line 193 Column 2
}))(); // Line 193 Column 2
});
var make_dash_vector = (function(count){
var val = arguments[1] || false;
return ((function() {var o11 = (function(v){
return (function() {if(val) {return ((function() {var loop = (function(i){
return (function() {if((i < count)) {vector_dash_put_excl_(v,i,val); // Line 202 Column 2
return loop((i + 1)); // Line 202 Column 2
} else {return v; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o13 = 0;
return loop(o13); // Line 202 Column 2
}))(); // Line 202 Column 2
} else {return v; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o12 = new Array(count);
return o11(o12); // Line 202 Column 2
}))(); // Line 202 Column 2
});
var vector = (function() {return Array.prototype.slice.call(arguments)});
var vector_dash_ref = (function(vec,i){
return vec[i]});
var vector_dash_put_excl_ = (function(vec,i,obj){
return vec[i] = obj});
var vector_dash_concat = (function(){
var vecs = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var loop = (function(lst,res){
return (function() {if(null_p_(lst)) {return res; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cdr(lst),res["concat"](car(lst))); // Line 222 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o14 = cdr(vecs);
var o15 = car(vecs);
return loop(o14,o15); // Line 222 Column 2
}))(); // Line 222 Column 2
});
var vector_dash_slice = (function(vec,start){
var end = arguments[2] || false;
return vec.slice(start, end || undefined)});
var vector_dash_push_excl_ = (function(vec,obj){
return vec.push(obj)});
var vector_dash_find = (function(vec,val){
return ((function() {var loop = (function(i){
return (function() {if((i < vec.length)) {return (function() {if(eq_p_(vector_dash_ref(vec,i),val)) {return i; // Line <unknown undefined> Column <unknown undefined>
} else {return loop((i + 1)); // Line 236 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o16 = 0;
return loop(o16); // Line 236 Column 2
}))(); // Line 236 Column 2
});
var vector_dash_length = (function(vec){
return vec["length"]; // Line <unknown undefined> Column <unknown undefined>
});
var list_dash__gt_vector = (function(lst){
var res = [];
for_dash_each((function(el){
return res["push"](el); // Line 248 Column 15
}),lst); // Line 247 Column 3
return res; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash_map = (function(func,vec){
var res = [];
((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {res["push"](func(vector_dash_ref(vec,i))); // Line 254 Column 2
return loop((i + 1)); // Line 254 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o17 = 0;
return loop(o17); // Line 254 Column 2
}))(); // Line 254 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var vector_dash_for_dash_each = (function(func,vec){
return ((function() {var loop = (function(i){
return (function() {if((i < vec["length"])) {func(vector_dash_ref(vec,i)); // Line 262 Column 2
return loop((i + 1)); // Line 262 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o18 = 0;
return loop(o18); // Line 262 Column 2
}))(); // Line 262 Column 2
});
var vector_dash_fold = (function(func,acc,vec){
return ((function() {var loop = (function(i,acc){
return (function() {if((i < vector_dash_length(vec))) {return loop((i + 1),func(vector_dash_ref(vec,i),acc)); // Line 269 Column 2
} else {return acc; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o19 = 0;
var o20 = acc;
return loop(o19,o20); // Line 269 Column 2
}))(); // Line 269 Column 2
});
var dict = (function() {
var args = vector_dash__gt_list(Array.prototype.slice.call(arguments));
var res = {};
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o22 = (function(key,val){
dict_dash_put_excl_(res,key,val); // Line 281 Column 4
return loop(cddr(lst)); // Line 281 Column 4
});
var o23 = car(lst);
var o24 = cadr(lst);
return o22(o23,o24); // Line 281 Column 4
}))(); // Line 281 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o21 = args;
return loop(o21); // Line 281 Column 4
}))(); // Line 281 Column 4
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash_put_excl_ = (function(dct,k,v){
return dct[k.substring(1)] = v});
var dict_dash_ref = (function(dct,k){
return dct[k.substring(1)]});
var dict_dash_map = (function(func,dct){
var res = dict();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {return ((function() {var o26 = (function(k){
dict_dash_put_excl_(res,k,func(dict_dash_ref(dct,k))); // Line 297 Column 2
return loop(cdr(lst)); // Line 297 Column 2
});
var o27 = car(lst);
return o26(o27); // Line 297 Column 2
}))(); // Line 297 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o25 = keys(dct);
return loop(o25); // Line 297 Column 2
}))(); // Line 297 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash_merge = (function(){
var dcts = vector_dash__gt_list(Array.prototype.slice.call(arguments, 0));
return ((function() {var o28 = (function(res){
for_dash_each((function(dct){
return for_dash_each((function(k){
return dict_dash_put_excl_(res,k,dict_dash_ref(dct,k)); // Line 306 Column 2
}),keys(dct)); // Line 306 Column 2
}),dcts); // Line 306 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var o29 = dict();
return o28(o29); // Line 306 Column 2
}))(); // Line 306 Column 2
});
var dict_dash__gt_vector = (function(dct){
var res = vector();
((function() {var loop = (function(lst){
return (function() {if(not(null_p_(lst))) {vector_dash_push_excl_(res,car(lst)); // Line 316 Column 2
vector_dash_push_excl_(res,dict_dash_ref(dct,car(lst))); // Line 316 Column 2
return loop(cdr(lst)); // Line 316 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o30 = keys(dct);
return loop(o30); // Line 316 Column 2
}))(); // Line 316 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var dict_dash__gt_list = (function(dct){
return vector_dash__gt_list(dict_dash__gt_vector(dct)); // Line 325 Column 3
});
var keys = (function(dct){
return ((function() {var o31 = (function(res){
for(var k in dct) {
       res = cons(string_dash__gt_key(k), res);
    }return res; // Line <unknown undefined> Column <unknown undefined>
});
var o32 = _emptylst;
return o31(o32); // Line 328 Column 2
}))(); // Line 328 Column 2
});
var vals = (function(dct){
return map((function(k){
return dict_dash_ref(dct,k); // Line 335 Column 20
}),keys(dct)); // Line 335 Column 3
});
var zip = (function(keys,vals){
var res = dict();
((function() {var loop = (function(ks,vs){
return (function() {if(not(null_p_(ks))) {dict_dash_put_excl_(res,car(ks),car(vs)); // Line 340 Column 2
return loop(cdr(ks),cdr(vs)); // Line 340 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o33 = keys;
var o34 = vals;
return loop(o33,o34); // Line 340 Column 2
}))(); // Line 340 Column 2
return res; // Line <unknown undefined> Column <unknown undefined>
});
var not = (function(obj){
return (typeof obj !== 'number' && !obj); // Line <unknown undefined> Column <unknown undefined>
});
var _eq__eq_ = (function(obj1,obj2){
return obj1 === obj2});
var _eq_ = (function(obj1,obj2){
return (function() {if((list_p_(obj1) && list_p_(obj2))) {return ((function() {var loop = (function(lst1,lst2){
var n1 = null_p_(lst1);
var n2 = null_p_(lst2);
return (function() {if((n1 && n2)) {return true; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if((n1 || n2)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(equal_p_(car(lst1),car(lst2))) {return loop(cdr(lst1),cdr(lst2)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o35 = obj1;
var o36 = obj2;
return loop(o35,o36); // Line 360 Column 2
}))(); // Line 360 Column 2
} else {return (function() {if((vector_p_(obj1) && vector_p_(obj2))) {return (function() {if(not(_eq_(obj1["length"],obj2["length"]))) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return ((function() {var loop = (function(i){
return (function() {if((i < obj1["length"])) {return (function() {if(_eq_(vector_dash_ref(obj1,i),vector_dash_ref(obj2,i))) {return loop((i + 1)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return true; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o37 = 0;
return loop(o37); // Line 360 Column 2
}))(); // Line 360 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if((dict_p_(obj1) && dict_p_(obj2))) {return ((function() {var o38 = (function(keys1,keys2){
return (eq_p_(length(keys1),length(keys2)) && ((function() {var loop = (function(lst){
return (function() {if(null_p_(lst)) {return true; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(equal_p_(dict_dash_ref(obj1,car(lst)),dict_dash_ref(obj2,car(lst)))) {return loop(cdr(lst)); // Line 360 Column 2
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o41 = keys1;
return loop(o41); // Line 360 Column 2
}))()); // Line <unknown undefined> Column <unknown undefined>
});
var o39 = keys(obj1);
var o40 = keys(obj2);
return o38(o39,o40); // Line 360 Column 2
}))(); // Line 360 Column 2
} else {return eq_p_(obj1,obj2); // Line 360 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var eq_p_ = _eq__eq_;
var equal_p_ = _eq_;
var print = (function(msg){
return util["print"](msg); // Line 408 Column 3
});
var println = (function(msg){
return util["puts"](msg); // Line 411 Column 3
});
var pp = (function(obj){
return println(inspect(obj)); // Line 414 Column 3
});
var _per_inspect_dash_non_dash_sequence = (function(obj){
return (function() {if(number_p_(obj)) {return ("" + obj); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(string_p_(obj)) {obj = obj["replace"](RegExp("\\\\","g"),"\\\\");
obj = obj["replace"](RegExp("\n","g"),"\\n");
obj = obj["replace"](RegExp("\r","g"),"\\r");
obj = obj["replace"](RegExp("\t","g"),"\\t");
obj = obj["replace"](RegExp("\"","g"),"\\\"");
return ("\"" + obj + "\""); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(key_p_(obj)) {return (":" + symbol_dash__gt_string(obj)); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(symbol_p_(obj)) {return symbol_dash__gt_string(obj); // Line 418 Column 2
} else {return (function() {if(boolean_p_(obj)) {return (function() {if(obj) {return "#t"; // Line <unknown undefined> Column <unknown undefined>
} else {return "#f"; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(null_p_(obj)) {return "()"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(function_p_(obj)) {return "<function>"; // Line <unknown undefined> Column <unknown undefined>
} else {return ("<unknown " + obj + ">"); // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var _per_recur_dash_protect = (function(obj,arg,func,halt){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 4));
return ((function() {var o42 = (function(parents){
return (function() {if(list_dash_find(parents,obj)) {return halt; // Line <unknown undefined> Column <unknown undefined>
} else {return func(obj,arg,(function(el,arg){
return _per_recur_dash_protect(el,arg,func,halt,cons(obj,parents)); // Line 435 Column 2
})); // Line 435 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o43 = (function() {if(null_p_(rest)) {return _emptylst; // Line <unknown undefined> Column <unknown undefined>
} else {return car(rest); // Line 435 Column 2
}})()
;
return o42(o43); // Line 435 Column 2
}))(); // Line 435 Column 2
});
var _per_space = (function(obj){
return _per_recur_dash_protect(obj,false,(function(obj,arg,recur){
return (function() {if(list_p_(obj)) {return (length(obj) + 1 + fold((function(el,acc){
return (acc + recur(el,false)); // Line <unknown undefined> Column <unknown undefined>
}),0,obj)); // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_(obj)) {return recur(dict_dash__gt_list(obj),false); // Line 448 Column 5
} else {return (function() {if(vector_p_(obj)) {return recur(vector_dash__gt_list(obj),false); // Line 448 Column 5
} else {return vector_dash_length(_per_inspect_dash_non_dash_sequence(obj)); // Line 448 Column 5
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),vector_dash_length("<circular>")); // Line 444 Column 3
});
var inspect = (function(obj){
var rest = vector_dash__gt_list(Array.prototype.slice.call(arguments, 1));
return ((function() {var o44 = (function(no_dash_newlines){
return _per_recur_dash_protect(obj,1,(function(obj,i,recur){
var buffer = "";
var get_dash_buffer = (function() {return buffer; // Line <unknown undefined> Column <unknown undefined>
});
var disp = (function(s){
buffer = (buffer + s);
});
var pad = (function(n){
return vector_dash_for_dash_each((function(_){
return disp(" "); // Line 468 Column 2
}),make_dash_vector(n)); // Line 468 Column 2
});
return (function() {if(list_p_(obj)) {return ((function() {var o46 = (function(sp,first){
disp("("); // Line 468 Column 2
for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(el,(i + 1))); // Line 468 Column 2
first = false;
}),obj); // Line 468 Column 2
disp(")"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o47 = (_per_space(obj) > 30);
var o48 = true;
return o46(o47,o48); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return (function() {if(vector_p_(obj)) {return ((function() {var o49 = (function(sp,first){
disp("["); // Line 468 Column 2
vector_dash_for_dash_each((function(el){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(el,(i + 1))); // Line 468 Column 2
first = false;
}),obj); // Line 468 Column 2
disp("]"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o50 = (_per_space(obj) > 30);
var o51 = true;
return o49(o50,o51); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return (function() {if(dict_p_(obj)) {return ((function() {var o52 = (function(sp,first){
disp("{"); // Line 468 Column 2
for_dash_each((function(k){
(function() {if(not(first)) {return (function() {if((sp && not(no_dash_newlines))) {disp("\n"); // Line 468 Column 2
return pad(i); // Line 468 Column 2
} else {return disp(" "); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
disp(recur(k,i)); // Line 468 Column 2
disp(" "); // Line 468 Column 2
disp(recur(dict_dash_ref(obj,k),(i + 3 + vector_dash_length(symbol_dash__gt_string(k))))); // Line 468 Column 2
first = false;
}),keys(obj)); // Line 468 Column 2
disp("}"); // Line 468 Column 2
return get_dash_buffer(); // Line 468 Column 2
});
var o53 = (_per_space(obj) > 30);
var o54 = true;
return o52(o53,o54); // Line 468 Column 2
}))(); // Line 468 Column 2
} else {return _per_inspect_dash_non_dash_sequence(obj); // Line 468 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}),"<circular>"); // Line 468 Column 2
});
var o45 = (function() {if(null_p_(rest)) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return car(rest); // Line 468 Column 2
}})()
;
return o44(o45); // Line 468 Column 2
}))(); // Line 468 Column 2
});
var apply = (function(func,args){
return func.apply(null,list_dash__gt_vector(args)); // Line 542 Column 3
});
var trampoline_dash_result_p_ = (function(value){
return (vector_p_(value) && _eq_(vector_dash_ref(value,0),"__tco_call")); // Line <unknown undefined> Column <unknown undefined>
});
var trampoline = (function(value){
while(trampoline_dash_result_p_(value)) { value = value[1](); }return value; // Line <unknown undefined> Column <unknown undefined>
});
var _per_gensym_dash_base = 0;
var gensym_dash_fresh = (function() {_per_gensym_dash_base = 10000;
});
var gensym = (function() {_per_gensym_dash_base = (_per_gensym_dash_base + 1);
return string_dash__gt_symbol(("o" + _per_gensym_dash_base)); // Line 563 Column 3
});
var _per_breakpoints_dash_flag = true;
var breakpoint = (function(thunk_dash_msg){
_per_next_dash_thunk = thunk_dash_msg;
return debugger_dash_step(vector_dash_ref(thunk_dash_msg,1)); // Line 571 Column 3
});
var debugger_dash_step_p_ = false;
var start_dash_stepping = (function() {debugger_dash_step_p_ = true;
});
var stop_dash_stepping = (function() {debugger_dash_step_p_ = false;
});
var debugger_dash_stepping_p_ = (function() {return not(_eq__eq_(_per_next_dash_thunk,false)); // Line 581 Column 3
});
var enable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = true;
});
var disable_dash_breakpoints = (function() {_per_breakpoints_dash_flag = false;
});
var debugger_dash_continue = (function() {return ((function() {var o55 = (function(thunk){
_per_next_dash_thunk = false;
return cps_dash_trampoline(thunk); // Line 590 Column 2
});
var o56 = vector_dash_ref(_per_next_dash_thunk,2)();
return o55(o56); // Line 590 Column 2
}))(); // Line 590 Column 2
});
var _per_next_dash_thunk = false;
var cps_dash_trampoline = (function(thunk_msg){
while(thunk_msg) {
     if(_per_breakpoints_dash_flag && (thunk_msg[0] || debugger_dash_step_p_)) {
       breakpoint(thunk_msg);
       break;
     }
     thunk_msg = thunk_msg[2](); }return false; // Line <unknown undefined> Column <unknown undefined>
});
var cps_dash_jump = (function(breakpoint,msg,to){
return vector(breakpoint,msg,to); // Line 617 Column 2
});
var cps_dash_halt = (function(v){
return list(list("\uFDD1lambda",_emptylst,v,false)); // Line 620 Column 4
});


var fs = _dereq_("fs");var ast = _dereq_("./ast");var chars_dash_whitespace = " \n\t\r";
var chars_dash_special = "(){}[],@'`:";
var chars_dash_delim = str(chars_dash_whitespace,chars_dash_special,";");
var _in_ = (function(str,char){
return number_p_(vector_dash_find(str,char)); // Line 9 Column 3
});
var vec_dash_getter = (function(i){
return (function(vec){
return vector_dash_ref(vec,i); // Line 13 Column 5
}); // Line <unknown undefined> Column <unknown undefined>
});
var read = (function(src){
var index = 0;
var len = vector_dash_length(src);
var lineno = 0;
var colno = 0;
var current = (function() {return (function() {if(finished()) {return ""; // Line <unknown undefined> Column <unknown undefined>
} else {return vector_dash_ref(src,index); // Line 24 Column 9
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var previous = (function() {return vector_dash_ref(src,(index - 1)); // Line 27 Column 5
});
var forward = (function() {index = (index + 1);
return (function() {if(_eq__eq_(previous(),"\n")) {lineno = (lineno + 1);
colno = 0;
} else {colno = (colno + 1);
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var back = (function() {index = (index - 1);
return (function() {if(_eq__eq_(current(),"\n")) {lineno = (lineno - 1);
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var finished = (function() {return (index >= len); // Line <unknown undefined> Column <unknown undefined>
});
var skip_dash_whitespace = (function() {return ((function() {var loop = (function() {return (function() {if(_in_(chars_dash_whitespace,current())) {forward(); // Line 48 Column 4
return loop(); // Line 48 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
return loop(); // Line 48 Column 4
}))(); // Line 48 Column 4
});
var parse_dash_string = (function(lineno,colno){
return ((function() {var loop = (function(s){
forward(); // Line 55 Column 4
return (function() {if(_eq__eq_(current(),"\\")) {forward(); // Line 55 Column 4
return loop(str(s,((function() {var o2 = (function(c){
return (function() {if(_eq__eq_(c,"n")) {return "\n"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(c,"t")) {return "\t"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(c,"r")) {return "\r"; // Line <unknown undefined> Column <unknown undefined>
} else {return c; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o3 = current();
return o2(o3); // Line 55 Column 4
}))())); // Line 55 Column 4
} else {return (function() {if(_eq__eq_(current(),"\"")) {return make_dash_token("\uFDD1STRING",s,lineno,colno); // Line 55 Column 4
} else {return loop(str(s,current())); // Line 55 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o1 = "";
return loop(o1); // Line 55 Column 4
}))(); // Line 55 Column 4
});
var parse_dash_token = (function(s,lineno,colno){
return (function() {if(s["match"](RegExp("^[-+]?[0-9]+$"))) {return make_dash_token("\uFDD1INTEGER",s,lineno,colno); // Line 71 Column 4
} else {return (function() {if(s["match"](RegExp("^[-+]?[0-9]+\\.[0-9]*$"))) {return make_dash_token("\uFDD1FLOAT",s,lineno,colno); // Line 71 Column 4
} else {return (function() {if(s["match"](RegExp("^[-+]?0x"))) {return ((function() {var o4 = (function(m,prefix){
return (function() {if(m) {return make_dash_token("\uFDD1HEX",str(prefix,vector_dash_ref(m,1)),lineno,colno); // Line 71 Column 4
} else {throw(str("invalid hex value: ",s)); // Line 71 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o5 = s["match"](RegExp("0x([0-9a-fA-F]+)$"));
var o6 = (function() {if(_eq__eq_(vector_dash_ref(s,0),"-")) {return "-"; // Line <unknown undefined> Column <unknown undefined>
} else {return ""; // Line <unknown undefined> Column <unknown undefined>
}})()
;
return o4(o5,o6); // Line 71 Column 4
}))(); // Line 71 Column 4
} else {return (function() {if((_eq__eq_(s,"#f") || _eq__eq_(s,"#t"))) {return make_dash_token("\uFDD1BOOLEAN",s,lineno,colno); // Line 71 Column 4
} else {return make_dash_token("\uFDD1SYMBOL",s,lineno,colno); // Line 71 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var parse_dash_comment = (function(lineno,colno){
return ((function() {var loop = (function(s){
forward(); // Line 84 Column 4
return (function() {if((finished() || _eq__eq_(current(),"\n"))) {return make_dash_token("\uFDD1COMMENT",s,lineno,colno); // Line 84 Column 4
} else {return loop(str(s,current())); // Line 84 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o7 = "";
return loop(o7); // Line 84 Column 4
}))(); // Line 84 Column 4
});
var unique_dash_obj = list(true);
var make_dash_token = (function(type,data,lineno,colno){
return vector(unique_dash_obj,type,data,lineno,colno); // Line 98 Column 4
});
var token_dash_type = vec_dash_getter(1);
var token_dash_data = vec_dash_getter(2);
var token_dash_lineno = vec_dash_getter(3);
var token_dash_colno = vec_dash_getter(4);
var token_p_ = (function(tok){
return (vector_p_(tok) && _eq__eq_(vector_dash_ref(tok,0),unique_dash_obj)); // Line <unknown undefined> Column <unknown undefined>
});
var get_dash_token = (function() {skip_dash_whitespace(); // Line 110 Column 5
return ((function() {var o8 = (function(c,lineno,colno){
return (function() {if(_in_(chars_dash_special,c)) {forward(); // Line 111 Column 4
return make_dash_token("\uFDD1SPECIAL",c,lineno,colno); // Line 111 Column 4
} else {return (function() {if(_eq__eq_(c,"\"")) {return ((function() {var o12 = (function(s){
forward(); // Line 111 Column 4
return s; // Line <unknown undefined> Column <unknown undefined>
});
var o13 = parse_dash_string(lineno,colno);
return o12(o13); // Line 111 Column 4
}))(); // Line 111 Column 4
} else {return (function() {if(_eq__eq_(c,";")) {return parse_dash_comment(lineno,colno); // Line 111 Column 4
} else {return (function() {if(_eq__eq_(c,"")) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(finished()) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return ((function() {var loop = (function(s){
return (function() {if((_in_(chars_dash_delim,current()) || finished())) {return parse_dash_token(s,lineno,colno); // Line 111 Column 4
} else {forward(); // Line 111 Column 4
return loop(str(s,previous())); // Line 111 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o14 = "";
return loop(o14); // Line 111 Column 4
}))(); // Line 111 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o9 = current();
var o10 = lineno;
var o11 = colno;
return o8(o9,o10,o11); // Line 111 Column 4
}))(); // Line 111 Column 4
});
var token_dash__gt_exp = (function(token){
return ((function() {var o15 = (function(type,data){
return (function() {if(_eq__eq_(type,"\uFDD1STRING")) {return data; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(type,"\uFDD1SYMBOL")) {return string_dash__gt_symbol(data); // Line 138 Column 4
} else {return (function() {if(_eq__eq_(type,"\uFDD1BOOLEAN")) {return (function() {if(_eq__eq_(data,"#f")) {return false; // Line <unknown undefined> Column <unknown undefined>
} else {return true; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(_eq__eq_(type,"\uFDD1INTEGER")) {return parseInt(data); // Line 138 Column 4
} else {return (function() {if(_eq__eq_(type,"\uFDD1FLOAT")) {return parseFloat(data); // Line 138 Column 4
} else {return (function() {if(_eq__eq_(type,"\uFDD1HEX")) {return parseInt(data,16); // Line 138 Column 4
} else {throw(str("cannot convert token to exp: ",token)); // Line 138 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o16 = token_dash_type(token);
var o17 = token_dash_data(token);
return o15(o16,o17); // Line 138 Column 4
}))(); // Line 138 Column 4
});
var special_p_ = (function(t,chars){
return (token_p_(t) && _eq__eq_(token_dash_type(t),"\uFDD1SPECIAL") && _in_(chars,token_dash_data(t))); // Line <unknown undefined> Column <unknown undefined>
});
var compound_dash_start_p_ = (function(t){
return (special_p_(t,"(") || special_p_(t,"[") || special_p_(t,"{")); // Line <unknown undefined> Column <unknown undefined>
});
var compound_dash_end_p_ = (function(t){
return (special_p_(t,")") || special_p_(t,"]") || special_p_(t,"}")); // Line <unknown undefined> Column <unknown undefined>
});
var end_p_ = (function(t){
return (token_p_(t) && _eq__eq_(token_dash_type(t),"\uFDD1END")); // Line <unknown undefined> Column <unknown undefined>
});
var read_dash_exp = (function() {return ((function() {var o18 = (function(token){
return (function() {if(not(token)) {return make_dash_token("\uFDD1END",false,false,false); // Line 170 Column 4
} else {return (function() {if(compound_dash_end_p_(token)) {return token; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(compound_dash_start_p_(token)) {return ((function() {var loop = (function(lst,exp){
return (function() {if((end_p_(exp) || compound_dash_end_p_(exp))) {var in_dash_list_p_ = special_p_(token,"(");
var in_dash_vector_p_ = special_p_(token,"[");
var in_dash_dict_p_ = special_p_(token,"{");
return (function() {if((in_dash_list_p_ && special_p_(exp,")"))) {return ast["make-node"]("\uFDD1LIST",reverse(lst),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
} else {return (function() {if((in_dash_vector_p_ && special_p_(exp,"]"))) {return ast["make-node"]("\uFDD1VECTOR",reverse(lst),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
} else {return (function() {if((in_dash_dict_p_ && special_p_(exp,"}"))) {return ast["make-node"]("\uFDD1DICT",reverse(lst),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
} else {throw(str("unterminated ",(function() {if(list_p_) {return "list"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(vector_p_) {return "vector"; // Line <unknown undefined> Column <unknown undefined>
} else {return (function() {if(dict_p_) {return "dict"; // Line <unknown undefined> Column <unknown undefined>
} else {return false; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
)); // Line 170 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cons(exp,lst),read_dash_exp()); // Line 170 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o20 = _emptylst;
var o21 = read_dash_exp();
return loop(o20,o21); // Line 170 Column 4
}))(); // Line 170 Column 4
} else {return (function() {if(special_p_(token,"'")) {return ast["make-node"]("\uFDD1LIST",list(ast["make-node"]("\uFDD1ATOM","\uFDD1quote",token_dash_lineno(token),token_dash_colno(token)),read_dash_exp()),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
} else {return (function() {if(special_p_(token,":")) {return ((function() {var o22 = (function(e){
(function() {if((not(ast["atom?"](e)) || not(symbol_p_(ast["node-data"](e))))) {throw(str("invalid key expression: ",ast["node-data"](e))); // Line 170 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
return ast["make-node"]("\uFDD1ATOM",symbol_dash__gt_key(ast["node-data"](e)),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
});
var o23 = read_dash_exp();
return o22(o23); // Line 170 Column 4
}))(); // Line 170 Column 4
} else {return (function() {if(special_p_(token,"`")) {return ast["make-node"]("\uFDD1LIST",list(ast["make-node"]("\uFDD1ATOM","\uFDD1quasiquote",token_dash_lineno(token),token_dash_colno(token)),read_dash_exp()),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
} else {return (function() {if(special_p_(token,",")) {return ((function() {var o24 = (function(next){
return (function() {if(_eq__eq_(next,"@")) {forward(); // Line 170 Column 4
return ast["make-node"]("\uFDD1LIST",list(ast["make-node"]("\uFDD1ATOM","\uFDD1unquote-splicing",token_dash_lineno(token),token_dash_colno(token)),read_dash_exp()),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
} else {return ast["make-node"]("\uFDD1LIST",list(ast["make-node"]("\uFDD1ATOM","\uFDD1unquote",token_dash_lineno(token),token_dash_colno(token)),read_dash_exp()),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o25 = current();
return o24(o25); // Line 170 Column 4
}))(); // Line 170 Column 4
} else {return (function() {if(_eq__eq_(token_dash_type(token),"\uFDD1COMMENT")) {return read_dash_exp(); // Line 170 Column 4
} else {return ast["make-node"]("\uFDD1ATOM",token_dash__gt_exp(token),token_dash_lineno(token),token_dash_colno(token)); // Line 170 Column 4
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o19 = get_dash_token();
return o18(o19); // Line 170 Column 4
}))(); // Line 170 Column 4
});
return ((function() {var loop = (function(e_star_,e){
return (function() {if(end_p_(e)) {return (function() {if(_eq__eq_(length(e_star_),1)) {return car(e_star_); // Line 272 Column 2
} else {return ast["make-node"]("\uFDD1LIST",cons(ast["make-node"]("\uFDD1ATOM","\uFDD1begin",0,1),reverse(e_star_)),0,0); // Line 272 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
} else {return loop(cons(e,e_star_),read_dash_exp()); // Line 272 Column 2
}})()
; // Line <unknown undefined> Column <unknown undefined>
});
var o26 = _emptylst;
var o27 = read_dash_exp();
return loop(o26,o27); // Line 272 Column 2
}))(); // Line 272 Column 2
});
module["exports"] = dict("\uFDD0read",read);


},{"./ast":6,"fs":1,"util":5}]},{},[10])
(10)
});