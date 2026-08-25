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


class SchemaFieldIn(BaseModel):
    field_key: str = ""
    display_name: str
    grp: str = ""
    data_type: str = "text"
    required: str = "no"
    conditional_expr: str = ""
    validation_type: str = "none"
    reference_kind: str = ""
    format_rule: str = ""
    responsibility: str = ""
    visible: bool = True


class SchemaFieldPatch(BaseModel):
    display_name: str | None = None
    required: str | None = None
    validation_type: str | None = None
    reference_kind: str | None = None
    format_rule: str | None = None
    responsibility: str | None = None
    visible: bool | None = None
    export_order: int | None = None


class ReferenceIn(BaseModel):
    kind: str
    code: str
    label: str = ""
    abbreviation: str = ""


class SegmentIn(BaseModel):
    sequence: int
    name: str
    source_field: str = ""
    segment_type: str = "reference"
    fixed_value: str = ""
    length: int = 0
    pad_char: str = "0"
    pad_dir: str = "left"
    delimiter_before: str = ""


class NamingSchemeIn(BaseModel):
    name: str = "Project naming"
    standard: str = "BDNS"
    mode: str = "auto"
    case_mode: str = "upper"
    segments: list[SegmentIn] = []


class NamingPresetIn(BaseModel):
    name: str
    standard: str = "BDNS"
    segments: list[SegmentIn] = []
