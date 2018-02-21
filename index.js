const express = require("express");
const router = express.Router();
const app = express();
const server = require("http").createServer(app);

const ctrl = require("./controller");
const config = require("./config/config");
const PORT = config.push.port_on_this_server;

// * это чтобы body получать из входящих сообщений. Иначе его не видно
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

server.listen(PORT, function () {
    console.log("Server listening at port %d", PORT);
});

app.use("/push/register", ctrl.onRegister);
app.use("/push/sendNotification", ctrl.onSendNotification);
