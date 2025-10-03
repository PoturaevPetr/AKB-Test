from webApi import webApi
from fastapi.exceptions import HTTPException
from fastapi import Request, status
from fastapi.responses import RedirectResponse, JSONResponse

@webApi.exception_handler(HTTPException)
async def auth_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == status.HTTP_401_UNAUTHORIZED:
        return RedirectResponse(url='/login')
    elif exc.status_code == status.HTTP_400_BAD_REQUEST:
        if hasattr(exc, 'detail'):
            return JSONResponse(
                status_code=400,
                content={"detail": exc.detail}
            )
        else:
            return JSONResponse(
                status_code=400,
                content={"detail": "Ошибка запроса"}
            )
    else:
        # Обработка остальных ошибок
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )