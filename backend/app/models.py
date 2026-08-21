"""Pydantic request/response models. Responses are mostly plain dicts from rows;
these cover the request bodies and a couple of typed shapes."""
from __future__ import annotations

from typing import Any
from pydantic import BaseModel


class ProjectIn(BaseModel):
    name: str
    site_reference: str = ""
    building_reference: str = ""
    name_mode: str = "auto"
    naming_standard: str = "BDNS"


class ProjectPatch(BaseModel):
    name: str | None = None
    site_reference: str | None = None
    building_reference: str | None = None
    name_mode: str | None = None
    naming_standard: str | None = None
    status: str | None = None


class TradeIn(BaseModel):
    code: str
    name: str = ""
    system_owner: str = ""


class AssetIn(BaseModel):
    trade_id: int
    instance_name: str = ""
    metadata: dict[str, Any] = {}


class AssetPatch(BaseModel):
    instance_name: str | None = None
    metadata: dict[str, Any] | None = None


class GenerateNamesIn(BaseModel):
    trade_id: int | None = None
    only_blank: bool = True
