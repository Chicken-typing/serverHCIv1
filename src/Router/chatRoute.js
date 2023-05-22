import express from "express";
import Chat from "../models/chatModel.js";
import isAuthenticated from "../utils/isAuthenticated.js";
const chatRoute = express.Router();
chatRoute.get("/:roomId", isAuthenticated, (req, res) => {
  Chat.findOne({ roomId: req.params.roomId }, (err, room) => {
    if (room) {
      res.send(room).status(200);
    } else {
      res.send({messages:[]}).status(200);
    }
  });
});
export default chatRoute;
