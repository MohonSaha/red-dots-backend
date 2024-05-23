# Blood Donation Service

Welcome to the Blood Donation Service! This application facilitates blood donation by connecting donors with those in need. Users can register, log in, search for donors, request blood donations, update donation statuses, and manage their profiles.

## Live URL

You can access the live version of the application [here](https://blood-donation-server-flax.vercel.app/).

## Features

1. **User Registration:** Users can register and create profiles, including details like name, email, blood type, location, and more.
2. **User Login:** Registered users can log in securely to access their accounts.
3. **Find Donors:** Users can search for donors based on various criteria such as blood type, location, name, and email.
4. **Request Blood Donation:** Users can make requests for blood donations, providing details such as contact information, date of donation, hospital name, and reason.
5. **Manage Donation Requests:** Donors can view and manage donation requests directed to them, including updating the status of requests.
6. **View User Profile:** Users can view their own profiles, including details like name, email, blood type, location, and donation history.
7. **Update User Profile:** Authenticated users can update their profile information, including bio, age, and other details.
8. **Pagination and Filtering:** The application supports pagination and filtering of donor lists for easier navigation and search.

## Technology Stack

- **Programming Language:** TypeScript
- **Web Framework:** Express.js
- **Object Relational Mapping (ORM):** Prisma for PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Other Dependencies:** bcrypt, cookie-parser, cors, dotenv, http-status, jsonwebtoken, zod

## Setup Instructions

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up environment variables (e.g., database connection details, JWT secret) in a `.env` file.
4. Run the development server using `npm run dev`.
5. Access the application locally at `http://localhost:PORT`, where `PORT` is the specified port in your environment variables.

# Blood Donation API Documentation

## 1. User Registration

**Endpoint:** `POST /api/register`

## 2. User Login

**Endpoint:** `POST /api/login`

## 3. Get Paginated and Filtered Users (Donors)

**Endpoint:** `GET /api/donor-list`

## 4. Request A Donor (user) For Blood

**Endpoint:** `POST /api/donation-request`

## 5. Get My Donation Request as Donor (user)

**Endpoint:** `GET /api/donation-request`

## 6. Update Request Application Status

**Endpoint:** `PUT /api/donation-request/:requestId`

## 7. Get My Profile

**Endpoint:** `GET /api/my-profile`

## 8. Update My Profile

**Endpoint:** `PUT /api/my-profile`
