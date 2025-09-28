# Инструкция по деплою FinCalc 2.0

## Способ 1: Netlify (рекомендуется)

### Через веб-интерфейс (проще всего):
1. Зайдите на https://netlify.com
2. Зарегистрируйтесь/войдите
3. Нажмите "Add new site" → "Deploy manually"
4. Перетащите папку FinCalcV2 в окно браузера
5. Сайт будет опубликован за несколько секунд!

### Через CLI:
```bash
# 1. Установите Netlify CLI
npm install -g netlify-cli

# 2. Войдите в аккаунт
netlify login

# 3. Перейдите в папку проекта
cd /Users/glyuch/Vibe-Coding/FinCalcV2

# 4. Деплой
netlify deploy --prod --dir .
```

## Способ 2: Vercel

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Перейдите в папку проекта
cd /Users/glyuch/Vibe-Coding/FinCalcV2

# 3. Деплой
vercel --prod
```

## Способ 3: GitHub Pages

1. Создайте репозиторий на GitHub
2. Загрузите все файлы FinCalcV2
3. В настройках репозитория → Pages → Source: Deploy from branch → main
4. Ваш сайт будет доступен по адресу: `username.github.io/repository-name`

## Способ 4: Surge.sh

```bash
# 1. Установите Surge
npm install -g surge

# 2. Перейдите в папку проекта
cd /Users/glyuch/Vibe-Coding/FinCalcV2

# 3. Деплой
surge
```

## Готовность к деплою

✅ Ваш проект готов к деплою как есть!
✅ Все файлы статические (HTML, CSS, JS)
✅ Нет зависимостей от сервера
✅ Работает из любой папки

## После деплоя

1. Получите URL вашего сайта
2. Протестируйте все функции
3. Поделитесь ссылкой!

## Кастомный домен (опционально)

Если у вас есть собственный домен:
- Netlify: Settings → Domain management → Add custom domain
- Vercel: Settings → Domains → Add domain
- GitHub Pages: Settings → Pages → Custom domain