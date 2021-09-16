//const e = require('express');
const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv').config()
const dbconfig = require('./config/database');
const app = express();
const http = require('http');
const { release } = require('os');
const port = 4000


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
let conn = mysql.createConnection(dbconfig);
// let test = 'SELECT u.device_id, u.nickname, r.nickname, r.score FROM user AS u LEFT JOIN `rank` AS r ON u.nickname = r.nickname WHERE score > 0 ORDER BY score DESC';
// const main = async () => { 
//   for(let i = 0; i < 5; i++) {
//   try {
//     let connection1 = await pool.getConnection(async conn => conn)
//     let row = await connection1.query(test);
//     console.log(row[0]);
//     connection1.release

//   } catch(err) {
//     // console.log(err)
//     return
//   }
// }
// }











// const test = conn.getConnection((err, connection) => {
//   if (!err) {
//     console.log("Database is connected ... \n\n");
//   } else {
//     console.log("Error connecting database ... \n\n");
//   }
// });
 
// const test = pool.getConnection((err, conn) => {
//     if (err) throw err;
//     const test_query = 'SELECT u.device_id, u.nickname, r.nickname, r.score FROM user AS u LEFT JOIN `rank` AS r ON u.nickname = r.nickname WHERE score > 0 ORDER BY score DESC';

//     conn.query(test_query, (error, results, fields) => {
//       console.log(results);
//       release();
//     })
//   })

// app.post('/game_end', (req, res) => {
//   const user_id = req.body.id;
//   const user_score = req.body.score
//   console.log(user_id);
//   console.log(user_score);
//   const callGameEnd = 'CALL gameEnd(?, ?)';
//   conn.query(callGameEnd, [user_id, user_score], (err, rows, field) => {
//     if (err) {
//       res.status(500).send('game_end 에서 데이터보내는 도중 서버 오류');
//       console.log(err);
//       console.log('에러는 query쪽에서 동작하다가 났어');
//     }
//     else {
//       console.log('이것은 rows : ', rows);
//       res.send(rows);
//     }

//   })
// })

app.get("/show_rank", (req, res) => {
  const query = 'SELECT u.device_id, u.nickname, r.nickname, r.score FROM user AS u LEFT JOIN `rank` AS r ON u.nickname = r.nickname WHERE score > 0 ORDER BY score DESC';

  const rank = async () => { 
    try {
      let connection2 = await pool.getConnection(async conn1 => conn1)
      let [row] = await connection2.query(query);
      console.log('1', row[0]);
        let rank_arr = [];
        for (var temp = 0; temp < row.length; temp++)
          rank_arr.push(row[temp]);

        let result_json = {};
        result_json["data"] = row;
        console.log('test', result_json);

        res.json(result_json);
      connection2.release()
    } catch(err) {
      res.status(500).send('show_rank 에서 서버 오류');
      console.log(err);
      console.log('랭킹 서버에서 오류')
      return
    }
  }

  rank();
});
  //   pool.query(query, (err, rows, field) => {
  //     if (err) {
  //       res.status(500).send('show_rank 에서 서버 오류');
  //       console.log(err);
  //       console.log('Error while performing Query.');
  //     }
  //     else {
  //       let rank_arr = [];
  //       for (var temp = 0; temp < rows.length; temp++)
  //         rank_arr.push(rows[temp]);

  //       let result_json = {};
  //       result_json["data"] = rows;
  //       console.log(i, rows);

  //       res.json(result_json);
  //   };
  // })



app.post("/create_name", (req, res) => {
  const user_name = req.body.nickname;
  const user_device = req.body.device;
  console.log('user_name: ', user_name);
  const nickCheckQuery = 'SELECT * FROM user WHERE nickname=?';
  const insertQuery = 'INSERT INTO user (device_id, nickname) values(?,?)';
  const ranknick_query = 'INSERT INTO `rank` (nickname) values(?)';
  const skilcharnick_query = 'INSERT INTO skillcharactor (nickname) values(?)'

  const create = async () => {
    try {
      let connection = await pool.getConnection(async conn1 => conn1)
      let [row] = await connection2.query(query);
      if (rows.length == 0) {
        conn.query(insertQuery, [user_device, user_name], (err, rows, fields) => {
          if (err) {
            res.status(500).send('닉넴을 데이터베이스에 추가하다가 오류 났습니다');
            console.log(err);
            console.log('Error while performing Query.');
          }
          else {
            conn.query(ranknick_query, [user_name], (err, rows, fields) => {
              if (err) {
                res.status(500).send('랭킹테이블에도 닉네임을 추가하다가 오류 났습니다.');
                console.log(err)
              }
              console.log('ranking 닉넴 succeedd')
              conn.query(skilcharnick_query, [user_name], (err, rows, field) => {
                if (err) {
                  res.status(500).send('스킬테이블에도 닉네임을 추가하다가 오류 났습니다.');
                  console.log(err)
                }
                console.log('succeed skillcharactory');
              })
            })
            let result_json = {};
            result_json["nickname_tf"] = false;
            res.json(result_json);
            console.log(result_json);
          }
        });
      }
      else {
        let result_json = {};
        result_json["nickname_tf"] = true;
        res.json(result_json);
        console.log(result_json);
      }
     } catch(err) {
    res.status(500).send('create_name 에서 닉넴 중복 체크 하다가 오류 났습니다.');
    console.log(err);
    console.log('Error while performing Query.');
  }
  }
});

app.post('/device', (req, res) => {
  const device_id = req.body.device;
  const check_device = 'SELECT device_id FROM user WHERE device_id = ?'
  conn.query(check_device, device_id, (err, rows, field) => {
    if (err) {
      res.status(500).send('디바이스 검사 하다가 서버 오류');
    }
    else {
      let checkdevice = new Object();
      checkdevice.tf = false;

      if (rows[0] == undefined) {
        res.send(checkdevice);
      }
      else {
        checkdevice.tf = true;
        res.send(checkdevice);
      }
    }
  })
})

app.get('/dataload', (req, res) => {
  const nickname = req.body.device;
  const device = '121e97a63411e2a7332decc5ecd5104287d116e6'
  console.log(req.body);
  const dataload = 'SELECT * FROM user left join skillcharactor ON user.nickname = skillcharactor.nickname WHERE user.device_id = ?'
  conn.query(dataload, device, (err, rows, field) => {
    console.log(rows);
    if (err) {
      res.status(500).send('저장된 save 데이터를 읽는 도중 오류가 났습니다');
    }
    else {
      const data = {
        "nickname": rows[0].nickname,
        "highscore": rows[0].highscore,
        "coin": rows[0].coin,
        "character_level": {
          "기사": rows[0].기사,
          "법사": rows[0].법사
        },
        "skill_level": {
          "돌진": rows[0].돌진,
          "연속찌르기": rows[0].연속찌르기,
          "검기날리기": rows[0].검기날리기,
          "회전공격": rows[0].회전공격,
          "내려찍기": rows[0].내려찍기,
          "밀쳐내기": rows[0].밀쳐내기,
          "z자베기": rows[0].z자베기,
          "흘리기": rows[0].흘리기,
          "회복": rows[0].회복
        }
      }
      console.log('이게 data 값이다 ', rows[0]);
      res.send(data);
    }
  })
})

app.get('/datasave', (req, res) => {
  console.log(req.body);
  // const user = {
  //   userData: '{"nickname":"seung","highscore":2000,"coin":1020,"character_level":{"기사":1,"법사":0},"skill_level":{"돌진":1,"연속찌르기":1,"검기날리기":0,"회전공격":0,"내려찍기":0,"밀쳐내기":0,"z자베기":0,"흘리기":0,"회복":1}}'
  // }

  const userdata = req.body.userData;
  const obj = JSON.parse(userdata);
  console.log(obj)

  const nickname = obj.nickname;
  const highscore = obj.highscore;
  const coin = obj.coin;
  const 기사 = obj.character_level.기사
  const 법사 = obj.character_level.법사
  const 돌진 = obj.skill_level.돌진
  const 연속찌르기 = obj.skill_level.연속찌르기
  const 회전공격 = obj.skill_level.회전공격
  const 검기날리기 = obj.skill_level.검기날리기
  const 삼단베기 = obj.skill_level.삼단베기
  const 내려찍기 = obj.skill_level.내려찍기
  const 밀쳐내기 = obj.skill_level.밀쳐내기
  const 흘리기 = obj.skill_level.흘리기
  const 회복 = obj.skill_level.회복

  const save_user = 'UPDATE user SET nickname = ?, coin = ?, highscore = ? WHERE nickname = ?'
  const save_skillcharactor = 'UPDATE skillcharactor SET 기사 = ?, 법사 = ?, 돌진 = ?, 연속찌르기 = ?,검기날리기 = ?, 회전공격 = ?, 내려찍기 = ?, 밀쳐내기 = ?, 흘리기 = ?, 회복 = ? WHERE nickname = ?'

  conn.query(save_user, [nickname, coin, highscore, nickname], (err, rows, field) => {
    if (err) {
      res.status(500).send('user 테이블에 데이터를 저장 하는 도중 오류가 났습니다');
    }
    else {
      conn.query(save_skillcharactor, [기사, 법사, 돌진, 연속찌르기, 검기날리기, 회전공격, 내려찍기, 밀쳐내기, 흘리기, 회복, nickname], (err, rows, field) => {
        if (err) {
          res.status(500).send('skillcharactor 테이블에 데이터를 저장 하는 도중 오류가 났습니다');
        }
        else {
          res.send('데이터가 잘 저장 되었습니다.');
        }
      })
    }
  })

})

app.listen(port, () => {
  console.log('Server listening : 80');
})
