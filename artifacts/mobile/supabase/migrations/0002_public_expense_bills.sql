-- Expense bills/invoices are public transparency records.
-- Only Masjid Real Documents and other explicitly private evidence remain protected.
update public.expense_documents
set is_private = false
where document_type in ('bill', 'invoice');
