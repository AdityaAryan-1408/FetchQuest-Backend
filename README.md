# ⚙️ FetchQuest (Backend Server)

**FetchQuest (Backend)** powers the **FetchQuest** ecosystem — a hyper-local, peer-to-peer micro-economy designed for closed communities like college campuses 🎓.  

This repository contains the **Node.js**, **Express**, and **MongoDB** backend API for the application.  
It provides a **RESTful API** for managing users and quests, a **Socket.IO server** for real-time chat 💬, and all **security logic** for safe transactions and communication.

---

## 🧩 Technology Stack

- 🟩 **Framework:** Node.js, Express.js  
- 🗄️ **Database:** MongoDB (with Mongoose ODM)  
- 🔁 **Real-time:** Socket.IO  
- 🔐 **Authentication:** JWT (jsonwebtoken), bcryptjs  
- ☁️ **File Uploads:** Cloudinary, express-fileupload  
- 📧 **Email:** Nodemailer  
- 🔒 **Security:** Node.js Crypto Module (AES-256 encryption for phone numbers)

---

## 🚀 Key Features

### 🔐 Secure API
- All sensitive routes are protected via **JWT authentication middleware**.  
- Role-based access ensures users only interact with data they own.

---

### 👥 User Authentication
- Full **registration**, **login**, **email verification**, and **password reset** flow.  
- Passwords hashed with **bcryptjs** before storage.  
- Tokens managed using **jsonwebtoken** for safe, stateless sessions.

---

### 🧾 Quest Management API
- RESTful endpoints to **create**, **accept**, **complete**, **cancel**, and **delete** quests.  
- Supports full lifecycle: from posting a quest → accepting → completion → rating.

---

### 💬 Real-time Chat Server
- Built using **Socket.IO** for live, room-based messaging between Requesters and Runners.  
- Chats are **persisted in MongoDB** (`messages` collection).  
- Automatically creates isolated rooms per accepted quest for privacy.

---

### 🔒 Secure Data Handling
- 🧂 Passwords hashed using **bcryptjs**.  
- 🔐 Phone numbers encrypted using **AES-256** (via Node.js crypto module).  
- ☎️ A secure endpoint (`/api/requests/:id/contact`) decrypts and reveals contact info **only** for users in an active, accepted quest.

---

### 🖼️ Image Uploads
- Handles **profile picture uploads** via **Cloudinary**.  
- Updates stored user image URLs securely through API endpoints.

---

### ⭐ Reputation System
- Users can **rate** each other after completing a quest.  
- Ratings are averaged and reflected in the user’s profile and **live feed** via the `averageRating` field.

---

## 🧠 API Endpoints

### 🔑 Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/register` | Register a new user & send verification email |
| `POST` | `/login` | Log in a verified user and return a JWT |
| `GET` | `/verify-email` | Verify a user's email via token |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Reset password with valid token |

---

### 👤 Users (`/api/users`)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/me` | Get current user profile (with decrypted phone) |
| `PATCH` | `/update` | Update user’s name |
| `PATCH` | `/update-phone` | Update & encrypt phone number |
| `POST` | `/upload` | Upload a new profile picture (Cloudinary) |
| `DELETE` | `/delete` | Delete account and all associated data |

---

### 📦 Requests (`/api/requests`)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/` | Create a new quest |
| `GET` | `/` | Get all open quests (for live feed) |
| `GET` | `/my-requests` | Get quests created by logged-in user |
| `GET` | `/my-runs` | Get quests accepted by logged-in user |
| `PATCH` | `/:id/accept` | Accept an open quest |
| `PATCH` | `/:id/complete` | Mark quest as completed (Requester only) |
| `PATCH` | `/:id/cancel` | Cancel an accepted quest (Requester/Runner) |
| `DELETE` | `/:id` | Delete an open quest (Requester only) |
| `POST` | `/:id/rate` | Submit a rating for a completed quest |
| `GET` | `/:id/contact` | Securely get decrypted phone number for an accepted quest |

---

## 🛡️ Security Highlights
- AES-256 encryption for user phone numbers.  
- JWT-based route protection for all authenticated actions.  
- Sanitized inputs and strict schema validation with **Mongoose**.  
- Cloudinary and Express-fileupload handle uploads securely.

---

## 🧰 Developer Info
**Backend:** Node.js (Express.js)  
**Database:** MongoDB (Mongoose)  
**Realtime:** Socket.IO  
**Auth:** JWT + bcryptjs  
**File Storage:** Cloudinary  
**Email Service:** Nodemailer  

---

## 🧑‍💻 Future Enhancements
- 🧾 Logging & monitoring with Winston or PM2  
- 🚨 Rate limiting & brute force protection  
- 🗺️ Geo-based quest discovery  
- 📈 Admin analytics dashboard  

---

### 🌟 Contributing
Pull requests are welcome! Please open an issue first to discuss your proposed changes.

---

### 📝 License
This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.

---

💡 *Secure, scalable, and built to power collaborative student communities.*
