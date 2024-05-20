const AWS = require("aws-sdk");
const secretName = process.env.secretName;

var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

class Response {
  constructor() {
    this.status = "";
    this.message = "";
  }

  addStatus(status) {
    this.status = status;
    return this;
  }
  addMessage(message) {
    this.message = message;
    return this;
  }
  getJsonObject() {
    return { statusCode: this.status, message: this.message };
  }
}

function validateChatInfo(chatInfo) {
  // console.log(JSON.stringify(chatInfo));
  if (!chatInfo.UserId) {
    return new Response().addStatus(400).addMessage("No userId found");
  }
  if (!chatInfo.lastSaved) {
    return new Response().addStatus(400).addMessage("No time last saved found");
  }
  if (!chatInfo.conversation) {
    return new Response().addStatus(400).addMessage("No conversation found");
  }
  if (chatInfo.chatRating && isNaN(chatInfo.chatRating)) {
    return new Response().addStatus(400).addMessage("Invalid chat rating type");
  }
  let messages = chatInfo.conversation;
  // console.log("Messages before: ", messages);
  messages = messages.filter(
    (message) => message.message.role != null && message.message.content != null
  );
  // console.log("Messages after: ", messages);
  chatInfo.conversation = messages;
  return chatInfo;
}

exports.handler = async (request) => {
  //   console.log(chatInfo);
  //   console.log(typeof chatInfo);
  //   chatInfo = JSON.parse(chatInfo);
  let chatInfo = JSON.parse(request.body);
  // console.log(chatInfo);
  let validation = validateChatInfo(chatInfo);
  if (validation.status == 400) {
    // console.log("bad");
    // console.log(chatInfo);
    // console.log(validation);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(validation),
    };
  }
  chatInfo = validation;

  var params = {
    TableName: "Chat_Information",
    Key: {
      UserId: { S: chatInfo.UserId },
    },
    UpdateExpression:
      "set lastSaved = :lastSaved, conversation = :conversation, EVERYTHING = :EVERYTHING",
    ExpressionAttributeValues: {
      ":lastSaved": { S: chatInfo.lastSaved },
      ":conversation": {
        L: chatInfo.conversation.map((msg) => ({
          M: {
            message: {
              M: {
                role: { S: msg.message.role },
                content: { S: msg.message.content },
              },
            },
            time: { S: msg.time },
          },
        })),
      },
      ":EVERYTHING": { S: "EVERYTHING" },
    },
    ReturnValues: "UPDATED_NEW",
  };
  // console.log(JSON.stringify(chatInfo.conversation));

  if (chatInfo.chatRating != null) {
    params.UpdateExpression += ", chatRating = :chatRating";
    params.ExpressionAttributeValues[":chatRating"] = {
      N: chatInfo.chatRating.toString(),
    };
  }

  if (chatInfo.dislikeFeedback) {
    params.UpdateExpression += ", dislikeFeedback = :dislikeFeedback";
    params.ExpressionAttributeValues[":dislikeFeedback"] = {
      S: chatInfo.dislikeFeedback,
    };
  }
  try {
    // console.log("Putting item:", params);
    const data = await ddb.updateItem(params).promise();
    // throw new Error("test");
    // console.log("Success", data);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(
        new Response()
          .addStatus(200)
          .addMessage("Successfully inserted record in database")
          .getJsonObject()
      ),
    };
  } catch (err) {
    // console.log("Error", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(
        new Response()
          .addStatus(500)
          .addMessage("Problem inserting record in database")
          .getJsonObject()
      ),
    };
  }
};

exports.getSecretFromSecretsManager = async () => {
  const secretsmanager = new AWS.SecretsManager();
  const params = {
    SecretId: secretName,
  };
  const data = await secretsmanager.getSecretValue(params).promise();
  return data.SecretString;
};
