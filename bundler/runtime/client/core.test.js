// JUST COPAS ON THE BROWSER CONSOLE

// PASS
(function(global, modules, entry) {
  global["*pointers"]("&registry")(modules);
  global["*pointers"]("&require")(entry);
})(
  typeof window !== "undefined" ? window : this,
  {
    // Entry module
    "&/entry.js": [
      function (require, exports, module) {
        var greetings = require("./greetings.js").default;
        console.log("[GREETINGS]:", greetings);
      },
      { "./greetings.js": "&/greetings.js" }
    ],
    // Greetings module
    "&/greetings.js": [
      function (require, exports, module) {
        exports["default"] = "Hello, World!";
      },
      {}
    ]
  },
  "&/entry.js"
);

// NO ENTRY (FAIL)
(function(global, modules, entry) {
  global["*pointers"]("&registry")(modules);
  global["*pointers"]("&require")(entry);
})(
  typeof window !== "undefined" ? window : this,
  {
    "&/dynamic/colors.json": [
      function(require, exports, module) {
        console.log("default", {
          "primary": "#2563eb",
          "secondary": "#6b7280",
          "accent": "#10b981"
        });
        exports.default = {
          "primary": "#2563eb",
          "secondary": "#6b7280",
          "accent": "#10b981"
        };
      },
      {}
    ]
  }
);

// PASS
(function(global, modules, entry) {
  global["*pointers"]("&registry")(modules);
  global["*pointers"]("&require")(entry);
})(
  typeof window !== "undefined" ? window : this,
  {
    "&/dynamic/colors.json": [
      function(require, exports, module) {
        console.log("default", {
          "primary": "#2563eb",
          "secondary": "#6b7280",
          "accent": "#10b981"
        });
        exports.default = {
          "primary": "#2563eb",
          "secondary": "#6b7280",
          "accent": "#10b981"
        };
      },
      {}
    ]
  },
  "&/dynamic/colors.json"
);