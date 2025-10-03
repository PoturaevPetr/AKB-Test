from webApi import *
from config import config
from fastapi import Depends, HTTPException, status, Path
from sqlalchemy.exc import IntegrityError
from typing import List
from sqlalchemy.orm import selectinload

@webApi.get("/api/device/{device_id}", response_model=DeviceWithBatterySchema)
async def get_device(
    device_id: str = Path(..., description="ID устройства в формате UUID"),
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    
    try:
        device_uuid = uuid.UUID(device_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Некорректный формат UUID")

    result = await db.execute(
        select(Device).options(selectinload(Device.batteries)).where(Device.id == device_uuid)
    )
    device = result.scalars().first()

    if not device:
        raise HTTPException(status_code=404, detail="Устройство не найдено")
    
    return device

@webApi.post("/api/device", response_model=DeviceSchema)
async def post_device(
    form: PostDevice, 
    user: User = Depends(superuser_required),
    db: AsyncSession = Depends(get_async_session)
):
    
    device = Device(
        name=form.name,
        version=form.version,
        state=form.state,
        max_batteries=form.max_batteries,
        device_api_id=form.device_api_id
    )
    db.add(device)
    try:
        await db.commit()
        await db.refresh(device)
        return device
    except IntegrityError as e:
        await db.rollback()
        # Проверка на уникальность
        if "unique constraint" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(status_code=400, detail="Устройство с таким названием уже существует")
        else:
            raise HTTPException(status_code=500, detail=f"Ошибка при добавлении устройства: {e}")
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при добавлении устройства: {e}")


@webApi.put("/api/device", response_model=DeviceSchema)
async def put_device(
    form: PutDevice,
    user: User = Depends(superuser_required),
    db: AsyncSession = Depends(get_async_session)
):
    # Найти устройство по ID
    result = await db.execute(
        select(Device).where(Device.id == form.id)
    )
    device = result.scalars().first()

    if not device:
        raise HTTPException(status_code=404, detail="Устройство не найдено")
    
    # Обновление полей, если они переданы
    if form.name is not None:
        device.name = form.name
    if form.version is not None:
        device.version = form.version
    if form.state is not None:
        device.state = form.state
    if form.max_batteries is not None:
        device.max_batteries = form.max_batteries
    if form.device_api_id is not None:
        device.device_api_id = form.device_api_id

    try:
        # Попытка сохранить изменения
        await db.commit()
        await db.refresh(device)
    except IntegrityError as e:
        # Обработка ошибок нарушения уникальности
        await db.rollback()
        # Можно дополнительно проверить, к какой уникальности относится ошибка
        # Например, по тексту сообщения или коду ошибки
        if "UNIQUE constraint" in str(e.orig):
            raise HTTPException(
                status_code=400,
                detail="Обновление не удалось из-за нарушения уникальности"
            )
        # Если нужно, можно перекинуть ошибку дальше
        raise

    return device

@webApi.delete("/api/device/{device_id}")
async def delete_device(
    device_id: str, 
    user: User = Depends(superuser_required), 
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    # Опционально, проверить права доступа
    
    await db.delete(device)
    await db.commit()
    return {"detail": "Device and its batteries deleted"}

@webApi.get("/api/devices", response_model=List[DeviceSchema])
async def get_devices(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(select(Device))
    devices = result.scalars().all()
    return devices

