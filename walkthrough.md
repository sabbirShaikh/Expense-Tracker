# Walkthrough - Simplified Landing Page Copy & Support Desk Integration

We have simplified the landing page text to make it easy for any normal user to understand (replacing complex tech terms with simple daily bookkeeping concepts), added a public FAQ accordion section, added a public support email form, and integrated a private support center.

## Changes Made

### SEO & Page Titles

#### Branded Favicon
- Designed and overwrote [favicon.svg](file:///Users/tablesprintshubhanshu/Desktop/react-practice/expense/Expense-Tracker/public/favicon.svg) in the public assets directory. The new icon features a premium indigo wallet vector accented with golden and sky-blue sparkles, aligning with the WalletInsights identity.

#### [index.html](file:///Users/tablesprintshubhanshu/Desktop/react-practice/expense/Expense-Tracker/index.html)
- Added dynamic OpenGraph (Facebook/LinkedIn) and Twitter Cards preview meta tags.
- Added SEO `description` and `keywords` tags.
- Referencd the generated OpenGraph image (`/og-image.jpg`).

#### Social Preview Image
- Generated a high-fidelity glassmorphism dashboard graphic featuring the `WalletInsights` brand layout, saved at [og-image.jpg](file:///Users/tablesprintshubhanshu/Desktop/react-practice/expense/Expense-Tracker/public/og-image.jpg).

#### Dynamic Browser Tab Titles
- Added `useEffect` document title hooks inside each page module to dynamically update the browser tab title as users navigate:
  - **Landing Page:** `"WalletInsights — Track Income, Expenses & Friends' Debits"`
  - **Auth/Login/Register:** `"Login & Onboarding | WalletInsights"`
  - **Dashboard Overview:** `"Overview Dashboard | WalletInsights"`
  - **Credits (Income):** `"Incomes & Earnings | WalletInsights"`
  - **Debits (Expenses):** `"Expenses & Spendings | WalletInsights"`
  - **Borrow & Lend Ledger:** `"Borrow & Lend Ledger | WalletInsights"`
  - **Statements & Exports:** `"Generate Account Statements | WalletInsights"`
  - **Workspace Settings:** `"Profile & Workspace Settings | WalletInsights"`
  - **Support Center:** `"Contact Workspace Support | WalletInsights"`

## Verification
- Successfully ran `npm run build` with clean outputs.
