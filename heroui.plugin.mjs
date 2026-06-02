// TODO: Remove src/app/heroui.plugin.mjs symlink (../../heroui.plugin.mjs) when
// Tailwind CSS v4 resolves @plugin paths consistently (dev uses project root,
// build uses src/app/ -- see @tailwindcss/postcss@4.3.0 PR #19980).
import { heroui } from "@heroui/theme/plugin";

export default heroui({
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
    layout: {
        // radius: {
        //     small: "0px",
        //     medium: "0px",
        //     large: "0px",
        // },
    },
});
