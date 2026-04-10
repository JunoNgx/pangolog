// Bridges the command palette and local component callbacks without shared state.
// create: route-dependent; the active route registers its "open create dialog" callback on mount.
// shortcuts: ShortcutsDialog (always mounted in layout) registers its "open" callback.
// Two slots are needed because a route mounting would overwrite the shortcuts callback if shared.

function createActionSlot() {
    let _cb: (() => void) | null = null;
    return {
        register: (cb: () => void) => {
            _cb = cb;
        },
        unregister: () => {
            _cb = null;
        },
        trigger: () => _cb?.(),
    };
}

export const commandPaletteCreateActions = createActionSlot();
export const commandPaletteShortcutsActions = createActionSlot();
