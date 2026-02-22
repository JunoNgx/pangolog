let _cb: (() => void) | null = null;

export const createAction = {
    register: (cb: () => void) => {
        _cb = cb;
        return () => {
            _cb = null;
        };
    },
    trigger: () => _cb?.(),
};
