import styles from "./Toolbar.module.scss";
import { Logo } from "./Logo";
import {Navigation} from "./Navigation";

export type ToolbarProps = {
    isMobile: boolean;
}

export function Toolbar({ isMobile }: ToolbarProps) {
    const logo = Logo();
    const navigation = Navigation();

    return isMobile
        ?   `
                <header class="${styles.header}">
                    ${logo}
                </header>
            `
        :   `
                <header class="${styles.header}">
                    ${logo}
                    ${navigation}
                </header>
            `;
}