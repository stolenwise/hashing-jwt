/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");




/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
  
    const result = await db.query(
      `INSERT INTO users
       (username, password, first_name, last_name, phone, join_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING username, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );
  
    return result.rows[0];
  }
  

  /** Authenticate: is this username/password valid? Returns boolean. */


  static async authenticate(username, password) {
    const results = await db.query(
    `SELECT username, password
    FROM users
    WHERE username = $1`,
    [username]
    )
    const user = results.rows[0];
    if (user) {
    
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user.password;
      return user;
    } else {
      throw new ExpressError("Invalid username/password", 400);
    }
  }
}
  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users 
      SET last_login_at = current_timestamp 
      WHERE username = $1 
      RETURNING username, last_login_at`,
      [username]
    )
    return result.rows[0];
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all(user) { 
    const result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users
      ORDER BY username`
    )
    return result.rows;

  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users 
       WHERE username = $1`,
      [username]
    )
    const user = result.rows[0];

    if (!user) {
      throw new ExpressError(`No user found with username: ${username}`, 404);
    }
    return user;
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u.username AS to_username,
              u.first_name,
              u.last_name,
              u.phone
       FROM messages AS m
       JOIN users AS u ON m.to_username = u.username
       WHERE m.from_username = $1`,
      [username]
    );
  
    if (result.rows.length === 0) {
      throw new ExpressError(`No messages found from user: ${username}`, 404);
    }
  
    return result.rows.map(m => ({
      id: m.id,
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      }
    }));
  }
  

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const result = await db.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u.username AS from_username,
              u.first_name,
              u.last_name,
              u.phone
       FROM messages AS m
       JOIN users AS u ON m.from_username = u.username
       WHERE m.to_username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`No messages found to user: ${username}`, 404);
    }

    return result.rows.map(m => ({
      id: m.id,
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      }
  }
  ));
  }
}

module.exports = User;