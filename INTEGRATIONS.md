# FitAura Data Integrations & Limitations

This document outlines the current state, limitations, and developer requirements for third-party health integrations within FitAura.

## Supported Integrations (OAuth2)
These providers support standard OAuth2 flows and are fully integrated into the `/api/connect/*` endpoints:
*   **Google Fit / Health Connect**
*   **Fitbit**
*   **Oura Ring**

## Provider-Specific Limitations & Requirements

### 1. Apple Health (HealthKit)
**Limitation:** Apple HealthKit data is securely siloed on the iOS device and does not have a web-accessible REST API. 
**Solution:** We have exposed an ingestion endpoint at `POST /api/sync/apple-health/:uid`. To sync data, users must set up an iOS Shortcut (or use a companion iOS app) that reads their HealthKit data and POSTs it directly to this endpoint.

### 2. Garmin (Garmin Connect API)
**Limitation:** The Garmin Health API is not open to individual developers by default. 
**Requirement:** You must apply for the **Garmin Health Developer Program** and be approved as an enterprise partner before you are granted API credentials. Until approved, the Garmin connection in the UI is stubbed.

### 3. Whoop
**Limitation:** The Whoop API (v2) requires a developer account and app approval.
**Requirement:** You must register at developer.whoop.com and submit your application for review to get production credentials.

### 4. Samsung Health
**Limitation:** Samsung Health's SDK is heavily restricted and typically requires partnering directly with Samsung. There is no open public REST API for general web access.
**Status:** Currently unsupported. Users on Android should be directed to sync Samsung Health data into **Google Fit/Health Connect**, and then connect Google Fit to FitAura.

### 5. Xiaomi / Mi Band
**Limitation:** Xiaomi does not provide an official, public REST API for Mi Fit / Zepp Life data.
**Status:** "Coming Soon". Do not fake a connection. The UI alerts the user that this API is not publicly available.

## Unified Data Model Schema
All incoming data, regardless of the provider, is normalized and stored in Firestore at `/users/{uid}/dailyMetrics/{date}` using the following schema:
```json
{
  "date": "2026-07-17",
  "steps": 10500,
  "heartRateAvg": 68,
  "heartRateResting": 52,
  "sleepMinutes": 450,
  "sleepStages": {
    "light": 210,
    "deep": 90,
    "rem": 100,
    "awake": 50
  },
  "activeCalories": 650,
  "hrv": 55,
  "spo2": 98,
  "recoveryScore": 85,
  "sources": {
    "steps": "google-fit",
    "sleep": "oura"
  }
}
```
