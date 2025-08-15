import express from 'express'

const app = express()
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("SERVER RUNNING ✅")
})

app.listen(PORT, () => {
    console.log(`SERVER RUNNING AT PORT: http://localhost:${PORT}`)
})