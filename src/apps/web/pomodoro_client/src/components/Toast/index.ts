import styles from "./Toast.module.scss";

const TOAST_CONTAINER_ID = "toast-container";
const TOAST_DURATION = 4000;

function getContainer(): HTMLDivElement {
    let el = document.getElementById(TOAST_CONTAINER_ID);
    if (!el) {
        el = document.createElement("div");
        el.id = TOAST_CONTAINER_ID;
        el.className = styles.container;
        document.body.appendChild(el);
    }
    return el as HTMLDivElement;
}

export function showToast(message: string, type: "info" | "success" = "info"): void {
    const container = getContainer();
    const toast = document.createElement("div");
    toast.className = `${styles.toast} ${styles[`toast_${type}`]}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add(styles.toast_visible));

    const remove = () => {
        toast.classList.remove(styles.toast_visible);
        setTimeout(() => toast.remove(), 300);
    };

    setTimeout(remove, TOAST_DURATION);
    toast.addEventListener("click", remove);
}
