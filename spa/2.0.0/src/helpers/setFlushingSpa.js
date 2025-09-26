"use strict";

import { isFunction } from "../utils.js";

/**
 * setFlushingSpa
 * Replace hostdom content with the reactor container.
 * If container is a DOM node, append it; otherwise append a text node from .toString()
 */
export function setFlushingSpa(spa, originPath) {
  const pipe = spa.pipe[originPath];
  if (!pipe) { return; }

  const ctx = pipe.context;
  if (!ctx) { return; }

  const container = isFunction(ctx.container) ? ctx.container() : ctx.container;
  const hostdom = spa.options.hostdom;

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
