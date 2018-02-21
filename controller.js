const webPush = require("web-push");
const request = require("request");

const config = require("./config/config");
const GCM_API_KEY = config.GCM_API_KEY;
const HOST = config.push.host_on_save_server;

// const VAPID_KEYS = webPush.generateVAPIDKeys();
const VAPID_KEYS = {
    publicKey:
        "BDViu3oevXaPx5ZkgRk7EuWtZAi-qEEqgDaX8u61KO9qdx3MtGQrtXKuDAKLqzAeJwy9Uf1pBBqPw5OtQN0GsIQ",
    privateKey: "lUFDLHg54xi_nFVBQV33XmbVEnogYspsbA3kFLWHZ7w"
};

webPush.setGCMAPIKey(GCM_API_KEY);
webPush.setVapidDetails(
    "mailto:leshicus@gmail.com",
    VAPID_KEYS.publicKey,
    VAPID_KEYS.privateKey
);

const getBody = req => {
    if (req.body && typeof req.body == "object") {
        const key = Object.keys(req.body);
        return JSON.parse(key[0]);
    } else return null;
};

const onRegister = (req, res) => {
    console.log("register");

    const body = getBody(req);
    console.log(body);
    saveRegistration(body, res);

    // res.sendStatus(201);
};

const onSendNotification = (req, res) => {
    console.log("sendNotification");

    const body = getBody(req);
    const options = {
        endpoint: body.endpoint,
        TTL: body.ttl,
        keys: {
            p256dh: body.key,
            auth: body.authSecret
        }
    };

    if (!body) {
        return;
    }

    console.log("req.body", body);

    webPush
        .sendNotification(options, body.payload)
        .then(function () {
            res.sendStatus(201);
        })
        .catch(function (error) {
            console.log("error", error);
            res.sendStatus(500);
        });
};

const saveRegistration = (body, res) => {
    var url = HOST + "/newadmin/build/php/pushNotifications.php";

    if (!body) {
        return;
    }

    body["xaction"] = "saveRegistration";

    body = JSON.stringify(body);

    request.post(
        {
            url: url,
            json: true,
            body: body
        },
        callbackSaveRegistration.bind(null, body, res)
    );
};

const wrapJson = (result, message) => {
    return JSON.stringify({
        success: result,
        message: message
    })
}

const callbackSaveRegistration = (
    registrationBody,
    res,
    error,
    response,
    body
) => {
    var mes

    if (!error && response.statusCode == 200) {
        try {
            if (!body["success"]) {
                mes = "Ошибка регистрации: " + JSON.stringify(registrationBody)
                console.error(
                    mes
                );

                res.status(500).send(mes);
            } else {
                mes = "Успешная регистрация"
                console.log(mes);

                res.status(response.statusCode).send(wrapJson(true, mes));

                // setTimeout(sendTestNotify.bind(null, registrationBody.endpoint), 1000);
            }
        } catch (e) {
            mes = "Ошибка парсинга ответа: " + body
            console.error(mes);

            res.status(500).send(mes);
        }
    } else {
        mes = "Ошибка ответа сервера при попытке сохранения регистрации"
        console.error(
            mes,
            response.statusCode
        );

        res.status(response.statusCode).send(mes);
    }
};

const sendTestNotify = (endpoint) => {
    var url = HOST + "/newadmin/build/php/pushNotifications.php";

    const body = {};
    body["xaction"] = "getRegistration";
    body["endpoint"] = endpoint;

    request.post(
        {
            url: url,
            json: true,
            body: body
        },
        callbackSendTestNotify.bind(null, body)
    );
}

const callbackSendTestNotify = (
    registrationBody,
    error,
    response,
    body
) => {
    if (!error && response.statusCode == 200) {
        try {
            if (!body["success"]) {
                console.error(
                    "Ошибка получения данных регистрации: ", registrationBody
                );
            } else {
                console.log("Успех получения данных регистрации: ", JSON.stringify(body));

                const rows = body['rows'];
                console.log(typeof rows);

                rows.forEach((item) => {
                    const payload = 'Привет!';

                    sendNotification(item, payload);
                })
            }
        } catch (e) {
            console.error("Ошибка парсинга ответа: " + body);
        }
    } else {
        console.error(
            "Ошибка ответа сервера при попытке получения данных регистрации: ",
            response.statusCode
        );
    }
};

const sendNotification = (data, payload) => {
    console.log("sendNotification", data, payload, data.key);

    const options = {
        endpoint: data.endpoint,
        TTL: data.ttl,
        keys: {
            p256dh: data.key,
            auth: data.auth_secret
        }
    };

    webPush
        .sendNotification(options, payload)
        .then(function () {
            console.log('Успех отправки пуш-сообщения пользователю');
        })
        .catch(function (error) {
            console.log("error отправки пуш-сообщения пользователю: ", error);
        });
};

module.exports = {
    onRegister,
    onSendNotification
};
