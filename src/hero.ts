import { heroui } from "@heroui/react";

export default heroui({
    layout: {
        radius: {
            small: "0px",
            medium: "0px",
            large: "0px",
        },
        borderWidth: {
            small: "2px",
            medium: "2px",
            large: "2px",
        },
    },
    themes: {
        light: {
            colors: {
                primary: {
                    DEFAULT: "#f59e0b",
                    foreground: "#000000",
                },
            },
        },
        dark: {
            colors: {
                primary: {
                    DEFAULT: "#f59e0b",
                    foreground: "#000000",
                },
            },
        },
    },
});
