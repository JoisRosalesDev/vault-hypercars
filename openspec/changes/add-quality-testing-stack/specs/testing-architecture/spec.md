# Testing Architecture Specification

## Purpose

Defines the automated testing architecture for `vault-hypercars`, establishing Vitest for isolated unit/component testing, Playwright for end-to-end user path verification, and OpenSpec quality gate configuration enforcing TDD rules.

## Requirements

### Requirement: Unit & Component Testing Automation (Vitest)

The testing framework MUST execute isolated unit tests for utility functions, currency helpers, Prisma client wrappers, and React 19 Client Components with sub-second execution feedback.

#### Scenario: Isolated Helper Function Verification

- GIVEN currency conversion rate utility `currency.ts`
- WHEN formatting a USD price into EUR or AED target currencies
- THEN the function MUST return correctly formatted currency strings without DOM or API dependencies
- AND total execution time MUST complete in under 500 milliseconds

#### Scenario: React 19 Client Component State Render

- GIVEN the `ProductCard` component with an in-stock hypercar item
- WHEN rendered using React Testing Library with mocked cart context
- THEN the component MUST render the stock status badge and enable the "Añadir al Carrito" action button

#### Scenario: Out of Stock Component Guard

- GIVEN the `ProductCard` component with a stock count of 0
- WHEN rendered inside the testing environment
- THEN the CTA button MUST be disabled and display the out-of-stock indicator

---

### Requirement: E2E Requirement Verification (Playwright)

The end-to-end testing suite MUST execute automated headless browser flows verifying critical user journeys, including catalog filtering, vehicle inspection modal interactions, cart management, Stripe payment redirection, and admin dashboard authorization.

#### Scenario: Full Customer Catalog and Cart Interaction Flow

- GIVEN an active development server hosting `vault-hypercars`
- WHEN a user navigates to the landing page, filters by brand "Bugatti", opens a vehicle modal, and clicks "Añadir al Carrito"
- THEN the cart drawer MUST slide open displaying the selected vehicle with accurate line-item pricing

#### Scenario: Stripe Checkout Redirection Initiation

- GIVEN a cart containing one or more hypercar items
- WHEN the customer clicks the checkout button in the cart drawer
- THEN the client MUST trigger the checkout API route and redirect the browser to the external Stripe Checkout URL

#### Scenario: Protected Admin Dashboard Access Block

- GIVEN an unauthenticated browser context
- WHEN attempting direct navigation to `/admin/dashboard`
- THEN the system MUST deny access and redirect the session to the login page

---

### Requirement: OpenSpec Quality Gate & TDD Enforcement

The project's OpenSpec configuration file (`openspec/config.yaml`) MUST set `strict_tdd: true` and define executable test runner commands for Vitest unit tests and Playwright E2E suites to block code progression without passing tests.

#### Scenario: Quality Gate Configuration Integrity

- GIVEN the OpenSpec runtime configuration file `openspec/config.yaml`
- WHEN evaluated by the OpenSpec validation tool
- THEN the configuration MUST contain `strict_tdd: true`
- AND runner commands MUST map `test:unit` to Vitest and `test:e2e` to Playwright

#### Scenario: TDD Execution Validation

- GIVEN an active OpenSpec workflow cycle for a new or modified feature
- WHEN code changes are evaluated before committing or archiving
- THEN the configured test runners MUST execute successfully with zero failing tests
