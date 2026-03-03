-- migrations/20250927193110_delete_project_with_tasks.sql

CREATE OR REPLACE FUNCTION delete_project_with_tasks(p_project_id uuid, p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- 開始一個事務
  -- 在 PostgreSQL 中，函數本身就在一個事務中執行
  
  -- 檢查專案是否存在並屬於當前用戶
  IF NOT EXISTS (SELECT 1 FROM "Projects" WHERE id = p_project_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Project not found or user does not have permission';
  END IF;

  -- 1. 先刪除關聯的任務
  DELETE FROM "Tasks" WHERE project_id = p_project_id;
  
  -- 2. 然後刪除專案本身
  DELETE FROM "Projects" WHERE id = p_project_id AND user_id = p_user_id;
  
  -- 如果上面的任何操作失敗，整個事務都會回滾
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
