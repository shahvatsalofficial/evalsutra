# EvalSutra evaluation report

Suite: **demo-agent-acceptance**  
Mode: **offline replay**  
Scoring: **scoring-v2**  
Gate: **NO_GO**  
Pass rate (scored assertions only): **77.8%**  
Evidence coverage: **90.0%**  
Case-level pass rate 95% Wilson CI: **37.6% – 96.4%** (n=5)  

> Evaluates supplied observations only; no target agent was executed by EvalSutra.

| Case | Result | Critical | Evidence source |
|---|---|---|---|
| factual-answer | pass | yes | test_fixture |
| json-contract | pass | no | test_fixture |
| version-format | pass | no | test_fixture |
| tool-order | pass | no | test_fixture |
| forbidden-tool | fail | yes | test_fixture |
| latency | inconclusive | no | unspecified |

A GO_CANDIDATE is not a release authorization. Human review remains required.
