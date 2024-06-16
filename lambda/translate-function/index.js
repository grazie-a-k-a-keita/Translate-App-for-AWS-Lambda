var AWS = require("aws-sdk");
var translate = new AWS.Translate();
var dynamodb = new AWS.DynamoDB();

exports.handler = async (event) => {
  const inputText = event.queryStringParameters.input_text;
  const outputText = await translateText(inputText);

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

  await putItem(inputText, outputText);

  return response;
};

/**
 * 翻訳処理
 * @param {*} inputText
 * @returns
 */
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

/**
 * DynamoDBにデータを追加する
 * @param {*} inputText
 * @param {*} outputText
 */
async function putItem(inputText, outputText) {
  var timestamp = getDate();
  var params = {
    Item: {
      timestamp: {
        S: timestamp,
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

  await dynamodb.putItem(params, function (err, data) {
    if (err) console.log(err);
    else console.log(data);
  });
}

/**
 * 現在時刻を取得する
 * @returns
 */
function getDate() {
  var now = new Date();
  var timestamp;
  for (let i = 0; i < 6; i++) {}
  timestamp = now.getFullYear().toString();
  timestamp = timestamp + zeroPadding(now.getMonth() + 1);
  timestamp = timestamp + zeroPadding(now.getDate());
  timestamp = timestamp + zeroPadding(now.getHours());
  timestamp = timestamp + zeroPadding(now.getMinutes());
  timestamp = timestamp + zeroPadding(now.getSeconds());
  console.log("timestamp : " + timestamp);
  return timestamp;
}

/**
 * ゼロパディング
 * @param {*} date
 * @returns
 */
function zeroPadding(date) {
  if (date < 10) date = "0" + date;
  return date;
}
