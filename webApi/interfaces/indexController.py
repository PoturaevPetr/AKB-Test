from webApi import *
from fastapi.responses import HTMLResponse
from fastapi import Request, Depends
from fastapi.responses import RedirectResponse



webApi.mount("/js", static_js, name="js")

@webApi.get("/login", response_class=HTMLResponse)
async def loader_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@webApi.get("/register", response_class=HTMLResponse)
async def loader_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@webApi.get("/", response_class=HTMLResponse)
async def loader_page(request: Request, user: User = Depends(current_active_user)):
    return templates.TemplateResponse("index.html", {"request": request})
