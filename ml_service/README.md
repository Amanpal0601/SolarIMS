# SolarIMS Infrastructure Monitoring System

SolarIMS is a high-performance analytics and monitoring suite specifically designed for Photovoltaic (PV) solar installations. It integrates advanced Machine Learning models with a real-time REST API to provide predictive energy forecasting and automated fault diagnosis for enterprise-scale solar farms.

## Technical Capabilities

### Photovoltaic Energy Forecasting
The system utilizes a Multi-Output XGBoost Regressor to predict a 13-hour daylight generation profile (06:00 to 18:00). 
- **Algorithm:** XGBoost (Extreme Gradient Boosting) was selected for its superior performance on tabular sensor data compared to recurrent neural networks.
- **Feature Engineering:** Implements cyclical temporal encoding (sine/cosine transformations) and rolling statistical windows to capture seasonal and daily variations in environmental data.

### Automated Fault Diagnosis
The anomaly detection engine identifies operational inconsistencies and classifies them into specific fault categories, including Short Circuit, Shading, and Open Circuit scenarios.
- **Model Selection:** Employs an automated selection pipeline between Random Forest Classifiers and Multi-Layer Perceptrons (MLP).
- **Data Imbalance Mitigation:** Utilizes SMOTE (Synthetic Minority Over-sampling Technique) to ensure high precision in identifying rare fault events within highly imbalanced sensor datasets.

### Infrastructure & Deployment
- **API Framework:** Built on FastAPI for high-concurrency request handling and automated OpenAPI documentation.
- **Integration Engine:** Includes a physics-based fallback mechanism to ensure response consistency during edge-case sensor scenarios.
- **Connectivity:** Integrated support for secure public tunneling via Ngrok to facilitate remote frontend integration.

## Project Structure

- `src/`: Core Machine Learning pipelines and feature engineering logic.
- `app.py`: Main FastAPI application entry point.
- `models/`: Serialized model binaries and evaluation metrics.
- `data/`: Local storage for dataset ingestion.
- `requirements.txt`: Comprehensive list of Python environment dependencies.

## Installation

Ensure a Python 3.8+ environment is active, then install the required dependencies:

```bash
pip install -r requirements.txt
```

To initialize the monitoring API:

```bash
python app.py
```

## Dataset Requirements
The pipelines expect structured PV sensor data. Ensure the following datasets are available in the `data/` directory:
1. Plant Generation Data
2. Weather Sensor Data
3. PV Fault Classification Dataset
