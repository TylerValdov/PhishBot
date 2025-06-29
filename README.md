# Phishing Detector

🚀 **Phishing Detector** is a full-stack web app that analyzes emails using Google's Gemini AI and flags potential phishing risks.  
It stores analysis results in MongoDB and provides a history view — perfect for quickly checking suspicious messages.

---

## ✨ Features

✅ Submit email text and receive:
- A **risk score** (0-100)  
- A **short summary** of concerns  
- A list of **specific flags** (like "Unexplained Call to Action")

✅ See the **history of your last 10 checks**.

✅ Built with:
- ⚛️ React frontend (clean textarea + result display)
- ⚡ FastAPI backend (Python)
- 🐳 Dockerized microservices (API + MongoDB)
- ☁️ Ready to deploy on EC2 or any cloud VM

---

## 🚀 Tech Stack

| Layer         | Tech                                |
|---------------|------------------------------------|
| Frontend      | React, JavaScript, Fetch API       |
| Backend       | FastAPI (Python), Google Gemini AI |
| Database      | MongoDB                            |
| DevOps        | Docker, Docker Compose             |
| Misc          | dotenv for config, GitHub Actions ready |

---

## ⚙️ Setup

### 🚀 Run locally with Docker

1. Clone the repo:

   ```bash
   git clone https://github.com/TylerValdov/phishing-detector.git
   cd phishing-detector
