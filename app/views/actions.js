import document from "document";

let views;

export function init(_views) {
  views = _views;
  console.log("actions init()");
  mounted();
}

/**
 * When this view is mounted, setup elements and events.
 */
function mounted() {
  console.log("actions display mounted");
}
