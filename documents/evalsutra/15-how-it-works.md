# How it works

A plain-language tour with pictures. No code knowledge needed.

## The idea in one sentence

You write the rules first, record what the agent actually did, and let a deterministic program compare the two.

<!--@diagram:pipeline-->

| Word | Plain meaning |
|---|---|
| Suite | Your list of rules |
| Case | One situation you test |
| Assertion | One rule inside a case |
| Observation | What the agent did in that situation |
| Gate | The overall decision |

## How one rule is judged

<!--@diagram:status-->

Missing information is its own answer. It is never rounded up to a pass.

## Which evidence counts

<!--@ladder-->

## How the final decision is made

<!--@diagram:gate-->

`GO_CANDIDATE` means your recorded evidence met your thresholds. A person still decides whether to release.

## What a failing run looks like

<!--@samplebars-->

## Why sample size matters

An 80% pass rate on 5 cases and on 1000 cases are not the same knowledge. EvalSutra prints a 95% Wilson interval so you can see the uncertainty.

<!--@samplesize-->

## Comparing two versions

<!--@diagram:compare-->

## Where everything runs

<!--@layers-->
