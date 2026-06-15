# SDM Consent - LiveAvatar NextJS Application

Shared decision-making and informed consent simulation built on the LiveAvatar Web SDK.

This app is a clone of the demo project with a dedicated clinical dashboard focused on treatment options, risks/benefits, and consent documentation for a third-molar extraction case.

## Getting Started

From the repository root:

```bash
pnpm install
pnpm run sdm-consent
```

Or navigate to the `apps/sdm-consent` directory and run:

```bash
pnpm install
pnpm run dev
```

Navigate to [http://localhost:3009](http://localhost:3009).

## Environment

Copy API secrets configuration from another app (e.g. `apps/demo/app/api/secrets.ts`) or set the required environment variables for your LiveAvatar context.
