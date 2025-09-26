/**
 * @license JS+ (SPA) v1.0.1 (ES5 compatible)
 * jsplus/spa/1.0.1/spa.js
 *
 * Rewritten to be ES5-compatible and documented in English.
 *
 * Copyright (c) dimaspandu
 * Licensed under MIT
 */

(function(global) {
  "use strict";

  // ---------------------------
  // Small helpers (ES5-friendly)
  // ---------------------------

  /**
   * safeTrimRightSlash
   * Remove trailing slash from a string if exists.
   * @param {string} s
   * @return {string}
   */
  function safeTrimRightSlash(s) {
    if (typeof s !== "string") { return s; }
    if (s.length > 0 && s.charAt(s.length - 1) === "/") {
      return s.slice(0, -1);
    }
    return s;
  }

  /**
   * isFunction
   * @param {*} v
   * @return {boolean}
   */
  function isFunction(v) {
    return typeof v === "function";
  }

  /**
   * nowrapSetTimeout
   * setTimeout wrapper that calls function preserving the global context (older browsers).
   */
  function nowrapSetTimeout(fn, delay) {
    // ensure fn is function
    if (!isFunction(fn)) { return; }
    return setTimeout(fn, delay);
  }

  // -----------------------------------
  // Event trigger helper for lifecycle
  // -----------------------------------
  /**
   * onIgnitedEventContext
   * Execute lifecycle event's setter with delay behavior.
   * The event object must have properties: delay (number) and set (function).
   */
  function onIgnitedEventContext(onEvent) {
    try {
      if (!onEvent) { return; }
      if (onEvent.delay === 0) {
        // immediate
        onEvent.set();
      } else {
        // delayed
        nowrapSetTimeout(onEvent.set, onEvent.delay);
      }
    } catch (e) {
      // swallow to avoid breaking navigation flow
      /* eslint-disable no-console */
      if (global && global.console && global.console.error) {
        global.console.error("onIgnitedEventContext error:", e && e.message ? e.message : e);
      }
      /* eslint-enable no-console */
    }
  }

  // -----------------------------------
  // History & URL helpers
  // -----------------------------------

  /**
   * setHistoryStateSpa
   * Push/replace history state in a consistent manner for hashtag or non-hashtag mode.
   * Logic:
   * 1. Always check cache for query string of the requested path.
   * 2. If not found, and the request is the same route as the active reactor,
   *    reuse activeReactor.query (so query does not get lost on refresh).
   * 3. Otherwise, no query is attached.
   */
  function setHistoryStateSpa(spa, method, originPath, requestPath) {
    // Resolve base path depending on hashtag mode
    var basePath = spa.options.hashtag
      ? global.location.pathname + spa.options.dividerPath
      : spa.options.baseUrl + "";

    // Retrieve query: prefer cache, fallback to activeReactor (same route only)
    var query = {};
    if (typeof spa.pipeCache[requestPath] !== "undefined") {
      query = spa.pipeCache[requestPath].query || {};
    } else if (
      originPath === spa.state.activeReactor.origin &&
      requestPath === spa.state.activeReactor.request &&
      spa.state.activeReactor.query
    ) {
      query = spa.state.activeReactor.query;
    }

    // Build query string from key-value pairs
    var qs = "";
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        qs += (qs.length === 0 ? "?" : "&") +
          encodeURIComponent(key) + "=" + encodeURIComponent(query[key]);
      }
    }

    // Compose final URL
    var url = basePath + requestPath + qs;
    var stateObj = { origin: originPath, request: requestPath };

    // Apply history state change
    if (method === "replace" && global.history && global.history.replaceState) {
      global.history.replaceState(stateObj, null, url);
    } else if (global.history && global.history.pushState) {
      global.history.pushState(stateObj, null, url);
    } else {
      try {
        global.location.href = url;
      } catch (e) {
        /* ignore */
      }
    }
  }

  // -----------------------------------
  // DOM flush (render) helper
  // -----------------------------------
  /**
   * setFlushingSpa
   * Replace hostdom content with the reactor container.
   * If container is a DOM node, append it; otherwise append a text node from .toString()
   */
  function setFlushingSpa(spa, originPath) {
    var pipe = spa.pipe[originPath];
    if (!pipe) { return; }

    var ctx = pipe.context;
    if (!ctx) { return; }

    var container = isFunction(ctx.container) ? ctx.container() : ctx.container;
    var hostdom = spa.options.hostdom;

    if (container !== null && hostdom) {
      // remove all children (compatible method)
      while (hostdom.firstChild) {
        hostdom.removeChild(hostdom.firstChild);
      }

      // append either DOM node or text node
      try {
        if (container && typeof container.nodeType !== "undefined") {
          hostdom.appendChild(container);
        } else {
          hostdom.appendChild(document.createTextNode(String(container)));
        }
      } catch (e) {
        // if append fails, attempt to set innerHTML as fallback (best-effort)
        try {
          hostdom.innerHTML = String(container);
        } catch (err) {
          /* ignore */
        }
      }
    }
  }

  // -----------------------------------
  // Initialization for first tap
  // -----------------------------------
  /**
   * initNavigationSpa
   * Called when SPA first starts (tap) to initialize the first reactor.
   */
  function initNavigationSpa(spa, context, originPath, params, query) {
    // populate context
    context.params = params || {};
    context.query = query || {};

    // attach context and call user-provided builder
    spa.pipe[originPath].context = context;
    spa.pipe[originPath].builder(context);

    // set first and active reactor states
    spa.state.firstReactor.origin = originPath;
    spa.state.firstReactor.request = spa.originPath();
    spa.state.firstReactor.params = context.params;
    spa.state.firstReactor.query = context.query;

    spa.state.activeReactor.origin = originPath;
    spa.state.activeReactor.request = spa.originPath();
    spa.state.activeReactor.params = context.params;
    spa.state.activeReactor.query = context.query;

    // push journey entry
    spa.state.journey.push({
      origin: originPath,
      request: spa.originPath(),
      method: "push",
      params: context.params,
      query: context.query
    });

    // prepare flush transform to render container
    spa.pipe[originPath].context.builder.flushTransform = function() {
      setFlushingSpa(spa, originPath);
    };

    // update history using replace so initial load doesn't create extra entry
    setHistoryStateSpa(spa, "replace", originPath, spa.originPath());

    // if builder not waiting (no async future), flush immediately
    if (!spa.pipe[originPath].context.builder.waiting) {
      spa.pipe[originPath].context.builder.flushTransform();
    }

    // set event transform to trigger lifecycle events
    spa.pipe[originPath].context.builder.eventTransform = function() {
      // notify meet -> run onMeet -> notify arrive -> run onArrive
      spa.notifier.meet();
      onIgnitedEventContext(spa.pipe[originPath].context.onMeet);
      spa.notifier.arrive();
      onIgnitedEventContext(spa.pipe[originPath].context.onArrive);
    };

    if (!spa.pipe[originPath].context.builder.waiting) {
      spa.pipe[originPath].context.builder.eventTransform();
    }
  }

  // -----------------------------------
  // Core navigation (push / replace)
  // -----------------------------------
  /**
   * setNavigationSpa
   * Centralized navigation handling for push/replace requests.
   */
  function setNavigationSpa(spa, method, originPath, requestPath, params, query) {
    // if error wildcard and not registered -> log and return
    if (originPath === "*" && typeof spa.pipe["*"] === "undefined") {
      if (global && global.console && global.console.error) {
        global.console.error("Handler not found, there is no {spa.err(callback)} pipe cause Spa in hurry.");
      }
      return 0;
    }

    var pipe = spa.pipe[originPath];

    // ensure context is created
    if (pipe.context === null) {
      var context = new Context();
      context.params = params || {};
      context.query = query || {};
      pipe.context = context;
      pipe.builder(context);
    } else {
      pipe.context.params = params || {};
      pipe.context.query = query || {};
    }

    // If origin changed (navigating to different reactor), set flush
    if (originPath !== spa.state.activeReactor.origin) {
      pipe.context.builder.flushTransform = function() {
        setFlushingSpa(spa, originPath);
      };

      if (!pipe.context.builder.waiting) {
        pipe.context.builder.flushTransform();
      }
    }

    // Save previous reactor unless replacing
    if (method !== "replace") {
      spa.state.previousReactor.origin = spa.state.activeReactor.origin;
      spa.state.previousReactor.request = spa.state.activeReactor.request;
      spa.state.previousReactor.params = spa.state.activeReactor.params;
      spa.state.previousReactor.query = spa.state.activeReactor.query;
    }

    // update active reactor info
    spa.state.activeReactor.origin = originPath;
    spa.state.activeReactor.request = requestPath;
    spa.state.activeReactor.params = params || {};
    spa.state.activeReactor.query = query || {};

    // Update journey stack
    if (method === "replace") {
      var journeyLastIndex = spa.state.journey.length - 1;
      if (journeyLastIndex >= 0) {
        spa.state.journey[journeyLastIndex].origin = originPath;
        spa.state.journey[journeyLastIndex].request = requestPath;
        spa.state.journey[journeyLastIndex].method = method;
        spa.state.journey[journeyLastIndex].params = params || {};
        spa.state.journey[journeyLastIndex].query = query || {};
      } else {
        // fallback to pushing a new entry
        spa.state.journey.push({
          origin: originPath,
          request: requestPath,
          method: method,
          params: params || {},
          query: query || {}
        });
      }
    } else {
      spa.state.journey.push({
        origin: originPath,
        request: requestPath,
        method: method,
        params: params || {},
        query: query || {}
      });
    }

    // prepare event transform (meet/arrive handlers)
    pipe.context.builder.eventTransform = function() {
      spa.notifier.meet();
      onIgnitedEventContext(pipe.context.onMeet);
      spa.notifier.arrive();
      onIgnitedEventContext(pipe.context.onArrive);

      // If container not provided and origin is not wildcard, use catcher or fallback content
      if (originPath !== "*" && pipe.context.container === null) {
        if (typeof pipe.catcher === "undefined") {
          try {
            spa.options.hostdom.innerHTML =
              "<div style=\"height: 100vh; padding: 20px; width: 100%;\">" +
                "<h1 style=\"font-size: 5rem; line-height: 1;\">Blank Screen</h1>" +
                "<p style=\"color: #585858; font-size: 2rem; margin-top: 8px;\">No reactor catcher.</p>" +
                "<span style=\"color: #11a3c4; display: block; font-size: 2rem; font-weight: bold; margin-top: 8px; text-decoration: underline;\" onclick=\"window.history.back();\">BACK</span>" +
              "</div>";
          } catch (e) {
            // ignore DOM errors
          }
        } else {
          pipe.catcher(pipe.context);
          setFlushingSpa(spa, originPath);
        }
      }
    };

    if (!pipe.context.builder.waiting) {
      pipe.context.builder.eventTransform();
    }
  }

  // -----------------------------------
  // Context constructor (per-route)
  // -----------------------------------
  /**
   * Context
   * Object passed to each reactor. Contains lifecycle hooks and builder helpers.
   */
  function Context() {
    // route params and query data
    this.params = {};
    this.query = {};

    // container: either a DOM node, string, or a function returning either
    this.container = null;

    // builder object handles synchronous/async rendering behavior
    this.builder = Object.seal({
      waiting: false,
      flushTransform: function() {},
      eventTransform: function() {},
      // future(builder) -> marks waiting true, passes dispose callback to user builder
      future: function(builder) {
        var self = this;
        this.waiting = true;
        try {
          builder(function dispose(snapshot) {
            if (typeof snapshot !== "function") {
              snapshot = function() {};
            }
            self.waiting = false;
            try { snapshot(); } catch (e) { /* ignore */ }
            try { self.flushTransform(); } catch (e) { /* ignore */ }
            try { self.eventTransform(); } catch (e) { /* ignore */ }
          });
        } catch (e) {
          // if builder throws immediately, reset waiting
          this.waiting = false;
        }
      }
    });

    // lifecycle event objects. Each contains 'delay' (ms) and 'set' (function)
    this.onMeet = Object.seal({ delay: 0, set: function() {} });
    this.onArrive = Object.seal({ delay: 0, set: function() {} });
    this.onExit = Object.seal({ delay: 0, set: function() {} });
    this.onComeback = Object.seal({ delay: 0, set: function() {} });

    Object.seal(this);
  }

  // -----------------------------------
  // Spa constructor
  // -----------------------------------
  /**
   * Spa constructor
   * options: { baseUrl, dividerPath, hashtag (bool), hostdom (DOM node) }
   *
   * Automatically determines hash mode, dividerPath, and baseUrl for file://, localhost, or domain.
   * Forces hash mode if URL has file extension (like .html, .php, .asp)
   */
  function Spa(options) {
    // normalize options argument to object (ES5-safe)
    options = options || {};

    // detect if running from file:// protocol
    var isFileProtocol = location.protocol === "file:";

    // detect if current URL already contains hash (#)
    var hashInUrl = location.href.indexOf("#") !== -1;

    // detect if URL has a file extension (.html, .php, .asp, etc)
    var fileExtPattern = /\.\w+$/;
    var hasFileExtension = fileExtPattern.test(location.pathname);

    // determine hashtag mode automatically if not provided
    var hashtagOption = typeof options.hashtag === "undefined"
      ? (isFileProtocol || hashInUrl || hasFileExtension)
      : !!options.hashtag;

    // determine baseUrl automatically if not provided
    var baseUrlOption = typeof options.baseUrl === "undefined"
      ? (isFileProtocol ? location.pathname : location.origin)
      : String(options.baseUrl);
    baseUrlOption = safeTrimRightSlash(baseUrlOption);

    // determine dividerPath automatically if not provided
    var dividerPathOption = typeof options.dividerPath === "undefined"
      ? (hashtagOption ? "#" : baseUrlOption)
      : String(options.dividerPath);

    // determine hostdom or fallback to document.body
    var hostdomOption = typeof options.hostdom === "undefined"
      ? document.body
      : options.hostdom;

    // seal options object
    this.options = Object.seal({
      baseUrl: baseUrlOption,
      dividerPath: dividerPathOption,
      hashtag: hashtagOption,
      hostdom: hostdomOption
    });

    // warning: if hashtag disabled and no baseUrl, navigation may fail
    if (!this.options.hashtag && (!this.options.baseUrl || this.options.baseUrl.length === 0)) {
      if (global && global.console && global.console.error) {
        global.console.error(
          "SPA warning: baseUrl not set and hashtag disabled. Navigation may fail."
        );
      }
    }

    // adjust dividerPath when hashtag disabled
    if (!this.options.hashtag && this.options.baseUrl.length > 0) {
      if (this.options.dividerPath !== "#" && this.options.dividerPath !== this.options.baseUrl) {
        if (global && global.console && global.console.warn) {
          global.console.warn(
            "SPA warning: dividerPath should match baseUrl when hashtag is disabled."
          );
        }
      }
      // set dividerPath to baseUrl when hashtag disabled
      this.options.dividerPath = this.options.baseUrl;
    }

    Object.freeze(this);
  }

  // -----------------------------------
  // Spa prototype / instance members
  // -----------------------------------

  /**
   * requestPath()
   * returns the part after dividerPath if present, otherwise full href.
   */
  Spa.prototype.requestPath = function() {
    var href = global.location.href;
    var parts = href.split(this.options.dividerPath);
    return typeof parts[1] !== "undefined" ? parts[1] : parts[0];
  };

  /**
   * originPath()
   * returns request path without query string. If path equals full href length, returns "/"
   */
  Spa.prototype.originPath = function() {
    var req = this.requestPath();
    var origin = req.indexOf("?") === -1 ? req : req.split("?")[0];
    if (origin.length === global.location.href.length) {
      origin = "/";
    }
    return origin;
  };

  // pipes and caches
  Spa.prototype.pipe = {};
  Spa.prototype.pipeCache = {};

  // state object (sealed)
  Spa.prototype.state = Object.seal({
    firstReactor: Object.seal({ origin: null, request: null, params: {}, query: {} }),
    previousReactor: Object.seal({ origin: null, request: null, params: {}, query: {} }),
    activeReactor: Object.seal({ origin: null, request: null, params: {}, query: {} }),
    journey: [],
    navigateBlocker: { queue: 0, works: false }
  });

  // notifier hooks (no-op by default)
  Spa.prototype.notifier = Object.seal({
    transition: function() {},
    meet: function() {},
    arrive: function() {},
    exit: function() {},
    comeback: function() {}
  });

  // -------------------------
  // Router API methods
  // -------------------------

  /**
   * reactor(path, builder, catcher)
   * Register a reactor (route). 'path' can be string or array of strings.
   * builder(ctx) should populate ctx.container, ctx.builder.future(...), ctx.onMeet, etc.
   */
  Spa.prototype.reactor = function(path, builder, catcher) {
    var self = this;

    function registerSingle(p) {
      self.pipe[p] = { context: null, builder: builder, catcher: catcher };
    }

    if (Object.prototype.toString.call(path) === "[object Array]") {
      for (var i = 0; i < path.length; i++) {
        registerSingle(path[i]);
      }
    } else {
      registerSingle(path);
    }

    return this;
  };

  /**
   * err(builder, catcher)
   * Register wildcard error reactor ("*").
   */
  Spa.prototype.err = function(builder, catcher) {
    this.pipe["*"] = { context: null, builder: builder, catcher: catcher };
    return this;
  };

  /**
   * navigator(pathInput, resolve, reject)
   * Resolve a user-request path into originPath, params, query. Calls resolve(originPath, params, query) or reject().
   */
  Spa.prototype.navigator = function(pathInput, resolve, reject) {
    var path = pathInput;
    var params = {};
    var query = {};

    // parse query string if any
    if (pathInput.indexOf("?") !== -1) {
      var segmentQuery = pathInput.split("?")[1].split("&");
      for (var sq = 0; sq < segmentQuery.length; sq++) {
        var segmentString = segmentQuery[sq].split("=");
        if (segmentString.length > 0) {
          query[segmentString[0]] = typeof segmentString[1] === "undefined" ? "" : segmentString[1];
        }
      }
      path = pathInput.split("?")[0];
    }

    // direct match
    if (typeof this.pipe[path] !== "undefined") {
      resolve(path, params, query);
      this.pipeCache[pathInput] = { originPath: path, params: params, query: query };
      return;
    }

    // attempt parametric match (e.g. /search/{q})
    var segmentInput = path.split("/");
    var pathInputValidate = { exists: false, origin: path };

    for (var pathOutput in this.pipe) {
      if (!this.pipe.hasOwnProperty(pathOutput)) { continue; }
      var segmentOutput = pathOutput.split("/");
      var countSegmentOutput = segmentOutput.length;
      var countSegmentInput = segmentInput.length;

      if (pathOutput.indexOf("{") !== -1 && countSegmentOutput === countSegmentInput) {
        // attempt to match segment by segment
        var matched = true;
        // create a temp params object to avoid accidental reuse
        var tempParams = {};
        for (var j = 0; j < countSegmentOutput; j++) {
          if (segmentOutput[j].indexOf("{") !== -1) {
            // parameter segment, extract key between {}
            var keyParams = segmentOutput[j].replace("{", "").replace("}", "");
            tempParams[keyParams] = segmentInput[j];
          } else {
            if (segmentOutput[j] !== segmentInput[j]) {
              matched = false;
              break;
            }
          }
        }
        if (matched) {
          // copy tempParams to params
          for (var k in tempParams) {
            if (tempParams.hasOwnProperty(k)) {
              params[k] = tempParams[k];
            }
          }
          pathInputValidate.exists = true;
          pathInputValidate.origin = pathOutput;
          break;
        }
      }
    }

    if (pathInputValidate.exists) {
      resolve(pathInputValidate.origin, params, query);
      this.pipeCache[pathInput] = { originPath: pathInputValidate.origin, params: params, query: query };
    } else {
      reject();
      this.pipeCache[pathInput] = { originPath: "*", params: params, query: query };
    }
  };

  /**
   * navigateProcess(path, method)
   * Main driver: if cached, use cache; otherwise resolve via navigator.
   */
  Spa.prototype.navigateProcess = function(path, method) {
    var root = this;

    if (typeof this.pipeCache[path] !== "undefined") {
      var cp = this.pipeCache[path];
      setHistoryStateSpa(root, method, cp.originPath, path);
      setNavigationSpa(root, method, cp.originPath, path, cp.params, cp.query);
    } else {
      this.navigator(
        path,
        function(originPath, params, query) {
          setHistoryStateSpa(root, method, originPath, path);
          setNavigationSpa(root, method, originPath, path, params, query);
        },
        function() {
          setHistoryStateSpa(root, method, "*", path);
          setNavigationSpa(root, method, "*", path, {}, {});
        }
      );
    }
  };

  /**
   * navigatePush(path)
   * Public API to push a new route.
   */
  Spa.prototype.navigatePush = function(path) {
    this.notifier.transition();

    if (!this.state.navigateBlocker.works) {
      this.navigateProcess(path, "push");
    } else {
      // if navigate blocked, poll until blocker cleared (bounded with timeout)
      var root = this;
      var looping = true;
      var waiting = setInterval(function() {
        if (!root.state.navigateBlocker.works) {
          root.navigateProcess(path, "push");
          looping = false;
          clearInterval(waiting);
        }
      }, 0);

      // safety: stop after 1 second to avoid infinite polling
      setTimeout(function() {
        if (looping) {
          looping = false;
          clearInterval(waiting);
        }
      }, 1000);
    }
  };

  /**
   * navigateReplace(path)
   * Public API to replace current route.
   */
  Spa.prototype.navigateReplace = function(path) {
    this.notifier.transition();

    if (!this.state.navigateBlocker.works) {
      this.navigateProcess(path, "replace");
    } else {
      var root = this;
      var looping = true;
      var waiting = setInterval(function() {
        if (!root.state.navigateBlocker.works) {
          root.navigateProcess(path, "replace");
          looping = false;
          clearInterval(waiting);
        }
      }, 0);

      setTimeout(function() {
        if (looping) {
          looping = false;
          clearInterval(waiting);
        }
      }, 1000);
    }
  };

  /**
   * navigateClear()
   * Clear browser history entries created by SPA and reset journey stack to current active.
   * This uses history.back() repeatedly. Works best in modern browsers but falls back safely.
   */
  Spa.prototype.navigateClear = function() {
    // set navigate blocker to queue length (we'll decrease it on pop)
    this.state.navigateBlocker.queue = this.state.journey.length;
    this.state.navigateBlocker.works = true;

    // store firstReactor as the current active
    this.state.firstReactor.origin = this.state.activeReactor.origin;
    this.state.firstReactor.request = this.state.activeReactor.request;
    this.state.firstReactor.params = this.state.activeReactor.params;
    this.state.firstReactor.query = this.state.activeReactor.query;

    // reset previous reactor
    this.state.previousReactor.origin = null;
    this.state.previousReactor.request = null;
    this.state.previousReactor.params = {};
    this.state.previousReactor.query = {};

    // go back in history for all but the first item
    for (var i = this.state.journey.length - 1; i >= 1; i--) {
      try {
        global.history.back();
      } catch (e) {
        /* ignore */
      }
    }

    // reset journey to single current active entry
    this.state.journey = [{
      origin: this.state.activeReactor.origin,
      request: this.state.activeReactor.request,
      params: this.state.activeReactor.params,
      query: this.state.activeReactor.query
    }];

    // replace current to ensure consistent state
    this.navigateReplace(this.state.journey[0].request);
  };

  /**
   * navigatePop()
   * Called when user navigates backward (popstate). Handles exit lifecycle and comeback.
   */
  Spa.prototype.navigatePop = function() {
    var root = this;

    // flip function executes the actual state transition after onExit is allowed
    var flip = function() {
      // if previous reactor origin differs, we must render its container
      if (root.state.previousReactor.origin !== root.state.activeReactor.origin &&
          root.pipe[root.state.previousReactor.origin]) {
        root.pipe[root.state.previousReactor.origin].context.builder.flushTransform = function() {
          setFlushingSpa(root, root.state.previousReactor.origin);
        };

        if (!root.pipe[root.state.previousReactor.origin].context.builder.waiting) {
          root.pipe[root.state.previousReactor.origin].context.builder.flushTransform();
        }
      }

      // pop journey and update active/previous reactors
      root.state.journey.pop();

      var lastIndex = root.state.journey.length - 1;
      var lastEntry = root.state.journey[lastIndex];

      root.state.activeReactor.origin = lastEntry.origin;
      root.state.activeReactor.request = lastEntry.request;
      root.state.activeReactor.params = lastEntry.params;
      root.state.activeReactor.query = lastEntry.query;

      if (root.state.journey.length === 1) {
        root.state.previousReactor.origin = null;
        root.state.previousReactor.request = null;
        root.state.previousReactor.params = null;
        root.state.previousReactor.query = null;
      } else {
        var prev = root.state.journey[root.state.journey.length - 2];
        root.state.previousReactor.origin = prev.origin;
        root.state.previousReactor.request = prev.request;
        root.state.previousReactor.params = prev.params;
        root.state.previousReactor.query = prev.query;
      }

      // update context params & query and trigger comeback lifecycle
      var activeCtx = root.pipe[root.state.activeReactor.origin].context;
      activeCtx.params = root.state.activeReactor.params;
      activeCtx.query = root.state.activeReactor.query;

      activeCtx.builder.eventTransform = function() {
        root.notifier.meet();
        onIgnitedEventContext(activeCtx.onMeet);
        root.notifier.comeback();
        onIgnitedEventContext(activeCtx.onComeback);
      };

      if (!activeCtx.builder.waiting) {
        activeCtx.builder.eventTransform();
      }
    };

    // call current onExit.set(), if it returns false -> prevent pop
    var onExit = this.pipe[this.state.activeReactor.origin].context.onExit;
    var doExit;
    try {
      doExit = onExit.set();
    } catch (e) {
      doExit = undefined;
    }

    if (typeof doExit === "undefined" || doExit) {
      // allowed to exit
      root.notifier.exit();

      if (onExit.delay === 0) {
        flip();
      } else {
        nowrapSetTimeout(flip, onExit.delay);
      }
    } else {
      // prevented exit: push state back so user remains on same page
      setHistoryStateSpa(this, "push", this.state.activeReactor.origin, this.state.activeReactor.request);

      var ctx = root.pipe[root.state.activeReactor.origin].context;
      ctx.builder.eventTransform = function() {
        root.notifier.meet();
        onIgnitedEventContext(ctx.onMeet);
        root.notifier.arrive();
        onIgnitedEventContext(ctx.onArrive);
      };

      if (!ctx.builder.waiting) {
        ctx.builder.eventTransform();
      }
    }
  };

  /**
   * addNotifier(instructions, callback)
   * Attach notifier callbacks for lifecycle events:
   * "transition", "meet", "arrive", "exit", "comeback"
   */
  Spa.prototype.addNotifier = function(instructions, callback) {
    this.notifier[instructions] = callback;
    return this;
  };

  // -----------------------------------
  // Start the SPA and listen to popstate
  // -----------------------------------
  /**
   * tap()
   * Boot the SPA: resolve current path, initialize first reactor and attach onpopstate handler.
   */
  Spa.prototype.tap = function() {
    try {
      var root = this;
      var context = new Context();

      // resolve current location into a reactor and initialize
      this.navigator(
        (this.requestPath().indexOf("?") === -1) ? this.originPath() : this.requestPath(),
        function(originPath, params, query) {
          initNavigationSpa(root, context, originPath, params, query);
        },
        function() {
          // if wildcard error route exists, initialize it
          if (typeof root.pipe["*"] !== "undefined") {
            initNavigationSpa(root, context, "*", {}, {});
            return 1;
          } else {
            if (global && global.console && global.console.error) {
              global.console.error("Handler not found, there is no {spa.err(callback)} pipe cause Spa in hurry.");
            }
            return 0;
          }
        }
      );

      // attach popstate handler (back/forward button)
      global.onpopstate = function(event) {
        try {
          // prevent default behavior where possible
          if (event && event.preventDefault) {
            try { event.preventDefault(); } catch (e) { /* ignore */ }
          }

          root.notifier.transition();

          // if navigateBlocker engaged, decrement queue and maybe disable works
          if (root.state.navigateBlocker.works) {
            root.state.navigateBlocker.queue--;
            if (root.state.navigateBlocker.queue === 1) {
              root.state.navigateBlocker.works = false;
            }
          }

          // check if active reactor has onExit.delay === -1 (force end)
          var endReactor = false;
          try {
            var currentOnExit = root.pipe[root.state.activeReactor.origin].context.onExit;
            endReactor = (currentOnExit && currentOnExit.delay === -1);
          } catch (e) {
            endReactor = false;
          }

          if (endReactor) {
            // force go back one more entry
            try { global.history.go(-1); } catch (e) { /* ignore */ }
          } else {
            // normal pop handling: if popped to previous reactor origin => navigatePop
            if (event && event.state && event.state.origin === root.state.previousReactor.origin) {
              root.navigatePop();
            } else {
              // else treat as a push to the state in event (for forward/back pushes)
              if (!root.state.navigateBlocker.works && event && event.state && event.state.origin) {
                // if pipe for origin exists use its context values where possible
                var ctxParams = {};
                var ctxQuery = {};
                try {
                  var pctx = root.pipe[event.state.origin].context;
                  ctxParams = pctx === null ? {} : (pctx.params || {});
                  ctxQuery = pctx === null ? {} : (pctx.query || {});
                } catch (e) {
                  ctxParams = {};
                  ctxQuery = {};
                }

                setNavigationSpa(
                  root,
                  "push",
                  event.state.origin,
                  event.state.request,
                  ctxParams,
                  ctxQuery
                );
              }
            }
          }
        } catch (e) {
          if (global && global.console && global.console.error) {
            global.console.error("onpopstate handler error:", e && e.message ? e.message : e);
          }
        }
      };
    } catch (e) {
      if (global && global.console && global.console.error) {
        global.console.error("Spa tap error:", e && e.message ? e.message : e);
      }
    }
    return this;
  };

  // Expose Spa to global
  global.Spa = Spa;

}(this));
