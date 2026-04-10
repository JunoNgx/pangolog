// Module-level singleton that bridges the command palette and the active route's
// "create" dialog. The mounted route registers its open callback; the command
// palette calls trigger() to open it without needing shared state or context.
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
