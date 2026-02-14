# Настройка GitHub OAuth (для разработчиков)

Для корректной работы входа через GitHub:

1.  Бэкенд должен быть запущен и настроен.
2.  В настройках GitHub OAuth App (на github.com):
    - **Homepage URL**: `http://localhost:5173`
    - **Authorization callback URL**: Укажите URL **бэкенда**, например `http://localhost:8080/api/v1/auth/github/callback`.

## Как работает процесс:

1.  Фронтенд отправляет пользователя на энпоинт бэкенда `/auth/github`.
2.  Пользователь авторизуется на GitHub.
3.  GitHub редиректит на бэкенд.
4.  Бэкенд обрабатывает вход/привязку и редиректит обратно на фронтенд:
    - Вход: `/login?token=...`
    - Привязка: `/profile?status=github_linked`
