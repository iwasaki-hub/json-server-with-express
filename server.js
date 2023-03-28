require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// CRUD システム

// Get all posts
app.get("/", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3000/posts");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Create new post
app.post("/", async (req, res) => {
  try {
    const { title, author } = req.body;
    const response = await fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        title,
        author,
        createdAt: new Date(),
      }),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Get single post
app.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await fetch(`http://localhost:3000/posts/${id}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Update a post
app.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, author } = req.body;
    // Check post
    const response = await fetch(`http://localhost:3000/posts/${id}`);
    if (!response.ok) {
      return res.status(400).json({ message: "Post is not exist" });
    }

    const data = await response.json();

    const updateResponse = await fetch(`http://localhost:3000/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        title,
        author,
        updatedAt: new Date(),
      }),
    });

    const updateData = await updateResponse.json();
    res.status(200).json(updateData);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Delete a post
app.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const response = await fetch(`http://localhost:3000/posts/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    res.status(200).json({ message: "Delete a Post" });
  } catch (error) {
    res.status(400).json(error);
  }
});

// User 認証登録

// Register User
app.post("/users/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    // Check if user exists
    const usersExist = await fetch("http://localhost:3000/users");
    const users = await usersExist.json();
    const user = users.find((user) => user.email === email);

    if (user) {
      return res.status(400).json({ message: "User is already exists" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create JWT
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SELECT, {
      expiresIn: "24h",
    });

    // Create User
    const response = await fetch("http:localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: hashedPassword,
        token,
        createdAt: new Date(),
      }),
    });

    const newUser = await response.json();

    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({ message: "New User created", newUser });
  } catch (error) {
    res.status(400).json(error);
  }
});

// Login user
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }
    const usersExist = await fetch("http://localhost:3000/users");
    const users = await usersExist.json();

    const user = users.find((user) => user.email === email);

    if (!user) {
      return res.status(200).json({ message: "User is not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(200).json({ message: "Password is not match" });
    }

    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SELECT, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "User is LogIn Successfully",
      ...user,
      newToken: token,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

app.listen(PORT, () => {
  console.log(`🪐 Server is running on port http://localhost:${PORT}`);
});
