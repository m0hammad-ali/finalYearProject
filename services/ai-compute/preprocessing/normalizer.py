"""
Min-Max Normalization for Hardware Specifications
Gulhaji Plaza Laptop Recommendation System

This module implements Min-Max Normalization to scale hardware specifications
between 0 and 1, which is essential for AI/ML algorithms to process features
on a comparable scale.

Formula: X_normalized = (X - X_min) / (X_max - X_min)

3NF Compliance: Normalization parameters are stored separately from raw data.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any


class MinMaxNormalizer:
    """
    Min-Max Normalizer for scaling numeric features to [0, 1] range.
    
    Attributes:
        min_values (Dict[str, float]): Minimum values for each feature
        max_values (Dict[str, float]): Maximum values for each feature
        feature_range (Tuple[float, float]): Target range for normalization
    """
    
    def __init__(self, feature_range: Tuple[float, float] = (0, 1)):
        """
        Initialize the MinMaxNormalizer.
        
        Args:
            feature_range: Target range for normalized values (default: (0, 1))
        """
        self.feature_range = feature_range
        self.min_values: Dict[str, float] = {}
        self.max_values: Dict[str, float] = {}
        self._is_fitted = False
    
    def fit(self, df: pd.DataFrame, features: Optional[List[str]] = None) -> 'MinMaxNormalizer':
        """
        Compute the min and max values for each feature.
        
        Args:
            df: Input DataFrame with hardware specifications
            features: Optional list of feature names to normalize.
                     If None, all numeric columns are used.
        
        Returns:
            self: Fitted normalizer instance
        
        Raises:
            ValueError: If DataFrame is empty or contains non-numeric data
        """
        if df.empty:
            raise ValueError("Cannot fit on empty DataFrame")
        
        # Select numeric columns if features not specified
        if features is None:
            features = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Validate features exist
        missing_features = set(features) - set(df.columns)
        if missing_features:
            raise ValueError(f"Missing features: {missing_features}")
        
        # Compute min and max for each feature
        for feature in features:
            col_data = df[feature].dropna()
            if len(col_data) == 0:
                continue
            
            self.min_values[feature] = float(col_data.min())
            self.max_values[feature] = float(col_data.max())
        
        self._is_fitted = True
        return self
    
    def transform(self, df: pd.DataFrame, features: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Scale the data to the specified range.
        
        Args:
            df: Input DataFrame to transform
            features: Optional list of feature names to transform
        
        Returns:
            pd.DataFrame: Transformed DataFrame with normalized values
        
        Raises:
            NotFittedError: If normalizer hasn't been fitted yet
        """
        if not self._is_fitted:
            raise NotFittedError("Normalizer must be fitted before transform")
        
        # Create a copy to avoid modifying original data
        df_normalized = df.copy().astype(float)
        
        if features is None:
            features = list(self.min_values.keys())
        
        min_range, max_range = self.feature_range
        
        for feature in features:
            if feature not in df_normalized.columns:
                continue
            
            if feature not in self.min_values or feature not in self.max_values:
                continue
            
            min_val = self.min_values[feature]
            max_val = self.max_values[feature]
            
            # Handle constant features (max == min)
            if max_val == min_val:
                df_normalized[feature] = (min_range + max_range) / 2
            else:
                # Apply Min-Max normalization formula
                df_normalized[feature] = (
                    (df_normalized[feature] - min_val) / (max_val - min_val)
                ) * (max_range - min_range) + min_range
        
        return df_normalized
    
    def fit_transform(
        self, 
        df: pd.DataFrame, 
        features: Optional[List[str]] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Fit and transform in one step.
        
        Args:
            df: Input DataFrame
            features: Optional list of feature names
        
        Returns:
            Tuple containing:
                - Normalized DataFrame
                - Dictionary with scaling parameters
        """
        self.fit(df, features)
        df_normalized = self.transform(df, features)
        
        scaling_params = {
            "min_values": self.min_values.copy(),
            "max_values": self.max_values.copy(),
            "feature_range": self.feature_range,
            "features_normalized": list(self.min_values.keys())
        }
        
        return df_normalized, scaling_params
    
    def inverse_transform(self, df: pd.DataFrame, features: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Reverse the normalization to get original values.
        
        Args:
            df: Normalized DataFrame
            features: Optional list of feature names
        
        Returns:
            pd.DataFrame: DataFrame with original scale values
        """
        if not self._is_fitted:
            raise NotFittedError("Normalizer must be fitted before inverse_transform")
        
        df_original = df.copy()
        min_range, max_range = self.feature_range
        
        if features is None:
            features = list(self.min_values.keys())
        
        for feature in features:
            if feature not in df_original.columns:
                continue
            
            if feature not in self.min_values or feature not in self.max_values:
                continue
            
            min_val = self.min_values[feature]
            max_val = self.max_values[feature]
            
            if max_val == min_val:
                df_original[feature] = min_val
            else:
                # Reverse Min-Max normalization
                df_original[feature] = (
                    (df_original[feature] - min_range) / (max_range - min_range)
                ) * (max_val - min_val) + min_val
        
        return df_original
    
    def get_scaling_params(self) -> Dict[str, Any]:
        """
        Get the scaling parameters for persistence.
        
        Returns:
            Dict containing min_values, max_values, and feature_range
        """
        return {
            "min_values": self.min_values.copy(),
            "max_values": self.max_values.copy(),
            "feature_range": self.feature_range
        }
    
    def set_scaling_params(self, params: Dict[str, Any]) -> None:
        """
        Set scaling parameters (for loading persisted models).
        
        Args:
            params: Dictionary with min_values, max_values, and feature_range
        """
        self.min_values = params.get("min_values", {})
        self.max_values = params.get("max_values", {})
        self.feature_range = params.get("feature_range", (0, 1))
        self._is_fitted = bool(self.min_values)


class NotFittedError(Exception):
    """Raised when transform is called before fit"""
    pass


# Hardware spec features to normalize for AI recommendation
HARDWARE_SPEC_FEATURES = [
    # Processor
    "processor_cores",
    "processor_threads",
    "processor_base_clock_ghz",
    "processor_boost_clock_ghz",
    
    # Memory
    "ram_gb",
    "max_ram_gb",
    
    # Storage
    "storage_capacity_gb",
    "additional_storage_slots",
    
    # Display
    "display_size_inches",
    "refresh_rate_hz",
    
    # Graphics (encoded score)
    "vram_gb",
    
    # Physical
    "weight_kg",
    "thickness_mm",
    "battery_whr",
    
    # Connectivity
    "usb_c_ports",
    "usb_a_ports",
    "hdmi_ports"
]


def create_gpu_score(gpu_type: str, vram_gb: Optional[float]) -> float:
    """
    Create a numeric GPU score for normalization.
    
    Args:
        gpu_type: Type of GPU (Integrated, Dedicated, Hybrid)
        vram_gb: Video RAM in GB
    
    Returns:
        float: GPU score between 0-10
    """
    type_scores = {
        "Integrated": 1.0,
        "Hybrid": 3.0,
        "Dedicated": 5.0
    }
    
    base_score = type_scores.get(gpu_type, 0)
    vram_score = vram_gb if vram_gb else 0
    
    return min(10.0, base_score + vram_score * 0.5)


def create_display_quality_score(
    resolution: str,
    display_type: str,
    refresh_rate: float
) -> float:
    """
    Create a numeric display quality score for normalization.
    
    Args:
        resolution: Display resolution string (e.g., "1920x1080")
        display_type: Panel type (IPS, OLED, TN, etc.)
        refresh_rate: Refresh rate in Hz
    
    Returns:
        float: Display quality score between 0-10
    """
    # Parse resolution
    try:
        width, height = map(int, resolution.split('x'))
        total_pixels = width * height
    except (ValueError, AttributeError):
        total_pixels = 1920 * 1080  # Default to FHD
    
    # Resolution score (0-4)
    if total_pixels >= 3840 * 2160:  # 4K
        resolution_score = 4.0
    elif total_pixels >= 2560 * 1440:  # QHD
        resolution_score = 3.0
    elif total_pixels >= 1920 * 1080:  # FHD
        resolution_score = 2.0
    else:
        resolution_score = 1.0
    
    # Panel type score (0-3)
    type_scores = {
        "OLED": 3.0,
        "IPS": 2.0,
        "VA": 1.5,
        "TN": 1.0
    }
    panel_score = type_scores.get(display_type.upper(), 1.0)
    
    # Refresh rate score (0-3)
    if refresh_rate >= 144:
        refresh_score = 3.0
    elif refresh_rate >= 90:
        refresh_score = 2.0
    else:
        refresh_score = 1.0
    
    return min(10.0, resolution_score + panel_score + refresh_score)


def create_portability_score(weight_kg: Optional[float], thickness_mm: Optional[float]) -> float:
    """
    Create a portability score (higher = more portable).
    
    Args:
        weight_kg: Weight in kilograms
        thickness_mm: Thickness in millimeters
    
    Returns:
        float: Portability score between 0-1 (inverted, lower weight = higher score)
    """
    if weight_kg is None or thickness_mm is None:
        return 0.5  # Default middle score
    
    # Normalize weight (assuming range 1-4 kg)
    weight_score = max(0, min(1, (4 - weight_kg) / 3))
    
    # Normalize thickness (assuming range 10-30 mm)
    thickness_score = max(0, min(1, (30 - thickness_mm) / 20))
    
    return (weight_score + thickness_score) / 2
