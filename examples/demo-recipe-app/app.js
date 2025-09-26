import Spa from "./spa/index.js";
import { bindNavigation } from "./helpers/bindNavigation.js";

const app = new Spa({
  hostdom: document.getElementById("app-host")
});

((app) => bindNavigation(app))(app);

export { app };