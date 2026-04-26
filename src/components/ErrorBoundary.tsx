"use client";

import { Component, type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[ErrorBoundary]", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center">
                    <h2 className="text-lg font-semibold mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-default-500 mb-4">
                        {this.state.error?.message}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-white rounded-md"
                    >
                        Reload page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
