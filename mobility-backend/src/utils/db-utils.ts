/**
 * Postgres requires uppercase NULL value without brackets
 *
 * @param value value to insert into db
 */
export const valueOrNULL = (value) => {
  return value !== null && value !== undefined ? "'" + value + "'" : 'NULL';
};
