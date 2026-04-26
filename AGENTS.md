# Pangolog

Personal expense tracker PWA. See `.docs/spec.md` and `.docs/plan.md` for full details.

## Maintainer's preferences
- Use 4 space indentation
- Variable names for boolean type must always have the appropriate prefix (e.g. is-, should-, does-, has-). There is no exception.
- Do not name variables with a bare adjective. `existing`, `filtered`, `updated`, `prev`, `next` are unacceptable. Use a noun-based name that reflects what the variable holds (e.g. `storedCategory`, `filteredTransactions`, `updatedToken`).
- Prioritise using guard clause and early termination. Avoid `else` and deeply nested codes.
- Use leading operators style for multi-line logical/binary expressions: place the operator at the start of the continuation line, not the end of the preceding one. (Not yet supported by Biome - it will reformat to trailing operators.)
- Use only `yarn` to manage packages
- Use double quotes for strings unless single quotes are required (e.g. a string containing a double quote)
- Use `camelCase` for hooks, `PascalCase` for components, and `camelCase` for all other filenames (no kebab-case)
- Constants use `SCREAMING_SNAKE_CASE` for values
- Exercise "Camel Case Acronyms"; treat acronyms and initialisms as one single word. E.g. `extractFromDb` instead of `extractFromDB`; `convertToUtc` instead of `convertToUTC`
- Use the term `Dialog` instead of `Modal`
- Complicated handler function, taking up more than one line, should be implemented separately outside of the template.
- Do not use the deprecated `FormEvent` and `React.FormEventHandler`
- Do not use em dash
- Avoid nesting by breaking down component templates to variables
- Ask for permission before committing
- Start the commit message with github ticket number, if not on `main`; followed by conventional commit type; start the actual verb with a lowercase character (e.g. `#12 refactor: rename and add boolean prefix to variables`)
- Avoid regex for implementation and usage when possible. Only use when absolutely necessary or the benefit is significant.

### Tailwind classes
- Tailwind classes are to be wrapped in literal template, grouping classes into categories:
    - Container (e.g. `w-full`, `max-w-md`)
    - Inner structure (e.g. `flex flex-col`, `p-6 gap-4`)
    - Content style (e.g. `font-sans text-gray-900 dark:text-gray-100`)
    - Visual effects (e.g. `shadow-lg`, `border border-gray-200`, `dark:border-gray-700`)
    - Behaviours (e.g. `hover:shadow-xl`, `transition-shadow duration-300`, `focus-within:ring-2 focus-within:ring-primary-500`)
    - Computed classes
- Do not use pixel-unit classes, e.g. `size-[18px]`

Complete example:
```
const cardClasses = `
    /* CONTAINER */
    w-full max-w-md bg-white dark:bg-gray-800 rounded-xl

    /* INNER STRUCTURE */
    flex flex-col p-6 gap-4

    /* CONTENT STYLES */
    font-sans text-gray-900 dark:text-gray-100

    /* VISUAL EFFECTS */
    shadow-lg border border-gray-200 dark:border-gray-700

    /* BEHAVIOR */
    hover:shadow-xl transition-shadow duration-300 focus-within:ring-2 focus-within:ring-primary-500

    /* COMPUTED CLASSES */
    ${!isActive ? "bg-amber-600" : ""}
    ${!isDisabled ? "text-default-100" : "text-default-400"}
`;

Don't comment on the classes. Just keep one type of classes in its own line. Each computed class should be on its own line.
```
