<div align="center">

# Claim Denial Prediction and Root Cause Classifier

<p align="center">
  <a href="https://claim-denial-prediction-root-cause-nine.vercel.app/">
    <strong>Live Demo</strong>
  </a>
</p>

![Claim Denial Prediction Workflow](workflow-diagram.png)

</div>

---

## Overview

Healthcare billing teams lose time and revenue when claims are denied after submission. This project brings that check earlier — before a claim is submitted, it estimates the probability of denial and, if a denial remark is provided, classifies the likely operational root cause with a recommended first-pass fix.

It combines structured CMS Medicare provider-service data with an X12 RARC-style NLP dataset, so billing teams can flag high-risk claims and route denial reasons to the right team before they become a loss.

---

## Aim

- Estimate the probability of denial for a claim before it is submitted, not after
- Classify the operational root cause of a denial from remark text using an X12 RARC-style taxonomy
- Group predictions into clear risk tiers so billing teams can prioritize what to review first
- Explain every prediction with the underlying feature drivers, not just a score
- Pair each root-cause classification with a recommended first-pass fix

---

## Key Features

- **Denial risk prediction** — a boosted tree model trained on CMS Medicare provider-service data, tuned with Optuna, returning a 0–100% denial probability
- **Risk tiering** — predictions are grouped into low, medium, and high risk using optimized probability thresholds
- **Root-cause classification** — an NLP classifier (TF-IDF and DistilBERT compared) maps denial remark text to an X12 RARC-style taxonomy
- **Explainability** — SHAP-based top feature drivers for every denial risk prediction
- **First-pass remediation** — each root-cause classification comes with a recommended fix and confidence score
- **FastAPI + Streamlit** — a live API backend and an interactive dashboard for entering claim details and reviewing results

---


## Application Screenshots

<div align="center">

### Claim Denial Predictor — Input
*Provider info, utilization sliders, denial remark text, and risk flags feed the model.*

<img src="predictor-empty.png" alt="Claim Denial Predictor Input" width="720" />

<br /><br />

### Claim Denial Predictor — Result
*Denial probability gauge, risk tier, and root-cause classification with a recommended fix.*

<img src="predictor-result.png" alt="Claim Denial Predictor Result" width="720" />

</div>

---


## Benefit

- **Fewer denials reach submission** — flagging high-risk claims beforehand lets billing teams intervene before revenue is lost
- **Faster root-cause resolution** — denial remarks are automatically routed to the right operational category instead of being triaged manually
- **Actionable, not just predictive** — every output comes with a recommended fix, so teams know what to do next, not just what went wrong
- **Transparent decisions** — SHAP-based explainability means risk scores can be justified and trusted rather than treated as a black box
- **Scales across claim volume** — a live API and dashboard let the same pipeline support high claim throughput without added manual review effort

---


