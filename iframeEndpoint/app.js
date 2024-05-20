const AWS = require("aws-sdk");
const s3 = new AWS.S3();

// Helper function to fetch file content from S3
const fetchFileFromS3 = async (bucketName, keyName) => {
  const params = { Bucket: bucketName, Key: keyName };
  const data = await s3.getObject(params).promise();
  return data.Body.toString("utf-8");
};

exports.handler = async (event) => {
  const bucketName = "chatbotiframe"; // Replace with your S3 bucket name
  try {
    // Fetch the HTML, CSS, and JavaScript contents from S3
    const htmlContent = await fetchFileFromS3(bucketName, "chatbot.html");
    const cssContent = await fetchFileFromS3(bucketName, "public/style.css");
    const jsContent = await fetchFileFromS3(bucketName, "public/script.js");

    // Inline the CSS and JavaScript in the HTML content
    const finalHtmlContent = htmlContent
      .replace("</head>", `<style>${cssContent}</style></head>`) // Inline CSS within <style> tags
      .replace("</body>", `<script>${jsContent}</script></body>`); // Inline JavaScript before </body>

    // Return the modified HTML as the response
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: finalHtmlContent,
    };
  } catch (error) {
    // console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify(
        "Internal Server Error: Unable to retrieve files from S3"
      ),
    };
  }
};

// // Wrap the call to your handler in an async function
// async function runHandler() {
//     const response = await exports.handler({});
//     console.log(response);
// }

// runHandler();
