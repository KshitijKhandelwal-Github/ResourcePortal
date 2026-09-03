from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database import get_db
from resourceportal.schemas.cluster import ClusterOut, ClusterCreate, ClusterUpdate
from resourceportal.models import Cluster
from resourceportal.utils.dependencies import require_role
from resourceportal.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/v1/clusters", tags=["clusters"])

@router.get("", response_model=List[ClusterOut])
def get_clusters(db: Session = Depends(get_db)):
    return db.query(Cluster).all()

@router.post("", response_model=ClusterOut, status_code=status.HTTP_201_CREATED)
def create_cluster(cluster: ClusterCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_cluster = Cluster(**cluster.model_dump())
    db.add(db_cluster)
    db.commit()
    db.refresh(db_cluster)
    return db_cluster

@router.put("/{cluster_id}", response_model=ClusterOut)
def update_cluster(cluster_id: int, cluster: ClusterUpdate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not db_cluster:
        raise NotFoundException("Cluster not found")
    update_data = cluster.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_cluster, k, v)
    db.commit()
    db.refresh(db_cluster)
    return db_cluster

@router.delete("/{cluster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cluster(cluster_id: int, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not db_cluster:
        raise NotFoundException("Cluster not found")
    db.delete(db_cluster)
    db.commit()

