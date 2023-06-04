import express from 'express'
//jwt
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import postgresClient from './config/db.js'
import userRouter from './routers/userRouter.js'
import { authMiddleware } from './middleware.js'

//jwt
dotenv.config();

const app = express()
app.use(express.json())

app.use('/users', userRouter)

const user = {
    username: "admin",
    email: "admin@gmail.com",
    password: "123456",
};

const animalsArray = [
    {
        name: "Giraffe",
        createdAt: new Date(),
    },
    {
        name: "Elephant",
        createdAt: new Date(),
    },
    {
        name: "Lion",
        createdAt: new Date(),
    },
];

let refreshTokens = [];

app.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body
    if(!refreshToken) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        if(err) {
            console.log(err);
            return res.status(400).json(err);
        }
        // tokendeki data dan validate ediyoz artık !!!dk 36:45te acıklıyor
        const accessToken = jwt.sign({ email: data.email, username: data.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2m"});
        // res status 200 her sey yolunda demek
        return res.status(200).json({ accessToken });
    });
});



app.get("/animals", authMiddleware, (req, res) => {
    console.log(req.user);
    res.json(animalsArray);
})

// oturumdan cıkarken kesinlikle refreshtokenleri kaldır cünkü sürekli access token olusturuyolar 2dk dabir
app.post("/logout", async (req, res) => {
    console.log(refreshTokens);
    refreshTokens = refreshTokens.filter(
        (token) => token !== req.body.refreshToken
        );
    console.log(refreshTokens);
    return res.sendStatus(200);
})

// Giris yapma islemi; Access ve Refresh Tokenlerinin olusturulma islemi
app.post("/login", async (req,res) => {
    const { email, password } = req.body;

    if(email !== user.email || password !== user.password)
        return res.status(401).json({ message: "Bilgiler Geçersiz."});

        // access token olusturma
    const accessToken = jwt.sign({ email: user.email, username: user.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2m"});
        // refresh token olusturma
    const refreshToken = jwt.sign({ email: user.email, username: user.username}, process.env.REFRESH_TOKEN_SECRET);

    refreshTokens.push(refreshToken);
    return res.status(200).json({accessToken, refreshToken});
});


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
    postgresClient.connect(err => {
        if(err) {
            console.log('connection error', err.stack)
        }else {
            console.log('db connection successful')
        }
    })
})

