<h1 align="center">💎 AniStream Ai</h1>

## Stream API setup

To keep playback working reliably, point the app at a compatible AniWatch/Hianime API (for example, your own deployment based on `SwirX/aniwatch`).

Create a `.env` file:

```bash
VITE_STREAM_API_NODES=https://your-api.example.com/api/v2/hianime,https://your-fallback.example.com/api/v2/hianime
VITE_GEMINI_API_KEY=your_gemini_key_optional
```

If `VITE_STREAM_API_NODES` is not set, the app uses built-in public fallbacks.

## Using code from `Coeeter/aniways`

If you want this project to use the exact code from `https://github.com/Coeeter/aniways`, run the sync below in an environment that allows GitHub access:

```bash
git remote add aniways https://github.com/Coeeter/aniways.git
git fetch aniways
git reset --hard aniways/main
npm install
npm run dev
```

If your environment blocks access to GitHub, this sync cannot complete until outbound access is enabled or you provide a local archive/patch of that repository.
