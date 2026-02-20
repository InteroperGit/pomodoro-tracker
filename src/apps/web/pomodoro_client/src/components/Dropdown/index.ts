import styles from "./Dropdown.module.scss";

export type DropdownItem = {
    id: string;
    content: string;
};

export type DropdownMarkupProps = {
    wrapClass: string;
    buttonId: string;
    buttonClass: string;
    buttonContent: string;
    buttonAriaLabel: string;
    dropdownId: string;
    items: DropdownItem[];
};

/**
 * Возвращает HTML-разметку выпадающего меню: обёртка, кнопка-триггер и панель с пунктами.
 */
export function dropdownMarkup(props: DropdownMarkupProps): string {
    const {
        wrapClass,
        buttonId,
        buttonClass,
        buttonContent,
        buttonAriaLabel,
        dropdownId,
        items,
    } = props;

    const itemsHtml = items
        .map(
            (item) =>
                `<button type="button" id="${item.id}" class="${styles.dropdown_item}" role="menuitem">${item.content}</button>`
        )
        .join("");

    return `
        <div class="${wrapClass}">
            <button
                id="${buttonId}"
                type="button"
                class="${buttonClass}"
                aria-label="${buttonAriaLabel}"
                aria-haspopup="true"
                aria-expanded="false">
                ${buttonContent}
            </button>
            <div
                id="${dropdownId}"
                class="${styles.dropdown}"
                role="menu"
                aria-hidden="true">
                ${itemsHtml}
            </div>
        </div>
    `;
}

export type DropdownConfig = {
    buttonId: string;
    dropdownId: string;
    openClass: string;
    /** Выравнивание панели относительно кнопки: по левому краю кнопки или по правому */
    align?: "left" | "right";
    /** Обработчики клика по пунктам: ключ — id пункта */
    itemHandlers: Record<string, () => void>;
};

const MARGIN = 8;

/**
 * Подключает поведение выпадающего меню: портал в body, позиционирование, закрытие по клику снаружи и Escape.
 * Возвращает функцию очистки для использования в useEffect.
 */
export function useDropdown(config: DropdownConfig): () => void {
    const {
        buttonId,
        dropdownId,
        openClass,
        align = "left",
        itemHandlers,
    } = config;

    const menuButton = document.getElementById(buttonId) as HTMLButtonElement | null;
    const dropdown = document.getElementById(dropdownId) as HTMLDivElement | null;

    if (!menuButton || !dropdown) {
        return () => {};
    }

    const menuWrap = menuButton.parentElement;

    const positionDropdown = () => {
        if (menuWrap && dropdown.parentElement !== document.body) {
            document.body.appendChild(dropdown);
        }
        const rect = menuButton.getBoundingClientRect();
        dropdown.style.visibility = "hidden";
        dropdown.classList.add(openClass);
        const dr = dropdown.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let top: number;
        const canOpenBelow = rect.bottom + dr.height + MARGIN <= vh;
        const canOpenAbove = rect.top - dr.height - MARGIN >= 0;
        const fallbackTop = Math.max(MARGIN, Math.min(rect.bottom, vh - dr.height - MARGIN));

        if (canOpenBelow) {
            top = rect.bottom + MARGIN;
        } else if (canOpenAbove) {
            top = rect.top - dr.height - MARGIN;
        } else {
            top = fallbackTop;
        }

        let left: number;
        if (align === "right") {
            left = rect.right - dr.width;
        } else {
            left = rect.left;
        }
        if (left + dr.width > vw - MARGIN) {
            left = vw - dr.width - MARGIN;
        }
        if (left < MARGIN) {
            left = MARGIN;
        }

        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${left}px`;
        dropdown.style.visibility = "";
    };

    const closeDropdown = () => {
        dropdown.classList.remove(openClass);
        dropdown.setAttribute("aria-hidden", "true");
        menuButton.setAttribute("aria-expanded", "false");
        if (menuWrap && dropdown.parentElement === document.body) {
            menuWrap.insertBefore(dropdown, menuButton.nextSibling);
        }
    };

    const isOpen = () => dropdown.classList.contains(openClass);

    const handleMenuButtonClick = (e: MouseEvent) => {
        e.stopPropagation();
        if (isOpen()) {
            closeDropdown();
        } else {
            positionDropdown();
            dropdown.setAttribute("aria-hidden", "false");
            menuButton.setAttribute("aria-expanded", "true");
        }
    };

    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (isOpen() && !dropdown.contains(target) && !menuButton.contains(target)) {
            closeDropdown();
        }
    };

    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen()) {
            closeDropdown();
        }
    };

    menuButton.addEventListener("click", handleMenuButtonClick);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    const itemCleanups: Array<() => void> = [];
    for (const [itemId, handler] of Object.entries(itemHandlers)) {
        const el = document.getElementById(itemId) as HTMLButtonElement | null;
        if (el) {
            const onItemClick = () => {
                handler();
                closeDropdown();
            };
            el.addEventListener("click", onItemClick);
            itemCleanups.push(() => el.removeEventListener("click", onItemClick));
        }
    }

    return () => {
        if (dropdown.parentElement === document.body) {
            document.body.removeChild(dropdown);
        }
        menuButton.removeEventListener("click", handleMenuButtonClick);
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        itemCleanups.forEach((cleanup) => cleanup());
    };
}

export { styles as dropdownStyles };
