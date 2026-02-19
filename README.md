<h1 align="center">💎 AniStream Ai</h1>

## Stream API setup

To keep playback working reliably, point the app at a compatible AniWatch/Hianime API (for example, your own deployment based on `SwirX/aniwatch`).

Create a `.env` file:

```bash
VITE_STREAM_API_NODES=https://your-api.example.com/api/v2/hianime,https://your-fallback.example.com/api/v2/hianime
VITE_GEMINI_API_KEY=your_gemini_key_optional
```

If `VITE_STREAM_API_NODES` is not set, the app uses built-in public fallbacks.
