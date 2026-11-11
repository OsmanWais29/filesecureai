/** Reads an OSB acknowledgement/notice (pasted text or extracted PDF text). Never guesses: unreadable fields stay null. */
export interface AckRead { reference: string | null; estateNumber: string | null; date: string | null; outcome: "acknowledged" | "accepted" | "rejected" | null }

const MONTHS: Record<string, string> = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };

export const readAck = (text: string): AckRead => {
  const t = text.replace(/\s+/g, " ");
  const ref = t.match(/(?:reference|confirmation|transaction|submission)\s*(?:no\.?|number|#|id)?\s*[:#]?\s*((?=[A-Z0-9-]*\d)[A-Z0-9][A-Z0-9-]{4,})/i)?.[1] ?? null;
  const est = t.match(/estate\s*(?:no\.?|number|#)\s*[:#]?\s*(\d{2}-\d{5,8}|\d{6,10})/i)?.[1] ?? null;
  let date: string | null = t.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)?.slice(1, 4).join("-") ?? null;
  if (!date) {
    const m = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(20\d{2})\b/i);
    if (m) date = `${m[3]}-${MONTHS[m[1].toLowerCase()]}-${m[2].padStart(2, "0")}`;
  }
  const outcome = /\breject/i.test(t) ? "rejected" : /\baccept/i.test(t) ? "accepted" : /\b(acknowledg|received)/i.test(t) ? "acknowledged" : null;
  return { reference: ref, estateNumber: est, date, outcome };
};

/** The acknowledgement must belong to this estate when both numbers are known. */
export const ackMatchesEstate = (read: AckRead, fileNumber: string | null | undefined) =>
  !read.estateNumber || !fileNumber ? null : read.estateNumber.replace(/\D/g, "") === fileNumber.replace(/\D/g, "");
