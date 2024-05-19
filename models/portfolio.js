const mysql = require("mysql2/promise.js");

const connectionConfig = {
    host: "localhost",
    user: "root",
    database: "web_portfolio_db",
    password: "4bQ095713Su3dkNO$"
}

class Portfolio {
    constructor(id) {
        this.portfolio_id = id
    }

    async saveContact(contactObj) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query("INSERT INTO contact (portfolio_id, link, link_name) VALUES (?, ?, ?)", [this.portfolio_id, contactObj.link, contactObj.linkName])
        } catch(err) {
            console.log(err)
            throw new Error('Contact adding fail');
        } finally {
            connection.end();
        }
    }

    static async deleteContact(contactId) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('DELETE FROM contact WHERE contact_id = ?', [contactId]);
        } catch(err) {
            console.log(err)
            throw new Error('Contact delete fail');
        } finally {
            connection.end();
        }
    }

    async findContactId(link, linkName) {
        const connection = await mysql.createConnection(connectionConfig);
    
        if (link.endsWith('/')) {
            link = link.substring(0, link.length - 1);
        }
          
        try {
            const [row] = await connection.query(`SELECT * FROM contact WHERE portfolio_id = ? AND link = ? AND link_name = ?`, [this.portfolio_id, link ,linkName]);
            return row[0];
        } catch(err) {
            console.log(err)
            throw new Error('Contact delete fail');
        } finally {
            connection.end();
        }
    }

    static async getAllContacts(portfolioId) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            const [row] = await connection.query('SELECT * FROM contact WHERE portfolio_id = ?', [portfolioId])
            return row;
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async changeName(newName) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('UPDATE portfolio SET name = ? WHERE portfolio_id = ?', [newName, this.portfolio_id])
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async changeDescription(newDescr) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('UPDATE portfolio SET description = ? WHERE portfolio_id = ?', [newDescr, this.portfolio_id])
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async changeBackgroundColor(newColor) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('UPDATE portfolio SET background_color = ? WHERE portfolio_id = ?', [newColor, this.portfolio_id])
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }
    async deletePortfolio() {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('DELETE FROM portfolio WHERE portfolio_id = ?', [this.portfolio_id])
            
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async saveSection(name) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('INSERT INTO sections (portfolio_id, name) VALUES (?,?)', [this.portfolio_id, name])
            
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    static async getAllSections(portfolioId) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            const [row] = await connection.query('SELECT * FROM sections WHERE portfolio_id = ?', [portfolioId])
            return row;
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async getSectionByName(name) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            const [row] = await connection.query('SELECT * FROM sections WHERE name = ?', [name])
            return row[0];
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    static async compareNewSectionName(newSectionName) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            const [row] = await connection.query('SELECT * FROM sections WHERE name = ?', [newSectionName])
            if (row.length > 0) {
                return 1;
            } else {
                return -1
            }
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async changeSectionName(name, sectionId) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('UPDATE sections SET name = ? WHERE portfolio_id = ? AND id = ?', [name, this.portfolio_id, sectionId])
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    static async deleteSection(sectionId) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('DELETE FROM sections WHERE id = ?', [sectionId])
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async saveWork(portfolio_id ,sectionId, workName, description, link, file_path) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            await connection.query('INSERT INTO work (portfolio_id ,section_id, work_name, description, link, file_path) VALUES (?,?,?,?,?,?)', 
            [portfolio_id,sectionId,workName,description,link,file_path])
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    static async getAllWorks(portfolioId) {
        const connection = await mysql.createConnection(connectionConfig);

        try {
            const [row] = await connection.query('SELECT * FROM work WHERE section_id = ?', [portfolioId]);
            return row;
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }
    static async getAllWorksByPortfolioId(portfolioId) {
        const connection = await mysql.createConnection(connectionConfig);
        const query = `
        SELECT work.*
        FROM work 
        JOIN sections ON work.section_id = sections.id
        JOIN portfolio ON sections.portfolio_id = portfolio.portfolio_id
        WHERE portfolio.portfolio_id = ?`
        try {
            const [row] = await connection.query(query, [portfolioId]);
            return row;
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    static async getAllWorksByPortfolioIdOnly(portfolioId) {
        const connection = await mysql.createConnection(connectionConfig);
        const query = `SELECT * FROM work WHERE portfolio_id = ?`

        try {
            const [row] = await connection.query(query, [portfolioId]);
            return row;
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    static async deleteWork(workId) {
        const connection = await mysql.createConnection(connectionConfig);
        const query = "DELETE FROM work WHERE work_id = ?"
        try {
            await connection.query(query, [workId]);
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async changeWorkName(workId, newName) {
        const connection = await mysql.createConnection(connectionConfig);
        const query = "UPDATE work SET work_name = ? WHERE work_id = ?";

        try {
            await connection.query(query, [newName, workId]);
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async changeWorkDescr(workId, newDescr) {
        const connection = await mysql.createConnection(connectionConfig);
        const query = "UPDATE work SET description = ? WHERE work_id = ?";

        try {
            await connection.query(query, [newDescr, workId]);
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    static async changeWorkFile(workId, path) {
        const connection = await mysql.createConnection(connectionConfig);
        const query = "UPDATE work SET file_path = ? WHERE work_id = ?"

        try {
            await connection.query(query, [path, workId]);
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }

    async changeWorkSection(workId, newSection) {
        const connection = await mysql.createConnection(connectionConfig);
        const query = "UPDATE work SET section_id = ? WHERE work_id = ?"

        try {
            await connection.query(query, [newSection, workId]);
        } catch (err) {
            console.log(err)
            return ;
        } finally {
            connection.end()
        }
    }
}

module.exports = {Portfolio}