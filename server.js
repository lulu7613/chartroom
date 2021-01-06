// import express 和 ws 套件
const express = require('express')
const SocketServer = require('ws').Server

// 指定開啟的 port
const PORT = 3000

// 創建 express 的物件，並綁定及監聽 3000 port ，且設定開啟後在 console 中提示
const server = express()
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

// 將 express 交給 SocketServer 開啟 WebSocket 的服務
const wss = new SocketServer({ server })

// 加入計算在線人數
let onlinePeople = 0

// 取得當前 client data
let clientData = ''

// 當 WebSocket 從外部連結時執行
wss.on('connection', ws => {
  // 當連線發生時增加人數
  onlinePeople = countOnlinePeople(onlinePeople, 1)

  // 連結時執行此 console 提示
  console.log('Client connected')

  // 對 message 設定監聽，接收從 Client 發送的訊息
  ws.on('message', data => {
    // 加入在線人數
    const newData = transformData(data, onlinePeople)
    clientData = newData

    // wss.clients = 所有連接中的 client
    sedAllClients(wss.clients, newData)
  })

  // 當 WebSocket 的連線關閉時執行
  ws.on('close', () => {
    console.log('斷開連結ˋˊ')
    // 當有人離線
    onlinePeople = onlinePeople > 0 ? countOnlinePeople(onlinePeople, -1) : 0
    const newData = transformData(clientData, onlinePeople)
    clientData = newData
    sedAllClients(wss.clients, newData)
  })
})

// 引入在線人數，並傳送到客戶端
function transformData(clientsData, onlinePeople) {
  const data = JSON.parse(clientsData)
  data.onlinePeople = onlinePeople
  return JSON.stringify(data)
}

// 傳送給所有 clients
function sedAllClients(clients, data) {
  return clients.forEach(client => {
    client.send(data)
  })
}

// 計算在線人數
function countOnlinePeople(onlinePeople, count) {
  return onlinePeople + count 
}