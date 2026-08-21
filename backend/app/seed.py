"""Seed a realistic demo project so the magic moment works out of the box.

Builds the "171 Victoria Street (sample)" project: reference lists, a BDNS naming
scheme, trades, a ~16-field schema, and ~24 assets across trades with DELIBERATE
faults planted — a cross-trade duplicate Instance Name, an invalid level, a
missing conditional QR size, a bad unique-number format, a missing mandatory —
so the first validation run always surfaces genuine issues.
"""
from __future__ import annotations

import json

from .db import get_conn, init_db
from .naming import DEFAULT_SEGMENTS
from . import validation

LEVELS = ["B02", "B01", "L01", "L02", "L03", "L04", "L05", "L06"]
SPACES = ["04.12", "04.13", "04.27", "04.31", "B2.18", "B2.02", "01.05", "05.09"]  # note: B2.01 intentionally absent
SYSTEMS = ["BMS", "HVAC", "EMS", "Lighting", "Security", "Mechanical", "Fire"]
ZONES = [("0", "Landlord"), ("1", "Tenant")]
EQUIP = [("air handling unit", "AHU"), ("fan coil unit", "FCU"),
         ("controller - direct digital controller", "DDC"), ("pump", "PMP"),
         ("air terminal box - variable air volume", "VAV"), ("controls enclosure", "CTRP")]
TRADES = [("BMS", "Building Management System"), ("EMS", "Energy Metering System"),
          ("Lighting", "Lighting Control"), ("Security", "Security Systems"),
          ("Mechanical", "Mechanical Services"), ("Fire", "Fire Systems")]

# field_key, display, required, validation_type, reference_kind, format_rule, conditional_expr
FIELDS = [
    ("contractor_name", "Contractor Name", "yes", "none", "", "", ""),
    ("system", "System", "yes", "reference", "system", "", ""),
    ("level", "Level", "yes", "reference", "level", "", ""),
    ("operational_zone_reference", "Operational Zone", "yes", "reference", "zone", "", ""),
    ("space_id", "Space ID", "yes", "reference", "space", "", ""),
    ("asset_description", "Asset Description", "yes", "none", "", "", ""),
    ("bdns_equipment_type", "BDNS Equipment Type", "yes", "reference", "equipment_type", "", ""),
    ("unique_local_number", "Unique Local No.", "yes", "format", "", "digits:3", ""),
    ("instance_name", "Instance Name", "no", "unique", "", "", ""),
    ("equipment_manufacturer", "Equipment Manufacturer", "yes", "none", "", "", ""),
    ("equipment_model", "Equipment Model", "yes", "none", "", "", ""),
    ("qr_code_required", "QR Required", "no", "none", "", "", ""),
    ("qr_label_size", "QR Size", "conditional", "none", "", "", "qr_code_required=Yes"),
    ("ip_address", "IP Address", "no", "format", "", "ipv4", ""),
    ("mac_address", "MAC Address", "no", "format", "", "mac", ""),
    ("bacnet_device_id", "BACnet Device ID", "no", "none", "", "", ""),
]


def _asset(trade, instance, **meta):
    return (trade, instance, meta)


