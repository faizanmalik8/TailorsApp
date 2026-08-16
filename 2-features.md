# Features — Tailor Shop Management App (v1)

## 1. Signup, Approval & Subscription
- Shop owner signs up via phone, email, or Google
- Manual monthly subscription: tailor pays via JazzCash/EasyPaisa/bank transfer and uploads payment proof
- Account stays "pending" until the app owner manually verifies and approves
- Renews every 30 days; a few days' grace period after expiry before locking
- No custom admin panel needed — approvals handled directly via the Supabase dashboard (Table Editor + Storage browser)

## 2. Shop Profile & Branding
- Set in Settings (not at signup): shop/brand name, owner name, phone number, logo
- Shop name + logo appear on the home dashboard, every WhatsApp message, and every receipt

## 3. Customers
- Minimal fields: name + WhatsApp number, only one required
- Searchable by name or number

## 4. Measurements
- Garment-type templates (Shalwar Qameez, Shirt, Waistcoat, etc.), pre-loaded with common fields
- Each field = numeric value + optional multi-select style tags (see workflow doc for the exact UI pattern)
- Fully customizable per shop — add/edit fields and garment types in Settings
- Bilingual field labels (English/Urdu) built in for default fields; custom fields typed directly by the tailor in their preferred script
- Returning customers: last measurement for a garment auto-fills on a new order, tailor confirms or edits

## 5. Orders
- One order per garment (simpler tracking), grouped visually under the customer's profile
- 3-stage status: Received → Ready → Delivered
- Optional due date
- No photos in v1

## 6. Dashboard
- Shop name + logo header
- Summary cards: Active Clients count, Total Amount Pending, garment-type breakdown of pending deliveries
- Bottom nav: Home, Active Clients, All Clients, Settings

## 7. Billing & Receipts
- Total-only by default, itemized breakdown optional
- Receipts generated on-demand (not automatic), shareable as image/PDF via WhatsApp
- Includes shop branding, bill number, garment count, amount, estimated pickup date, thank-you closing line

## 8. Ledger (Pending Amount)
- Separate from Active Clients — this is for orders already delivered but not fully paid
- Shows order-placed date and delivery date
- Payment history logged individually (date + amount per payment), not a single overwritable total
- No automated reminders — manual only, using the Payment Reminder message template

## 9. Customer Messaging
- Four editable message templates in Settings: Order Placed, Ready for Pickup, Payment Reminder, Thank You/Delivered
- All auto-filled with order data (customer name, shop name, bill number, quantity, amount, pickup date)
- Sent via a one-tap "Send via WhatsApp" action — no messaging API, just a pre-filled WhatsApp deep link

## Explicitly excluded from v1
- Staff/multiple logins per shop
- Customer or order photos
- Automated payment reminders
- Custom admin dashboard UI (Supabase dashboard used directly)
- Card/automatic subscription billing
