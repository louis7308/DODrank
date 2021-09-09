//const e = require('express');
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv').config()
const dbconfig = require('./config/database');
const app = express();
const http = require('http');
//const { serialize } = require('v8');
const hostname = '10.120.74.70';
const port = 80;

const conn = mysql.createConnection(dbconfig);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

conn.connect((err) => {
  if (!err) {
    console.log("Database is connected ... \n\n");
  } else {
    console.log("Error connecting database ... \n\n");
  }
});

app.post('/game_end', (req, res) => {
  const user_id = req.body.id;
  const user_score = req.body.score
  console.log(user_id);
  console.log(user_score);
  const callGameEnd = 'CALL gameEnd(?, ?)';
  conn.query(callGameEnd, [user_id, user_score], (err, rows, field) => {
    if (err) {
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
  const query = 'SELECT u.device_id, u.nickname, r.nickname, r.score FROM user AS u LEFT JOIN `rank` AS r ON u.nickname = r.nickname WHERE score > 0 ORDER BY score DESC LIMIT 10';
  conn.query(query, (err, rows, fields) => {
    if (err) {
      res.status(500).send('Internal Server Error');
      console.log(err);
      console.log('Error while performing Query.');
    }
    else {
      console.log('1', rows);
      var rank_arr = [];
      for (var temp = 0; temp < rows.length; temp++)
        rank_arr.push(rows[temp]);

      var result_json = {};
      result_json["data"] = rows;
      console.log(result_json);
      res.json(result_json["data"][0]);
    }
  });
});

// app.post('/create_name', (req, res) => {
//   const nickname = req.body.nickname;
//   const device = req.body.device;
//   const check_query = 'SELECT * FROM user WHERE nickname = ?'
//   const insert_query = 'INSERT INTO user (device, nickname) VALUES(?, ?)'
//   conn.query(check_query, nickname, (err, rows, field) => {
//     console.log('create rows : ', rows);
//     if (err) {
//       res.status(500).send('Internal Server Error');
//       console.log(err);
//       console.log('Error while performing Query.');
//     }
//     else {
//       let checkid = new Object();
//       checkid.tf = false;

//       if (rows.length == 0) {
//         checkid.tf = false;
//         console.log('checkid: ', chekcid);
//         res.json(checkid);
//       } else {
//         conn.query()
//         checkid.tf = true; // 중복됨 사용x
//         res.json(checkid);
//       }
//     }
//   })
// })
// insert into login_table lt
// INNER JOIN user_info ui ON ui.some_id = lt.id
// (ui.name, ui.address, lt.username, lt.password) 
// values
// ('John', 'wall street', 'john123', 'passw123')

// INSERT INTO user lt INNER JOIN nickname ui ON ui.nickname


app.post("/create_name", (req, res) => {
  const user_name = req.body.nickname;
  const user_device = req.body.device;
  console.log('user_name: ', user_name);
  const nickCheckQuery = 'SELECT * FROM user WHERE nickname=?';
  const insertQuery = 'INSERT INTO user (device_id, nickname) values(?,?)';
  const ranknick_query = 'INSERT INTO `rank` (nickname) values(?)';
  const skilcharnick_query = 'INSERT INTO skillcharactor (nickname) values(?)'
  
  conn.query(nickCheckQuery, [user_name], (err, rows, fields) => {
    if (err) {
      res.status(500).send('Internal Server Error');
      console.log(err);
      console.log('Error while performing Query.');
    }
    else {
      if (rows.length == 0) {
        conn.query(insertQuery, [user_device, user_name], (err, rows, fields) => {
          if (err) {
            res.status(500).send('Internal Server Error');
            console.log(err);
            console.log('Error while performing Query.');
          }
          else {
            conn.query(ranknick_query, [user_name], (err, rows, fields) => {
              console.log('test_ succeedd')
              conn.query(skilcharnick_query, [user_name], (err, rows, field) => {
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
    }
  });
});

app.post('/device', (req, res) => {
  const device_id = req.body.device;
  const check_device = 'SELECT device_id FROM user WHERE device_id = ?'
  conn.query(check_device, device_id, (err, rows, field) => {
    if (err) {
      res.status(500).send('서버 오류');
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

app.post('/dataload', (req, res) => {
  const nickname = req.body.nickname;
  console.log(req.body);
  const dataload = 'SELECT * FROM skillcharactor WHERE nickname = ?'
  conn.query(dataload, nickname, (err, rows, field) => {
    console.log(rows);
    if (err) {
      res.status(500).send('서버 오류 인뎁쇼??');
    }
    else {
      const data = {
        "nickname": rows[0].nickname,
        "maxscore": rows[0].maxscore,
        "coin": rows[0].coin,
        "character_level": {
          "기사" : rows[0].기사
        },
        "skill_level": {
          "돌진" : rows[0].돌진,
          "연속찌르기": rows[0].연속찌르기,
          "회전공격": rows[0].회전공격,
          "검이커져!": rows[0].검이커져,
          "검기날리기": rows[0].검기날리기
        }
      }
      console.log('이게 data 값이다 ', rows[0]);
      res.send(data);
    }
  })
})

app.post('/datasave', (req, res) => {
  console.log(req.body);
  const user = {
    userData: '{"nickName":"seung","maxscore":0,"coin":100,"skill_level":{"돌진":1,"연속찌르기":1,"회전공격":1,"검이커져":1,"검기날리기":1}}'
  }
  const testuser = req.body.userData;
  // console.log(testuser);

  const obj = JSON.parse(testuser);
  console.log(obj)
  // const userdata = {
  //   ""
  // }

  const nickname = obj.nickname;
  const highscore = obj.highscore;
  const coin = obj.coin;
  console.log(coin);
  const 기사 = obj.character_level.기사
  const 법사 = obj.character_level.법사
  const 돌진 = obj.character_level.돌진
  const 연속찌르기 = obj.skill_level.연속찌르기
  const 회전공격 = obj.skill_level.회전공격
  const 검이커져 = obj.skill_level.검이커져
  const 검기날리기 = obj.skill_level.검기날리기
  const 삼단베기 = obj.skill_level.삼단베기
  // console.log(obj);
  // console.log(obj.nickName)

  const save_user = 'UPDATE user SET nickname = ?, coin = ?, highscore = ? WHERE nickname = ?'
  const save_skillcharactor = 'UPDATE skillcharactor SET 기사 = ?, 법사 = ?, 돌진 = ?, 연속찌르기 = ?, 회전공격 = ?, 검이커져 = ?, 검기날리기 = ?, 삼단베기 = ? WHERE nickname = ?'

  conn.query(save_user, [nickname, coin, highscore, nickname], (err, rows, field) => {
    if(err) {
      res.status(500).send('서버오류 인뎁쇼잉');
    }
    else {
      conn.query(save_skillcharactor, [기사, 법사, 돌진, 연속찌르기, 회전공격, 검이커져, 검기날리기, 삼단베기], (err, rows, field) => {
        if(err) {
          res.status(500).send('두번째 구문 오류 안뎁쇼잉');
        }
        else {
          res.send('데이터가 잘 저장 되었습니다.');
        }
      })
    }
  })
  
  // const testuser = user.substring(0,4);
  // console.log(testuser);
  // const test = req.body;
  // const nickname = test.nickname
  // const highscore = req.body.userData.highscore
  // const coin = req.body.userData.coin
  // const stonefront = req.body.userData.Skill_Level.돌진
  // const faststing = req.body.userData.Skill_Level.연속찌르기
  // const spinattack = req.body.userData.Skill_Level.회전공격
  // const bigsword = req.body.userData.Skill_Level.검이커져
  // const throwsword = req.body.userData.Skill_Level.검기날리기
  // console.log(test);
  // console.log(user);
  // console.log(user.nickname);
  // console.log(nickname);
  // console.log(highscore);
  // console.log(coin);
  // console.log(bigsword);
  // console.log(throwsword);
  // console.log(faststing);

})

app.listen(port, hostname, () => {
  console.log('Server listening : 80');
})
