/**
 * A basic module to simplify navigation within multi-view applications.
 */
import document from "document";

/**
 * Initialize the views module with views from a specific folder.
 * @param {Object[]} _views An array of views containing the view filename excluding
 * its file extension, and an associated JavaScript `import()`.
 * @param {string} _prefix The folder name where the view files reside.
 */
export function init(_views, _prefix) {
  let views = _views;
  let viewsPrefix = _prefix;
  const viewsSuffix = ".gui";
  let viewSelected;

  /**
   * Select a specific view by its index. The view's associated JavaScript is
   * loaded and executed, and the current view is replaced by the selected one.
   * @param {number} _index The array position of the view to be selected.
   */
  const select = (_index, data = {}) => {
    const [viewGUI, viewJSLoader] = views[_index];
    viewSelected = viewGUI;
    viewJSLoader()
      .then(({ init }) => {
        document.replaceSync(`${viewsPrefix}${viewGUI}${viewsSuffix}`);
        init({ navigate }, data);
      })
      .catch(() => {
        console.error(`Failed to load view JS: ${viewGUI}`);
      });
  };

  /**
   * Navigate to a specific view using its view name.
   * @param {string} _viewName The name of a .gui file, excluding its path or
   * file extension.
   */
  const navigate = (_viewName, data = {}) => {
    const index = views.indexOf(views.filter(el => el[0] == _viewName)[0]);
    select(index, data);
  };

  return {
    navigate,
    viewSelected: () => viewSelected
  };
}
