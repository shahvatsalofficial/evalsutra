# EvalSutra evaluation report

Suite: **demo-agent-acceptance**  
Mode: **offline replay**  
Scoring: **scoring-v2**  
Gate: **GO_CANDIDATE**  
Pass rate (scored assertions only): **100.0%**  
Evidence coverage: **100.0%**  
Case-level pass rate 95% Wilson CI: **61.0% – 100.0%** (n=6)  

> Evaluates supplied observations only; no target agent was executed by EvalSutra.

| Case | Result | Critical | Evidence source |
|---|---|---|---|
| factual-answer | pass | yes | test_fixture |
| json-contract | pass | no | test_fixture |
| version-format | pass | no | test_fixture |
| tool-order | pass | no | test_fixture |
| forbidden-tool | pass | yes | test_fixture |
| latency | pass | no | test_fixture |

A GO_CANDIDATE is not a release authorization. Human review remains required.
