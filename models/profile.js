const mysql = require("mysql2/promise.js");
const User = require("./user")

const connectionConfig = {
    host: "localhost",
    user: "root",
    database: "web_portfolio_db",
    password: "4bQ095713Su3dkNO$"
}

class Profile {
    constructor(portfolioName, name, description = null) {
        this.portfolioName = portfolioName,
        this.name = name,
        this.description = description
    }

    async savePortfolio(nickname) {
        const connection = await mysql.createConnection(connectionConfig);
        const userArr = await User.findByNickname(nickname);
        const user = userArr[1];
        // const userName = User.findByNickname(req.user.nickname);

        try {
            await connection.query('INSERT INTO portfolio (user_id, portfolio_name, name, description) VALUES (?, ?, ?, ?)', [
                user.user_id,
                this.portfolioName,
                this.name,
                this.description
            ]);
        } catch (error) {
            console.log(error)
            throw new Error('Portfolio adding fail');
        } finally {
            connection.end();
        }
    }
    static async getByPortfolioId(portfolioId) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            const [row] = await connection.query('SELECT * FROM portfolio WHERE portfolio_id = ?', [portfolioId])
            return row[0];
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    static async getAllPortfolioByUserId(userId) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            const [row] = await connection.query('SELECT * FROM portfolio WHERE user_id = ?', [userId]) 
            return row;
        } catch(err) {
            console.log(err)
            return;
        } finally {
            connection.end()
        }
    }

}

module.exports = {Profile}