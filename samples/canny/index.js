// Mimimal canny custom destination implementation

const { default: axios } = require("axios");
const { Destination } = require("./destination");

const CANNY_OBJECTS = {
  user: {
    label: "Users",
    can_create_fields: "on_write",
    upsertHandler: (record) => {
      return axios.post('https://canny.io/api/v1/users/create_or_update', {
        apiKey: process.env.CANNY_APY_KEY,
        ...record
      });
    },
    fields: [
      {
        field_api_name: "userID",
        label: "User ID",
        identifier: true,
        updateable: false,
        type: "string",
        required: true,
        array: false,
      },
      {
        field_api_name: "name",
        label: "Name",
        type: "string",
        required: true,
      },
      {
        field_api_name: "avatarURL",
        label: "Avatar URL",
        type: "string",
      },
      {
        field_api_name: "created",
        label: "Created Date",
        type: "date_time"
      },
      {
        field_api_name: "email",
        label: "Email",
        type: "string"
      }
    ]
  }
}

exports.handler = async function(event, context) {
  const destination = Destination(CANNY_OBJECTS);
  const requestBodyBuffer = event.body;
  console.log(requestBodyBuffer);
  console.log(process.env.CANNY_APY_KEY);
  const { id, method, params } = JSON.parse(requestBodyBuffer);

  const result = await destination[method](params);

  const response = {
    jsonrpc: "2.0",
    id,
    result,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(response)
  };
}