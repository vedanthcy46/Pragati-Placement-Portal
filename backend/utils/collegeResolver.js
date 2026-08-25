import { pool } from '../config/db.js';
import { resolveUserIntId } from './userResolver.js';

/**
 * Resolve the college row for an authenticated user UUID (auth_users.uuid_id)
 * - Uses resolveUserIntId to map UUID -> users.id
 * - Queries colleges WHERE user_id = <intUserId>
 * - DOES NOT swallow database/errors — errors will propagate to caller
 *
 * Returns: { id, name, ... } | null
 */
export const resolveCollegeForUser = async (userUuid) => {
  if (!userUuid) return null;

  // resolve to integer user id (may throw if DB error occurs inside resolveUserIntId)
  const intUserId = await resolveUserIntId(userUuid);

  if (!intUserId) return null;

  const result = await pool.query('SELECT id, name FROM colleges WHERE user_id = $1', [intUserId]);
  return result.rows[0] || null;
};
