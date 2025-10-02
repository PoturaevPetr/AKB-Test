from webApi import webApi
from fastapi.exceptions import HTTPException
from fastapi import Request, status
from fastapi.responses import RedirectResponse, JSONResponse

@webApi.exception_handler(HTTPException)
async def auth_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == status.HTTP_401_UNAUTHORIZED:
        return RedirectResponse(url='/login')
    if exc.status_code == status.HTTP_400_BAD_REQUEST:
        # Проверяем, есть ли в исключении свойство detail
        if hasattr(exc, 'detail'):
            return JSONResponse(
                status_code=400,
                content={"detail": exc.detail}
            )
        else:
            # Если по какой-то причине нет detail
            return JSONResponse(
                status_code=400,
                content={"detail": "Ошибка запроса"}
            )
    # Для остальных ошибок оставить стандартную обработку
    handler = request.app.exception_handlers.get(type(exc))
    if handler:
        return await handler(request, exc)
    # Если обработчик не найден, возвращаем стандартный ответ
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

