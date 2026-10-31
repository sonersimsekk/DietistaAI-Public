module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: process.env.VUE_APP_API_PROXY || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
};
