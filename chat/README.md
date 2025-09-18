# Real-time Chat System for Skincare Consultation

This chat system enables customers to communicate with skincare experts in real-time for personalized consultation.

## Features

### Customer Features
- Browse available experts by specialization
- Start conversations with specific experts or request any available expert
- Real-time messaging with automatic polling
- View conversation history
- Message read receipts
- Responsive design for mobile and desktop

### Expert Features
- Expert dashboard with login system
- View all assigned conversations and waiting customers
- Accept new consultation requests
- Real-time messaging with customers
- Message read receipts
- Conversation status management

## Database Tables

### Expert
- Stores expert information including specialization and bio
- Manages expert status (active, offline, busy)

### Conversation
- Links customers with experts
- Tracks conversation status (waiting, active, closed)
- Maintains conversation timestamps

### Message
- Stores all chat messages
- Supports text and image messages
- Tracks read status and timestamps

## API Endpoints

### `/chat/experts.php`
- `GET`: Retrieve all active experts
- `POST`: Expert login

### `/chat/conversations.php`
- `GET`: Get conversations for customer or expert
- `POST`: Create new conversation
- `PUT`: Update conversation (assign expert, change status)

### `/chat/messages.php`
- `GET`: Retrieve messages for a conversation
- `POST`: Send new message
- `PUT`: Mark messages as read

## Setup Instructions

1. **Run the database setup:**
   ```bash
   # Access the setup script via browser or curl
   curl http://localhost/setup_chat.php
   ```

2. **Start the backend services:**
   ```bash
   docker compose up --build
   ```

3. **Start the frontend:**
   ```bash
   cd SkinCare-Frontend
   bun i
   bun run dev
   ```

## Usage

### For Customers
1. Navigate to `/consult` in the application
2. Sign in to your customer account
3. Browse available experts or start a quick consultation
4. Chat in real-time with assigned experts

### For Experts
1. Navigate to `/expert` in the application
2. Login with expert credentials:
   - Email: `sarah@skincare.com`
   - Password: `hello`
3. Accept waiting conversations
4. Provide consultation via real-time chat

## Demo Expert Accounts

The system comes with 3 pre-configured expert accounts:

1. **Dr. Sarah Johnson**
   - Email: `sarah@skincare.com`
   - Password: `hello`
   - Specialization: Acne & Oily Skin

2. **Dr. Emily Chen**
   - Email: `emily@skincare.com`
   - Password: `hello`
   - Specialization: Anti-Aging & Dry Skin

3. **Dr. Michael Kim**
   - Email: `michael@skincare.com`
   - Password: `hello`
   - Specialization: Sensitive Skin

## Technical Features

- **Real-time Updates**: Automatic polling every 2 seconds for messages
- **Responsive Design**: Works on mobile and desktop
- **Message Status**: Read receipts and delivery confirmation
- **Auto-scroll**: Messages automatically scroll to bottom
- **Keyboard Shortcuts**: Enter to send messages
- **Error Handling**: Comprehensive error handling and user feedback
- **Local Storage**: Expert login persistence

## Security Considerations

- CORS headers configured for cross-origin requests
- Input validation on all endpoints
- SQL injection prevention with prepared statements
- Password hashing (MD5 for demo - use bcrypt in production)

## Future Enhancements

- WebSocket integration for true real-time messaging
- Image message support
- Typing indicators
- Message encryption
- Push notifications
- File sharing capabilities
- Video call integration