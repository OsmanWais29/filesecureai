// CORS: public routes answer any website; private routes only the SFAI app.
import { expect, it } from "vitest";
import { setup } from "./helpers.js";

it("allows any origin on public routes and only the app elsewhere", async () => {
  const { crm } = await setup();
  const origin = (path: string) =>
    crm.app
      .request(path, { headers: { origin: "https://www.trustee.ca" } })
      .then((r) => r.headers.get("access-control-allow-origin"));
  expect(await origin("/crm/public/embed.js")).toBe("https://www.trustee.ca");
  expect(await origin("/crm/health")).toBe("https://app.test");
});
