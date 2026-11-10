CREATE OR REPLACE FUNCTION public.validate_estate_trust_posting() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_debit numeric; v_credit numeric; v_bad boolean; v_negative boolean;
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'Posted ledger entries are immutable; post a reversing entry.'; END IF;
 PERFORM 1 FROM public.estates WHERE id=NEW.estate_id FOR UPDATE;
 IF NEW.bank_account_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.estate_bank_accounts WHERE id=NEW.bank_account_id AND estate_id=NEW.estate_id) THEN RAISE EXCEPTION 'Bank account must belong to this estate.'; END IF;
 IF jsonb_typeof(NEW.lines) <> 'array' OR jsonb_array_length(NEW.lines) < 2 THEN RAISE EXCEPTION 'At least two ledger lines are required.'; END IF;
 SELECT coalesce(sum((x->>'debit')::numeric),0),coalesce(sum((x->>'credit')::numeric),0),coalesce(bool_or((x->>'debit') IS NULL OR (x->>'credit') IS NULL OR (x->>'debit')::numeric < 0 OR (x->>'credit')::numeric < 0 OR ((x->>'debit')::numeric > 0 AND (x->>'credit')::numeric > 0)),false) INTO v_debit,v_credit,v_bad FROM jsonb_array_elements(NEW.lines) x;
 IF v_bad OR v_debit <= 0 OR v_debit <> v_credit OR v_debit <> NEW.total_debit OR v_credit <> NEW.total_credit THEN RAISE EXCEPTION 'Ledger debits and credits must balance exactly.'; END IF;
 WITH changes AS (
 SELECT coalesce(e.gl_date,e.created_at::date) AS d, sum((x->>'debit')::numeric-(x->>'credit')::numeric) AS delta FROM public.estate_ledger_entries e CROSS JOIN LATERAL jsonb_array_elements(e.lines) x WHERE e.estate_id=NEW.estate_id AND x->>'account' LIKE '10000%' GROUP BY 1
 UNION ALL SELECT coalesce(NEW.gl_date,current_date),coalesce(sum((x->>'debit')::numeric-(x->>'credit')::numeric),0) FROM jsonb_array_elements(NEW.lines) x WHERE x->>'account' LIKE '10000%'
 ), daily AS (SELECT d,sum(delta) AS delta FROM changes GROUP BY d), balances AS (SELECT sum(delta) OVER (ORDER BY d) AS balance FROM daily)
 SELECT coalesce(bool_or(balance < 0),false) INTO v_negative FROM balances;
 IF v_negative THEN RAISE EXCEPTION 'Posting would leave a negative estate trust balance; check the receipt and payment dates.'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.validate_estate_trust_posting() FROM PUBLIC;
CREATE TRIGGER validate_estate_trust_posting BEFORE INSERT OR UPDATE OR DELETE ON public.estate_ledger_entries FOR EACH ROW EXECUTE FUNCTION public.validate_estate_trust_posting();