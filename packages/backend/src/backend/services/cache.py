from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models import KeyValueCache


async def get_cache(db: AsyncSession, key: str) -> str | None:
    result = await db.execute(select(KeyValueCache).where(KeyValueCache.key == key))
    entry = result.scalar_one_or_none()
    if entry is None:
        return None
    if entry.ttl and entry.created_at:
        age = (datetime.utcnow() - entry.created_at).total_seconds()
        if age > entry.ttl:
            await db.delete(entry)
            await db.commit()
            return None
    return str(entry.value) if entry.value is not None else None


async def set_cache(db: AsyncSession, key: str, value: str, ttl: int | None = None) -> None:
    entry = KeyValueCache(key=key, value=value, ttl=ttl, created_at=datetime.utcnow())
    await db.merge(entry)
    await db.commit()
