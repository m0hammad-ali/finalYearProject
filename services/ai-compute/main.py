"""
AI Compute Service - FastAPI for ML workloads
Gulhaji Plaza Laptop Recommendation System
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np

from preprocessing.normalizer import MinMaxNormalizer
from preprocessing.data_loader import load_hardware_specs

app = FastAPI(
    title="AI Compute Service",
    description="ML/AI computation service for laptop recommendations",
    version="1.0.0"
)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NormalizationRequest(BaseModel):
    """Request model for normalization endpoint"""
    spec_ids: Optional[List[str]] = None
    features: Optional[List[str]] = None


class RecommendationRequest(BaseModel):
    """Request model for recommendation endpoint"""
    user_preferences: Dict[str, Any]
    top_k: int = 5


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-compute",
        "version": "1.0.0"
    }


@app.post("/api/v1/normalize")
async def normalize_specs(request: NormalizationRequest):
    """
    Normalize hardware specifications using Min-Max Normalization.
    Scales all numeric features between 0 and 1.
    """
    try:
        # Load hardware specs from database or sample data
        df = load_hardware_specs()

        if df.empty:
            raise HTTPException(status_code=404, detail="No hardware specs found")

        # Initialize normalizer
        normalizer = MinMaxNormalizer()

        # Select features to normalize - only numeric columns
        features = request.features if request.features else None
        if features is None:
            # Use predefined numeric feature columns
            from preprocessing.data_loader import get_feature_columns
            features = get_feature_columns()
        
        # Filter to only columns that exist in dataframe
        available_features = [f for f in features if f in df.columns]
        
        normalized_df, scaling_params = normalizer.fit_transform(df, available_features)

        return {
            "success": True,
            "normalized_data": normalized_df.to_dict(orient="records"),
            "scaling_parameters": scaling_params,
            "record_count": len(normalized_df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/recommend")
async def get_recommendations(request: RecommendationRequest):
    """
    Generate laptop recommendations based on user preferences.
    Uses normalized specs for similarity scoring.
    """
    try:
        # Load and normalize data
        df = load_hardware_specs()
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No hardware specs found")
        
        normalizer = MinMaxNormalizer()
        normalized_df, _ = normalizer.fit_transform(df)
        
        # Calculate relevance scores based on preferences
        scores = calculate_relevance_scores(
            normalized_df, 
            request.user_preferences
        )
        
        # Get top-k recommendations
        top_indices = np.argsort(scores)[-request.top_k:][::-1]
        
        recommendations = []
        for idx in top_indices:
            recommendations.append({
                "spec_id": df.iloc[idx]["spec_id"] if "spec_id" in df.columns else str(idx),
                "relevance_score": float(scores[idx]),
                "laptop_info": normalized_df.iloc[idx].to_dict()
            })
        
        return {
            "success": True,
            "recommendations": recommendations,
            "user_preferences": request.user_preferences
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def calculate_relevance_scores(
    normalized_df: pd.DataFrame, 
    preferences: Dict[str, Any]
) -> np.ndarray:
    """
    Calculate relevance scores based on user preferences.
    Uses weighted Euclidean distance in normalized space.
    """
    scores = np.zeros(len(normalized_df))
    
    # Default weights for different features
    weights = {
        "ram_gb": 0.15,
        "storage_capacity_gb": 0.10,
        "processor_cores": 0.15,
        "gpu_score": 0.20,
        "display_quality": 0.10,
        "portability": 0.10,
        "battery": 0.10,
        "connectivity": 0.10
    }
    
    # Calculate score for each laptop
    for idx in range(len(normalized_df)):
        score = 0.0
        for feature, weight in weights.items():
            if feature in normalized_df.columns:
                score += normalized_df.iloc[idx][feature] * weight
        scores[idx] = score
    
    return scores


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
