import { test, expect } from "vitest";
import { templateFor } from "@/components/estate/forms/FormDetails";
const it = (number: string, label: string, known = true): any => ({ number, evaluation: { version: { label, known } } });
test("post-cutover estates get the 2024 official template", () => expect(templateFor(it("Form 79", "Current version")).url).toBe("/osb-forms/form-79-2024.pdf"));
test("pre-2024 estates get the pre-2024 official template", () => expect(templateFor(it("Form 65", "Pre-2024 version")).url).toBe("/osb-forms/form-65-pre2024.pdf"));
test("unknown version shows no template", () => expect(templateFor(it("Form 31", "Version unknown", false)).url).toBeNull());
test("unversioned forms use the single official file", () => expect(templateFor(it("Form 68", "Current version")).url).toBe("/osb-forms/form-68.pdf"));
