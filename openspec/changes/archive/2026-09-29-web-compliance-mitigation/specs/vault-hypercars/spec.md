# Delta for Vault Hypercars Capability

## ADDED Requirements

### Requirement: Semantic Landmark Hierarchy and Structural Markup

The customer-facing application layout MUST provide a clear, unambiguous landmark hierarchy using standard HTML5 semantic elements, containing exactly one top-level `<main>` landmark that encloses all primary page content, `<article>` tags for independent catalog items, and `<nav>` landmarks for navigation structures.

#### Scenario: Customer landing page renders compliant landmark structure

- GIVEN the customer landing page (`app/page.tsx`)
- WHEN rendered in the browser or parsed by assistive technologies
- THEN exactly one `<main>` landmark element MUST encompass the core content (including both Hero and Catalogo sections)
- AND the mobile navigation menu in `Navbar.tsx` MUST be contained within a semantic `<nav>` element
- AND the hero container in `Hero.tsx` MUST NOT define a nested, separate `<main>` element.

#### Scenario: Catalog items use semantic article elements

- GIVEN the `ProductCard` component rendered within `CatalogGrid`
- WHEN the component DOM is evaluated
- THEN the root container of each card MUST be an `<article>` HTML element
- AND each vehicle title MUST be structured with an appropriate heading level (`<h3>`).

---

### Requirement: Accessible Dialog and Drawer Focus Management

Interactive overlays (`CatalogModal`, `CartDrawer`, and `AdminModals`) MUST implement WAI-ARIA dialog design patterns, trapping keyboard focus within the dialog while active, dismissing on `Escape` keypress, and returning focus to the triggering element upon closure.

#### Scenario: Catalog modal traps keyboard focus and closes on Escape

- GIVEN a user opens a vehicle detail modal via the inspection button
- WHEN the user presses `Tab` repeatedly inside the modal
- THEN keyboard focus MUST cycle exclusively through focusable elements inside the modal without leaking into background elements
- AND WHEN the user presses the `Escape` key
- THEN the modal MUST close immediately
- AND focus MUST return to the button that originally triggered the modal.

#### Scenario: Cart drawer implements dialog semantics and keyboard control

- GIVEN the user opens the slide-over cart drawer
- WHEN rendered in the DOM
- THEN the drawer panel MUST have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` referencing the drawer title
- AND background overlay clicks or `Escape` keypress MUST dismiss the drawer
- AND the backdrop overlay MUST NOT have non-interactive click handlers without keyboard accessibility.

---

### Requirement: Explicit Form Control and Label Association

All form controls (inputs, selects, textareas, and file upload fields) in administrative modals MUST be explicitly associated with their descriptive `<label>` elements via matching `id` and `htmlFor` attributes.

#### Scenario: Admin vehicle modal inputs are programmatically labelled

- GIVEN the `AdminModals` component rendered for either creation or editing
- WHEN an assistive technology inspects any input, select, or textarea (including Brand, Name, Year, Power, Top Speed, Price, Image, Status, Stock, and Description)
- THEN every control MUST possess a unique `id` attribute
- AND its corresponding `<label>` element MUST possess an `htmlFor` attribute matching that exact `id`
- AND screen readers MUST announce the label when focusing any input field.

---

### Requirement: Contextual Action Labelling and Dynamic State Announcements

Interactive buttons and icon-only controls MUST provide unambiguous, contextual accessible names that identify the target object, and asynchronous updates MUST notify assistive technology users via live regions.

#### Scenario: Vehicle inspection buttons contain model context

- GIVEN multiple `ProductCard` components displayed in the catalog
- WHEN rendered to the accessibility tree
- THEN each inspection button MUST feature an accessible name that specifies the vehicle name (e.g., `aria-label="Ver detalles de Bugatti Tourbillon"`)
- AND buttons MUST NOT present generic uncontextualized names like "Ver detalles".

#### Scenario: Cart mutation announcement

- GIVEN a user adds a vehicle to the shopping cart
- WHEN the cart item count increments
- THEN an `aria-live="polite"` region MUST announce that the vehicle was added to the cart
- AND screen readers MUST communicate the update without interrupting current speech.

---

### Requirement: Telemetry Brutalist Color Contrast Conformance

The CSS design tokens defined in `app/globals.css` MUST guarantee a minimum contrast ratio of 4.5:1 for standard text and 3.0:1 for large/bold text against their respective background colors across all theme modes (`cyan` and `corsa`).

#### Scenario: Corsa theme accent button contrast compliance

- GIVEN the application with active theme `corsa` (`data-theme="corsa"`)
- WHEN accent buttons and badges (`bg-accent text-accent-contrast`) are evaluated for color contrast
- THEN the contrast ratio between the text and background color MUST meet or exceed 4.5:1
- AND text must remain fully legible under standard WCAG 2.2 AA contrast formulas.

#### Scenario: Secondary metadata text contrast

- GIVEN secondary metadata and telemetry labels rendered with zinc text utilities
- WHEN evaluated against the dark carbon background (`#09090b` / `zinc-950`)
- THEN all text elements MUST maintain a contrast ratio >= 4.5:1 (or >= 3.0:1 for bold headers)
- AND low-contrast `text-zinc-600` styling on dark surfaces MUST be elevated to compliant values.
