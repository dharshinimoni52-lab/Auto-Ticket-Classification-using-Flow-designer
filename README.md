# Automatic Incident Classification using ServiceNow Flow Designer

A no-/low-code ServiceNow project that automatically sets the **Category**, **Subcategory** and **Assignment group** of new incidents using a keyword-weight rules table and a Flow Designer flow. Low-confidence tickets are routed to a manual triage queue instead of being guessed.

> **Full project report (PDF):** [docs/Auto_Incident_Classification_Flow_Designer.pdf](docs/Auto_Incident_Classification_Flow_Designer.pdf)

**Author:** Your Name &nbsp;|&nbsp; **Course/Institution:** Your Course

## Table of contents
1. [Problem statement](#problem-statement)
2. [Objectives](#objectives)
3. [Tech stack](#tech-stack)
4. [Architecture](#architecture)
5. [Repository structure](#repository-structure)
6. [Setup and implementation](#setup-and-implementation)
7. [Test plan](#test-plan)
8. [Evaluation metrics](#evaluation-metrics)
9. [Limitations](#limitations)
10. [Future enhancements](#future-enhancements)

## Problem statement
Service desk agents manually read each new incident and pick its category, subcategory and assignment group. This is slow, inconsistent, and often leads to misrouted tickets. This project automates classification at the moment a ticket is created.

## Objectives
- Auto-populate Category, Subcategory and Assignment group on new incidents
- Reduce time to first assignment
- Send low-confidence tickets to a triage queue
- Keep rules maintainable by non-developers (data in a table, not code)

## Tech stack
- ServiceNow Personal Developer Instance (free: https://developer.servicenow.com)
- Flow Designer and Action Designer
- Server-side JavaScript (GlideRecord) inside a custom action
- Roles needed: `admin` or `flow_designer`

## Architecture

```
New Incident created
        |
        v
Flow Designer trigger (Category is empty)
        |
        v
Custom Action: Classify Ticket (script + keyword rules table)
        |
        v
Confidence >= 60 ?
   |-- Yes --> Update Incident (category, subcategory, group) + work note
   |-- No  --> Assign to "Service Desk Triage" + work note
```

**How scoring works:** every active rule whose keyword appears in the short description or description adds its weight to its category/subcategory bucket. The highest-scoring bucket wins. Confidence = winning bucket's score / total matched weight x 100.

## Repository structure
```
.
├── README.md
├── LICENSE
├── data/
│   └── ticket_keyword_rules.csv     # sample rules to import into the rules table
├── scripts/
│   └── classify_ticket_action.js    # script step for the custom action
├── docs/
│   ├── test_plan.md                 # test cases and results template
│   └── Auto_Incident_Classification_Flow_Designer.pdf  # full report
└── screenshots/                     # add flow, action, rules table and test screenshots here
```

## Setup and implementation

### Step 1: Create the rules table
System Definition > Tables > New. Name: `u_ticket_keyword_rule`

| Field | Column name | Type |
|---|---|---|
| Keyword | `u_keyword` | String |
| Category | `u_category` | String (choice value, e.g. `network`) |
| Subcategory | `u_subcategory` | String |
| Assignment group | `u_assignment_group` | Reference (sys_user_group) |
| Weight | `u_weight` | Integer (1 to 10) |
| Active | `u_active` | True/False |

### Step 2: Load the rules
Import `data/ticket_keyword_rules.csv` (System Import Sets > Load Data) or enter rows manually. Create the assignment groups first (Network Support, Service Desk, Application Support, Hardware Support, Identity Team, Service Desk Triage) and make sure the group names in the CSV match.

### Step 3: Add optional fields on Incident
- `u_auto_classified` (True/False)
- `u_confidence` (Integer)

### Step 4: Build the custom action
Flow Designer > Action Designer > New.
- Name: `Classify Ticket`
- Inputs: `short_description` (String), `description` (String)
- Outputs: `category`, `subcategory`, `assignment_group` (sys_id string), `confidence` (Integer)
- Add a **Script** step and paste the contents of `scripts/classify_ticket_action.js`, mapping the script step's inputs/outputs to the action's inputs/outputs
- Publish

### Step 5: Build the flow
Flow Designer > New > Flow. Name: `Auto Classify Incident`
- **Trigger:** Record > Created, table Incident, condition `Category is empty`
- **Action:** `Classify Ticket` (inputs from the trigger record's Short description and Description)
- **If** `confidence >= 60`
  - Update Record: Category, Subcategory, Assignment group from outputs; `u_auto_classified = true`; `u_confidence = confidence`
  - Add work note: "Auto-classified as [category]/[subcategory] with [confidence]% confidence"
- **Else**
  - Update Record: Assignment group = Service Desk Triage
  - Add work note: "Could not classify with confidence; manual triage needed"
- **Activate**

## Test plan
See [docs/test_plan.md](docs/test_plan.md). Verify results in **Flow Designer > Executions** and the incident activity log.

## Evaluation metrics
- **Accuracy:** % of auto-classified tickets whose category was not changed by an agent
- **Auto-classification rate:** % of tickets handled without the triage fallback
- **Time to assignment:** average before vs. after automation

## Limitations
- Keyword matching misses synonyms, typos and non-English text
- Rules need periodic maintenance
- Overlapping keywords can misclassify; weights and the confidence threshold reduce but do not remove this

## Future enhancements
- Replace the script with **Predictive Intelligence** trained on historical incidents
- Use **NLU** for intent detection
- Feedback loop: log agent corrections and use them to tune rules
- Extend to Requests, Changes and HR cases
- Dashboard for classification accuracy

## License
MIT. See [LICENSE](LICENSE).