# (trade_code, instance_name, metadata...) — most valid, a few planted faults.
ASSETS = [
    _asset("BMS", "AHU-1004001", system="HVAC", level="L04", operational_zone_reference="1",
           space_id="04.13", asset_description="L04 Tenant North Office AHU",
           bdns_equipment_type="air handling unit", unique_local_number="001",
           equipment_manufacturer="FläktGroup", equipment_model="eQ Prime",
           qr_code_required="Yes", qr_label_size="Medium", ip_address="10.191.164.20",
           bacnet_device_id="1040001"),
    _asset("BMS", "DDC-1098001", system="BMS", level="B02", operational_zone_reference="0",
           space_id="B2.01", asset_description="Basement B02 Plant Controller",
           bdns_equipment_type="controller - direct digital controller", unique_local_number="001",
           equipment_manufacturer="Tridium", equipment_model="JACE 9025",
           qr_code_required="No", qr_label_size="N/A", ip_address="10.191.174.10",
           bacnet_device_id="1098001"),  # space B2.01 not in refs -> invalid_reference
    _asset("BMS", "FCU-1041007", system="HVAC", level="L04", operational_zone_reference="1",
           space_id="04.27", asset_description="Tenant FCU 04-027",
           bdns_equipment_type="fan coil unit", unique_local_number="007",
           equipment_manufacturer="Ability", equipment_model="EVO",
           qr_code_required="Yes", qr_label_size="Small"),  # duplicate with Mechanical
    _asset("BMS", "AHU-1004002", system="HVAC", level="LXX", operational_zone_reference="1",
           space_id="04.12", asset_description="L04 South Office AHU",
           bdns_equipment_type="air handling unit", unique_local_number="002",
           equipment_manufacturer="FläktGroup", equipment_model="eQ",
           qr_code_required="Yes", qr_label_size="", ip_address="10.191.164.21",
           bacnet_device_id="1040002"),  # level LXX invalid + QR size missing (conditional)
    _asset("BMS", "VAV-1004012", system="HVAC", level="L04", operational_zone_reference="1",
           space_id="04.31", asset_description="Tenant VAV 04-031",
           bdns_equipment_type="air terminal box - variable air volume", unique_local_number="012",
           equipment_manufacturer="Swegon", equipment_model="WISE",
           qr_code_required="No", qr_label_size="N/A"),
    _asset("Mechanical", "FCU-1041007", system="Mechanical", level="L04",
           operational_zone_reference="1", space_id="04.27", asset_description="Mech FCU 04-027",
           bdns_equipment_type="fan coil unit", unique_local_number="7",
           equipment_manufacturer="Ability", equipment_model="EVO",
           qr_code_required="No", qr_label_size="N/A"),  # duplicate name + bad unique no (format)
    _asset("Mechanical", "PMP-1980007", system="Mechanical", level="B02",
           operational_zone_reference="0", space_id="B2.18",
           asset_description="Secondary CHW Pump 7", bdns_equipment_type="pump",
           unique_local_number="007", equipment_manufacturer="Grundfos", equipment_model="MAGNA3",
           qr_code_required="Yes", qr_label_size="Large", ip_address="10.191.174.41"),
    _asset("Mechanical", "AHU-1005001", system="Mechanical", level="L05",
           operational_zone_reference="1", space_id="05.09", asset_description="L05 AHU",
           bdns_equipment_type="air handling unit", unique_local_number="001",
           equipment_manufacturer="", equipment_model="eQ Prime",
           qr_code_required="No", qr_label_size="N/A"),  # missing mandatory manufacturer
    _asset("EMS", "DDC-1001004", system="EMS", level="L01", operational_zone_reference="0",
           space_id="01.05", asset_description="Main Incomer Meter Controller",
           bdns_equipment_type="controller - direct digital controller", unique_local_number="004",
           equipment_manufacturer="Schneider", equipment_model="PM5560",
           qr_code_required="No", qr_label_size="N/A", ip_address="10.191.160.4",
           bacnet_device_id="1001004"),
    _asset("Lighting", "DDC-1004050", system="Lighting", level="L04",
           operational_zone_reference="1", space_id="04.13",
           asset_description="Lighting Controller L04", unique_local_number="050",
           bdns_equipment_type="controller - direct digital controller",
           equipment_manufacturer="Zumtobel", equipment_model="LITECOM",
           qr_code_required="Yes", qr_label_size="Small", ip_address="999.1.1.1"),  # bad IP (format warn)
    _asset("Security", "DDC-1001010", system="Security", level="L01",
           operational_zone_reference="0", space_id="01.05",
           asset_description="Access Control Panel", unique_local_number="010",
           bdns_equipment_type="controller - direct digital controller",
           equipment_manufacturer="Gallagher", equipment_model="C7000",
           qr_code_required="No", qr_label_size="N/A"),
    _asset("Fire", "DDC-1002003", system="Fire", level="L02", operational_zone_reference="0",
           space_id="B2.02", asset_description="Fire Alarm Interface", unique_local_number="003",
           bdns_equipment_type="controller - direct digital controller",
           equipment_manufacturer="Kentec", equipment_model="Syncro",
           qr_code_required="No", qr_label_size="N/A"),
]


