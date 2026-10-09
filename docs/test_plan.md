# Test Plan

Create each incident with the short description below (leave Category empty) and record the result.

| # | Short description | Expected category / subcategory | Expected group | Expected route | Actual result | Pass/Fail |
|---|---|---|---|---|---|---|
| 1 | Cannot connect to VPN from home | network / vpn | Network Support | Auto-classified | | |
| 2 | Forgot my password | inquiry / password reset | Service Desk | Auto-classified | | |
| 3 | Outlook keeps crashing | software / email | Application Support | Auto-classified | | |
| 4 | Printer jammed on floor 3 | hardware / printer | Hardware Support | Auto-classified | | |
| 5 | Need a new chair | none | Service Desk Triage | Low confidence fallback | | |
| 6 | VPN down and laptop slow | mixed; check which wins | depends on weights | Verify score logic | | |

Where to check: Flow Designer > Executions (step inputs/outputs) and the incident activity log (work notes).

## Metrics (fill in after testing)
- Tickets tested:
- Auto-classified correctly:
- Sent to triage:
- Accuracy:
