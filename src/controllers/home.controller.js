// const { response } = require("express")

const home = (req, res) => {
  console.log("req for home", req.body);
  //   res.status(200).send("NOT FOUND");
  res
    .status(200)
    .send(
      `<img src = "https://cdn.pixabay.com/photo/2017/10/26/17/51/under-construction-2891888_1280.jpg" height=120% width=100%>`
    );
};
module.exports = {
  home,
};
