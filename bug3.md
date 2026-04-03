## Summary
The mobile tab switcher uses resultsExpanded state which has confusing and inverted logic for what it actually controls.

## Bug Details
**Location:** `client/src/pages/CodingChallenge.tsx` lines 430-447

- When "Description" tab is clicked, resultsExpanded is set to true
- But the left pane (description) uses resultsExpanded with hidden pattern (line 450)
- This means when resultsExpanded=true, description is shown on mobile, but the state name suggests otherwise
- The state name "resultsExpanded" is misleading - it actually controls description visibility, not test results

## Severity
MEDIUM - Mobile users may see wrong tab content

## Fix
Rename state to showDescription and fix the toggle logic to be more intuitive.

## Location
client/src/pages/CodingChallenge.tsx