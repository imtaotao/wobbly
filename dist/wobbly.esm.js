function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var assert = function assert(val) {
  if (typeof val !== 'number' || Number.isNaN(val)) {
    throw TypeError('The "parameter" should be a number.');
  }
};

var wobbly = function wobbly(t) {
  return -0.5 * Math.pow(2.71828, -6 * t) * (-2 * Math.pow(2.71828, 6 * t) + Math.sin(12 * t) + 2 * Math.cos(12 * t));
};

var filterOpts = function filterOpts(opts) {
  var end = opts.end,
      duration = opts.duration,
      _opts$normal = opts.normal,
      normal = _opts$normal === void 0 ? false : _opts$normal,
      _opts$move = _slicedToArray(opts.move, 2),
      from = _opts$move[0],
      to = _opts$move[1];

  assert(to);
  assert(from);
  assert(duration);
  return {
    to: to,
    from: from,
    end: end,
    normal: normal,
    duration: duration
  };
};

var hexToRgb = function hexToRgb(hex) {
  if (!/^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(hex)) {
    throw Error("the \"".concat(hex, "\" do not meet specifications."));
  }

  var rgba = [];
  hex = hex.toLowerCase();

  if (hex.length === 4) {
    var regenerate = '#';

    for (var i = 1; i < 4; i++) {
      regenerate += hex.slice(i, i + 1).repeat(2);
    }

    hex = regenerate;
  }

  for (var j = 1; j < 7; j += 2) {
    rgba.push(+('0x' + hex.slice(j, j + 2)));
  }

  if (hex.length === 9) {
    rgba.push(+('0x' + hex.slice(7, 9)) / 255);
  }

  return rgba;
};

var Wobbly = function Wobbly(opts, process) {
  var _filterOpts = filterOpts(opts),
      to = _filterOpts.to,
      from = _filterOpts.from,
      end = _filterOpts.end,
      normal = _filterOpts.normal,
      duration = _filterOpts.duration;

  typeof process !== 'function' && (process = function process() {});
  var timerId = null;
  var startTime = null;
  var totalDistance = to - from;

  var stopAnimate = function stopAnimate() {
    startTime = null;

    if (timerId) {
      cancelAnimationFrame(timerId);
      timerId = null;
      typeof end === 'function' && end();
    }
  };

  var core = function core() {
    timerId = requestAnimationFrame(function () {
      var precent = (Date.now() - startTime) / duration;
      if (Number.isNaN(precent)) return;

      if (precent > 1) {
        process(to);
        stopAnimate();
        return;
      }

      var destination = normal ? from + precent * totalDistance : from + wobbly(precent) * totalDistance;
      process(destination);
      core();
    });
  };

  return {
    start: function start() {
      if (timerId === null) {
        startTime = Date.now();
        core();
      }

      return this;
    },
    stop: function stop() {
      stopAnimate();
      return this;
    },
    reStart: function reStart() {
      this.stop();
      this.start();
      return this;
    },
    toStart: function toStart() {
      this.stop();
      process(from);
      return this;
    },
    toEnd: function toEnd() {
      this.stop();
      process(to);
      return this;
    }
  };
};

Wobbly["export"] = function (opts) {
  var ticker = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 17;
  assert(ticker);
  var i = 0;
  var precent = 0;
  var cacheArray = null;

  var _filterOpts2 = filterOpts(opts),
      to = _filterOpts2.to,
      from = _filterOpts2.from,
      normal = _filterOpts2.normal,
      duration = _filterOpts2.duration;

  var totalDistance = to - from;
  var frames = {};
  var res = {
    ticker: ticker,
    frames: frames,
    length: 0,
    clearCache: function clearCache(newVal) {
      cacheArray = newVal || null;
    },
    toArray: function toArray(cache) {
      if (cacheArray !== null) {
        return cacheArray;
      }

      var array = [];

      for (var key in this.frames) {
        array.push([key, this.frames[key]]);
      }

      if (cache) {
        cacheArray = array;
      }

      return array;
    }
  };

  while (precent <= 1) {
    res.length++;
    var frame = i++ * ticker;
    precent = frame / duration;

    if (precent > 1) {
      if (frames[duration] === undefined) {
        frames[duration] = to;
      }

      break;
    }

    frames[frame] = normal ? from + precent * totalDistance : from + wobbly(precent) * totalDistance;
  }

  return res;
};

Wobbly.all = function (_ref, process) {
  var moves = _ref.moves,
      duration = _ref.duration,
      normal = _ref.normal,
      end = _ref.end;

  if (!Array.isArray(moves) || moves.length === 0) {
    throw Error('The "moves" must be an array with one element.');
  }

  var processWrap = function processWrap(currentIndex, des) {
    processWrap._i++;
    processWrap._des[currentIndex] = des;

    if (processWrap._i === moves.length) {
      process(processWrap._des);
      processWrap._i = 0;
      processWrap._des = [];
    }
  };

  processWrap._i = 0;
  processWrap._des = [];
  var _endWrap = null;

  if (end) {
    _endWrap = function endWrap() {
      _endWrap._i++;

      if (_endWrap._i === moves.length) {
        _endWrap._i = 0;
        end();
      }
    };

    _endWrap._i = 0;
  }

  var animates = moves.map(function (move, i) {
    return Wobbly({
      move: move,
      normal: normal,
      duration: duration,
      end: _endWrap
    }, function (des) {
      return processWrap(i, des);
    });
  });
  var allApis = {};

  var _loop = function _loop(key) {
    allApis[key] = function () {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = animates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var animate = _step.value;
          animate[key]();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this;
    };
  };

  for (var key in animates[0]) {
    _loop(key);
  }

  return allApis;
};

Wobbly.move = function (move, duration, process) {
  return new Promise(function (resolve) {
    Wobbly({
      move: move,
      duration: duration,
      end: function end() {
        resolve(function () {
          return Wobbly.move(move, duration, process);
        });
      }
    }, process).start();
  });
};

Wobbly.color = function (start, end) {
  if (typeof end === 'string') {
    end = hexToRgb(end.trim());
  }

  if (typeof start === 'string') {
    start = hexToRgb(start.trim());
  }

  var maxLength = Math.max(start.length, end.length);
  end.length < maxLength && end.push(1);
  start.length < maxLength && start.push(1);
  return start.map(function (val, i) {
    return [val, end[i]];
  });
};

export default Wobbly;
