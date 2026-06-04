# WellMind Data Solutions - Claim Denial Prediction & Root-Cause Classifier

An end-to-end healthcare revenue cycle management demo that predicts Medicare claim denial/underpayment risk, explains the top risk drivers, and prepares an NLP pipeline for denial root-cause classification.

This project uses public CMS Medicare Physician & Other Practitioners utilization/payment data and synthetic RARC-style denial text for NLP. It is designed as a reproducible portfolio project for RCM analytics, denial prevention, and first-pass resolution workflows.

## Client Hook

Before a claim is submitted, the system estimates the probability that it will be denied or underpaid and explains why, so the billing team can fix issues before the rejection cycle begins.

## Current Status

Completed:

- CMS data loading and exploratory data analysis
- Null, duplicate, outlier, and business-rule review
- Conservative cleaning and audit reports
- Provider credential standardization
- Feature engineering and leakage-aware encoding plan
- Synthetic denial-risk target definition
- Multiple-model training and tuning
- SHAP/model explainability artifacts
- RARC root-cause taxonomy
- Synthetic RARC-style NLP dataset generator

In progress / next:

- NLP root-cause classifier training
- FastAPI inference endpoint
- Dashboard and ROI brief

## Project Structure

```text
step01_eda.py
step02_null_detection.py
step03_duplicate_outlier.py
step04_cleaning.py
step05_credentials.py
step06_encoding.py
step07_premodel_eda.py
step08_model.py
step09_rarc_taxonomy.py
step10_synthetic_rarc_data.py
requirements.txt
```

Generated outputs are saved locally as CSV, PNG, PKL/JSON, and report artifacts. Large generated datasets are intentionally not recommended for GitHub commits.

## Data Source

Primary dataset:

- CMS Medicare Physician & Other Practitioners - by Provider and Service, 2023
- Public use file; no approval required

Important limitation:

CMS PUF data does not contain real claim denial labels, CARC codes, or RARC codes. The ML target is a synthetic denial/underpayment-risk proxy based on the lowest 20 percent payment-to-charge ratio. The NLP data is synthetic RARC-style text generated from a documented root-cause taxonomy.

## Pipeline

### Step 01 - EDA

Loads the raw CMS file, profiles numeric/categorical columns, and saves summary files.

Outputs include:

- `eda_numeric_summary.csv`
- `eda_categorical_summary.csv`
- `eda_column_profile.csv`

### Step 02 - Null Detection

Detects standard nulls, string placeholders, zeros requiring review, negative values, and suspicious missing patterns.

Output:

- `null_detection_summary.csv`

### Step 03 - Duplicate and Outlier Review

Checks full-row duplicates, business-key duplicates, inconsistent provider records, numeric outliers, rare categorical values, and healthcare business-rule flags.

Outputs include:

- `duplicate_detection_summary.csv`
- `outlier_numeric_summary.csv`
- `business_rule_review_summary.csv`
- `outlier_detection_charts.png`

### Step 04 - Cleaning

Applies conservative cleaning decisions. Outliers and zero values are documented instead of blindly removed.

Outputs include:

- `Medicare_Cleaned_Week1.csv`
- `cleaning_null_before_after.csv`
- `cleaning_column_actions.csv`
- `cleaning_summary.csv`

### Step 05 - Credential Standardization

Normalizes provider credentials into modeling groups such as Physician, NP, PA, Therapist, CRNA, and Other.

Outputs include:

- `Medicare_Cleaned_Credentials.csv`
- `credentials_group_summary.csv`
- `credentials_mapping_audit.csv`

### Step 06 - Feature Engineering and Encoding

Creates business-rule flags, log-transformed numeric features, binary encodings, and baseline numeric modeling data.

High-cardinality encoding is deferred to Step 08 to avoid train/test contamination.

Outputs include:

- `Medicare_Cleaned_Outliers.csv`
- `Medicare_Cleaned_Encoded.csv`
- `feature_rule_review_summary.csv`
- `encoding_summary.csv`
- `encoding_deferred_high_cardinality.csv`

### Step 07 - Pre-Model EDA

Creates the synthetic denial-risk target and produces target-level EDA, statistical tests, and charts.

Outputs include:

- `target_definition_card.md`
- `modeling_feature_policy.csv`
- `premodel_eda_summary.csv`
- `premodel_statistical_tests.csv`
- charts in `charts/`

### Step 08 - Model Training

Trains and compares multiple models with leakage controls:

- Logistic Regression
- HistGradientBoosting
- Random Forest
- Extra Trees
- XGBoost
- LightGBM
- Tuned XGBoost
- Tuned LightGBM
- Soft-voting ensemble

Key controls:

- target threshold learned from training data only
- payment outcome columns dropped before modeling
- high-cardinality frequency/target encodings fit on training split only
- moderated class weighting
- balanced validation thresholding
- overfit/underfit audit
- subgroup/bias audit

Best completed model:

