from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models import Pipeline


async def create_pipeline(db: AsyncSession, name: str, dag_json: str | None = None) -> Pipeline:
    pipeline = Pipeline(name=name, dag_json=dag_json)
    db.add(pipeline)
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


async def get_pipeline(db: AsyncSession, pipeline_id: int) -> Pipeline | None:
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    return result.scalar_one_or_none()


async def list_pipelines(db: AsyncSession) -> list[Pipeline]:
    result = await db.execute(select(Pipeline).order_by(Pipeline.updated_at.desc()))
    return list(result.scalars().all())