def seed_demo(name: str = "171 Victoria Street (sample)") -> int:
    init_db()
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO project (name, site_reference, building_reference, name_mode) "
            "VALUES (?,?,?,?)", (name, "GB-LON-171VS", "1", "import"))
        pid = cur.lastrowid

        # references
        for code in LEVELS:
            conn.execute("INSERT INTO reference_value (project_id,kind,code,label) VALUES (?,?,?,?)",
                         (pid, "level", code, f"Level {code}"))
        for code in SPACES:
            conn.execute("INSERT INTO reference_value (project_id,kind,code,label) VALUES (?,?,?,?)",
                         (pid, "space", code, f"Space {code}"))
        for code in SYSTEMS:
            conn.execute("INSERT INTO reference_value (project_id,kind,code,label) VALUES (?,?,?,?)",
                         (pid, "system", code, code))
        for code, label in ZONES:
            conn.execute("INSERT INTO reference_value (project_id,kind,code,label) VALUES (?,?,?,?)",
                         (pid, "zone", code, label))
        for label, abbr in EQUIP:
            conn.execute("INSERT INTO reference_value (project_id,kind,code,label,abbreviation) "
                         "VALUES (?,?,?,?,?)", (pid, "equipment_type", label, label, abbr))
        conn.execute("INSERT INTO reference_value (project_id,kind,code,label) VALUES (?,?,?,?)",
                     (pid, "building", "1", "171 Victoria Street"))

        # naming scheme + segments
        sc = conn.execute(
            "INSERT INTO naming_scheme (project_id,mode) VALUES (?, 'auto')", (pid,)).lastrowid
        for s in DEFAULT_SEGMENTS:
            conn.execute(
                "INSERT INTO naming_segment (scheme_id,sequence,name,source_field,segment_type,"
                "fixed_value,length,pad_char,pad_dir,delimiter_before) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (sc, s["sequence"], s["name"], s["source_field"], s["segment_type"],
                 s["fixed_value"], s["length"], s["pad_char"], s["pad_dir"], s["delimiter_before"]))

        # schema
        for i, (k, dn, req, vt, rk, fr, cond) in enumerate(FIELDS):
            conn.execute(
                "INSERT INTO schema_field (project_id,field_key,display_name,grp,data_type,required,"
                "conditional_expr,validation_type,reference_kind,unique_scope,format_rule,"
                "auto_generated,editable,visible,export_order) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (pid, k, dn, "", "text", req, cond, vt, rk,
                 "project" if k == "instance_name" else "", fr,
                 1 if k == "instance_name" else 0, 1, 1, i + 1))

        # trades
        trade_ids = {}
        for code, tname in TRADES:
            tid = conn.execute(
                "INSERT INTO trade (project_id,code,name,system_owner) VALUES (?,?,?,?)",
                (pid, code, tname, "Electracom")).lastrowid
            trade_ids[code] = tid

        # assets
        for trade_code, instance, meta in ASSETS:
            meta = dict(meta)
            meta.setdefault("contractor_name", "Electracom")
            conn.execute(
                "INSERT INTO asset (project_id,trade_id,instance_name,metadata,source) "
                "VALUES (?,?,?,?, 'import')",
                (pid, trade_ids[trade_code], instance, json.dumps(meta)))

        validation.persist(conn, pid, validation.validate_project(conn, pid))
    return pid


if __name__ == "__main__":
    pid = seed_demo()
    with get_conn() as conn:
        n = conn.execute("SELECT COUNT(*) c FROM asset WHERE project_id=?", (pid,)).fetchone()["c"]
        iss = conn.execute("SELECT COUNT(*) c FROM validation_issue WHERE project_id=?",
                           (pid,)).fetchone()["c"]
    print(f"seeded project {pid}: {n} assets, {iss} validation issues")
