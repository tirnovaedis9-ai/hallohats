from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from rembg import remove, new_session
from PIL import Image
import io

app = FastAPI()

# En yüksek kalite için 'isnet-general-use' modelini sunucu başlarken bir kere yükle
session = new_session("isnet-general-use")

# CORS (Cross-Origin Resource Sharing) ayarları
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Rembg server is running"}

@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    input_bytes = await file.read()
    
    # Önceden yüklenmiş oturumu ve alpha matting'i kullanarak arka planı kaldır
    output_bytes = remove(input_bytes, session=session, alpha_matting=True)
    
    return StreamingResponse(io.BytesIO(output_bytes), media_type="image/png")
