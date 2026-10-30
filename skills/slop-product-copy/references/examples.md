# Product copy examples

| # | Where | Before | After | Rules |
|---|---|---|---|---|
| 1 | Error toast | "Oops! Something went wrong!" | "Could not save the invoice. Check your connection and try again." | NS-C-04, 16 |
| 2 | Form validation | "Invalid input" | "Enter a date after 1 May." | NS-C-04 |
| 3 | Field help | A three-line paragraph under "Tax code" explaining what a tax code is | Label "Tax code" and hint "10 or 13 digits" | NS-C-02 |
| 4 | Empty state | "Unlock the power of invoicing! Get started today." | "No invoices yet" + button "Create invoice" | NS-C-05, 16 |
| 5 | Button | "Submit" | "Send leave request" | NS-C-03 |
| 6 | Status cell | `PENDING_REVIEW` | "Pending review" (from key `leave.status.pending_review`) | NS-C-07 |
| 7 | Detail row | "Phone: -" or "Phone: n/a" | Row hidden, or "Phone: Not set" with "Add phone" | NS-C-08 |
| 8 | Owner column | `u_5f3a9c20-...` | "Linh Tran" | NS-C-07, 10 |
| 9 | Count | "You have 1 task(s)" | ICU: `{n, plural, one {# task} other {# tasks}}` | NS-C-13 |
| 10 | Date | "2026-05-14" built by string | "14 May 2026" via Intl, "14 tháng 5, 2026" in vi | NS-C-11 |
| 11 | Title case | "Create New Leave Request" | "Create leave request" | NS-C-14 |
| 12 | Catalog | `"save": "Save"` only in en.json | `save` present in en.json and vi.json ("Lưu") | NS-C-12 |

## Notes

- Row 1: the fix removes "Oops", the exclamation marks and the vague failure in one change. Rule list is long on purpose; cite the most specific.
- Row 3 is the usual slop: explanation as decoration. Leave the hint out when the label is enough.
- Row 7: a hidden row needs no explanation. If the field is required, "Not set" must come with the action that sets it.
- Row 8: map ids to names in the data layer, not in the view. If the name is unknown, show "Unknown user", not the id.
- Row 9: write the plural once, with ICU; do not hard-code "s".
- Row 12: a missing vi key is a Hard fail (NS-C-12), even when en looks right.
- Vietnamese equivalents for rows 1, 4, 5: "Không lưu được hóa đơn. Kiểm tra kết nối rồi thử lại." / "Chưa có hóa đơn" + "Tạo hóa đơn" / "Gửi đơn nghỉ phép" (native review recommended).
