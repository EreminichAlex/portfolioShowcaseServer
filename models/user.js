const mysql = require("mysql2/promise.js");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const connectionConfig = {
    host: "localhost",
    user: "root",
    database: "web_portfolio_db",
    password: "4bQ095713Su3dkNO$"
}

class User {
    constructor(nickname, email, password) {
        this.nickname = nickname;
        this.email = email;
        this.password = password;
    }

    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async save() {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('INSERT INTO users (nickname, email, password) VALUES (?, ?, ?)', [
                this.nickname,
                this.email,
                this.password
            ]);
        } catch (error) {
            console.log(error)
            throw new Error('User registration failed');
        } finally {
            connection.end();
        }
    }

    async generateAuthTokens() {
        const accessToken = jwt.sign({ nickname: this.nickname}, 'secret-PortfolioUserToken-231sca', { expiresIn: "2h" });
        // const refreshToken = jwt.sign({ nickname: this.nickname}, 'secret-PortfolioUserToken-231sca', { expiresIn: "16d" });

        // const connection = await mysql.createConnection(connectionConfig);
        // try {
        //     await connection.query('INSERT INTO users (refresh_token) VALUES (?) WHERE nickname = (?)', [refreshToken, this.nickname]);
        // } catch (error) {
        //     console.log(error)
        //     throw new Error('User registration failed');
        // } finally {
        //     connection.end();
        // }
        return accessToken;
    }

    static async findById(id) {
        const connection = await mysql.createConnection(connectionConfig);
        
        try {
            const [rows] = await connection.execute('SELECT * FROM users WHERE user_id = ?', [id]);
            if (rows.length > 0) {
                const userData = rows[0];
                // return userData;
                return userData;
            }
            return null;
        } catch (error) {
            throw new Error('User not found');
        } finally {
            connection.end();
        }
    }

    static async findByNickname(nickname) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            const [rows] = await connection.execute('SELECT * FROM users WHERE nickname = ?', [nickname]);
            if (rows.length > 0) {
                const userData = rows[0];
                // return userData;
                return [new User(userData.nickname, userData.email, userData.password), userData];
            }
            return null;
        } catch (error) {
            throw new Error('User not found');
        } finally {
            connection.end();
        }
    }

    // async getUserId()
}

module.exports = User;