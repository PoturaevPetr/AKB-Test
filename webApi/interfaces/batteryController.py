from webApi import *
from config import config
from fastapi import Depends, HTTPException, status, Path
from webApi.database import *


@webApi.get("/api/battery/{battery_id}", response_model=BatteryShema)
async def get_battery(
    battery_id: str = Path(..., description="ID батареи в формате UUID"), 
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        battery_uuid = uuid.UUID(battery_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Некорректный формат UUID")

    result = await db.execute(
        select(Battery).where(Battery.id == battery_uuid)
    )
    battery = result.scalars().first()

    if not battery:
        raise HTTPException(status_code=404, detail="Батарея не найдено")
    
    return battery


@webApi.post("/api/battery", response_model=BatteryShema)
async def post_battery(
    form: PostBattery,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    # Создаем новый объект Battery
    new_battery = Battery(
        name=form.name,
        voltage=form.voltage,
        capacity=form.capacity,
        service_life=form.service_life,
        device_id=form.device_id
    )
    try:
        # Добавляем в сессию
        db.add(new_battery)
        # Выполняем коммит
        await db.commit()
        # Обновляем объект для получения данных из базы
        await db.refresh(new_battery)
    except Exception as e:
        await db.rollback()
        # Обработка ошибок, например, связанных с уникальностью или другими ограничениями
        raise HTTPException(status_code=400, detail="Ошибка при добавлении батареи")
    
    return new_battery

@webApi.put("/api/battery", response_model=BatteryShema)
async def put_battery(
    form: PutBattery,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    # Найти батарею по battery_id
    result = await db.execute(select(Battery).where(Battery.id == form.id))
    battery = result.scalars().first()

    if not battery:
        raise HTTPException(status_code=404, detail="Батарея не найдена")
    
    # Обновление переданных полей
    if form.name is not None:
        battery.name = form.name
    if form.voltage is not None:
        battery.voltage = form.voltage
    if form.capacity is not None:
        battery.capacity = form.capacity
    if form.device_id is not None:
        battery.device_id = form.device_id
    if form.service_life is not None:
        battery.service_life = form.service_life

    await db.commit()
    await db.refresh(battery)

    return battery


@webApi.delete("/api/battery/{battery_id}")
async def delete_battery(
    battery_id: str = Path(..., description="ID батареи в формате UUID"), 
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    # Найти батарею по ID
    result = await db.execute(select(Battery).where(Battery.id == battery_id))
    battery = result.scalars().first()

    if not battery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery not found"
        )

    # Удалить батарею
    await db.delete(battery)
    await db.commit()

    return {"detail": "Battery deleted successfully"}