# Learning & Study Hub with Shinchan 🌍📚

A modern, interactive learning platform that helps you manage all your courses, study notes, and bookmarks in one place. Featuring a fun Shinchan theme and beautiful UI!

## Features ✨

- 📌 Course Management & Quick Access
- 📝 Notes & Bookmark System
- 🎨 Fun & Stunning UI with Shinchan
- 🔔 Smart Learning Assistant
- 🔍 AI-Powered Search
- 📱 Responsive Design

## Tech Stack 🛠️

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js with Express
- Database: MySQL
- Authentication: JWT
- File Upload: Multer

## Prerequisites 📋

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/yourusername/learning-study-hub.git
cd learning-study-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
mysql -u root -p < database.sql
```

4. Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=learning_hub
JWT_SECRET=your_secret_key
```

5. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Project Structure 📁

```
learning-study-hub/
├── public/
│   ├── css/
│   │   └── style.css
│   │   
│   ├── js/
│   │   └── main.js
│   ├── images/
│   │   ├── shinchan.png
│   │   ├── avatar.png
│   │   └── earth.gif
│   └── index.html
├── server.js
├── database.sql
├── package.json
└── README.md
```

## API Endpoints 🔌

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - Login user

### Courses
- GET `/api/courses` - Get all courses
- POST `/api/courses` - Add a new course
- PUT `/api/courses/:id` - Update course status
- DELETE `/api/courses/:id` - Delete a course

### Notes
- GET `/api/notes` - Get all notes
- POST `/api/notes` - Add a new note
- PUT `/api/notes/:id` - Update note
- DELETE `/api/notes/:id` - Delete a note

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Shinchan character and related assets are trademarks of their respective owners
- Icons by Font Awesome
- Earth animation by [source] 