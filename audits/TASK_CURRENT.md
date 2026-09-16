# Electrical Tasks Master — Stage 1 Independent Audit

ROLE: INDEPENDENT AUDIT ONLY
AUDITED_HEAD_SHA: `0231119f6ff56922434e8a954cc3f90d906689b2`
REPORT_PATH: `audits/reports/ELECTRICAL_TASKS_STAGE1_0231119.md`

Verify independently:
- first-class Electrical Tasks discoverability on desktop/tablet/phone;
- Feeder / Panel Run only enabled template in Stage 1;
- task data shape/provenance;
- Job-owned persistence only;
- create/save/edit/reload/duplicate/delete/active semantics;
- BLANK != ZERO round-trip;
- Job A/B isolation;
- Save Draft does not mutate Job Materials;
- future templates fail closed;
- task core loads before UI and runtime survives offline PWA v53;
- no regression in existing tool navigation/project mode;
- exact SHA CI provenance.

P0/P1 => C REJECT. Zero P0/P1 => A/B according to protocol.
