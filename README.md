# FacialRecognitionAttendance — VisionGuard

### A Facial Recognition-Based Attendance Management System

**VisionGuard** is a facial recognition-based attendance management system designed to make attendance tracking more convenient, efficient, and reliable. By integrating facial recognition technology with a web-based dashboard, a backend server, and a database, the system aims to simplify the process of identifying individuals and recording their attendance.

Instead of relying entirely on manual attendance sheets or roll calls, VisionGuard provides a technology-driven approach that helps reduce repetitive administrative work, save time, and minimize common errors associated with manual recording. Its goal is to make attendance management more organized and accessible for educational institutions and other environments where attendance monitoring is necessary.

Key Features

- **Facial Recognition:** Uses a trained facial recognition model as part of the attendance system to support identifying registered individuals.
- **Automated Attendance Tracking:** Designed to streamline attendance recording and reduce the need for manual input.
- **Web-Based Dashboard:** Provides a centralized interface for accessing and managing attendance-related information.
- **Database Integration:** Uses MongoDB to store and manage application data.
- **Python-Based Scanner:** Includes a Python scanner component for camera-based image capture and facial recognition-related operations.
- **Convenient Workflow:** Brings the frontend, backend, database, and recognition components together in one project.
- **Improved Efficiency:** Helps reduce repetitive tasks and makes attendance records easier to manage and review.

Project Objectives

VisionGuard was developed to explore how computer vision and web technologies can improve traditional attendance management. The project focuses on making the process more convenient for users while providing a structured way to manage attendance information.

Its main objectives are to:

- Reduce the time and effort required for routine attendance recording.
- Minimize errors associated with manual attendance tracking.
- Use facial recognition to support identity-based attendance recording.
- Provide an accessible dashboard for managing attendance information.
- Demonstrate the practical integration of frontend development, backend services, database management, and computer vision.

Technologies Used

| Technology | Purpose |
|---|---|
| React | Builds the web-based user interface. |
| Vite | Provides frontend development and production build tooling. |
| Node.js | Runs the backend application. |
| Express.js | Handles backend routes and API requests. |
| MongoDB | Stores application and attendance-related data. |
| Python | Supports the facial recognition scanner and image capture components. |
| Trained facial recognition model | Supports the project's facial recognition workflow. |
| Git and GitHub | Provides version control and project hosting. |

How It Works

The system brings several components together to support the attendance workflow:

1. **User Interface:** The VisionGuard frontend provides an interface for interacting with the attendance system.
2. **Backend Processing:** The Node.js backend handles application requests and communicates with the database.
3. **Facial Recognition:** The Python scanner and trained recognition model support the facial recognition component.
4. **Database Management:** MongoDB stores relevant application information and attendance records.
5. **Attendance Monitoring:** The dashboard provides a centralized place to access and review attendance-related information.

The complete workflow depends on the proper configuration and connection of the frontend, backend, database, and facial recognition components.

Benefits

**Convenience:** Helps simplify attendance recording by incorporating facial recognition into the workflow.

**Efficiency:** Reduces dependence on repetitive manual attendance tasks and supports a more streamlined process.

**Organization:** Keeps attendance-related information within a database-backed application.

**Practical Integration:** Demonstrates how web development, database management, and computer vision can work together in a real-world application.

**Portfolio Value:** Showcases practical experience in building a multi-component application that combines frontend development, backend APIs, database connectivity, and machine learning-related functionality.

Running the Project Locally

Prerequisites

Make sure you have the following installed and configured:

- Node.js and npm
- MongoDB
- Python and the dependencies required by the scanner
- A compatible camera for testing the facial recognition component

1. Clone the repository

```bash
git clone https://github.com/KJFraser03/FacialRecognitionAttendance.git
cd FacialRecognitionAttendance
```

2. Set up the backend

```bash
cd backend
npm ci
```

Create a local `.env` file in the `backend` folder and configure the required environment variables, including your MongoDB connection string. Keep real credentials private and never commit your `.env` file.

Start the backend:

```bash
npm start
```

The backend is configured to use port `5001` by default.

### 3. Set up the frontend

Open a separate terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL displayed by Vite in your browser. The default development address is usually `http://localhost:5173`.

### 4. Set up the Python scanner

Open the `python_scanner` folder and install the Python dependencies required by the scanner. Ensure that the trained model and any required recognition data are available in the locations expected by the code, and connect a compatible camera before testing.

**Note:** The backend, frontend, and scanner must be configured correctly for the full attendance workflow to operate. A successful frontend build or backend startup alone does not confirm that every recognition and attendance feature is working.

Project Status

The frontend production build has completed successfully, and the backend has started locally and connected to MongoDB during development testing. End-to-end testing of facial recognition, attendance recording, and the complete user workflow should be performed in the intended environment.

About This Project

FacialRecognitionAttendance is a software development project focused on applying facial recognition and web technologies to a practical attendance management problem. It demonstrates the integration of multiple software components into a unified application, with an emphasis on convenience, efficiency, and organized attendance tracking.




<img width="1240" height="722" alt="image" src="https://github.com/user-attachments/assets/b2dc567e-1597-431a-af0e-91a5e514d82b" />


**GitHub Repository:** [KJFraser03/FacialRecognitionAttendance](https://github.com/KJFraser03/FacialRecognitionAttendance)
