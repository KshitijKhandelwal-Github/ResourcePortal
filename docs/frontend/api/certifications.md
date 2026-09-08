# Technical Documentation: `frontend/src/api/certifications.js`

## 1. Overview & Purpose

`certifications.js` provides client-side API functions for managing professional certifications and industry credentials held by team members (e.g., AWS Certified Solutions Architect, Google Professional Cloud Architect, PMP).

### Analogy
Think of this as an employee's **credential trophy case**. Clients and leadership often need verified proof of certifications to staff enterprise bids or audit regulatory compliance; this file allows the portal to catalog and inspect those credentials.

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

- **`client`**: The centralized Axios HTTP client instance configured with authorization headers and error interceptors.

---

## 3. Function Explanations & API Endpoints

### 1. `getCertifications(employeeId)`
- **HTTP Method & Path**: `GET /resources/:employeeId/certifications`
- **What it does**: Retrieves all recorded professional certifications for a specific employee code.
- **Why it's needed**: Feeds the certifications listing table on `ResourceDetailPage` and the personal certificates card on `ProfilePage`.
- **Parameters**:
  - `employeeId` (*String*): The employee's unique identifier (e.g., `"EMP001"`).
- **Returns**: A Promise resolving to an array of certification records:
  ```json
  [
    {
      "id": 1,
      "resource_id": 1,
      "name": "AWS Certified Solutions Architect - Associate",
      "issuing_organization": "Amazon Web Services",
      "issue_date": "2024-05-10",
      "expiry_date": "2027-05-10"
    }
  ]
  ```

### 2. `addCertification(employeeId, data)`
- **HTTP Method & Path**: `POST /resources/:employeeId/certifications`
- **What it does**: Adds a new certification record to the employee's profile.
- **Why it's needed**: Used when a team member passes a certification exam and logs the credential.
- **Parameters**:
  - `employeeId` (*String*): The employee's ID.
  - `data` (*Object*):
    - `name` (*String, required*): Official title of the credential.
    - `issuing_organization` (*String, optional*): Organization that granted it (e.g. Microsoft, AWS, Cisco).
    - `issue_date` (*String, optional*): Date of issuance (`YYYY-MM-DD`).
    - `expiry_date` (*String, optional*): Validity expiration date (`YYYY-MM-DD`).
- **Returns**: A Promise resolving to the newly inserted certification record.

### 3. `updateCertification(certId, data)`
- **HTTP Method & Path**: `PUT /certifications/:certId`
- **What it does**: Updates an existing certification entry by its database ID.
- **Why it's needed**: Used to renew credentials (extending expiry date) or correct credential names.
- **Parameters**:
  - `certId` (*Number*): The ID of the certification.
  - `data` (*Object*): Partial object of fields to update.
- **Returns**: A Promise resolving to the updated certification record.

---

## 4. Key Concepts for Beginners

- **Credential Lifecycle Management**: Storing `issue_date` and `expiry_date` allows the portal to calculate whether a credential is actively valid or expired, which is critical for RFP (Request For Proposal) resource allocation.

