# KitchenQuest - Recipe Explorer App

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Backend Setup](#backend-setup)
  - [Database Configuration](#database-configuration)
  - [Running the Backend](#running-the-backend)
- [API Endpoints](#api-endpoints)
- [Scraping Service](#scraping-service)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Introduction

KitchenQuest is a mobile application designed to help users discover, explore, and manage a variety of recipes. Built using **React Native** for the user interface, **NestJS** for the backend, and **PostgreSQL** as the database, this app provides a seamless experience for cooking enthusiasts.

## ScreenShots

![Dark theme KitchenQuest](https://github.com/user-attachments/assets/5fa263e2-1104-4ac9-a4e5-389e533bf34a)
![light theme KitchenQuest](https://github.com/user-attachments/assets/c4cabb42-6f1f-4989-95f4-31ebb0037d4d)

## Technologies Used

- **Frontend**: 
  - React Native
  - React Navigation
  - Axios for API calls
  - React Native Vector Icons
  - ESLint and Prettier for code quality

- **Backend**: 
  - NestJS
  - TypeORM for database interaction
  - PostgreSQL as the database
  - Axios for web scraping

- **Development Tools**: 
  - Node.js
  - npm

### Frontend (React Native)

- **Home Screen**: 
  - Displays three cards representing different recipe sections (e.g., Popular, Desserts, Quick Meals).
  - Each card shows a relevant cover image and section title.
  - Smooth navigation to the recipe list when a card is tapped.

- **Recipe List Screen**: 
  - Displays a grid layout of recipes for the selected section.
  - Each recipe card shows:
    - Recipe thumbnail
    - Recipe title

- **Recipe Detail Screen**: 
  - Displays a hero image of the recipe.
  - Shows the recipe title and basic information.
  - Lists ingredients.
  - Provides step-by-step cooking directions.
  - Displays attribution ("Submitted by").

### Backend (NestJS)

- **Scraping Service**: 
  - Scheduled hourly scraping using NestJS cron jobs.
  - Scrapes only the first load of recipes from sections without clicking "VIEW MORE".
  - Implements a data deduplication strategy to avoid duplicate entries.

- **API Endpoints**:
  - `GET /sections/:sectionType/recipes`: List recipes by section.
  - `GET /recipes/:id`: Get detailed recipe information.
  - Proper error handling and status codes.

### Database (PostgreSQL)

- Stores essential recipe metadata and content.
- Implements proper indexing for efficient queries.


## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm (Node package manager)
- PostgreSQL database
- React Native CLI

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/vishv0407/Recipe-Explorer-App.git
   cd Recipe-Explore-App
   ```

2. **Install frontend dependencies:**

   Navigate to the frontend directory and install the dependencies:

   ```bash
   npm install
   ```

3. **Install backend dependencies:**

   Navigate to the backend directory and install the dependencies:

   ```bash
   cd backend
   npm install
   ```

### Running the Application

1. **Start the Metro Server:**

   From the root of your React Native project, run:

   ```bash
   npm start
   ```

2. **Run the Android or iOS application:**

   For Android:

   ```bash
   npx react-native run android
   ```

   For iOS:

   ```bash
   npm run ios
   ```

## Backend Setup

### Database Configuration

1. **Create a PostgreSQL database:**

   Create a new database for the Recipe Explorer app. You can use the following command in your PostgreSQL shell:

   ```sql
   CREATE DATABASE recipe_explorer;
   ```

### Running the Backend

1. **Start the NestJS server:**

   From the backend directory, run:

   ```bash
   npm run start:dev
   ```

   This will start the backend server in development mode.

## .env setup

# Database Configuration

The following environment variables are used to configure the database connection:
```bash
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_USERNAME=myusername
DATABASE_PASSWORD=mypassword
DATABASE_NAME=mydatabase
```

## Contributing

Contributions are welcome! If you would like to contribute to the Recipe Explorer app, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
