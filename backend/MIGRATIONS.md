
# Alembic Database Migration Workflow

This document outlines the standard operational commands for managing database schema changes using Alembic. The environment is fully configured to dynamically map SQLAlchemy models and load the database connection string.

## 1. Generate a New Migration

Whenever changes are made to the SQLAlchemy models (e.g., adding a table, modifying a column, changing relationships), a new migration script must be generated. 

Execute the following command in the root directory:

```bash
alembic revision --autogenerate -m "Describe the schema change here"

```

* **`--autogenerate`**: Instructs Alembic to compare the current state of the application's `Base.metadata` against the physical database schema and automatically write the structural differences into a new script.
* **`-m`**: Applies a human-readable message to the migration file name for tracking purposes.
* **Action Required**: Always review the newly generated Python file in the `alembic/versions/` directory. Autogeneration accurately detects most changes but may require manual adjustment for complex operations like column renaming, data type casting, or custom ENUM type drops.

## 2. Apply Migrations (Upgrade)

To execute pending migration scripts and update the physical database schema to match the latest application models, run the upgrade command:

```bash
alembic upgrade head

```

* **`head`**: Refers to the most recent migration revision available in the `alembic/versions/` directory. This command processes all unapplied `upgrade()` functions sequentially.

## 3. Revert Migrations (Downgrade)

If a migration introduces an error or needs to be rolled back, the schema can be reverted to a previous state.

To rollback the immediately preceding migration:

```bash
alembic downgrade -1

```

To rollback to a specific migration revision, locate the revision ID (the alphanumeric string at the start of the version filename) and specify it:

```bash
alembic downgrade <revision_id>

```

* **Action Note**: This executes the `downgrade()` function within the specified migration script(s), removing tables or columns added in that specific step.

## 4. Audit and Status Validation

To inspect the current state of the database and the migration history, utilize the following diagnostic commands:

**Check current database revision:**

```bash
alembic current

```

*Outputs the exact revision ID currently applied to the database.*

**View migration history:**

```bash
alembic history --verbose

```

*Outputs the chronological timeline of all generated migrations, indicating the order of execution and relationship between scripts.*



### Explanation of Workflow Strategy

The workflow strictly relies on the `--autogenerate` flag due to the proper configuration within the provided `env.py` file. Because `target_metadata = Base.metadata` is set and the models are imported in `env.py`, Alembic has complete memory access to the declarative schema. The dynamic injection of `sqlalchemy.url` ensures that all terminal commands listed in the documentation will execute directly against the active application database without requiring hardcoded credentials.
