# User Data Rights Specification

## Purpose

Enforces GDPR and local personal data regulations (ARCO rights under Chilean Law 21.719) by providing automated endpoints and accessible self-service user interfaces for personal data portability (export) and erasure (right to be forgotten / data deletion).

## Requirements

### Requirement: Self-Service Data Portability (Export)

The system MUST provide an API endpoint and user-accessible interface allowing individuals to request or directly download all personal data (including order records and transaction metadata) linked to their verified email address in standard machine-readable JSON format.

#### Scenario: Customer requests data export with existing records

- GIVEN a customer who previously made purchases using email `customer@example.com`
- WHEN the customer submits an export request via the Privacy Center or `POST /api/privacy/request` with `{ email: "customer@example.com", action: "export" }`
- THEN the system MUST query all matching `Order` and `OrderItem` records
- AND the system MUST return a structured JSON response containing sanitized customer profile and order transaction history without exposing sensitive internal keys
- AND the response MUST include HTTP status 200.

#### Scenario: Customer requests data export with no existing records

- GIVEN an email `unknown@example.com` with no registered orders or user accounts
- WHEN the client submits an export request for `unknown@example.com`
- THEN the system MUST return HTTP status 200 with an empty record payload and informative message confirming that no personal data is stored for this address
- AND the system MUST NOT leak administrative error logs to the client.

### Requirement: Right to Erasure (Data Deletion / Right to be Forgotten)

The system MUST provide an API endpoint and user-accessible interface allowing individuals to request complete erasure or anonymization of their personal data from non-immutable system logs.

#### Scenario: Customer submits data erasure request

- GIVEN existing `Order` records associated with `customer@example.com`
- WHEN the customer submits an erasure request via `POST /api/privacy/request` with `{ email: "customer@example.com", action: "delete" }`
- THEN the system MUST anonymize or purge `customerEmail` in matching completed or cancelled `Order` records (replacing with `anonymized_<UUID>@vault.invalid`)
- AND the system MUST preserve financial transaction integrity (idempotency key, amounts, purchased vehicles) for tax compliance while severing identifiable personal connections
- AND the response MUST return HTTP status 200 with confirmation message "Datos personales anonimizados/eliminados con éxito".

#### Scenario: Malformed privacy request submission

- GIVEN an incoming privacy request payload with missing email or invalid email format
- WHEN the client calls `POST /api/privacy/request` with `{ email: "not-an-email", action: "export" }`
- THEN the system MUST reject the request with HTTP status 400 Bad Request
- AND the response MUST provide an explicit validation error message.

### Requirement: Consent and Policy Version Logging

The system MUST record the timestamp and version of terms and privacy policy accepted during checkout transactions.

#### Scenario: Checkout records consent metadata in transaction logs

- GIVEN a customer completing checkout via the application
- WHEN the checkout payload is processed by the API
- THEN the created or updated `Order` metadata MUST include `{ privacyConsent: true, policyVersion: "2026.1", consentedAt: "<ISO_DATE>" }`
- AND these records MUST be queryable for regulatory compliance audits.
