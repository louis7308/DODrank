const express = require('express'); // 외장 모듈
const app = express(); 
const mysql = require('mysql2/promise');
const dotenv = require('dotenv').config() // .env 환경변수 설정이라고 서버내에 데이터를 저장시켜서 남이 못보게 하는 모듈
const dbconfig = require('./config/database');
const http = require('http'); // 내장 모듈
const hostname = '10.120.74.70'
const port = 4000;


app.use(express.json()); // 나는 데이터를 json 형식으로 받을거야
app.use(express.urlencoded({ extended: false }));
let pool = mysql.createPool(dbconfig); // DB 연결 세팅 

app.get("/show_rank", (req, res) => { // GET(데이터 보내지 않고 얻어 오기만 하는 거고) , POST (데이터를 보내서 생성하면서 얻어 올수있다)
    // SQL 문
    const query = 'SELECT u.device_id, u.nickname, r.nickname, r.score FROM user AS u LEFT JOIN `rank` AS r ON u.nickname = r.nickname WHERE score > 0 ORDER BY score DESC';
    // 유저테이블과 랭킹테이블을 JOIN 해서 내림차순으로 정렬 해가지고 데이터를 긁어오는 SQL 문 
    // 비동기 식 pool 작성 코드
    const rank = async () => { // 비동기  // 서버가 오류 가 나면 터져 
      try {
        let connection2 = await pool.getConnection(async conn1 => conn1) // async 는 await과 짝꿍이다 (async는 선언 이라 봐도 되고 await은 비동기 처리할 구문의 작성하는 거다)
        let [row] = await connection2.query(query); // 
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
      }
    }
  
    rank();
  });

  app.post("/create_name", (req, res) => {
      const nickname = req.body.nickname;
      const device = req.body.device;
      console.log(req.body);
      // SQL 문
        const nickCheckQuery = 'SELECT * FROM user WHERE nickname=?';
        const insertQuery = 'INSERT INTO user (device_id, nickname) values(?,?)';
        const ranknick_query = 'INSERT INTO `rank` (nickname) values(?)';
        const skilcharnick_query = 'INSERT INTO skillcharactor (nickname) values(?)'

        const create = async () => {
            try { 
                let connection = await pool.getConnection(async conn1 => conn1)
                let [row] = await connection.query(nickCheckQuery, nickname);
                console.log(row);
                if(Array.isArray(row) && row.length === 0) {
                        let [row1] = await connection.query(insertQuery, [device, nickname])
                            let [row2] = await connection.query(ranknick_query, nickname)
                            console.log('ranking 테이블에 닉넴이 잘 추가 되었다');
                                let [row3] = await connection.query(skilcharnick_query, nickname)
                                console.log('스킬 테이블 추가 완료');
                                let result_json = new Object();
                                result_json["nickname_tf"] = false;
                                console.log(result_json);
                                res.send(result_json);
                                connection.release()
                }
                else {
                  let result_json = new Object();
                  result_json["nickname_tf"] = true;
                  res.json(result_json);
                  console.log(result_json);
                }
            } catch(err) {
                res.status(500).send('create_name 에서 닉넴 중복 체크 하다가 오류 났습니다.');
                console.log(err);
            }
        }
        create();
  })

  app.post('/device', (req, res) => {
    const device_id = req.body.device;
    const check_device = 'SELECT device_id FROM user WHERE device_id = ?'
    console.log(req.body);
    const device = async () => {
      try {
        let connection = await pool.getConnection(async conn => conn);
        let [row] = await connection.query(check_device, device_id)
        console.log(row)
        let checkdevice = new Object();
        checkdevice.tf = false;
        connection.release()
        if(Array.isArray(row) && row.length === 0) {
          console.log('DB에 존재 하지 않는 디바이스 아이디 입니다.')
          res.send(checkdevice);
        } else {
          checkdevice.tf = true;
          console.log('이미 DB에 존재하는 디바이스 아이디 입니다.')
          res.send(checkdevice);
        }
        

      } catch(err) {
        res.status(500).send('디바이스 검사 하다가 서버 오류');
      }
    }
    device()

  })

  app.post('/dataload', (req, res) => {
    const device = req.body.device
    const dataload_query = 'SELECT * FROM user left join skillcharactor ON user.nickname = skillcharactor.nickname WHERE user.device_id = ?'
    console.log(req.body.device);
    
    const dataload = async () => {
      try {
        let connection = await pool.getConnection(async conn => conn)
        let [row] = await connection.query(dataload_query, device)
        console.log('dataload 값',row)
        connection.release()
        const data = {
          "nickname": row[0].nickname,
          "coin": row[0].coin,
          "highscore": row[0].highscore,
          "character_level": {
            "30001": row[0].기사,
            "30002": row[0].법사
          },
          "skill_level": {
            "10001": row[0].연속찌르기,
            "10002": row[0].돌진,
            "10003": row[0].회전공격,
            "10004": row[0].내려찍기,
            "10005": row[0].검기날리기,
            "10006": row[0].연속베기,
            "10007": row[0].밀쳐내기,
            "10008": row[0].흘리기,
            "10009": row[0].회복
          }
        }
        console.log('dataload 유저 데이터 값 : ', data);
        res.send(data);

      } catch(err) {
        res.status(500).send('저장된 save 데이터를 읽는 도중 오류가 났습니다');
      }
    }
    dataload();
  })

  app.post('/datasave', (req, res) => {
    const userdata = req.body.userData;
    const obj = JSON.parse(userdata);
    console.log('datasave에 body 데이터 부분',req.body);
    console.log('userData 배열값들을 obj 로 파싱 한 부분 : ',obj)

    const nickname = obj.nickname;
    const coin = obj.coin;
    const highscore = obj.highscore;
    const 기사 = obj.character_level[30001]
    const 법사 = obj.character_level[30002]
    const 연속찌르기 = obj.skill_level[10001]
    const 돌진 = obj.skill_level[10002]
    const 회전공격 = obj.skill_level[10003]
    const 내려찍기 = obj.skill_level[10004]
    const 검기날리기 = obj.skill_level[10005]
    const 연속베기 = obj.skill_level[10006]
    const 밀쳐내기 = obj.skill_level[10007]
    const 흘리기 = obj.skill_level[10008]
    const 회복 = obj.skill_level[10009]
    const save_user = 'UPDATE user SET nickname = ?, coin = ?, highscore = ? WHERE nickname = ?'
    const save_skillcharactor = 'UPDATE skillcharactor SET 기사 = ?, 법사 = ?, 연속찌르기 = ?, 돌진 = ?, 회전공격 = ?, 내려찍기 = ?, 검기날리기 = ?, 연속베기 = ?, 밀쳐내기 = ?, 흘리기 = ?, 회복 = ? WHERE nickname = ?'
    
    const datasave = async () => {
      try {
        let connection = await pool.getConnection(async conn => conn)
        let [row] = connection.query(save_user, [nickname, coin, highscore, nickname])
        let [row1] = connection.query(save_skillcharactor, [기사, 법사, 연속찌르기, 돌진, 회전공격, 내려찍기, 검기날리기, 연속베기, 밀쳐내기, 흘리기, 회복, nickname])
        connection.release()
        res.send('데이터가 잘 저장 되었습니다.');
      } catch(err) {
        res.status(500).send('데이터를 저장하다가 오류가 났습니다.');
      }

    }

    datasave();
  })
app.listen(port, hostname, () => {
    console.log('서버가 4000번 포트에서 대기중입니다.');
})