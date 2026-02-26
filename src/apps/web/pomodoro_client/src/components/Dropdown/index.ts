import styles from "./Dropdown.module.scss";

/**
 * Элемент выпадающего меню
 * @typedef {Object} DropdownItem
 * @property {string} id - уникальный идентификатор элемента
 * @property {string} content - HTML содержимое элемента
 */
export type DropdownItem = {
    id: string;
    content: string;
};

/**
 * Свойства для создания разметки выпадающего меню
 * @typedef {Object} DropdownMarkupProps
 * @property {string} wrapClass - CSS класс для обертки
 * @property {string} buttonId - ID кнопки-триггера
 * @property {string} buttonClass - CSS класс кнопки
 * @property {string} buttonContent - HTML содержимое кнопки
 * @property {string} buttonAriaLabel - aria-label для кнопки
 * @property {string} dropdownId - ID выпадающей панели
 * @property {DropdownItem[]} items - массив элементов меню
 */
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
 * Создает HTML-разметку выпадающего меню с кнопкой и панелью
 * @param {DropdownMarkupProps} props - свойства меню
 * @returns {string} HTML-строка выпадающего меню
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

/**
 * Конфигурация для подключения поведения выпадающего меню
 * @typedef {Object} DropdownConfig
 * @property {string} buttonId - ID кнопки-триггера
 * @property {string} dropdownId - ID выпадающей панели
 * @property {string} openClass - CSS класс для открытого меню
 * @property {"left"|"right"} [align="left"] - выравнивание меню относительно кнопки
 * @property {Record<string, Function>} itemHandlers - обработчики клика по элементам меню
 */
export type DropdownConfig = {
    buttonId: string;
    dropdownId: string;
    openClass: string;
    align?: "left" | "right";
    itemHandlers: Record<string, () => void>;
};

/** Отступ для позиционирования выпадающего меню (пиксели) */
const MARGIN = 8;

/** Реестр открытых выпадающих меню для синхронизации открытия/закрытия */
const openDropdowns = new Map<string, () => void>();

/**
 * Подключает поведение выпадающего меню
 * Включает: позиционирование, закрытие по клику снаружи, обработку Escape
 * При открытии одного меню остальные закрываются автоматически
 * @param {DropdownConfig} config - конфигурация меню
 * @returns {Function} функция очистки для использования в useEffect
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
        openDropdowns.delete(dropdownId);
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
            // Закрыть все остальные открытые выпадающие меню (PlanTasks, ArchiveTasks)
            const others = [...openDropdowns.entries()].filter(([id]) => id !== dropdownId);
            others.forEach(([, close]) => close());
            positionDropdown();
            dropdown.setAttribute("aria-hidden", "false");
            menuButton.setAttribute("aria-expanded", "true");
            openDropdowns.set(dropdownId, closeDropdown);
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
        openDropdowns.delete(dropdownId);
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
