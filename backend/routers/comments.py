from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from database import get_db
from models import Comment, User
from schemas import CommentCreate, CommentOut
from deps import get_current_user, requires_role

router = APIRouter(prefix="/api/comments", tags=["comments"])

@router.get("/{post_type}/{post_id}", response_model=List[CommentOut])
async def get_comments(post_type: str, post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment).options(joinedload(Comment.user)).filter(
            Comment.post_type == post_type, 
            Comment.post_id == post_id,
            Comment.is_approved == True
        ).order_by(Comment.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=dict)
async def post_comment(req: CommentCreate, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    new_comment = Comment(
        post_id=req.post_id,
        post_type=req.post_type,
        user_id=current.id,
        content=req.content,
        is_approved=False
    )
    db.add(new_comment)
    await db.commit()
    return {"status": "pending_approval"}

@router.put("/{comment_id}/approve")
async def approve_comment(comment_id: int, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    result = await db.execute(select(Comment).filter(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.is_approved = True
    await db.commit()
    return {"status": "approved"}

@router.delete("/{comment_id}")
async def delete_comment(comment_id: int, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    result = await db.execute(select(Comment).filter(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    await db.delete(comment)
    await db.commit()
    return {"status": "deleted"}
