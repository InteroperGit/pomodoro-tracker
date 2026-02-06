import { render } from "./utils/render";
import { findById } from "./utils/dom";
import { App } from "./components/App";

window.addEventListener('load', () => {
    const root = findById("root");
    if (!root) {
        alert("Элемент с идентификатором root не найден");
        return;
    }

    render(root, App);
});