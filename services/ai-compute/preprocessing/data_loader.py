"""
Data Loading Utilities for Hardware Specifications
Gulhaji Plaza Laptop Recommendation System

This module handles loading hardware specs from PostgreSQL database
or sample data for development/testing.
"""

import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any
import os
from datetime import datetime


def load_hardware_specs(
    connection_string: Optional[str] = None,
    spec_ids: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Load hardware specifications from PostgreSQL database.

    Args:
        connection_string: PostgreSQL connection URL.
                          Falls back to DATABASE_URL env var.
        spec_ids: Optional list of spec IDs to filter

    Returns:
        pd.DataFrame: Hardware specifications data

    Note:
        If database connection fails, returns sample data for development.
    """
    # Try to load from database
    try:
        import psycopg2
        from sqlalchemy import create_engine, text

        conn_string = connection_string or os.getenv("DATABASE_URL")

        if conn_string:
            engine = create_engine(conn_string)

            query = "SELECT * FROM hardware_specs"
            if spec_ids:
                # Use parameterized query to prevent SQL injection
                placeholders = ','.join([f':param{i}' for i in range(len(spec_ids))])
                query += f" WHERE spec_id IN ({placeholders})"
                params = {f'param{i}': sid for i, sid in enumerate(spec_ids)}
                df = pd.read_sql_query(text(query), engine, params=params)
            else:
                df = pd.read_sql_query(query, engine)

            if not df.empty:
                return preprocess_hardware_specs(df)
    
    except ImportError:
        print("psycopg2 or sqlalchemy not installed, using sample data")
    except Exception as e:
        print(f"Database connection failed: {e}, using sample data")
    
    # Fallback to sample data
    return load_sample_data(spec_ids)


def load_sample_data(spec_ids: Optional[List[str]] = None) -> pd.DataFrame:
    """
    Generate sample hardware specifications for development/testing.
    
    Args:
        spec_ids: Optional list of spec IDs to include
    
    Returns:
        pd.DataFrame: Sample hardware specifications
    """
    np.random.seed(42)  # Reproducibility
    
    n_samples = 50
    
    # Generate sample data
    sample_data = {
        "spec_id": [f"spec-{i:04d}" for i in range(n_samples)],
        
        # Processor
        "processor_brand": np.random.choice(
            ["Intel", "AMD", "Apple"], n_samples, 
            p=[0.5, 0.4, 0.1]
        ),
        "processor_model": np.random.choice(
            ["Core i5", "Core i7", "Core i9", "Ryzen 5", "Ryzen 7", "Ryzen 9", "M1", "M2"],
            n_samples
        ),
        "processor_cores": np.random.choice([4, 6, 8, 10, 12, 16], n_samples),
        "processor_threads": np.random.choice([8, 12, 16, 20, 24, 32], n_samples),
        "processor_base_clock_ghz": np.round(np.random.uniform(2.0, 4.0, n_samples), 2),
        "processor_boost_clock_ghz": np.round(np.random.uniform(4.0, 5.5, n_samples), 2),
        
        # Memory
        "ram_gb": np.random.choice([8, 16, 32, 64], n_samples, p=[0.2, 0.4, 0.3, 0.1]),
        "ram_type": np.random.choice(["DDR4", "DDR5", "LPDDR4X", "LPDDR5"], n_samples),
        "ram_slots": np.random.choice([2, 4], n_samples),
        "max_ram_gb": np.random.choice([32, 64, 128], n_samples),
        
        # Storage
        "storage_type": np.random.choice(
            ["NVMe SSD", "SATA SSD", "HDD", "NVMe SSD + HDD"], n_samples,
            p=[0.5, 0.2, 0.1, 0.2]
        ),
        "storage_capacity_gb": np.random.choice(
            [256, 512, 1024, 2048], n_samples,
            p=[0.2, 0.4, 0.3, 0.1]
        ),
        "additional_storage_slots": np.random.choice([0, 1, 2], n_samples, p=[0.3, 0.5, 0.2]),
        
        # Display
        "display_size_inches": np.round(np.random.choice(
            [13.3, 14.0, 15.6, 16.0, 17.3], n_samples
        ), 1),
        "display_resolution": np.random.choice(
            ["1920x1080", "2560x1440", "3840x2160"], n_samples,
            p=[0.6, 0.3, 0.1]
        ),
        "display_type": np.random.choice(
            ["IPS", "OLED", "TN", "VA"], n_samples,
            p=[0.5, 0.2, 0.2, 0.1]
        ),
        "refresh_rate_hz": np.random.choice([60, 90, 120, 144, 165, 240], n_samples),
        "touch_screen": np.random.choice([True, False], n_samples, p=[0.2, 0.8]),
        
        # Graphics
        "gpu_type": np.random.choice(
            ["Integrated", "Dedicated", "Hybrid"], n_samples,
            p=[0.3, 0.5, 0.2]
        ),
        "gpu_brand": np.random.choice(
            ["NVIDIA", "AMD", "Intel", None], n_samples,
            p=[0.4, 0.3, 0.2, 0.1]
        ),
        "gpu_model": np.random.choice(
            ["RTX 4050", "RTX 4060", "RTX 4070", "RTX 4080", "RX 7600M", "RX 7700S", None],
            n_samples
        ),
        "vram_gb": np.random.choice([0, 4, 6, 8, 12, 16], n_samples),
        
        # Physical
        "weight_kg": np.round(np.random.uniform(1.2, 3.5, n_samples), 2),
        "thickness_mm": np.round(np.random.uniform(15, 25, n_samples), 2),
        "battery_whr": np.random.choice([50, 60, 70, 80, 90, 99], n_samples),
        
        # Connectivity
        "has_wifi_6": np.random.choice([True, False], n_samples, p=[0.8, 0.2]),
        "has_bluetooth": np.random.choice([True, False], n_samples, p=[0.9, 0.1]),
        "usb_c_ports": np.random.choice([0, 1, 2, 3, 4], n_samples),
        "usb_a_ports": np.random.choice([0, 1, 2, 3, 4], n_samples),
        "hdmi_ports": np.random.choice([0, 1, 2], n_samples),
        
        # Metadata
        "spec_version": 1,
        "created_at": datetime.now()
    }
    
    df = pd.DataFrame(sample_data)
    
    # Filter by spec_ids if provided
    if spec_ids:
        df = df[df["spec_id"].isin(spec_ids)]
    
    return preprocess_hardware_specs(df)


def preprocess_hardware_specs(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess hardware specs for AI/ML processing.
    
    Adds derived features:
    - gpu_score: Numeric GPU performance score
    - display_quality_score: Combined display quality metric
    - portability_score: Portability metric (higher = more portable)
    
    Args:
        df: Raw hardware specs DataFrame
    
    Returns:
        pd.DataFrame: Preprocessed DataFrame with derived features
    """
    df = df.copy()
    
    # Import scoring functions
    from .normalizer import (
        create_gpu_score,
        create_display_quality_score,
        create_portability_score
    )
    
    # Create GPU score
    df["gpu_score"] = df.apply(
        lambda row: create_gpu_score(row.get("gpu_type", "Integrated"), 
                                      row.get("vram_gb")),
        axis=1
    )
    
    # Create display quality score
    df["display_quality_score"] = df.apply(
        lambda row: create_display_quality_score(
            row.get("display_resolution", "1920x1080"),
            row.get("display_type", "IPS"),
            row.get("refresh_rate_hz", 60)
        ),
        axis=1
    )
    
    # Create portability score
    df["portability_score"] = df.apply(
        lambda row: create_portability_score(
            row.get("weight_kg"),
            row.get("thickness_mm")
        ),
        axis=1
    )
    
    # Create battery score (normalized 0-1)
    if "battery_whr" in df.columns:
        df["battery_score"] = df["battery_whr"].clip(40, 100).map(
            lambda x: (x - 40) / 60
        )
    
    # Create connectivity score
    if all(col in df.columns for col in ["usb_c_ports", "usb_a_ports", "hdmi_ports"]):
        df["connectivity_score"] = (
            df["usb_c_ports"] * 0.4 + 
            df["usb_a_ports"] * 0.3 + 
            df["hdmi_ports"] * 0.3
        ).clip(0, 1)
    
    return df


def get_feature_columns() -> List[str]:
    """
    Get list of numeric feature columns for normalization.
    Excludes non-numeric columns like timestamps, IDs, and text fields.

    Returns:
        List[str]: Column names suitable for ML processing
    """
    return [
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

        # Derived scores
        "gpu_score",
        "display_quality_score",
        "portability_score",
        "battery_score",
        "connectivity_score",

        # Physical
        "weight_kg",
        "thickness_mm",
        "battery_whr",

        # Connectivity
        "usb_c_ports",
        "usb_a_ports",
        "hdmi_ports"
    ]


def get_numeric_columns() -> List[str]:
    """
    Get all numeric columns from hardware_specs table for normalization.
    Excludes timestamps, IDs, and text columns.

    Returns:
        List[str]: Numeric column names
    """
    base_features = get_feature_columns()
    # Add spec_id for reference but it won't be normalized
    return base_features
