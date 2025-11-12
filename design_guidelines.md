# Amazeon ERP - Design Guidelines

## Design Approach

**Selected System:** Material Design 3 adapted for enterprise ERP applications
**Rationale:** ERP systems prioritize data clarity, efficient workflows, and consistent interaction patterns. Material Design provides robust components for forms, tables, and dashboards while maintaining professional aesthetics suitable for business applications.

**Core Principles:**
- Data-first hierarchy: Information accessibility over visual flair
- Consistent interaction patterns across all modules
- Efficient task completion with minimal clicks
- Clear visual feedback for all user actions

---

## Typography System

**Font Family:** Inter (via Google Fonts CDN)
- Primary: Inter (400, 500, 600, 700)

**Hierarchy:**
- **H1 (Page Titles):** text-3xl font-semibold (Dashboard, Invoice Management)
- **H2 (Section Headers):** text-2xl font-semibold (Today's Sales, Inventory List)
- **H3 (Card Titles):** text-lg font-medium (Invoice Details, Product Info)
- **Body Text:** text-base font-normal (Form labels, table content)
- **Small Text:** text-sm (Helper text, timestamps, metadata)
- **Micro Text:** text-xs (Badges, status indicators)

**Labels & Inputs:**
- Form labels: text-sm font-medium
- Input text: text-base
- Placeholder text: text-sm opacity-60

---

## Layout System

**Spacing Primitives (Tailwind Units):**
Primary spacing scale: **2, 4, 6, 8, 12, 16**

**Application:**
- Micro spacing (icons, badges): p-2, gap-2
- Standard padding (cards, inputs): p-4, p-6
- Section spacing: mb-8, mt-12
- Page margins: p-8, p-12
- Form field spacing: space-y-4
- Button padding: px-6 py-2

**Grid System:**
- Dashboard cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Form layouts: Single column max-w-2xl for clarity
- Table layouts: Full width with horizontal scroll on mobile

**Container Widths:**
- Login page: max-w-md mx-auto
- Forms: max-w-3xl
- Dashboards: Full width with max-w-7xl
- Tables: Full width

---

## Component Library

### 1. Authentication & Navigation

**Login Page:**
- Centered card (max-w-md) on neutral background
- Logo placement: Top center, mb-8
- Form fields: Stacked vertically, space-y-4
- Input fields: Full width, h-12, border with focus ring
- Submit button: Full width, h-12, prominent styling
- Remember me checkbox: text-sm with subtle styling

**Sidebar Navigation (Post-Login):**
- Fixed left sidebar: w-64 on desktop, collapsible on tablet/mobile
- Navigation items: px-4 py-3, hover background transition
- Active state: Distinct background with left border accent (border-l-4)
- Section dividers: my-4 border-t
- User profile: Bottom of sidebar with avatar and name

**Top Bar:**
- Height: h-16
- Logo: Left aligned, h-8
- User menu: Right aligned with avatar + dropdown
- Breadcrumbs: Center or left after logo (text-sm)

### 2. Dashboard Components

**Metric Cards (Sales/Expense Summary):**
- Card structure: p-6, rounded-lg, shadow-sm
- Icon: Top left, text-2xl
- Value: text-3xl font-bold, mt-2
- Label: text-sm, mt-1, opacity-70
- Change indicator: text-sm with up/down arrow (if applicable)
- Grid layout: 3 columns on desktop, 1 on mobile

**Date Range Picker:**
- Inline or dropdown style
- Two input fields: From Date | To Date
- Apply button: ml-4

### 3. Forms & Inputs

**Invoice Creation Form:**
- Two-column layout on desktop (md:grid-cols-2 gap-6)
- Auto-generated invoice number: Read-only field with distinct styling
- Input fields: h-12, px-4, rounded border
- Dropdown (Item selection): Searchable combobox pattern
- Rate field: Auto-filled with edit capability indicator
- Quantity input: Number input with +/- buttons (optional inline)
- Payment mode: Radio buttons or prominent dropdown
- Action buttons row: justify-end gap-4

**Input Field Structure:**
```
- Label: mb-2 block text-sm font-medium
- Input: w-full h-12 px-4 rounded border
- Helper text: mt-1 text-xs
- Error state: Red border + error message below
- Required indicator: Red asterisk after label
```

**Buttons:**
- Primary action: px-6 py-2.5, rounded, font-medium
- Secondary action: px-6 py-2.5, border variant
- Icon buttons: p-2 square for compact actions
- Button group spacing: gap-4

### 4. Data Display

**Invoice Table (Sales Overview):**
- Table header: Sticky top, font-semibold, border-b-2
- Row height: py-4
- Cell padding: px-6
- Alternating rows: Subtle background on even rows
- Hover state: Slight background change
- Action column: Right-aligned with icon buttons
- Mobile: Card-based layout instead of table

**Table Columns:**
- Invoice No. | Date | Customer | Items | Amount | Payment Mode | Actions
- Column widths: Auto-adjust with min-widths
- Sortable headers: Arrow indicator

**Invoice Detail View:**
- Header section: Invoice number + date (text-2xl)
- Customer info card: p-6 border rounded
- Items table: Full width with columns (Item, Rate, Qty, GST, Total)
- Totals section: Right-aligned, text-lg
- Grand total: text-2xl font-bold, border-t-2 pt-4

### 5. Admin Features

**Inventory Management:**
- Add Product button: Top right, prominent
- Product list: Grid or table view toggle
- Product card: p-4, includes image placeholder, name, rate, GST %, edit/delete icons
- Edit modal: Centered overlay (max-w-lg) with form fields

**B2B Invoice Generation:**
- Additional field: GST Number input (prominent placement)
- Series indicator: AZB format clearly displayed
- Otherwise identical to standard invoice form

**Report Download Section:**
- Date range selector: Horizontal layout
- Report type: Radio buttons or tabs
- Download button: px-8 py-3, with download icon
- Preview area: Optional table showing data summary

### 6. Print Layout

**Thermal Print Invoice:**
- Width: 80mm standard thermal paper
- Font sizes: Smaller scale (10-14px equivalents)
- Logo: Centered, max-height: 60px
- Invoice details: Left-aligned blocks
- Items table: Simple borders, compact spacing
- Totals: Bold, right-aligned
- Footer: Text-center, text-xs (Thank you message)

### 7. Overlays & Modals

**Modal Structure:**
- Backdrop: Semi-transparent overlay
- Modal card: max-w-2xl, mx-auto, mt-20, p-6
- Header: flex justify-between, text-xl font-semibold, mb-6
- Close button: Top right, icon only
- Footer actions: flex justify-end gap-4, mt-6

**Alerts/Toasts:**
- Position: Top-right corner
- Duration: 3-5 seconds
- Types: Success, Error, Warning, Info with distinct icons
- Dismiss button: Right side

---

## Interaction Patterns

**Form Submission:**
- Disable button during processing
- Show loading spinner on button
- Success: Toast notification + redirect/reset
- Error: Inline error messages under fields

**Table Interactions:**
- Click row: Navigate to detail view
- Edit icon: Open edit modal
- Delete icon: Confirmation dialog before action

**Navigation:**
- Active route: Bold text + background highlight in sidebar
- Breadcrumb links: Clickable path navigation

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (Single column, hamburger menu)
- Tablet: 768px - 1024px (Collapsed sidebar, 2-column grids)
- Desktop: > 1024px (Full sidebar, 3-column grids)

**Mobile Adaptations:**
- Sidebar: Drawer overlay triggered by hamburger
- Tables: Transform to stacked cards
- Multi-column forms: Stack to single column
- Metric cards: Full width stacking

---

## Animation Guidelines

**Use Sparingly:**
- Sidebar expand/collapse: 200ms ease
- Modal fade in: 150ms
- Dropdown menus: 100ms
- Button hover: No animation, instant state change
- Page transitions: None (instant navigation)

---

## Accessibility

- All form inputs include visible labels
- Focus states: 2px ring around interactive elements
- Tab navigation: Logical order through forms
- Required fields: Asterisk + aria-required
- Error messages: Associated with inputs via aria-describedby
- Color contrast: WCAG AA minimum (4.5:1 for text)