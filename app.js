const express = require('express');
const mysql = require('mysql2');
const dbconfig = require('./config/database');
const app = express();

const conn = mysql.createConnection(dbconfig);

app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));

conn.connect( (err) => {
    if(!err) {
      console.log("Database is connected ... \n\n");
    } else {
      console.log("Error connecting database ... \n\n");
    }
  });

app.post('/game_end', (req,res) => {
    const user_id = req.body.id;
    const user_score = req.body.score
    console.log(user_id);
    console.log(user_score);
    const callGameEnd = 'CALL gameEnd(?, ?)';

    conn.query(callGameEnd, [user_id, user_score], (err, rows, field) => {
        if(err) {
            res.status(500).send('데이터보내는 도중 서버 오류');
            console.log(err);
            console.log('에러는 query쪽에서 동작하다가 났어');
        } 
        else {
            console.log('이것은 rows : ', rows);
            res.send(rows);
        }
        
    })
})

app.get("/show_rank", (req, res) => {
    const query = 'SELECT u.user_id, u.nickname, r.score FROM user AS u LEFT JOIN `rank` AS r ON u.user_id = r.user_id WHERE score > 0 ORDER BY score DESC LIMIT 10';
    conn.query(query, (err, rows, fields) =>
    {
      if (err)
      {
        res.status(500).send('Internal Server Error');
        console.log(err);
        console.log('Error while performing Query.');
      }
      else
      {
        console.log('1',rows);
        var rank_arr = [];
        for(var temp = 0; temp < rows.length; temp++)
          rank_arr.push(rows[temp]);
  
        var result_json = {};
        result_json["data"] = rows;
        console.log(result_json);
        res.json(rows);
      }
    });
  });

  app.post('/create_name', (req, res) => {
    const id = req.body.id;
    const check_query = 'SELECT user_id FROM user WHERE user_id = ?'
    conn.query(check_query, id, (err, rows, field) => {
      console.log('create rows : ',rows);
      if(err) {
        res.status(500).send('Internal Server Error');
        console.log(err);
        console.log('Error while performing Query.');
      }
      else {
        let checkid = new Object();
        checkid.tf =false;   

        if(rows[0] == undefined) {
          checkid.tf = true;
          console.log('checkid: ', chekcid);
          res.send(checkid);
        } else {
          checkid.tf = false; // 중복됨 사용x
          res.send(checkid);  
        }
      }
    })
  })

app.listen(3000, () => {
    console.log('Server listening : 3000');
})
