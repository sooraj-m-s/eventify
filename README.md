### Eventify - Tech Event Management Platform

Eventify is a comprehensive event management platform with integrated real-time messaging capabilities. The platform allows event organizers and attendees to communicate seamlessly before, during, and after events. The messaging system features real-time updates, online status indicators, and unread message tracking.

[![Repo](https://img.shields.io/badge/repo-eventify-181717?logo=github)](https://github.com/sooraj-m-s/eventify)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/DRF-API-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-secure-000000?logo=jsonwebtokens&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-Distributed-37814A?logo=celery&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white)

---

## Features

### User Management

- User registration and authentication
- Profile management with customizable avatars
- Role-based access (Admin, Organizer, Attendee)
- OTP verification for secure account access


### Event Management

- Create and manage events
- Event booking and ticketing
- Event settlement for organizers
- Refund processing


### Wallet System

- Integrated wallet for users and organizers
- Transaction history tracking
- Multiple transaction types (Credit, Debit, Refund, Withdrawal)
- Secure payment processing


### Real-time Messaging

- One-on-one conversations between users
- Real-time message delivery
- Online status indicators
- Typing indicators
- Unread message counters
- Image sharing capabilities
- Message read receipts


### Admin Features

- User management dashboard
- Event approval system
- Organizer verification
- Financial settlement oversight


## Technologies Used

### Frontend

- React.js with React Router for navigation
- Redux Toolkit for state management
- Tailwind CSS for styling
- Lucide React for icons
- Sonner for toast notifications


### Backend

- Django with Django REST Framework
- Django Channels for WebSocket support
- PostgreSQL for primary database
- Redis for caching and WebSocket backing
- Celery with Redis – For managing asynchronous background tasks, such as:
   - Sending email notifications to users one day before an event.
   - Automatically marking pending transactions as declined after a specific period.
- CI/CD – Automated build, test and deployment pipeline using GitHub Actions.


### Real-time Communication

- WebSocket protocol for real-time updates
- Custom notification system for status changes and new messages


## Installation

### Prerequisites

- Node.js (v16+)
- npm
- Python (v3.8+)
- PostgreSQL
- Redis
- Celery


### Frontend Setup

1. Clone the repository

```shellscript
https://github.com/sooraj-m-s/eventify.git
cd frontend/frontend
```


2. Install dependencies

```shellscript
npm install
```


3. Create environment file

```shellscript
cp .env.example .env
```


4. Update the `.env` file with configuration
5. Start the development server

```shellscript
npm run dev
```




### Backend Setup

1. Navigate to the backend directory

```shellscript
cd ../backend
```


2. Create and activate a virtual environment

```shellscript
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```


3. Install dependencies

```shellscript
pip install -r requirements.txt
```


4. Set up environment variables

```shellscript
cp .env.example .env
```


5. Update the `.env` file with database and Redis configuration
6. Run migrations

```shellscript
python manage.py migrate
```


7. Start the development server

```shellscript
python manage.py runserver
```


8. In a separate terminal, start the Daphne server for WebSocket support

```shellscript
daphne -b 0.0.0.0 -p 8001 project.asgi:application
```


### Start Celery Worker and Beat Scheduler

In separate terminals, run:

```shell
celery -A project worker -l info
celery -A project beat -l info
```




## Usage Guide

### User Registration and Login

1. Navigate to the registration page
2. Enter your details and submit the form
3. Verify your account using the OTP sent to your email
4. Log in with your credentials


### Messaging System

1. Access the messages page from the navigation menu
2. View your existing conversations
3. Click on a conversation to open the chat modal
4. Type your message and press Enter or click the Send button
5. For image sharing, click the image icon and select a file


### WebSocket Connection

The messaging system uses WebSockets for real-time communication:

- Connection status is displayed in the header
- Green indicator shows active connection
- Red indicator shows disconnected state (will auto-reconnect)


### Message Types

#### Notification WebSocket

- `new_message`: Received when a new message is sent to the user
- `user_status_update`: Received when a user's online status changes
- `message_read`: Received when messages are marked as read


#### Chat Room WebSocket

- `message`: Received when a new message is sent in the room
- `typing`: Received when a user starts or stops typing
- `participant_status`: Received when a participant's status changes


## WebSocket Architecture

The real-time messaging system uses a dual WebSocket architecture:

1. **Notification WebSocket**

1. Single connection per user
2. Handles system-wide notifications
3. Updates online status of users
4. Notifies about new messages across all conversations
5. Manages unread message counts


2. **Chat Room WebSocket**

1. One connection per active chat room
2. Handles message exchange within a specific room
3. Manages typing indicators
4. Provides message delivery confirmation
5. Updates read status of messages




This architecture ensures efficient real-time communication while minimizing connection overhead.

## Security Considerations

- All WebSocket connections require authentication
- Messages are validated on both client and server
- User permissions are checked for each action
- Rate limiting is implemented to prevent abuse
- Sensitive data is never transmitted over WebSockets


## Contributing

We welcome contributions to Eventify! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.




## Acknowledgements

- [Django](https://www.djangoproject.com/)
- [React](https://reactjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Celery](https://docs.celeryq.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redis](https://redis.io/)

---


## 📞 Contact

For questions or feedback, reach out to **[soorajms4@gmail.com](mailto:soorajms4@gmail.com)**.