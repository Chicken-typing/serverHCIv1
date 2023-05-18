import mongoose from "mongoose";
const msgModel = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  message: { type: String },
},
{
  timestamps: true,
}
)
const chatModel = new mongoose.Schema({
  roomId: { type: String },
  messages: [msgModel],
});
const Chat = mongoose.model("Chat", chatModel)
export default Chat