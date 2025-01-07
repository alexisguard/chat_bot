# Chatbot Application

This repository contains a chatbot application with a Node.js backend and a FastAPI-based API service.

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm (Node Package Manager)
- pip (Python Package Manager)

## Installation

### Automatic Installation (macOS)

The easiest way to install all dependencies is to use the provided installation script:

1. Make the script executable:
```bash
chmod +x install.sh
```

2. Run the installation script:
```bash
./install.sh
```

This script will:
- Install Homebrew if not present
- Install Node.js if not present
- Install Python if not present
- Install all Node.js dependencies
- Generate the Prisma client
- Install all Python dependencies

### Manual Installation

If you prefer to install manually or are not using macOS, follow these steps:

#### 1. Backend Setup (Node.js)

1. Install Node.js dependencies:
```bash
npm install
```

This will install the following required packages:
- @prisma/client
- axios
- compression
- cors
- dotenv
- express
- node-fetch
- prisma
- uuid

2. Generate Prisma Client:
```bash
npx prisma generate
```
This step is required to generate the Prisma Client based on your schema before running the application.

3. Set up your environment variables:
Create a `.env` file in the root directory and add your configuration.

#### 2. API Setup (Python/FastAPI)

1. Navigate to the alphaguard_api folder:
```bash
cd alphaguard_api
```

2. Install Python dependencies:
```bash
pip install fastapi uvicorn
```

## Running the Application

### 1. Start the FastAPI Server

Navigate to the alphaguard_api folder and run:
```bash
uvicorn app.main:app --reload
```

This will start the API server locally, typically at `http://localhost:8000`

### 2. Start the Node.js Server

In a new terminal window, from the root directory, run:
```bash
npm start
```

This will start the Node.js server, typically at `http://localhost:3000`

## Accessing the Chatbot

Once both servers are running:

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. You should see the chatbot interface and be able to interact with it

## Troubleshooting

- Make sure all required ports (3000 and 8000) are available
- Check that all environment variables are properly set in your `.env` file
- Ensure both the FastAPI and Node.js servers are running simultaneously
- If you encounter database-related errors, ensure you've run `npx prisma generate`

## Additional Information

- The FastAPI documentation can be accessed at `http://localhost:8000/docs`
- For API testing, you can use the Swagger UI at the docs endpoint