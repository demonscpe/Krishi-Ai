"""Price prediction service — wraps the existing price_engine logic."""
from services.price_engine import (
    get_price_overview as _overview,
    get_commodity_detail as _detail,
    COMMODITY_DICT,
)


async def get_overview() -> dict:
    return await _overview()


async def get_detail(crop_name: str) -> dict:
    return await _detail(crop_name)


def list_commodities() -> list:
    return sorted(COMMODITY_DICT.keys())
