/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TASK_TIME_MIN: string;
    readonly VITE_SHORT_BREAK_TIME_MIN: string;
    readonly VITE_LONG_BREAK_TIME_MIN: string;
    readonly VITE_LONG_BREAK_AFTER: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
