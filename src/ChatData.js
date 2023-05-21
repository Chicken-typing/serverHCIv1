// import Chat from "./models/chatModel.js";
// export const getChatData = async (roomId) => {
//   console.log(roomId)
//   const data =  Chat.findOne({ roomId: roomId });
//   if (data) {
//     return data.messages;
//   } else {
//       const data=  new Chat({
//       roomId: roomId,
//       messages: [],
//       })
//     await data.save()
//       return data.messages
//   }
//   // return[]
// };
// export const postChatData =  (roomId,message) => {
//     const data = Chat.findOne({ roomId: roomId });
//     // data.messages.push(message);
//   // console.log(roomId,message);
//     return [message]
// }
 