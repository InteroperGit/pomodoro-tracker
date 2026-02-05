import { render } from "./utils/render.js";
import { findById } from "./utils/dom.js";
import { App } from "./components/App.js";

window.addEventListener('load', () => {
    const root = findById("root");
    if (!root) {
        alert("Элемент с идентификатором root не найден");
    }

    render(root, App);
});