| Metric | Value |
|---|---:|
| Best model | LightGBM Tuned |
| Test ROC-AUC | 0.9819 |
| Test PR-AUC | 0.9480 |
| Test F1 | 0.8732 |
| Test Precision | 0.8746 |
| Test Recall | 0.8719 |
| Test Brier Score | 0.0453 |

Business lift:

| Decile | Risk rate | Lift | Captured risk |
|---:|---:|---:|---:|
| Top 10% | 99.39% | 4.97x | 49.69% |
| Top 20% | 75.23% | 3.76x | 37.61% |

Outputs include:

- `model_outputs/model_comparison.csv`
- `model_outputs/model_training_report.json`
- `model_outputs/risk_decile_report.csv`
- `model_outputs/threshold_review_table.csv`
- `model_outputs/feature_importance.csv`
- `model_outputs/best_denial_risk_model.pkl`
- `model_outputs/charts/`

### Step 09 - RARC Root-Cause Taxonomy

Creates a documented root-cause taxonomy for denial NLP labels.

Categories:

- eligibility
- coding_error
- authorization
- duplicate_claim
- not_covered
- timely_filing
- medical_necessity
- coordination_of_benefits
- documentation
- other

Outputs:

- `nlp_outputs/rarc_root_cause_taxonomy.csv`
- `nlp_outputs/rarc_category_mapping.csv`
- `nlp_outputs/rarc_reference_summary.csv`
- `nlp_outputs/rarc_taxonomy_model_card.md`

### Step 10 - Synthetic RARC-Style NLP Dataset

Generates balanced synthetic denial remark text from the Step 09 taxonomy and creates train/validation/test splits.

Outputs:

- `nlp_outputs/rarc_denial_dataset.csv`
- `nlp_outputs/rarc_train.csv`
- `nlp_outputs/rarc_val.csv`
- `nlp_outputs/rarc_test.csv`
- `nlp_outputs/rarc_dataset_quality_report.csv`
- `nlp_outputs/rarc_data_stats.png`

## Installation

Create and activate a virtual environment:

```powershell
py -m venv env
.\env\Scripts\activate
```

Install dependencies:

```powershell
py -m pip install -r requirements.txt
```

If using the active environment:

```powershell
python -m pip install -r requirements.txt
```

## How to Run

Run the pipeline in order:

```powershell
python step01_eda.py
python step02_null_detection.py
python step03_duplicate_outlier.py
python step04_cleaning.py
python step05_credentials.py
python step06_encoding.py
python step07_premodel_eda.py
python step08_model.py
python step09_rarc_taxonomy.py
python step10_synthetic_rarc_data.py
```

Step 08 can take a long time on large data. For a faster demo run, reduce tuning settings inside `step08_model.py`.

## Model Interpretation

The model is designed for ranking and prevention workflows:

- High PR-AUC means the model is strong at finding high-risk claims in an imbalanced setting.
- Balanced precision/recall reduces the chance of a model that over-flags too many claims.
- Decile lift shows business value: the top-risk deciles concentrate a large share of risky claims.
- SHAP/feature importance artifacts explain which features drive predictions.

Top model drivers observed:

- charge-per-service proxy
- HCPCS code frequency and smoothed target signal
- provider state signal
- provider specialty signal
- total services and beneficiary volume

## Leakage and Bias Controls

The project explicitly avoids several common modeling mistakes:

- The target threshold is learned from training data only.
- Payment outcome columns used to define the synthetic target are dropped before modeling.
- High-cardinality encoders are fit on training rows only.
- Validation data is used for threshold/model selection.
- Test data is kept as final holdout evaluation.
- Subgroup metrics are saved for key operational groups.

## Limitations

This is a public-data portfolio project, not a production payer-denial model yet.

Known limitations:

- CMS PUF does not include actual denial labels.
- The denial target is a synthetic underpayment-risk proxy.
- RARC/CARC denial text is synthetic RARC-style text, not real payer remittance data.
- Real deployment should connect payer remittance files, claim status, CARC/RARC codes, appeal notes, and adjudication outcomes.

## GitHub Publishing Notes

Do not commit:

- `env/`
- raw CMS data folders
- multi-GB cleaned CSVs
- model binaries if they are too large
- cache folders

Recommended GitHub contents:

- Python scripts
- `requirements.txt`
- README
- small audit CSVs
- model cards / methodology notes
- selected charts

Large data/model files should be shared through a release artifact, cloud storage link, or regenerated by running the pipeline.

## Roadmap

Next planned work:

- Step 11: Train NLP root-cause classifier with TF-IDF baseline and DistilBERT comparison
- Step 12: FastAPI endpoint for claim risk and denial reason prediction
- Step 13: Dashboard for denial trends by CPT, payer, provider specialty, and geography
- ROI brief and methodology PDF for business buyers

## Business Use Case

For an RCM team, even a small reduction in denial rate can have material financial impact.

Example:

```text
A 5% denial-rate reduction on $10M in claims can represent up to $500K protected or recovered.
```

This project demonstrates the analytics foundation for that workflow: predict risk before submission, identify the root cause, and route the claim to the right fix team.
