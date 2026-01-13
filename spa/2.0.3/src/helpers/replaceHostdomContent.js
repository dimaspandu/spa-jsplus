"use strict";

/**
 * replaceHostdomContent
 * Safely replace hostdom children with the provided container.
 * Handles DOM nodes, strings, and other primitive types with fallbacks.
 *
 * @param {HTMLElement} hostdom - The DOM node that will host the content
 * @param {*} container - The content to render (DOM node, string, or primitive)
 */
export function replaceHostdomContent(hostdom, container) {
  if (!hostdom) { return; }

  // remove all children (compatible method)
  while (hostdom.firstChild) {
    hostdom.removeChild(hostdom.firstChild);
  }

  // append either DOM node or handle string content
  try {
    if (container && typeof container.nodeType !== "undefined") {
      hostdom.appendChild(container); // Append DOM node
    } else if (typeof container === "string") {
      hostdom.innerHTML = container; // Directly set innerHTML if it's a string
    } else {
      hostdom.appendChild(document.createTextNode(String(container))); // Append text node for other types
    }
  } catch (e) {
    // If append fails, attempt to set innerHTML as fallback (best-effort)
    try {
      if (typeof container === "string") {
        hostdom.innerHTML = String(container);
      }
    } catch (err) {
      /* ignore */
    }
  }
}
