"use strict";

import { isFunction } from "../utils.js";
import { replaceHostdomContent } from "./replaceHostdomContent.js";

/**
 * setFlushingSpa
 * Replace hostdom content with the reactor container.
 * If container is a DOM node, append it; otherwise append a text node or set innerHTML if container is a string.
 */
export function setFlushingSpa(spa, originPath) {
  const pipe = spa.pipe[originPath];
  if (!pipe) { return; }

  const ctx = pipe.context;
  if (!ctx) { return; }

  const container = isFunction(ctx.container) ? ctx.container() : ctx.container;
  const hostdom = spa.options.hostdom;

  if (container !== null && hostdom) {
    replaceHostdomContent(hostdom, container);
  }
}
