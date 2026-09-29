# Privacy Cookie Consent Specification

## Purpose

Defines user privacy and cookie consent behaviors compliant with GDPR / RGPD (General Data Protection Regulation) and local data privacy laws (such as Chilean Law 21.719). The system presents an accessible banner allowing users to explicitly grant, reject, or customize non-essential telemetry and storage, with equal prominence for acceptance and rejection and zero pre-ticked opt-in checkboxes.

## Requirements

### Requirement: Explicit Cookie and Telemetry Consent Banner

The system MUST display an accessible cookie and storage consent banner to unconsented visitors on their first visit, offering both "Aceptar Todo" (Accept All) and "Rechazar No Esenciales" (Reject Non-Essential) with equal visual prominence and accessibility.

#### Scenario: First visit presents consent banner with equal-weight actions

- GIVEN a visitor navigates to the application for the first time without prior stored consent in `localStorage` or cookies
- WHEN the initial page render completes
- THEN the Cookie Consent Banner MUST be rendered in the viewport
- AND the banner MUST contain both an acceptance button and a rejection button with equal accessibility and visual weight
- AND neither option MUST be pre-selected by default.

#### Scenario: User accepts all cookies and telemetry

- GIVEN the Cookie Consent Banner is displayed
- WHEN the user clicks or activates via keyboard the "Aceptar Todo" button
- THEN the system MUST save the consent state `{ essential: true, analytics: true, timestamp: "<ISO_DATE>", version: "1.0" }` in persistent storage
- AND the banner MUST dismiss immediately without page reload
- AND subsequent page loads MUST NOT display the consent banner.

#### Scenario: User rejects non-essential cookies and telemetry

- GIVEN the Cookie Consent Banner is displayed
- WHEN the user clicks or activates via keyboard the "Rechazar No Esenciales" button
- THEN the system MUST save the consent state `{ essential: true, analytics: false, timestamp: "<ISO_DATE>", version: "1.0" }` in persistent storage
- AND the banner MUST dismiss immediately without page reload
- AND non-essential analytics tracking or external telemetry MUST remain disabled
- AND essential application storage (such as active shopping cart and current currency) MUST continue functioning normally.

### Requirement: Accessible Banner Keyboard Navigation & Screen Reader Support

The Cookie Consent Banner MUST implement accessible landmark/dialog attributes and trap or facilitate smooth keyboard navigation without trapping users if non-modal.

#### Scenario: Keyboard navigation and screen reader announcement

- GIVEN a keyboard-only user navigates into the Cookie Consent Banner
- WHEN the user presses `Tab`
- THEN focus MUST move sequentially between the explanation text, "Rechazar No Esenciales", "Aceptar Todo", and "Preferencias"
- AND the container MUST have `role="region"` or `role="dialog"` with `aria-label="Consentimiento de Cookies y Privacidad"`
- AND screen readers MUST announce the purpose of the banner upon focus.

### Requirement: Persistent Consent State and Re-Opening Preferences

The system MUST allow users to revisit and modify their cookie preferences at any time through a designated link in the footer.

#### Scenario: User reopens cookie preferences from footer

- GIVEN a user who previously accepted or rejected cookies
- WHEN the user clicks the "Configuración de Cookies" link in the footer
- THEN the consent preferences panel MUST open
- AND the user MUST be able to change their election and save updated preferences.
