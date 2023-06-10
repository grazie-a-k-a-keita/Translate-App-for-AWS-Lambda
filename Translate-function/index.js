var AWS = require("aws-sdk");
var translate = new AWS.Translate();
var dynamodb = new AWS.DynamoDB();

exports.handler = async (event) => {
  const inputText = event.queryStringParameters.input_text;
  const outputText = await translateText(inputText);

  await putItem(inputText, outputText);

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify({
      inputText: inputText,
      outputText: outputText,
    }),
    isBase64Encoded: false,
  };
  return response;
};

// 翻訳する関数
function translateText(inputText) {
  return new Promise((resolve, reject) => {
    var params = {
      SourceLanguageCode: "ja",
      TargetLanguageCode: "en",
      Text: inputText,
    };

    translate.translateText(params, function (err, data) {
      if (err) {
        console.log(err);
        reject();
      } else {
        console.log(JSON.stringify(data));
        resolve(data.TranslatedText);
      }
    });
  });
}

// DynamoDBに更新する関数
function putItem(inputText, outputText) {
  var timestamp = new Date().getTime();
  var params = {
    Item: {
      timestamp: {
        S: String(timestamp),
      },
      input_text: {
        S: inputText,
      },
      output_text: {
        S: outputText,
      },
    },
    ReturnConsumedCapacity: "TOTAL",
    // テーブル名
    TableName: "xxxxx",
  };

  dynamodb.putItem(params, function (err, data) {
    if (err) console.log(err);
    else console.log(data);
  });
}
