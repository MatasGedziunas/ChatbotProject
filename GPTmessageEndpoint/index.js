const OpenAI = require("openai");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const secretName = process.env.SECRET_NAME;
let connectionId;
AWS.config.update({ region: "us-east-1" });

const tools = [
  {
    type: "function",
    function: {
      name: "showTrackingOrderElement",
      description:
        "Show a dialog in which the user can input their tracking number or order number along with their email or phone to get the status of their order. This should be called when a user inquires about their order status",
      parameters: {},
    },
  },
];

const fetchFileFromS3 = async (bucketName, keyName) => {
  const params = { Bucket: bucketName, Key: keyName };
  const data = await s3.getObject(params).promise();
  return data.Body.toString("utf-8");
};

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
    return { status: this.status, message: this.message };
  }
}

exports.handler = async function useAssistant(event) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint:
      "https://pc6ix29j69.execute-api.us-east-1.amazonaws.com/production/",
  });
  const secret = JSON.parse(await exports.getSecretFromSecretsManager());
  const openai = new OpenAI({ apiKey: Object.values(secret)[0] });
  if (event.requestContext) {
    connectionId = event.requestContext.connectionId;
  } else {
    return new Response()
      .addStatus(400)
      .addMessage("No connection ID found in request");
  }
  try {
    const systemMessage = { role: "system", content: "" };
    systemMessage.content = await fetchFileFromS3(
      "chatbotiframe",
      "public/instructions.txt"
    );
    let messages = JSON.parse(event.body);
    if (!messages) {
      return new Response()
        .addStatus(400)
        .addMessage("No messages found in request");
    }
    messages = validateMessages(messages);
    messages.unshift(systemMessage);
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
      stream: true,
      temperature: 0.3,
      tools: tools,
      tool_choice: "auto",
    });
    // Stream responses as they arrive
    for await (const part of completion) {
      if (part.choices && part.choices[0] && part.choices[0].delta.tool_calls) {
        await exports.send(
          apigwManagementApi,
          JSON.stringify(
            new Response().addMessage("DIALOG").addStatus(200).getJsonObject()
          )
        );
        return;
      } else if (part.choices && part.choices[0] && part.choices[0].delta) {
        let text = part.choices[0].delta.content || "";
        await exports.send(
          apigwManagementApi,
          JSON.stringify(
            new Response().addMessage(text).addStatus(206).getJsonObject()
          )
        );
      }
    }
    await exports.send(
      apigwManagementApi,
      JSON.stringify(
        new Response()
          .addMessage("End of response")
          .addStatus(200)
          .getJsonObject()
      )
    );
    return JSON.stringify(
      new Response()
        .addMessage("End of response")
        .addStatus(200)
        .getJsonObject()
    );
  } catch (error) {
    await exports.send(
      apigwManagementApi,
      JSON.stringify(
        new Response()
          .addMessage(
            "Oops! Something went wrong on our servers. For the best support, please contact us at support@simple-painting.com. Thank you for understanding."
          )
          .addStatus(400)
          .getJsonObject()
      )
    );
    return JSON.stringify(
      new Response()
        .addMessage(
          "Oops! Something went wrong on our servers. For the best support, please contact us at support@simple-painting.com. Thank you for understanding."
        )
        .addStatus(400)
        .getJsonObject()
    );
  }
};

exports.send = async (apiContext, response) => {
  try {
    if (connectionId) {
      await apiContext
        .postToConnection({ ConnectionId: connectionId, Data: response })
        .promise();
    } else {
    }
  } catch (error) {
    throw error;
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

function validateMessages(messages) {
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role == null || message.content == null) {
      messages.splice(i, 1);
    }
  }
  return messages;
}
