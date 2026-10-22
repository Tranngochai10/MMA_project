# VoucherHub — Brand Voucher Marketplace Mobile UI

A complete, high-fidelity mobile application for discovering, purchasing, and redeeming **Brand Vouchers, Discount Deals, and Promotions** built with **React Native**, **Expo (SDK 58)**, **TypeScript**, and **Expo Router**.

Designed following premium mobile UI/UX principles: warm cream background (`#FFF8F1`), soft peach promotional banners (`#FFF0DF`), coral-orange gradient accents (`#FF765F` → `#FF9D43`), white rounded cards (16–22px radius), circular brand logos, and floating bottom tab navigation.

---

## 📱 Visual Roles Supported

The application supports exactly two complete visual roles:
1. **USER (Customer)**: Browse curated brand vouchers, filter by category/discount/price, save favorites, simulate one-click purchases with demo checkout, manage voucher passes inside **My Wallet**, and simulate in-store barcode redemption.
2. **MANAGER (Merchant)**: Professional business dashboard for partner merchants (e.g., Starbucks Coffee). View sales stats, active voucher count, total orders, create/edit voucher campaigns, toggle campaign status (**Draft**, **Active**, **Paused**, **Ended**), inspect customer acquisition orders, and audit simulated in-store redemption events.

A dedicated **Role Preview Portal** (`/role-preview`) and quick-switch action inside the Profile tab allow instant toggling between both experiences during evaluation.

---

## 🎨 Design System & Theme Tokens

| Token | Value | Description |
|---|---|---|
| **Primary Coral** | `#FF765F` | Primary brand accent and gradients |
| **Primary Orange** | `#FF9D43` | Secondary gradient accent |
| **Light Peach** | `#FFF0DF` | Promotional card backdrops and soft tags |
| **Warm Cream** | `#FFF8F1` | App-wide screen background |
| **White** | `#FFFFFF` | Rounded cards and dialog containers |
| **Primary Text** | `#202020` | Headings and high-emphasis labels |
| **Secondary Text** | `#888888` | Subtitles, descriptions, timestamps |
| **Border** | `#F0EFED` | Card borders and dividers |
| **Success** | `#2E9D68` | Completed orders, active badges |
| **Error** | `#DC4F4F` | Validation errors, destructive actions |
| **Disabled** | `#F2F2F2` | Inactive buttons and expired cards |

---

## 📂 Navigation & Screen Architecture

All routes are fully implemented with Expo Router in `src/app/`:

### 1. Authentication & Onboarding Routes
- `/splash` — Minimal brand logo, warm cream aesthetic, quick start buttons.
- `/onboarding` — 3 interactive slides with illustrations, pagination indicators, Skip, Next, and Get Started.
- `/login` — Welcome heading, demo credential autofill presets (User vs Manager), password visibility toggle, remember me, validation, social login demo.
- `/register` — Full name, email, phone, password confirmation, terms acceptance, validation, success modal.
- `/forgot-password` — Lock illustration, email input, validation, simulated reset instructions modal.
- `/reset-password` — Password inputs, confirmation matching, update success modal.
- `/role-preview` — Visual role selector allowing the reviewer to preview USER or MANAGER mode.

### 2. User Experience Routes (`/(user)`)
- `/(user)/home` — Header greeting with avatar, notification badge, rounded search bar with filter trigger, peach promotional banner ("UP TO 80% OFF"), circular Featured Brands list, 2-column "Special For You" voucher grid, Trending Deals, and New Arrivals.
- `/(user)/discover` — Full voucher explorer with search, category chips, sort options (Popular, Biggest Discount, Price Low-to-High), filter bottom sheet, 2-column voucher grid, and empty search states.
- `/(user)/brands` — Brand catalog with category filters, rating badges, active voucher counters, and favorite actions.
- `/(user)/brands/[id]` — Brand detail view with cover banner, circular logo, about text, general policy, and brand-specific voucher list.
- `/(user)/vouchers/[id]` — Voucher detail screen featuring large cover image, brand store link, expiration countdown, usage terms bullet list, savings pill, share simulation, and fixed bottom "Buy Voucher" CTA.
- `/(user)/checkout` — Order summary, discount breakdown, payment method picker (Marketplace Wallet, Card, Apple Pay, PayPal), demo disclaimer, confirmation dialog, and simulated order placement.
- `/(user)/order-result` — Order receipt, generated voucher code, payment status, and navigation to My Wallet or Home.
- `/(user)/orders` — Order history with tabs (**All**, **Paid**, **Pending**, **Failed**, **Cancelled**).
- `/(user)/orders/[id]` — Detailed order receipt with item breakdown and direct wallet pass shortcut.
- `/(user)/wallet` — Mobile voucher wallet with tabs (**All**, **Available**, **Redeemed**, **Expired**).
- `/(user)/wallet/[id]` — **Simulated Voucher Usage**: Shows unique voucher code, copy passcode button, and prominent "Use Voucher" action. Tapping "Use Voucher" prompts confirmation, updates status to **REDEEMED**, records simulated redemption timestamp, and notifies the manager dashboard.
- `/(user)/favorites` — Dual-tab view for saved vouchers and favorite partner brands.
- `/(user)/notifications` — Notification center tracking purchase confirmations, redemption events, and perks.
- `/(user)/profile` — User profile, settings, terms, role-switcher, and logout.
- `/(user)/edit-profile` — Avatar change with Image Picker integration, name, email, phone editing with validation.

