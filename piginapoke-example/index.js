var app = new Vue({
  el: "#app",
  mounted() {
    console.log(this.message)
  },
  data: {
    message: 'Hello Vue!'
  }
})
