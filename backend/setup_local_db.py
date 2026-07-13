import os

import pymysql
from dotenv import load_dotenv


def main():
    load_dotenv()
    db_name = os.environ.get("DB_NAME", "superhero_store")

    connection = pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        port=int(os.environ.get("DB_PORT", "3306")),
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        connection.commit()
    finally:
        connection.close()

    print(f"Database {db_name} ready")


if __name__ == "__main__":
    main()
