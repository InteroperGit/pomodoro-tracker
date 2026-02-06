import type {Component, Props} from "../types/component.ts";

export function render(root: HTMLElement, Component: Component, props?: Props) {
    root.innerHTML = Component(props);
}