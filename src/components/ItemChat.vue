<template>
  <div class="itemChat">
    <div class="itemChat__box" ref="chatBox">
      <div
        v-for="(item, k) in list"
        :key="k"
        :class="{'itemChat__list--self': item.chatId === chatId}"
        class="itemChat__list"
      >
        <span class="name">
          {{ item.timeStamp | dateTime }}
          {{ item.chatId }}
        </span>
        <span v-if="item.status === 'join'">加入聊天室!</span>
        <span v-else-if="item.status === 'leave'">離開聊天室!</span>
        <span v-else>{{ item.message }}</span>
      </div>
    </div>

    <div class="itemChat__message">
      <input
        v-model="message"
        type="text"
        placeholder="輸入訊息"
        @keydown.enter="actMessage(message)"
      >
    </div>
    <div>
      在線人數: {{ onlinePeople }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemChat',

  data() {
    return {
      webSocket: null,
      chatId: '',
      message: '',
      list: [],
      onlinePeople: 0,
    }
  },

  filters: {
    dateTime(timeStamp) {
      const date = new Date(timeStamp)
      const month = date.getMonth() + 1
      const day = date.getDay()
      const hour = date.getHours()
      const minute = date.getMinutes()
      return `${month}/${day} ${hour}:${minute}`
    },
  },

  watch: {
    list: {
      handler() {
        this.setChatScrollBar()
      },
      deep: true,
    },

  },

  async created() {
    await this.initSocket()
    await this.getSessionStorage()
    window.addEventListener('beforeunload', () => {
      this.actMessage('leave', 'leave') // 使用者離開聊天室
      this.closeSocket()
    })
  },

  destroyed() {
    this.actMessage('leave', 'leave') // 使用者離開聊天室
    this.closeSocket()
  },

  methods: {
    // 取得使用者ID
    getSessionStorage() {
      this.chatId = sessionStorage.getItem('chatId')
    },

    // 發送訊息給伺服器
    actMessage(message, status) {
      if (!message) return
      const data = {
        chatId: this.chatId,
        message: message,
        timeStamp: +new Date(),
        status,
      }
      this.socketSend(data)
      this.message = ''
    },

    // 設定聊天室窗的滾輪 (保持在最底部)
    setChatScrollBar() {
      const element = this.$refs.chatBox
      this.$nextTick(() => {
        const scrollHeight = element.scrollHeight
        element.scrollTop = scrollHeight
      })
    },

    initSocket() {
      // 使用 WebSocket 的網址向 Server 開啟連結
      const url = 'ws://localhost:3000'
      this.webSocket = new WebSocket(url)

      // 開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
      this.webSocket.onopen = this.openSocket

      // 關閉後執行的動作，指定一個 function 會在連結中斷後執行
      this.webSocket.onclose = this.closeSocket

      // 接收 Server 發送的訊息
      this.webSocket.onmessage = this.socketOnMessage

      // 連接失敗，指定一個 function 會在連結失敗後執行
      this.webSocket.onerror = this.socketOnError
    },

    openSocket() {
      console.log('open connection')
      this.actMessage('join', 'join') // 使用者進入聊天室
    },

    closeSocket() {
      console.log('close connection')
      this.webSocket.close()
    },

    socketOnMessage(event) {
      function setMessageList(originList, newMessage) {
        return [...originList, newMessage]
      }
      function getOnlinePeople(data) {
        return data.onlinePeople
      }
      console.log('event', event)
      const eventData = JSON.parse(event.data)
      const hasStatus = eventData.status && eventData.onlinePeople === this.onlinePeople
      if (hasStatus) return
      this.list = setMessageList(this.list, eventData)
      this.onlinePeople = getOnlinePeople(eventData)
    },

    socketOnError() {
      this.initSocket()
    },

    socketSend(data) {
      // client 端發送數據
      this.webSocket.send(JSON.stringify(data))
    },
  },
}
</script>

<style lang="scss" scoped>
  @mixin message {
    width: 60%;
    color: #333;
    word-break: break-word;
    box-sizing: border-box;
    padding: 10px;
    margin: 10px 0;
  }

  .itemChat {
    width: 400px;
    border: 1px solid #ccc;
    padding: 5px;

    &__box {
      height: 200px;
      // display: flex;
      // flex-direction: column;
      // justify-content: flex-end;
      overflow-y: auto;
    }

    &__list {
      @include message;
      background-color: #fffdd7;

      &--self {
        @include message;
        background-color: #ffd86e;
        margin-left: 40%;
      }
    }

    &__message {
      input {
        width: 97%;
        height: 30px;
      }
    }
  }
</style>
