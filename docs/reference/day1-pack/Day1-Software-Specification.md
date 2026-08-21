

Smart Asset Management Tool
Day 1 Functional &amp; Technical Software Specification
Standalone project asset metadata management, validation and register replacement tool
Status
Development Specification
Scope
Day 1 standalone functionality
Audience
Software developer, development team or AI software agent
Source basis
Supplied React UI mockup, Smart Asset Registers and Smart Asset Naming Technical Submittal
Purpose
Define a buildable product that replaces project Excel asset registers with a governed database and web application

1. Executive Summary
The Smart Asset Management Tool is a standalone Day 1 web application for creating, governing, validating and maintaining project asset metadata across multiple system owners. It is intended to become the long-term replacement for separate Excel-based asset registers while preserving the ability to import and export project data in spreadsheet form when required.
The application shall be project-configurable rather than hard-coded to a single register structure. The supplied project examples contain materially different CONTRACTOR ASSET schemas: one focuses on structured naming, asset, network and smart-point information, while the other adds extended BIM, lifecycle, documentation, cyber/network, QR-code and commissioning fields. The product must therefore allow a project-specific register schema to be imported and managed without requiring software changes.
Core Day 1 outcome:  A user can create a project, configure the naming convention and controlled reference lists, import the project register schema, manage each trade's asset records in a single governed database, validate the data continuously, and export controlled registers and reports.
2. Scope and Boundaries
2.1 In Scope - Day 1
Standalone web application with persistent database storage.
Project creation and selection.
Configurable asset naming conventions, including BDNS-aligned naming.
Auto-generated, manually entered and imported instance names.
Project reference imports for trades, buildings, levels, spaces, systems and operational zones.
Dynamic register schema import and template generation.
Project and trade-level overview dashboards.
Full-width editable asset register.
Asset detail panel displayed below the register when a row is selected.
Import, export, filtering, search, validation, duplicate detection and issue navigation.
Audit history sufficient to identify when records were created, imported or edited.
2.2 Explicitly Out of Scope - Day 1
Live integration with the Smart Commissioning Tool, BIM platforms, MQTT brokers, BMS, QR generation services or other Day 2 toolsets.
Automated sync from external systems.
Cloud platform onboarding and semantic relationship generation.
Automated QR image generation and printing workflows, other than maintaining QR metadata fields when the active project schema requires them.
3. Source-Derived Design Principles
The software shall preserve the project-specific nature of the supplied registers rather than enforcing one global fixed table. The 171 Victoria Street example uses fields such as Contractor Name, System, Level, Operational Zone Reference, Space ID, Space Description, BDNS Equipment Type, Unique Local Number, Instance Name, Smart Point Type and network/protocol fields. The Holborn Viaduct example expands this with device type, proxy devices, group identifiers, BIM coordinates, manufacturing/installation/warranty fields, documentation references, MQTT support, inbound/outbound communication requirements, known issues/remediation, open/closed services and QR-code requirements.
The supplied naming technical submittal describes a BDNS-aligned instance-name structure using asset abbreviation, a delimiter, building reference, floor reference, operational zone reference and unique local number. It also states that the site reference is maintained as separate metadata. The application must support this pattern while also supporting projects where names are created in BIM or follow another naming standard.
4. Product Architecture
4.1 Recommended Logical Architecture
React-based frontend matching the approved UI mockup.
Backend API providing project, schema, reference, asset, validation, import/export and audit services.
Relational database recommended; PostgreSQL is a suitable implementation.
Dynamic project metadata should be represented by a project schema plus asset values, rather than a separate physical database table for every project.
Long-running imports/exports should run as jobs with status and result summaries.
4.2 Core Entities
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-DM-001
Project
Stores project identity, site/building references, naming mode, active schema and status.
A project can be created, selected, archived and uniquely identified.
SAM-DM-002
Trade
Stores each trade/system owner participating in the project.
Assets can be filtered and reported by trade.
SAM-DM-003
Reference Set / Value
Stores controlled values for levels, spaces, systems, zones, buildings and project-specific equipment types.
Configured reference fields validate against active values.
SAM-DM-004
Register Schema / Field
Defines every metadata column, data type, requirement, validation rule, visibility and export order.
Changing the schema changes the project register without code changes.
SAM-DM-005
Naming Scheme / Segment
Defines name generation mode and ordered naming components.
Auto-generated names reproduce the configured convention exactly.
SAM-DM-006
Asset
Stores stable asset ID, project/trade ownership, instance name and dynamic metadata.
One asset exists once in the project database and is not duplicated into separate trade tables.
SAM-DM-007
Validation Issue
Stores field-level and asset-level validation faults, severity and resolution state.
Every displayed fault is traceable to a project, asset and field where applicable.
SAM-DM-008
Import / Export Job
Stores source file, mode, timestamps, counts, errors and generated output.
Imports and exports are reproducible and auditable.
SAM-DM-009
Audit Event
Stores user/action/timestamp and before/after context for controlled changes.
The project can show who changed a record and when.
5. Common UI and Interaction Requirements
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-UI-001
Visual style
Follow the same Electracom UI language as the other toolsets: light grey application background, white cards, blue primary accent, green/amber/red status indicators, rounded controls and compact data tables.
All pages visually align with the approved React mockup.
SAM-UI-002
Navigation
Primary pages: Configuration, Overview, Asset Management. Active page is clearly highlighted.
Users can move between all Day 1 pages without losing the selected project.
SAM-UI-003
Information help
Key fields, metrics and validation concepts should have clickable information icons/popovers.
Clicking an information icon opens explanatory content and does not navigate away.
SAM-UI-004
Project context
Selected project must be visible in the application header or page context.
No action can be mistaken as applying to another project.
SAM-UI-005
Responsive table behaviour
Wide asset registers must retain full page width, use horizontal scrolling, sticky headers and sensible frozen identifier columns where practical.
No side inspector reduces register width on Asset Management.
SAM-UI-006
Status language
Use consistent statuses: Valid, Warning, Error; Complete, Partial, Missing; Active, Archived. Do not rely on colour alone.
Every status has text/icon plus colour.
6. Configuration Page
What needs to be built
Build the project setup area used to create/select projects, define naming behaviour, maintain trades and reference lists, import a project register schema, and export the project configuration.
Why it is needed
All downstream register behaviour depends on controlled project configuration. Centralising these rules prevents each trade maintaining separate uncontrolled Excel logic.
Where it applies
Applies once per project and governs all trades/assets in that project.
How it should behave
Users create/select a project, configure naming mode, import or edit reference datasets, import the register schema, validate the setup and save/publish it. Configuration changes must be audited.
What the finished result should look like
A card-based configuration page matching the approved UI, with clear setup status, import buttons, naming preview and export controls.
How success will be checked
A new project can be configured from blank through to a valid schema/reference setup and an asset import template can then be generated.
6.1 Project Configuration
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-CFG-001
Project creation / selection
Allow create, rename, select, archive and duplicate-project-as-template actions. Minimum fields: project name, project code, site reference, status.
Users can switch projects and all displayed data changes to the selected project.
SAM-CFG-002
Trade setup
Allow manual entry and import of trade code, trade name, system owner/contractor and active status.
Trade dropdowns and Overview cards use the configured list.
SAM-CFG-003
Reference data
Support controlled imports for buildings, levels, spaces, systems, operational zones and project-specific equipment types.
Invalid asset values are detected against the configured reference lists.
SAM-CFG-004
Reference dependencies
Where configured, validate child-parent relationships such as Space -&gt; Level -&gt; Building and System -&gt; Trade.
A space assigned to the wrong level is flagged rather than accepted silently.
SAM-CFG-005
Schema import
Import the project Register Schema and show field count, required count, conditional count, generated fields and validation sources.
A schema can be replaced/versioned only after validation and confirmation.
SAM-CFG-006
Template generation
Provide Download Asset Import Template generated from the active Register Schema.
Downloaded template columns and order match the active schema.
SAM-CFG-007
Configuration export
Export project configuration/reference lists/schema/naming rules as a controlled package.
Exported configuration can be reviewed and re-imported into a new project where supported.
7. Asset Naming Engine
What needs to be built
Build a configurable naming engine supporting Auto, Manual, Imported and Hybrid name modes. Auto mode shall concatenate ordered project-defined segments and validate uniqueness.
Why it is needed
Projects do not all create asset names in the same place. Some use project rules in the asset register; others generate names in BIM and must import them without overwrite.
Where it applies
Applies to the Instance Name / Asset Tag / BDNS Reference field for every asset when the active naming mode requires it.
How it should behave
In Auto mode, required source fields trigger immediate name preview/generation. In Manual/Imported mode, the application validates the provided name but does not overwrite it. Hybrid mode permits selected trades/asset types to use different modes.
What the finished result should look like
A naming configuration card with ordered segments, examples and live preview; asset rows show generated or imported name status.
How success will be checked
Configured source examples such as AHU + - + 1 + 02 + 0 + 013 generate AHU-1020013 exactly, and duplicate names are rejected project-wide.
7.1 Required Naming Capabilities
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-NAM-001
Segment configuration
Each segment must define sequence, source field, segment type, fixed value, length/padding, delimiter-before, required state and validation rule.
Segments can reproduce the supplied BDNS project example and a different custom convention.
SAM-NAM-002
BDNS lookup
Where BDNS is selected, equipment type resolves to approved abbreviation. Project-specific custom abbreviations must be allowed with approval status.
Known types generate the correct abbreviation; unapproved custom values are warned/blocked per configuration.
SAM-NAM-003
Site reference handling
Site reference can be retained as separate metadata and need not be forced into the human-readable instance name.
Naming output follows project configuration exactly.
SAM-NAM-004
Unique local number
Support configurable zero-padding and uniqueness scope, e.g. sequential per asset type/floor where required.
Auto numbering does not create duplicates inside the configured scope.
SAM-NAM-005
Imported names
When names originate from BIM, allow import and validation without regeneration.
Imported valid names remain unchanged after save/import.
SAM-NAM-006
Project-wide duplicate check
Instance Name must be unique across the complete project, including different trades.
A duplicate in another trade creates a blocking validation issue identifying both assets.
SAM-NAM-007
Component consistency
If a generated/structured name conflicts with level/zone/building/equipment type components, flag the mismatch.
Changing Level can either regenerate Auto names or show a controlled impact warning before save.
8. Dynamic Register Schema Engine
The register schema is the core Day 1 capability. The application shall not have a fixed hard-coded CONTRACTOR ASSET column list. Instead, each project defines the register fields and validation rules through a schema import or UI editor.
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-SCH-001
Field definition
Store Field Key, Display Name, Group, Data Type, Required state, Conditional Requirement, Validation Type, Reference List, Unique Scope, Auto Generated, Editable, Visible, Export Order, Help Text and aliases.
The supplied Register Schema Import Template can be imported successfully.
SAM-SCH-002
Supported data types
At minimum: Text, Long Text, Integer, Number, Boolean, Date.
UI editor and import validator handle each type correctly.
SAM-SCH-003
Conditional fields
Support expressions such as qr_required=Yes -&gt; qr_label_size required and static_ip_required=Yes -&gt; IP/Subnet/Gateway required.
Conditional faults appear/disappear immediately as source fields change.
SAM-SCH-004
Project-specific fields
Allow additional project fields without application deployment.
A newly added field appears in Asset Management, detail view, validation and export.
SAM-SCH-005
Schema versioning
Record schema version and effective date; preserve old asset values when fields are retired.
Schema change history is auditable and does not silently delete existing data.
SAM-SCH-006
Aliases / import mapping
Allow legacy header aliases to map to the same Field Key, e.g. Asset Tag/BDNS Reference and Instance Name.
An approved alternate source header can import to the correct field without duplicating metadata.
9. Overview Page
What needs to be built
Build a project dashboard with project-level and trade-level asset completeness, validation and naming metrics, plus direct navigation into each trade register.
Why it is needed
Project teams need a concise view of progress and data quality without opening every trade register or analysing Excel formulas.
Where it applies
Applies to the selected project and can be filtered by trade, system, level and validation state.
How it should behave
Metrics recalculate from the live database. Trade cards are clickable. Metric/error cards navigate to the corresponding filtered Asset Management view.
What the finished result should look like
A dashboard of summary KPI cards, trade progress cards, validation breakdowns and recent activity using the approved Electracom UI style.
How success will be checked
All displayed counts can be reconciled to the Asset Management filtered dataset and exported report.
9.1 Required Metrics
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-OV-001
Asset population
Total assets, assets per trade, assets per system and recently added/updated assets.
Counts equal database records under active filters.
SAM-OV-002
Metadata completeness
Overall % populated and average % populated per asset based on fields defined as applicable to that asset.
Metric excludes hidden/non-applicable fields and correctly treats conditional requirements.
SAM-OV-003
Fully complete assets
Count/% of assets with all applicable required fields populated.
Opening the metric shows only assets meeting the same rule.
SAM-OV-004
Validation issues
Assets with errors, assets with warnings, total field issues.
Counts reconcile with the issue panel.
SAM-OV-005
Naming compliance
Valid names, invalid names, duplicate instance names and imported/manual names requiring review.
Duplicate metric operates across trades.
SAM-OV-006
Reference compliance
Invalid levels, spaces, systems, operational zones and equipment types.
Each metric navigates to the corresponding invalid cells.
SAM-OV-007
Conditional project metrics
If schema contains QR fields, show QR Required, QR Metadata Complete and Missing QR Size. Similar schema-driven optional metrics may be added.
QR metrics do not appear on projects where those fields do not exist.
SAM-OV-008
Data freshness
Show assets not updated within a configurable period and last import date by trade.
Freshness changes correctly as records/imports are updated.
SAM-OV-009
Export
Export current dashboard summary and validation breakdown to XLSX/CSV and optionally PDF later.
Export reflects active project and filters.
10. Asset Management Page
What needs to be built
Build the primary asset register editing workspace for viewing, creating, modifying, deleting, filtering, validating and importing/exporting trade asset records.
Why it is needed
This is the operational replacement for the CONTRACTOR ASSET Excel tab and must remain practical for large, wide project registers.
Where it applies
Applies to the selected project and selected trade/register view, while validation can reference assets across all trades.
How it should behave
The register always spans the full page width. Clicking a row highlights the asset and opens the Selected Asset Details section below the register. No side inspector is permitted because it would reduce register width.
What the finished result should look like
A full-width horizontally scrollable register with sticky headers, cell validation styling, filters and actions; selected asset detail, issues and audit information are displayed beneath it.
How success will be checked
Users can complete the same core register-maintenance tasks as Excel while receiving stronger validation, controlled dropdowns, issue navigation and auditability.
10.1 Register Grid
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-AM-001
Full-width grid
The asset register occupies 100% of available content width at all times.
Selecting an asset never shrinks the table or opens a right-side inspector.
SAM-AM-002
Horizontal scrolling
Support wide project schemas with horizontal scrolling. Keep primary identifier columns frozen where practical.
Registers with 50+ columns remain usable without column clipping.
SAM-AM-003
Sticky headers
Column headings remain visible during vertical scrolling.
Headers remain aligned with columns while scrolling.
SAM-AM-004
Cell editing
Editable fields can be changed inline according to schema data type and reference validation.
Text, dropdown, date, boolean and numeric fields use appropriate controls.
SAM-AM-005
Validation styling
Invalid cells show icon/outline/status; hover/click exposes reason and expected rule.
A user can understand every validation error without opening external documentation.
SAM-AM-006
Row selection
Clicking a row highlights it and opens/updates Selected Asset Details below the register.
Selected row and detail asset always match.
SAM-AM-007
Create / duplicate / delete
Support new asset, duplicate-as-new and delete with confirmation. Deletion should be soft-delete where audit retention is required.
Accidental one-click permanent deletion is not possible.
SAM-AM-008
Bulk actions
Support multi-select for bulk validation, export and safe bulk changes to selected compatible fields.
Bulk edit clearly shows affected record count and requires confirmation.
SAM-AM-009
Search and filters
Search instance name, description, GUID, manufacturer etc.; filter by trade/system/level/equipment type/completeness/validation state and schema fields.
Filters can be cleared and counts update immediately.
SAM-AM-010
Column controls
Users can show/hide/reorder columns for their view without altering the project schema.
Personal/view layout changes do not remove schema fields from exports.
SAM-AM-011
Issue navigation
A faults/issues panel lists all faults under current filters. Clicking an issue selects the asset, scrolls to the row and focuses the affected cell where possible.
Users can move from issue list to faulty cell in one action.
SAM-AM-012
Import / export
Import trade/project asset data and export full register, filtered view, selected rows or a blank active-schema template.
Export ordering and headings match active schema configuration.
10.2 Selected Asset Details Below Register
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-DET-001
Position
Selected Asset Details is rendered below the full-width register.
No detail drawer exists at the side of the grid.
SAM-DET-002
Grouped metadata
Display fields grouped by schema Group, e.g. Location, Naming, Equipment, Network, BIM, QR, BACnet, Lifecycle, Documentation, Comments.
All visible schema fields for the selected asset are represented.
SAM-DET-003
Issue summary
Show field-level issues with severity, rule, observed value and expected condition.
Every invalid cell in the selected row appears in the detail issue list.
SAM-DET-004
Audit history
Show created/imported/modified timestamps and latest change history for the selected asset.
Users can identify the last change and source import.
SAM-DET-005
Asset actions
Provide Save, Validate, Duplicate, Delete/Archive and Export Selected Asset actions as appropriate.
Actions operate only on the selected asset and provide clear feedback.
11. Validation Engine
11.1 Validation Classes
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-VAL-001
Required field
Missing required value is an Error. Missing optional value is not an issue.
Required field status matches schema.
SAM-VAL-002
Conditional required
Evaluate the schema expression before deciding whether a value is required.
QR Label Size is required only when QR Code Required = Yes in a schema containing those fields.
SAM-VAL-003
Reference validation
Validate controlled values against active project references.
Invalid level/system/space/zone/equipment type is identified at cell level.
SAM-VAL-004
Cross-reference consistency
Validate linked reference relationships such as Space -&gt; Level and System -&gt; Trade.
A valid Space ID on the wrong Level is still flagged.
SAM-VAL-005
Instance-name uniqueness
No duplicate Instance Name across the project, including across trades.
Both records are identified in the duplicate issue.
SAM-VAL-006
Other unique fields
Support uniqueness scopes for GUID, hostname, IP address, BACnet Device ID etc. where configured.
Configured duplicate unique fields are identified.
SAM-VAL-007
Pattern/type validation
Support IP, MAC, hostname, numeric, date, regex/pattern and enumerated list validation.
Invalid field formats are blocked/warned according to schema.
SAM-VAL-008
Naming validation
Validate generated/imported name format and component consistency.
Names inconsistent with configured naming rule are identified.
SAM-VAL-009
Asset-reference validation
Validate Associated Panel Reference / Proxy Devices against known assets when those fields use asset-reference validation.
Orphan references are identified but can be warning or error per schema.
SAM-VAL-010
Severity
Support Error, Warning, Information. Schema/validation rule determines severity.
Overview and Asset Management counts separate errors from warnings.
12. Import Framework
Imports are a first-class workflow because Day 1 must coexist with Excel deliverables, BIM-generated names and system-owner data. An import should never directly write uncontrolled rows into the database without pre-validation.
12.1 Import Process
Upload file.
Identify import type and selected project.
Read headers and map to schema/reference fields.
Validate structure and row values.
Show preview with Create / Update / Warning / Reject classification.
User confirms import mode.
Commit accepted records in one transaction or controlled batches.
Store Import Job, source filename, user, timestamp and row-level results.
Provide downloadable error file for rejected rows.
12.2 Asset Import Modes
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-IMP-001
Create only
Rows must not overwrite an existing asset. Existing Instance Name/Asset ID causes reject or warning depending on configuration.
No existing record is changed.
SAM-IMP-002
Update only
Update rows matched by stable Asset ID where available, otherwise approved project match key.
Rows with no existing match are rejected.
SAM-IMP-003
Upsert
Create unmatched rows and update matched rows after preview.
Summary clearly states create/update/reject counts before commit.
SAM-IMP-004
Stable asset identifier
System-generated Asset ID should be included in exports and accepted on re-import even if not normally displayed as a user metadata field.
An asset can be renamed without creating a duplicate database record.
SAM-IMP-005
Blank update behaviour
Update imports must define whether blank means No Change or Clear Value. Default should be No Change unless Replace mode is explicitly selected.
Blank cells do not accidentally erase metadata during normal upsert.
13. Export and Reporting
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-EXP-001
Reference/config exports
Export project reference lists, naming scheme and schema.
Configuration can be independently reviewed outside the application.
SAM-EXP-002
Register exports
Export by project, trade, system, filter or selected assets in active schema order.
Export row count matches current requested scope.
SAM-EXP-003
Validation report
Export summary of completeness, issues, duplicates and reference-validation faults.
Overview metrics reconcile to report values.
SAM-EXP-004
Template export
Generate blank Contractor Asset template from active project schema.
Template headings/order match schema and can be re-imported.
SAM-EXP-005
Source compatibility
Where feasible, allow project-specific export headings/aliases to mirror agreed Excel deliverable terminology.
A project can retain contractual register naming while the database uses stable field keys.
14. Audit, Versioning and Data Governance
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-AUD-001
Audit changes
Record user, timestamp, action, asset, field and before/after value for controlled changes.
Asset detail can show recent change history.
SAM-AUD-002
Import provenance
Every created/updated asset records the import job/source file when changed by import.
A record can be traced back to the import that changed it.
SAM-AUD-003
Soft delete/archive
Do not silently destroy project asset history.
Deleted/archived assets are recoverable by administrator or retained in audit.
SAM-AUD-004
Schema history
Version changes to schema and naming rules.
Historical exports/validation can identify which rules were active.
SAM-AUD-005
Concurrency
Prevent silent overwrite when two users edit the same asset. Optimistic concurrency/version checking is acceptable.
Conflicting save produces a clear refresh/merge message.
15. Backend API - Recommended Surface
The implementation may use different endpoint names, but the backend should expose equivalent capabilities. The following REST-style surface is recommended for clarity and AI-agent implementation.
Endpoint
Purpose
GET /projects
List projects
POST /projects
Create project
GET/PATCH /projects/{id}
Read/update project
GET/PUT /projects/{id}/references/{type}
Read/replace reference set
POST /projects/{id}/references/{type}/import
Import reference data
GET/PUT /projects/{id}/schema
Read/update active register schema
POST /projects/{id}/schema/import
Import register schema
GET/PUT /projects/{id}/naming
Read/update naming scheme
POST /projects/{id}/naming/preview
Generate/validate name preview
GET /projects/{id}/assets
Search/filter/paginate assets
POST /projects/{id}/assets
Create asset
GET/PATCH/DELETE /assets/{assetId}
Read/update/archive asset
POST /projects/{id}/assets/import
Create import job
GET /imports/{jobId}
Read import status/result
POST /projects/{id}/validate
Run/recalculate validation
GET /projects/{id}/issues
Query issues
GET /projects/{id}/overview
Return overview metrics
POST /projects/{id}/exports
Generate export
GET /assets/{assetId}/audit
Read asset change history
16. Performance and Scale
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-PERF-001
Project scale
Target at least 50,000 assets in one project and 100+ schema fields without redesign.
Representative load test completes search/filter/paging acceptably.
SAM-PERF-002
Grid paging/virtualisation
Do not render every asset row at once. Use server-side pagination or virtualised data grid.
Large registers remain responsive.
SAM-PERF-003
Validation processing
Run project-wide validation incrementally/background where dataset size warrants it.
UI remains usable while validation runs and status is visible.
SAM-PERF-004
Search
Index Instance Name, Asset ID, trade/system, level, GUID and commonly filtered fields.
Common search/filter actions return promptly on large projects.
17. Security and Deployment
Day 1 may be deployed as an internal standalone application, but backend and database must not be exposed without authentication in production.
Role model should at minimum anticipate Administrator, Project Editor and Read Only roles, even if initial release uses a simplified login.
Uploaded files must be validated for type/size and stored outside executable paths.
Sensitive fields such as default passwords, if a project schema includes them, should support restricted visibility and encryption at rest.
All write operations should be attributable to a user/service identity.
18. Error Handling and User Feedback
ID
Requirement
Required Behaviour
Acceptance / Success Check
SAM-ERR-001
Import structural error
Show missing/unknown headings and stop commit until resolved.
User receives specific actionable error list.
SAM-ERR-002
Row validation errors
Show source row number, field, observed value, rule and severity.
Rejected rows can be exported with error reason.
SAM-ERR-003
Save conflict
Show concurrency conflict rather than overwriting another user.
No silent data loss.
SAM-ERR-004
Reference deletion
Prevent deletion of reference values currently used, or require controlled replacement/archive.
Existing assets do not become silently invalid without warning.
SAM-ERR-005
Schema change impact
Before applying schema changes, show affected asset/value counts.
User sees impact before publish.
19. Import Templates Supplied with this Specification
File
Purpose
SAM_Reference_Data_Import_Template.xlsx
Project reference lists: buildings, trades, levels, spaces, systems, operational zones and custom equipment types.
SAM_Naming_Convention_Import_Template.xlsx
Naming mode, ordered segments and source-derived naming examples.
SAM_Register_Schema_Import_Template.xlsx
Dynamic field-definition import representing the union of common fields seen across the supplied CONTRACTOR ASSET examples.
SAM_Asset_Data_Import_Template.xlsx
Example bulk asset import. Production software should generate this dynamically from the active schema.
Smart_Asset_Management_Import_Templates.zip
Convenience pack containing all four templates.
Important implementation rule:  The supplied Asset Data template is an example starting point only. The finished application must generate project-specific imports/exports from the active Register Schema so QR, lifecycle, smart-integration or other columns only appear where that project requires them.
20. End-to-End Acceptance Scenario
1. Create Project A and set site/building reference.
2. Import trades and reference lists.
3. Import the sample naming convention and select Auto mode.
4. Import the Register Schema containing QR fields.
5. Generate and download the project Asset Import Template.
6. Import assets for BMS and another trade.
7. Confirm valid rows load and invalid references are rejected with field-level errors.
8. Confirm Auto naming generates the configured instance names.
9. Create a duplicate Instance Name in the second trade and confirm both assets are flagged project-wide.
10. Open Overview and confirm trade counts, metadata completeness and duplicate/error metrics reconcile.
11. Open Asset Management and confirm the register occupies full page width.
12. Click an asset and confirm details render below the register.
13. Use the issue list to navigate to an invalid cell.
14. Export the current trade register and validation report.
15. Re-import an exported asset using stable Asset ID and confirm the record updates rather than duplicates.
21. Definition of Done
Configuration, Overview and Asset Management pages are implemented in line with the approved React mockup.
Asset Management register remains full-width and selected asset details appear below it.
Project-specific reference data, naming configuration and register schema can be imported.
The register schema drives UI columns, validation, detail grouping and export structure.
Auto/manual/imported naming modes work and project-wide duplicate detection is enforced.
Assets can be created, edited, filtered, deleted/archived, imported and exported.
Cell-level validation and issue navigation are operational.
Overview metrics reconcile to register data.
Audit/import history is stored.
Representative project datasets have been tested, including a project with QR fields and a project without them.
The four supplied import templates can be consumed by the software or mapped with documented equivalents.
Appendix A - Key Source Requirements
Smart Asset Naming Technical Submittal: the project example uses BDNS-based abbreviations, a hyphen delimiter, building reference, two-digit floor reference, operational zone reference and three-digit unique local number; site reference is stored separately. Example instance names include AHU-1020013, FCU-1071095, LT-1051088, ELV-1000004 and PMP-1980007.
Smart Asset Register examples: the CONTRACTOR ASSET tabs demonstrate that project metadata requirements vary significantly. The product must preserve this configurability rather than standardise all projects to one workbook structure.
