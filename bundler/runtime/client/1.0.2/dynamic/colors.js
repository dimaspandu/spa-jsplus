(function(global, modules, entry) {
  global["*pointers"]("&registry")(modules);
  global["*pointers"]("&require")(entry);
})(
  typeof window !== "undefined" ? window : this,
  {
    "&/dynamic/colors.json": [
      function(require, exports, module) {
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