from app.config.chroma_config import init_chroma_db
from app.config.mysql_config import init_mysql_db
from app.utils.open_ai_util import init_open_ai, embedding_open_ai

client = init_open_ai()


"""
    Lấy các khóa học chưa đồng bộ, embedding và lưu vào ChromaDB.
    Sau khi từng batch được lưu thành công, cập nhật is_sync = 1.
"""
def process_course():
    mydb = None
    cursor = None

    try:
        mydb = init_mysql_db()
        cursor = mydb.cursor(dictionary=True)

        courses = get_course(cursor)

        if not courses:
            return {
                "data": {
                    "total": 0
                },
                "status": {
                    "message": "Không có học phần nào cần đồng bộ!",
                    "code": 200
                }
            }

        course_collection, _ = init_chroma_db()

        max_batch_size = 100
        total_synced = 0

        for start_idx in range(0, len(courses), max_batch_size):
            end_idx = min(start_idx + max_batch_size, len(courses))
            courses_chunk = courses[start_idx:end_idx]

            ids_chunk = [str(course["id"]) for course in courses_chunk]
            mysql_ids_chunk = [course["id"] for course in courses_chunk]

            texts_chunk = combine_text(courses_chunk)
            metadatas_chunk = get_metadata(courses_chunk)

            embedding_data = embedding_course_batch(texts_chunk)
            embeddings_chunk = [item.embedding for item in embedding_data]

            course_collection.upsert(
                ids=ids_chunk,
                documents=texts_chunk,
                embeddings=embeddings_chunk,
                metadatas=metadatas_chunk
            )

            update_course_sync_status(
                cursor=cursor,
                mydb=mydb,
                course_ids=mysql_ids_chunk
            )

            total_synced += len(courses_chunk)

        return {
            "data": {
                "total": total_synced
            },
            "status": {
                "message": f"Đồng bộ thành công {total_synced} học phần!",
                "code": 200
            }
        }

    except Exception as exception:
        if mydb is not None:
            mydb.rollback()

        return {
            "data": None,
            "status": {
                "message": f"Đồng bộ học phần thất bại: {str(exception)}",
                "code": 500
            }
        }

    finally:
        if cursor is not None:
            cursor.close()

        if mydb is not None and mydb.is_connected():
            mydb.close()


"""
    Lấy các khóa học chưa được đồng bộ vào ChromaDB.
"""
def get_course(cursor):
    cursor.execute("""
        SELECT *
        FROM course
        WHERE is_sync = 0
        ORDER BY id ASC
    """)

    return cursor.fetchall()


"""
    Cập nhật is_sync = 1 cho các khóa học đã lưu thành công vào ChromaDB.
"""
def update_course_sync_status(cursor, mydb, course_ids):
    if not course_ids:
        return

    placeholders = ", ".join(["%s"] * len(course_ids))

    sql = f"""
        UPDATE course
        SET is_sync = 1
        WHERE id IN ({placeholders})
    """

    cursor.execute(sql, tuple(course_ids))
    mydb.commit()


"""
    Kết hợp thông tin khóa học thành văn bản để embedding.
"""
def combine_text(courses):
    return [
        (
            f"Name: {course.get('name') or ''} "
            f"- English_name: {course.get('english_name') or ''} "
            f"- Course_code: {course.get('code') or ''} "
            f"- Duration: {course.get('duration') or ''} "
            f"- Institute_manage: {course.get('institute_manage') or ''} "
            f"- Credits: {course.get('credits') or ''} "
            f"- Credit_fee: {course.get('credit_fee') or ''} "
            f"- List_course_condition: {course.get('list_course_condtion') or ''} "
            f"- Weight: {course.get('weight') or ''}"
        )
        for course in courses
    ]


"""
    Embedding danh sách văn bản theo từng batch.
"""
def embedding_course_batch(all_texts, chunk_size=100):
    all_embeddings = []

    for start_idx in range(0, len(all_texts), chunk_size):
        end_idx = min(start_idx + chunk_size, len(all_texts))
        texts_chunk = all_texts[start_idx:end_idx]

        embeddings = embedding_open_ai(texts_chunk)
        all_embeddings.extend(embeddings)

    return all_embeddings


"""
    Tạo metadata cho ChromaDB.
    ChromaDB không nhận giá trị None nên chuyển None thành chuỗi rỗng.
"""
def get_metadata(courses):
    return [
        {
            "name": course.get("name") or "",
            "english_name": course.get("english_name") or "",
            "code": course.get("code") or "",
            "duration": course.get("duration") or "",
            "institute_manage": course.get("institute_manage") or "",
            "credits": course.get("credits") or "",
            "credit_fee": course.get("credit_fee") or "",
            "list_course_condition": course.get("list_course_condtion") or "",
            "weight": course.get("weight") or ""
        }
        for course in courses
    ]