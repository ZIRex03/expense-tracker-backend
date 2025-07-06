const express = require("express");
const sql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

const con = sql.createConnection({
    host: 'MySQL-8.2',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

con.connect((err) => {
    if (err) console.log('Ошибка подключения: ', err);
    else console.log('Подключение к БД успешно');
});

const PORT = 5000;

app.get('/allusers', async(req, res) => {
    con.query(
        "SELECT * FROM Users", (err, result) => {
            if(err) console.log('Ошибка получения всех пользователей', err);
            else return res.send(result);
        }
    )
});

app.get('/transactions', async(req, res) => {
    con.query(
        "SELECT * FROM Transactions", (err, result) => {
            if(err) console.log('Ошибка получения всех пользователей', err);
            else return res.send(result);
        }
    )
});

app.post("/addtransaction", async(req, res) => {

    const date = new Date(req.body.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    let data = [
        req.body.id,
        req.body.userid,
        req.body.name,
        req.body.price,
        req.body.category,
        formattedDate
    ];

    const userid = data[1];

    con.query("INSERT INTO `Transactions`(`id`, `userid`, `name`, `price`, `category`, `date`) VALUES (?,?,?,?,?,?)",
        data,
        (err, result) => {
            if (err){
                return res.json(err)
            } 

            con.query(`SELECT * FROM Transactions WHERE userid = ${userid}`, (err, result) => {
                if(err){
                    return res.status(500).send('Transactions query error');
                }

                return res.json(result);
            })
        }
    )
});

app.post("/edittransaction", async(req, res) => {

    const date = new Date(req.body.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    let data = [
        req.body.id,
        req.body.userid,
        req.body.name,
        req.body.price,
        req.body.category,
        formattedDate
    ];

    const transactionid = data[0];
    const userid = data[1];

    con.query(`UPDATE Transactions SET id=?, userid=?, name=?, price=?, category=?, date=? WHERE id = ${transactionid}`,
        data,
        (err, result) => {
            if (err){
                return res.json(err)
            } 

            con.query(`SELECT * FROM Transactions WHERE userid = ${userid}`, (err, result) => {
                if(err){
                    return res.status(500).send('Transactions query error');
                }

                return res.json(result);
            })
        }
    )
});

app.post(`/gettransactions`, async(req, res) => {

    let data = [
        req.body.id
    ]

    const userid = data[0];

    con.query(
        `SELECT * FROM Transactions WHERE userid = ${userid}`,
        (err, result) => {
            if(err){
                return res.json(err);
            }

            return res.json(result);
        }
    )
});

app.post(`/deletetransaction`, async(req, res) => {

    let data = [
        req.body.id,
        req.body.userid
    ]

    const transactionid = data[0];
    const userid = data[1];

    con.query(
        `DELETE FROM Transactions WHERE id = ${transactionid}`,
        (err, result) => {
            if(err){
                return res.json(err);
            }

            con.query(
                `SELECT * FROM Transactions WHERE userid = ${userid}`,
                (err, result) => {
                    if(err){
                        return res.json(err);
                    }
        
                    return res.json(result);
                }
            )
        }
    )
    
});


app.post('/getlimits', async(req, res) => {

    let data = [
        req.body.id
    ];

    const userid = data[0];

    con.query(
        `SELECT cl.Счета, cl.Еда, cl.Личное, cl.Подписка, cl.Здоровье, cl.Образование, cl.Транспорт, cl.Другое FROM CategoryLimits cl WHERE userid = ${userid}`,
        data,
        (err, result) => {
            if(err){
                return res.json(err);
            }

            return res.json(result);
        }
    )
});

app.post('/editlimits', async(req, res) => {

    let data = [
        req.body.id,
        req.body.Счета,
        req.body.Еда,
        req.body.Личное,
        req.body.Подписка,
        req.body.Здоровье,
        req.body.Образование,
        req.body.Транспорт,
        req.body.Другое
    ];

    const userid = data[0];

    con.query(
        `UPDATE CategoryLimits cl SET cl.userid=?, cl.Счета=?, cl.Еда=?, cl.Личное=?, cl.Подписка=?, cl.Здоровье=?, cl.Образование=?, cl.Транспорт=?, cl.Другое=? WHERE userid = ${userid}`,
        data,
        (err, result) => {

            if(err){
                return res.json(err);
            }

            con.query(
                `SELECT cl.Счета, cl.Еда, cl.Личное, cl.Подписка, cl.Здоровье, cl.Образование, cl.Транспорт, cl.Другое FROM CategoryLimits cl WHERE userid = ${userid}`,
                (err, result) => {

                    if(err){
                        return res.json(err);
                    }

                    return res.json(result);
                }
            )
        }
    )
});


app.listen(PORT, () => {
    console.log('Сервер запущен');
});
