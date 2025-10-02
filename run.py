from webApi import webApi
import uvicorn
from config import config

if __name__ == "__main__":
    uvicorn.run("webApi:webApi", host="0.0.0.0", port=int(config['WEB_APP']['PORT']), reload=True)