### 3. Manager Experience Routes (`/(manager)`)
- `/(manager)/dashboard` — Merchant metrics (active vouchers, orders, issued count, simulated redemptions, total revenue), quick action buttons, recent customer orders, and live redemption feeds.
- `/(manager)/vouchers` — Campaign list with search, status filtering (**Active**, **Paused**, **Draft**, **Ended**), inline status transitions with confirmation dialogs.
- `/(manager)/vouchers/create` — Voucher creator with title, description, category, original vs selling price, discount calculation, total quantity, schedule dates, conditions, cover image selection, draft and publish actions.
- `/(manager)/vouchers/[id]` — Campaign overview with real-time performance stats (issued vs remaining, revenue) and live status controls (Activate / Pause / End).
- `/(manager)/vouchers/[id]/edit` — Pre-filled form to update campaign details with validation.
- `/(manager)/orders` — Merchant customer transaction audit log with search and inspection dialog.
- `/(manager)/redemptions` — Live simulated redemption audit log displaying customer names, verified passcodes, and redemption timestamps.
- `/(manager)/profile` — Manager account settings, brand assignment, and switcher back to User mode.

---

## 🛠 Reusable UI Components

Located in `src/components/`:
- `AppHeader` — Top navigation with avatar greeting, notification unread badge, and back button.
- `SearchBar` — Rounded search field with active filter badge indicator and clear button.
- `BrandLogo` — Circular brand logo with fallback initial badge and soft shadow.
- `BrandCard` — Horizontal brand card with ratings, voucher counter, and favorite toggle.
- `VoucherCard` — 2-column voucher ticket with image, discount tag, brand badge, expiration, and price display.
- `VoucherGrid` — 2-column responsive layout.
- `WalletVoucherCard` — Cutout ticket style with status badges and voucher code teaser.
- `FilterBottomSheet` — Modal with categories, brand selector, price range, discount %, and availability toggle.
- `FloatingTabBar` — Rounded floating bottom navigation bar with peach focus highlight.
- `ManagerStatCard` — Metric cards with percentage change and color-coded icons.
- `ManagerVoucherCard` — Compact campaign card with action buttons for Edit, Pause, Activate, and End.
- `ConfirmDialog` — Reusable dialog with destructive & confirmation variants.
- `SuccessModal` — Success modal with checkmark illustration and customizable CTA.
- `ScreenContainer` — SafeArea wrapper with warm cream background and status bar styling.
- `PrimaryButton` / `SecondaryButton` / `GradientButton` — Coral-to-orange gradient action buttons.
- `FormInput` / `PasswordInput` — Form fields with validation error text and password visibility toggles.
- `EmptyState` / `LoadingState` / `ErrorState` — State placeholders.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm or bun

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start Expo Development Server
```bash
npx expo start
```

### 3. Open on Mobile or Web
- Press `w` in the terminal to view on web browser.
- Scan the QR code using the **Expo Go** app on iOS or Android.
- Press `a` for Android Emulator or `i` for iOS Simulator.

### 4. Verify TypeScript
```bash
npx tsc --noEmit
```

---

## 🔒 Front-End Simulation Disclaimer

This project is a 100% frontend UI demonstration. No backend database, live credit card processors, or real email servers are connected. All authentication states, voucher redemptions, and order creations are safely executed in local React state.
