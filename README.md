# AI Game Connect Website

Static bilingual preview site for AI Game Connect, prepared for Vite builds and GitHub Pages deployment.

## Routes

- `/`
- `/dawrak/`
- `/leaderboard/`
- `/rewards/`
- `/blog/`
- `/about/`
- `/register/`
- `/signin/`
- `/privacy/`
- `/terms/`

## Notes

- GitHub Pages project base is `/aigameconnect-website/`.
- Production output is generated in `dist`.
- English and Arabic content lives in `content/en` and `content/ar`.
- The language toggle uses `?lang=ar` for Arabic and the default route for English.
- Forms are frontend-only previews and do not store submissions.
- There is no backend, database, payment flow, live login, live leaderboard, or real chatbot in this build.
- Privacy and Terms are linked from the footer only.

## Commands

```bash
npm install
npm run build
npm run preview
```
