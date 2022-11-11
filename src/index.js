const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    }
  });
  res.json(users);
});

app.get("/users/:userId", async (req, res) => {
  const id = parseFloat(req.params.userId)

  const user = await prisma.user.findFirst({
    where: {
      id
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    }
  });

  if (user) {
    res.json(user);
  } else {
    res.sendStatus(404)
  }
});

app.post("/users", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: encryptedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    res.json(user);
  } catch (e) {
    console.error(e);
    res.sendStatus(403);
  }
});

app.put("/users/:userId", async (req, res) => {
  const id = parseFloat(req.params.userId)
  const { email, firstName, lastName } = req.body;

  const userToUpdate = await prisma.user.findFirst({ where: { id } })

  if (userToUpdate) {
    try {
      const user = await prisma.user.update({
        where: {
          id
        },
        data: {
          email,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      });
  
      res.json(user);
    } catch (e) {
      console.error(e)
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(404)
  }
})

app.delete("/users/:userId", async (req, res) => {
  const id = parseFloat(req.params.userId)

  try {
    const user = await prisma.user.delete({
      where: {
        id
      }
    });

    res.json({ id: user.id });
  } catch (e) {
    console.error(e)
    res.sendStatus(403)
  }  
})

app.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`)
);
