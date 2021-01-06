<template>
  <div>
    <label for="name">暱稱</label>
    <input id="name" type="text" v-model.trim="name">
    <button @click="enterChatPage(name)">進入聊天室</button>
  </div>
</template>

<script>
export default {
  name: 'SignUp',

  data() {
    return {
      name: '',
    }
  },

  methods: {
    enterChatPage(name) {
      if (!name) return
      this.setSession(name)
      this.$router.push('/chat')
    },

    setSession(name) {
      sessionStorage.setItem('chatId', name)
    },
  },
}
</script>