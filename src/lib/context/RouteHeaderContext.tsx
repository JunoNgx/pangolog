"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface RouteHeaderState {
    label: string;
    centerContent?: React.ReactNode;
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
}

const RouteHeaderContext = createContext<
    [RouteHeaderState, (state: RouteHeaderState) => void]
>([{ label: "" }, () => {}]);

export function RouteHeaderProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [state, setState] = useState<RouteHeaderState>({ label: "" });
    return (
        <RouteHeaderContext value={[state, setState]}>
            {children}
        </RouteHeaderContext>
    );
}

export function useRouteHeader(state: RouteHeaderState): void {
    const [, setState] = useContext(RouteHeaderContext);

    useEffect(() => {
        setState(state);
        return () => setState({ label: "" });
    }, [
        setState,
        state.label,
        state.centerContent,
        state.leftContent,
        state.rightContent,
        state,
    ]);
}

export function useRouteHeaderContent(): RouteHeaderState {
    const [state] = useContext(RouteHeaderContext);
    return state;
}
