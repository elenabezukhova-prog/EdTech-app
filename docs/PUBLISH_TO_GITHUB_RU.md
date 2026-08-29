# Как загрузить PilotLab в GitHub и включить демо

Текущий репозиторий: `https://github.com/elenabezukhova/PilotLab`.

Аккаунт и репозиторий уже переименованы. Во всех новых документах и публичных материалах используйте только актуальный адрес выше.

## Перед публикацией

Проверьте, что в папке нет:

- резюме, телефона, почты и документов участников;
- списков учеников, родителей или респондентов;
- API-ключей, паролей и токенов;
- полного курса и материалов преподавателя;
- внутренних договоров и финансовых таблиц;
- файлов из папок `private`, `internal`, `course-materials` и `participant-data`.

Все файлы, которые должны быть опубликованы, уже находятся внутри одной папки `pilotlab-mvp`.

## Вариант A — через сайт GitHub в существующий репозиторий

1. Войдите в GitHub.
2. Откройте `https://github.com/elenabezukhova/PilotLab`.
3. Выберите **Add file → Upload files**.
4. Откройте подготовленную папку `pilotlab-mvp`, выделите всё её содержимое и перетащите в окно загрузки. Перетаскивайте содержимое папки, а не родительскую папку целиком.
5. В поле сообщения напишите `Rebrand public MVP as PilotLab`.
6. Нажмите **Commit changes**.

Проверьте, что на главной странице репозитория сразу виден `README.md`, а рядом находятся `index.html`, `styles.css` и `app.js`.

## Вариант B — через Терминал

Сначала клонируйте существующий репозиторий в отдельную папку:

```bash
cd "/Users/e-lena/Documents/Codex/2026-08-24/new-chat/outputs/GitHub_public_mvp"
git clone https://github.com/elenabezukhova/PilotLab.git pilotlab-upload
cp -R "pilotlab-mvp/." "pilotlab-upload/"
cd "pilotlab-upload"
git add .
git status
git commit -m "Rebrand public MVP as PilotLab"
git push -u origin main
```

Если Git просит указать автора коммита:

```bash
git config --global user.name "Elena Bezukhova"
git config --global user.email "EMAIL-USED-FOR-GITHUB"
```

Пароль от аккаунта в Терминал вводить не следует. Для HTTPS GitHub использует авторизацию в браузере или токен; также можно настроить GitHub CLI командой `gh auth login`.

## Как включить демо через GitHub Pages

1. Откройте репозиторий на GitHub.
2. Перейдите в **Settings**.
3. В левом меню откройте **Pages**.
4. В разделе **Build and deployment** выберите **Deploy from a branch**.
5. В качестве ветки выберите `main`.
6. В качестве папки выберите `/(root)`.
7. Нажмите **Save**.
8. Подождите несколько минут и обновите страницу Settings → Pages.
9. После публикации ссылка будет выглядеть так: `https://elenabezukhova.github.io/PilotLab/`.

GitHub предупреждает, что первая публикация иногда занимает до десяти минут.

## Что вставить в заявку

- GitHub: `https://github.com/elenabezukhova/PilotLab`
- Демо после включения GitHub Pages: `https://elenabezukhova.github.io/PilotLab/`

Перед отправкой откройте обе ссылки в приватном окне браузера. Они должны работать без входа в ваш аккаунт.

## Как обновлять репозиторий позже

После изменения файлов:

```bash
git add .
git status
git commit -m "Describe the update"
git push
```

Перед `git add .` всегда просматривайте содержимое папки. Не добавляйте секреты или персональные данные даже на один коммит: удаление файла последующим коммитом не стирает его из истории Git.

## Официальная справка

- [Добавление файлов в репозиторий](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Публикация локального кода](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
- [Настройка источника GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
