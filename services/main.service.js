module.exports = {
  name: 'main',
  actions: {},
  async created() {
    try {
      console.log('completed');
    } catch (err) {
      console.log(err);
    }
  },
};
