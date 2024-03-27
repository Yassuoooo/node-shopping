const path = require('path')
const express = require('express') // khởi tạo express và import express


const app = express() // dùng express cho app nodejs
const port = 3000 // tạo port 3000 để sử dụng

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
}) // arrow function