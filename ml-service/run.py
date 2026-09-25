import os
import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    print(f"Starting ML Service FastAPI Server on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
