"""Database schema initialization and multi-engine connection management (SQLite, MySQL, PostgreSQL, MSSQL, Oracle, MongoDB)."""

import sqlite3
from contextlib import contextmanager
from typing import Any

try:
    from core.config import (
        DB_TYPE,
        DB_PATH,
        STORAGE_DIR,
        MYSQL_CONFIG,
        POSTGRESQL_CONFIG,
        MSSQL_CONFIG,
        ORACLE_CONFIG,
        MONGODB_CONFIG,
    )
except ImportError:
    from ..core.config import (
        DB_TYPE,
        DB_PATH,
        STORAGE_DIR,
        MYSQL_CONFIG,
        POSTGRESQL_CONFIG,
        MSSQL_CONFIG,
        ORACLE_CONFIG,
        MONGODB_CONFIG,
    )


def initialize_database():
    """Initializes tables or collections across any configured database engine."""
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    if DB_TYPE == "mongodb":
        # MongoDB is schema-less; create unique index on users and db_store
        try:
            import pymongo
            client = pymongo.MongoClient(MONGODB_CONFIG.get("uri", "mongodb://localhost:27017"))
            db = client[MONGODB_CONFIG.get("database", "win7simu")]
            db.users.create_index("username", unique=True)
            db.users.create_index("uid", unique=True)
            db.db_store.create_index("path", unique=True)
            db.community_themes.create_index("id", unique=True)
            client.close()
            return
        except ImportError:
            raise RuntimeError("MongoDB driver not found. Install with: pip install pymongo")

    with get_db_connection() as connection:
        cursor = connection.cursor()

        if DB_TYPE == "sqlite":
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    uid TEXT PRIMARY KEY,
                    username TEXT UNIQUE,
                    password TEXT,
                    display_name TEXT,
                    photo_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS db_store (
                    path TEXT PRIMARY KEY,
                    data_json TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS community_themes (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    author_id TEXT,
                    author_name TEXT,
                    pic_url TEXT,
                    use_count INTEGER DEFAULT 0,
                    date INTEGER,
                    data_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

        elif DB_TYPE == "mysql":
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    uid VARCHAR(64) PRIMARY KEY,
                    username VARCHAR(191) UNIQUE,
                    password VARCHAR(255),
                    display_name VARCHAR(255),
                    photo_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS db_store (
                    path VARCHAR(255) PRIMARY KEY,
                    data_json LONGTEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS community_themes (
                    id VARCHAR(64) PRIMARY KEY,
                    name VARCHAR(255),
                    author_id VARCHAR(64),
                    author_name VARCHAR(255),
                    pic_url TEXT,
                    use_count INT DEFAULT 0,
                    date BIGINT,
                    data_json LONGTEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

        elif DB_TYPE in ("postgresql", "postgres"):
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    uid VARCHAR(64) PRIMARY KEY,
                    username VARCHAR(191) UNIQUE,
                    password VARCHAR(255),
                    display_name VARCHAR(255),
                    photo_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS db_store (
                    path VARCHAR(255) PRIMARY KEY,
                    data_json TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS community_themes (
                    id VARCHAR(64) PRIMARY KEY,
                    name VARCHAR(255),
                    author_id VARCHAR(64),
                    author_name VARCHAR(255),
                    pic_url TEXT,
                    use_count INT DEFAULT 0,
                    date BIGINT,
                    data_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

        elif DB_TYPE in ("mssql", "sqlserver"):
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' and xtype='U')
                CREATE TABLE users (
                    uid NVARCHAR(64) PRIMARY KEY,
                    username NVARCHAR(191) UNIQUE,
                    password NVARCHAR(255),
                    display_name NVARCHAR(255),
                    photo_url NVARCHAR(MAX),
                    created_at DATETIME DEFAULT GETDATE()
                );
            """)
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='db_store' and xtype='U')
                CREATE TABLE db_store (
                    path NVARCHAR(255) PRIMARY KEY,
                    data_json NVARCHAR(MAX),
                    updated_at DATETIME DEFAULT GETDATE()
                );
            """)
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='community_themes' and xtype='U')
                CREATE TABLE community_themes (
                    id NVARCHAR(64) PRIMARY KEY,
                    name NVARCHAR(255),
                    author_id NVARCHAR(64),
                    author_name NVARCHAR(255),
                    pic_url NVARCHAR(MAX),
                    use_count INT DEFAULT 0,
                    date BIGINT,
                    data_json NVARCHAR(MAX),
                    created_at DATETIME DEFAULT GETDATE()
                );
            """)

        elif DB_TYPE == "oracle":
            # Oracle table initialization
            tables = [
                """CREATE TABLE users (
                    uid VARCHAR2(64) PRIMARY KEY,
                    username VARCHAR2(191) UNIQUE,
                    password VARCHAR2(255),
                    display_name VARCHAR2(255),
                    photo_url CLOB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )""",
                """CREATE TABLE db_store (
                    path VARCHAR2(255) PRIMARY KEY,
                    data_json CLOB,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )""",
                """CREATE TABLE community_themes (
                    id VARCHAR2(64) PRIMARY KEY,
                    name VARCHAR2(255),
                    author_id VARCHAR2(64),
                    author_name VARCHAR2(255),
                    pic_url CLOB,
                    use_count NUMBER DEFAULT 0,
                    date_ts NUMBER,
                    data_json CLOB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )"""
            ]
            for t_sql in tables:
                try:
                    cursor.execute(t_sql)
                except Exception:
                    pass  # table already exists

        connection.commit()


@contextmanager
def get_db_connection():
    """
    Context manager yielding an active connection or client across all supported database engines.
    """
    if DB_TYPE == "sqlite":
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(DB_PATH)
        try:
            yield connection
        finally:
            connection.close()

    elif DB_TYPE == "mysql":
        try:
            import pymysql
            connection = pymysql.connect(
                host=MYSQL_CONFIG.get("host", "localhost"),
                port=int(MYSQL_CONFIG.get("port", 3306)),
                user=MYSQL_CONFIG.get("user", "root"),
                password=MYSQL_CONFIG.get("password", ""),
                database=MYSQL_CONFIG.get("database", "win7simu"),
                autocommit=True,
            )
            try:
                yield connection
            finally:
                connection.close()
        except ImportError:
            raise RuntimeError("MySQL driver not found. Install with: pip install pymysql")

    elif DB_TYPE in ("postgresql", "postgres"):
        try:
            import psycopg2
            connection = psycopg2.connect(
                host=POSTGRESQL_CONFIG.get("host", "localhost"),
                port=int(POSTGRESQL_CONFIG.get("port", 5432)),
                user=POSTGRESQL_CONFIG.get("user", "postgres"),
                password=POSTGRESQL_CONFIG.get("password", ""),
                dbname=POSTGRESQL_CONFIG.get("database", "win7simu"),
            )
            try:
                yield connection
            finally:
                connection.close()
        except ImportError:
            raise RuntimeError("PostgreSQL driver not found. Install with: pip install psycopg2-binary")

    elif DB_TYPE in ("mssql", "sqlserver"):
        try:
            import pyodbc
            conn_str = (
                f"DRIVER={{{MSSQL_CONFIG.get('driver', 'ODBC Driver 17 for SQL Server')}}};"
                f"SERVER={MSSQL_CONFIG.get('server', 'localhost')},{MSSQL_CONFIG.get('port', 1433)};"
                f"DATABASE={MSSQL_CONFIG.get('database', 'win7simu')};"
                f"UID={MSSQL_CONFIG.get('user', 'sa')};"
                f"PWD={MSSQL_CONFIG.get('password', '')};"
            )
            connection = pyodbc.connect(conn_str, autocommit=True)
            try:
                yield connection
            finally:
                connection.close()
        except ImportError:
            raise RuntimeError("MSSQL driver not found. Install with: pip install pyodbc")

    elif DB_TYPE == "oracle":
        try:
            import oracledb
            dsn = f"{ORACLE_CONFIG.get('host', 'localhost')}:{ORACLE_CONFIG.get('port', 1521)}/{ORACLE_CONFIG.get('serviceName', 'XE')}"
            connection = oracledb.connect(
                user=ORACLE_CONFIG.get("user", "system"),
                password=ORACLE_CONFIG.get("password", ""),
                dsn=dsn,
            )
            try:
                yield connection
            finally:
                connection.close()
        except ImportError:
            raise RuntimeError("Oracle driver not found. Install with: pip install oracledb")

    elif DB_TYPE == "mongodb":
        try:
            import pymongo
            client = pymongo.MongoClient(MONGODB_CONFIG.get("uri", "mongodb://localhost:27017"))
            db = client[MONGODB_CONFIG.get("database", "win7simu")]
            try:
                yield db
            finally:
                client.close()
        except ImportError:
            raise RuntimeError("MongoDB driver not found. Install with: pip install pymongo")

    else:
        raise ValueError(
            f"Unsupported database type '{DB_TYPE}'. Supported: sqlite, mysql, postgresql, mssql, oracle, mongodb."
        )
