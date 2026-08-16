# Workflow — Tailor Shop Management App (v1)

## 1. Signup, Approval & Subscription
1. Tailor signs up (phone/email/Google)
2. Redirected to subscription screen: fee amount + JazzCash/EasyPaisa/bank transfer instructions
3. Tailor pays manually, uploads proof (screenshot or reference number) to Supabase Storage
4. Account shows "Pending verification" waiting screen
5. App owner checks the Supabase dashboard periodically, verifies payment, flips shop status to "approved"
6. App unlocks automatically via Supabase Realtime the moment status changes — no polling, no manual refresh needed
7. Every 30 days this repeats for renewal; a few days' grace period before the account locks if unpaid

## 2. Customers & Measurements
1. Home screen → primary button: "Add Customer / Take Measurement"
2. Enter name and/or WhatsApp number (only one required)
3. Select garment type from a single-select tile picker (loads that garment's template)
4. For each measurement field: numeric input + a row of multi-select style tag chips (tailor can select zero, one, or several tags per field — selected chips are navy-filled, unselected are outlined)
5. "+ Add field" option available if the template is missing something for this order
6. Enter order quantity → Save
7. **Returning customer flow**: search by name/number → matching customer(s) shown → select → their last measurement for the relevant garment auto-fills → tailor confirms or edits values/tags → creates a new order (does not overwrite the old measurement record, saves as this order's snapshot)
8. Each garment ordered = a separate order record, but all of a customer's orders are visible together on their profile page

## 3. Orders & Status
1. Order status: Received → Ready → Delivered (3 stages only)
2. Optional due date field at creation
3. When tailor marks an order **Ready**: a "Notify Customer" button appears → opens WhatsApp with the pre-filled "Ready for Pickup" template (auto-filled with customer name + shop name)
4. When tailor marks an order **Done** (delivered):
   - Confirmation prompt appears
   - If due amount = 0 → order closes fully, customer removed from Active Clients list
   - If due amount > 0 → order marked delivered, customer moves to the **Pending Amount** list instead (no longer "active" since the dress is gone — this is now purely a money-owed record)

## 4. Dashboard
1. Header: shop name + logo (pulled from Settings)
2. Summary cards (tappable, each navigates to its filtered list):
   - Active Clients — count of customers with an in-progress order
   - Amount Pending — sum of all outstanding balances across Pending Amount list
   - Garment-type breakdown — dynamic cards per garment type currently pending delivery (e.g. "6 shirts pending", "3 suits pending") — only show types that currently have pending orders
3. Bottom navigation: Home · Active Clients · All Clients (search) · Settings

## 5. Active Clients screen
1. List view: name, phone, garment/dress count, total order amount, due amount
2. Tap a row → full customer profile: all measurements, full order history, contact info
3. From the profile or list row: WhatsApp button (opens chat with that number), edit due amount inline, "Mark Done" button
4. Mark Done triggers the confirmation + routing logic described in section 3 above

## 6. Pending Amount list (Ledger)
1. Separate screen/tab from Active Clients
2. Each row: customer name, phone, amount still owed, order-placed date, delivery date
3. Tap into a customer → payment history log (each payment recorded as its own entry: date + amount) — not a single editable total
4. Tailor can add a new payment entry here, which reduces the remaining balance and logs to history
5. When balance reaches 0, customer is removed from this list automatically
6. "Send Reminder" action available → opens WhatsApp with the pre-filled Payment Reminder template

## 7. Billing & Receipts
1. From an order screen, tailor can tap "Generate Receipt" at any time (not automatic)
2. Receipt shows: shop name/logo, bill/order number, garment(s) and quantity, amount (itemized if the tailor chose that mode), amount paid vs. due, estimated pickup date, and a closing thank-you line with the shop name
3. Receipt renders as a shareable image or PDF, with a "Send via WhatsApp" action to deliver it directly

## 8. Settings
Organized into clear sections:
- **Shop Profile** — shop/brand name, owner name, phone, logo upload
- **Message Templates** — 4 editable templates (Order Placed, Ready for Pickup, Payment Reminder, Thank You/Delivered), each showing available placeholders (customer name, shop name, bill number, quantity, amount, pickup date) that auto-fill when a message is sent
- **Garment & Measurement Templates** — list of garment categories, each with its own field list; tailor can add/edit/remove fields and categories directly; if they prefer not to, they can contact the app owner via WhatsApp for manual setup (no in-app request system needed)
- **Language** — toggle between English and Urdu; affects field labels, navigation, and UI text app-wide (RTL layout applies when Urdu is active)

## Reference: Multi-select chip pattern (source: tailor's own paper template)
Each measurement row has two parts, side by side:
- A numeric value input (what the tailor writes, e.g. "40")
- A set of tappable style tag chips relevant to that specific measurement (e.g. Baazu → "Half Ban" / "Cuff"; Length → "Poni Patti" / "1¼ Patti") — tailor can select any number of these per row, not just one
Selected chip = navy filled background, white text. Unselected = outlined, navy text on white/transparent.

## Reference: Single-select tile pattern
For choices where only one option applies (e.g. garment type at the start of a new order), use large tappable cards in a grid, each with a label (and icon/illustration if available), with a checkmark overlay on the currently selected card — only one card can be active at a time.
