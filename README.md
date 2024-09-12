<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]

# Soul Connection - Dating Coach Management System

We are excited to introduce a new project in collaboration with Soul Connection, a very famous coaching agency.  
This project is led by two project managers:  
- Jean-Eudes Berlier, a very talented former businessman with a strong commitment to excellence and a track record of success (except his last project, which aimed to revolutionize communication and team efficiency in business units).
- Martin Sarnau, a graduate from a digital art school and a specialist in product design, has been working at Soul Connection for two years.

Soul Connection needs to develop a dashboard for their coaches to help them in their daily
work.  
The coaches each have their own way of working and noting client information, making it difficult to transfer responsibilities from one coach to another. The goal is to standardize client files
and processes.  

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Key Components](#key-components)
7. [API Endpoints](#api-endpoints)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [License](#license)

## Project Overview

Soul Connection is a platform that enables dating coaches to:
- Manage their clients (customers)
- Schedule and organize events
- Analyze compatibility between clients
- Provide coaching tips
- Perform video analysis of client interactions
- View statistics and insights
- Manage a virtual wardrobe for styling advice

The application is designed with a user-friendly interface and incorporates various features to streamline the coaching process.

## Features

- User authentication and authorization
- Dashboard with key metrics and insights
- Customer management
- Event scheduling and management
- Compatibility checker
- Coaching tips repository
- Video analysis tool
- Statistical reports and visualizations
- Virtual wardrobe management
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Hook Form for form handling
- Zod for form validation
- Recharts for data visualization
- FullCalendar for event management
- Radix UI for accessible component primitives

### Backend
- FastAPI (Python framework)
- MongoDB for data storage
- PyJWT for authentication
- Pydantic for data validation

### DevOps
- Docker for containerization
- Docker Compose for multi-container management

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/soul-connection.git
   cd soul-connection
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Fill in the required values in each `.env` file

3. Install dependencies:
   ```
   cd frontend && npm install
   cd ../backend && pip install -r requirements.txt
   ```

4. Start the development servers:
   ```
   # In the frontend directory
   npm run dev

   # In the backend directory
   uvicorn main:app --reload
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

The project is divided into two main directories:

1. `frontend/`: Contains the Next.js application
2. `backend/`: Contains the FastAPI application

## Key Components

### Frontend

1. Layout Component (`frontend/app/pagesLayout.tsx`)
2. Dashboard Page (`frontend/app/page.tsx`)
3. Video Analysis Page (`frontend/app/video/page.tsx`)
4. Customers Page (`frontend/app/customers/page.tsx`)
5. Events Page (`frontend/app/events/page.tsx`)
6. Wardrobe Page (`frontend/app/wardrobe/page.tsx`)

### Backend

1. Main Application (`backend/api.py`)
2. Authentication API (`backend/authentificationAPI.py`)

## API Endpoints

The backend provides various API endpoints for managing customers, events, tips, and more. Some key endpoints include:

- `/api/customers`: CRUD operations for customers
- `/api/events`: CRUD operations for events
- `/api/tips`: CRUD operations for coaching tips
- `/api/ai/analyze_video`: Video analysis endpoint
- `/api/compatibility`: Compatibility checking between customers

Refer to the `api.py` file for detailed endpoint information.

## Deployment

The project is containerized using Docker, making it easy to deploy in various environments. Use the provided `docker-compose.yml` file to spin up both the frontend and backend services:

1. Ensure Docker and Docker Compose are installed
2. Run the following command in the root directory:
   ```
   docker-compose up --build
   ```

This will start the frontend, backend, and MongoDB services.

## Contributing

We welcome contributions to the Soul Connection project! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with clear, descriptive messages
4. Push your changes to your fork
5. Submit a pull request to the main repository

Please ensure your code adheres to the existing style conventions and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

For more detailed information on specific components or features, refer to the codebase and comments within the files. If you have any questions or need further assistance, please open an issue on the GitHub repository.


## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Gaulaume">
        <img src="https://avatars.githubusercontent.com/u/114737222?v=4" width="100px;" alt="Gaulaume"/>
        <br/>
        <sub><b>Gaulaume</b></sub>
      </a>
      <br/>
      Contributions: 96
    </td>
    <td align="center">
      <a href="https://github.com/LouisLanganay">
        <img src="https://avatars.githubusercontent.com/u/114762819?v=4" width="100px;" alt="LouisLanganay"/>
        <br/>
        <sub><b>LouisLanganay</b></sub>
      </a>
      <br/>
      Contributions: 89
    </td>
    <td align="center">
      <a href="https://github.com/ValentinPeron">
        <img src="https://avatars.githubusercontent.com/u/71937391?v=4" width="100px;" alt="ValentinPeron"/>
        <br/>
        <sub><b>ValentinPeron</b></sub>
      </a>
      <br/>
      Contributions: 65
    </td>
    <td align="center">
      <a href="https://github.com/AugustinBst">
        <img src="https://avatars.githubusercontent.com/u/114652651?v=4" width="100px;" alt="AugustinBst"/>
        <br/>
        <sub><b>AugustinBst</b></sub>
      </a>
      <br/>
      Contributions: 49
    </td>
  </tr>
</table>




<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/Gaulaume/Survivor-seminar.svg?style=for-the-badge
[contributors-url]: https://github.com/Gaulaume/Survivor-seminar/graphs/contributors
[stars-shield]: https://img.shields.io/github/stars/Gaulaume/Survivor-seminar.svg?style=for-the-badge
[stars-url]: https://github.com/Gaulaume/Survivor-seminar/stargazers
[license-shield]: https://img.shields.io/github/license/Gaulaume/Survivor-seminar.svg?style=for-the-badge
[license-url]: https://github.com/Gaulaume/Survivor-seminar/blob/master/LICENSE
