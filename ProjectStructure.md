Qurious/
├── Backend/
│ ├── config/
│ │ └── db.config.js # Database connection
│ ├── controllers/
│ │ ├── user.controller.js # User operations
│ │ ├── post.controller.js # Post CRUD
│ │ ├── comment.controller.js # Comment management
│ │ ├── vote.controller.js # Voting logic
│ │ ├── follow.controller.js # Follow/Unfollow
│ │ ├── message.controller.js # Messaging
│ │ ├── report.controller.js # Reporting
│ │ └── admin.controller.js # Admin operations
│ ├── models/
│ │ ├── user.models.js # User schema
│ │ ├── post.models.js # Post schema
│ │ ├── comment.models.js # Comment schema
│ │ ├── vote.models.js # Vote schema
│ │ ├── follow.models.js # Follow schema
│ │ ├── message.models.js # Message schema
│ │ ├── report.models.js # Report schema
│ │ └── admin.models.js # Admin schema
│ ├── routes/
│ │ ├── user.routes.js # User endpoints
│ │ ├── post.route.js # Post endpoints
│ │ ├── comment.route.js # Comment endpoints
│ │ ├── vote.route.js # Vote endpoints
│ │ ├── follow.route.js # Follow endpoints
│ │ ├── message.routes.js # Message endpoints
│ │ ├── report.route.js # Report endpoints
│ │ └── admin.route.js # Admin endpoints
│ ├── Middlewares/
│ │ ├── auth.middleware.js # JWT verification
│ │ ├── multer.js # File upload config
│ │ └── errorHandler.js # Error handling
│ ├── utils/
│ │ ├── cloudinary.js # Cloudinary integration
│ │ └── validators.js # Input validation
│ ├── socket/
│ │ └── socket.js # Socket.IO setup
│ ├── app.js # Express app setup
│ ├── package.json
│ ├── .env.example
│ └── .gitignore
│
├── Frontend/
│ ├── app/
│ │ ├── screens/
│ │ │ ├── AuthScreen/
│ │ │ ├── HomeScreen/
│ │ │ ├── ProfileScreen/
│ │ │ ├── DiscoverScreen/
│ │ │ ├── MessageScreen/
│ │ │ └── AdminScreen/
│ │ ├── components/
│ │ ├── navigation/
│ │ └── services/
│ ├── app.json
│ ├── package.json
│ ├── .env.example
│ └── .gitignore
│
├── Documentation/
│ ├── API_DOCUMENTATION.md
│ ├── ARCHITECTURE.md
│ ├── DATABASE_SCHEMA.md
│ └── SETUP_GUIDE.md
│
├── README.md
├── LICENSE
└── .gitignore
