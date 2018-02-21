## windbet-push-server

### Установка

* `npm i`

### Запуск

* `npm start`

### Обновление сервера

* `cd /var/www/windbet-push-server`
* `git pull origin`
* `service windbet-push-server stop`
* `service windbet-push-server start`

### Назначение

* Позволяет пользователям подписываться на получение пуш-уведомлений с сайта WindBet.

<!-- ### Адреса

* prod: `195.122.28.80 -p15853` -->

### Переменные окружения

* `GCM_API_KEY` - ключ
