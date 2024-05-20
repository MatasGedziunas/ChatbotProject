const AWS = require("aws-sdk");

var ddb = new AWS.DynamoDB.DocumentClient();

class Response {
  constructor() {
    this.status = "";
    this.message = "";
    this.data;
  }

  addStatus(status) {
    this.status = status;
    return this;
  }
  addMessage(message) {
    this.message = message;
    return this;
  }
  addData(data) {
    this.data = data;
    return this;
  }
  getJsonObject() {
    return { statusCode: this.status, message: this.message };
  }
}

exports.handler = async (event) => {
  // console.log("hello");
  // console.log("Request: ", event);

  // Parsing query string parameters from the event
  const queryParams = event.queryStringParameters || {};
  const dateFrom = new Date(queryParams.dateFrom || new Date());
  let chatRating = queryParams.chatRating;
  if (chatRating == "Any") {
    chatRating = null;
  } else if (chatRating == "Liked") {
    chatRating = 1;
  } else if (chatRating == "Disliked") {
    chatRating = -1;
  } else if (chatRating == "Unrated") {
    chatRating = 0;
  } else {
    chatRating = null;
  }
  const limit = parseInt(queryParams.limit, 10) || 10; // Default limit to 10 if not specified

  let params;
  if (chatRating != null) {
    params = {
      TableName: "Chat_Information",
      IndexName: "EVERYTHING-lastSaved-index",
      KeyConditionExpression:
        "#EVERYTHING = :EVERYTHING and #lastSaved >= :dateFrom",
      FilterExpression: "#chatRating = :chatRating",
      ExpressionAttributeNames: {
        "#lastSaved": "lastSaved",
        "#chatRating": "chatRating",
        "#EVERYTHING": "EVERYTHING",
      },
      ExpressionAttributeValues: {
        ":EVERYTHING": "EVERYTHING",
        ":dateFrom": dateFrom.toISOString(),
        ":chatRating": Number(chatRating),
      },
      Limit: limit,
    };
  } else {
    params = {
      TableName: "Chat_Information",
      IndexName: "EVERYTHING-lastSaved-index",
      KeyConditionExpression:
        "#EVERYTHING = :EVERYTHING and #lastSaved >= :dateFrom",
      ExpressionAttributeNames: {
        "#EVERYTHING": "EVERYTHING",
        "#lastSaved": "lastSaved",
      },
      ExpressionAttributeValues: {
        ":EVERYTHING": "EVERYTHING",
        ":dateFrom": dateFrom.toISOString(),
      },
      Limit: limit,
    };
  }
  message =
    "Search parameters: From date: " +
    dateFrom.toDateString() +
    "; With " +
    queryParams.chatRating +
    " chat rating";
  try {
    // console.log("Query Parameters: ", params);
    const result = await ddb.query(params).promise();
    // console.log(typeof result.Items);
    message +=
      " . Retrieved conversation count: " + Object.keys(result.Items).length;
    // console.log("Query successful: ", result.Items);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: message,
        data: result.Items,
        status: 200,
      }),
    };
  } catch (error) {
    console.error("Failed retrieving data: ", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Failed to retrieve conversations. " + message,
        error: error,
        status: 500,
      }),
    };
  }
};
