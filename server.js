const express = require('express');
const http = require('http');
const session = require('express-session');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 환경변수에서 사용자 이름과 비밀번호 읽기
const adminUser = process.env.USERNAME;
const adminPassword = process.env.PASSWORD;

// 세션 시크릿
const sessionSecret = process.env.SESSION_SECRET;

// 세션 설정
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}));

// 로그 파일 경로
const logFilePath = './logs/application.log';

app.use(express.urlencoded({ extended: true })); // 폼 데이터를 해석하기 위해

// HTML 파일 제공
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(__dirname + '/index.html');
  } else {
    res.redirect('/login');
  }
});

// 로그인 페이지
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// 로그인 처리
app.post('/do-login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser && password === adminPassword) {
    req.session.loggedIn = true;
    res.redirect('/');
  } else {
    res.send('Invalid credentials');
  }
});

// 로그아웃 처리
app.get('/logout', (req, res) => {
  req.session.loggedIn = false;
  res.redirect('/login');
});

// WebSocket 연결 설정
io.on('connection', (socket) => {

  // 로그 파일 변경 감지
  fs.watch(logFilePath, (eventType, filename) => {
    if (eventType === 'change') {
      fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        socket.emit('logUpdated', data);
      });
    }
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

