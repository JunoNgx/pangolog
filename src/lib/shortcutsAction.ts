let _cb: (() => void) | null = null;

export const shortcutsAction = {
    register: (cb: () => void) => {
        _cb = cb;
        return () => {
            _cb = null;
        };
    },
    trigger: () => _cb?.(),
};
