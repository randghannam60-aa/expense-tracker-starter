

# Expense Tracker

A full-stack web application designed to track and manage personal expenses efficiently.

---

## Project Links

- **GitHub Repository:** [Your GitHub Repository Link Here]
- **Demo Video (Google Drive):** [Your Google Drive Video Link Here]

---

## How to run

**Backend**
1. Open pgAdmin and create a new database named `expense_tracker`.
2. Open the Query Tool for `expense_tracker`, paste the content of `backend/schema.sql`, and execute it to create the tables.
3. Open your terminal in VS Code and navigate to the `backend` folder (`cd backend`).
4. Install the required Node.js packages by running: `npm install`.
5. Create a `.env` file in the `backend` directory (you can copy `.env.example`) and add your PostgreSQL database credentials.
6. Start the backend server by running: `node server.js`.

**Frontend**
1. In VS Code, navigate to the `frontend` folder.
2. Right-click on the `index.html` file and select **Open with Live Server**.

---

## Features

- [x] Add an expense (with validation)
- [x] Delete an expense
- [x] Edit an expense
- [x] Filter by category
- [x] Summary cards (total, count, highest)
- [x] Data is saved in a PostgreSQL database
- [x] Interactive Chart visualization by category 
- [x] Dark Mode toggle 
- [x] Bootstrap Loading Spinner 

---

## Screenshots


### Desktop View (Overview & Dark Mode)
![Frontend Overview](screenshots/frontend_overview.png)

### Validation & Error Handling
![Frontend Validation](screenshots/frontend_validation.png)

---

## What was the hardest part?

The hardest part was connecting the frontend with the backend. It was my first time fully understanding how REST APIs work, sending and receiving JSON data using `fetch`, and linking everything to a PostgreSQL database. At first, handling asynchronous code (`async/await`) and tracking errors was challenging. I solved this by testing all API endpoints step-by-step using Thunder Client and making sure the server returns clear JSON responses for both success and error cases.