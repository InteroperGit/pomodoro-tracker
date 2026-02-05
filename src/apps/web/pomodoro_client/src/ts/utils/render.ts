export function render(root, Component, props = {}) {
    root.innerHTML = Component(props);
}