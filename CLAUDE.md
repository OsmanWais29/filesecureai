# Focus: SFAICRM

Active work happens in the **SFAICRM** repository (`OsmanWais29/SFAICRM`, private),
not in this one. This repository (`filesecureai`) is the old FileSecure app; leave it
unchanged unless the owner asks for a change here by name.

At the start of every session:

1. Attach SFAICRM with push access (`add_repo`: owner `OsmanWais29`, repo `SFAICRM`,
   access `push`) and clone it to `/home/user/sfaicrm`.
2. Do all reading, changes, commits and pushes in `/home/user/sfaicrm`.
3. If attaching fails, say so and ask the owner to check the Claude GitHub App's access
   to SFAICRM, rather than working in this repository instead.

SFAICRM contains `crm-app/` (CRM front end) and `sfai-platform-module/` (AWS backend
module + CDK); see its README for how to run and test it.
