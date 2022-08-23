// Mimimal canny custom destination implementation

// export default syncer = new Syncer(listOfObjects, recordHandler)
// export default destination = new Destination(fields, recordHandler)

const { default: axios } = require("axios");
const { Destination } = require("./destination");

const CANNY_OBJECTS = {
  user: {
    label: "Users",
    operations: [
      {
        name: "upsert",
        endpoint: "https://canny.io/api/v1/users/create_or_update"
      }
    ],
    upsertHandler: (record) => {
      return axios.post('https://canny.io/api/v1/users/create_or_update', {
        apiKey: '8f034cb7-f14a-39bd-25fe-a09a3e14b477',
        ...record
      });
    },
    fields: [
      {
        field_api_name: "userID",
        label: "User ID",
        identifier: true,
        createable: true,
        updateable: false,
        type: "string",
        required: true,
        array: false,
      },
      {
        field_api_name: "name",
        label: "Name",
        identifier: false,
        createable: true,
        updateable: true,
        type: "string",
        required: true,
        array: false,
      },
    ]
  }
}

const destination = Destination(CANNY_OBJECTS);

exports.handler = async function(event, context) {
  const requestBodyBuffer = event.body;
  console.log(requestBodyBuffer);
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

// const server = {};

// server.test_connection = () => {
//   return { success: true };
// };

// server.list_objects = () => {
//   return {
//     objects: Object.keys(CANNY_OBJECTS)
//                    .map(name => ({ 
//                       object_api_name: name, label: CANNY_OBJECTS[name].label
//                     }))
//   };
// };

// server.supported_operations = ({ object }) => {
//   console.log("listing operations for object", object);
//   return { operations: CANNY_OBJECTS[object.object_api_name].operations };
// };

// server.list_fields = ({ object }) => {
//   console.log("listing fields for object", object);
//   return { fields: CANNY_OBJECTS[object.object_api_name].fields };
// };

// server.get_sync_speed = () => {
//   console.log("get sync speed");
//   return {
//     maximum_batch_size: 100,
//     maximum_records_per_second: 10,
//     maximum_parallel_batches: 4,
//   };
// };

// server.sync_batch = async ({ sync_plan, records }) => {
//   console.log("sync one batch of data", { sync_plan, records });
//   const key_column = Object.values(sync_plan.schema).find(v => v.active_identifier).field.field_api_name;
//   const endpoint = CANNY_OBJECTS[sync_plan.object.object_api_name].endpoint;

//   const record_results = await Promise.all(records.map(async record => {
//     try {
//       const res = await axios.post(endpoint, {
//         apiKey: '8f034cb7-f14a-39bd-25fe-a09a3e14b477',
//         ...record
//       });
//       return {
//         identifier: record[key_column],
//         success: true,
//       }
//     } catch (error) {
//       return {
//         identifier: record[key_column],
//         success: false,
//         error_message: error.code,
//       };
//     }
//   }));

//   console.log(record_results);

//   return { record_results };

//   // return {
//   //   record_results: records.map((record, index) => {
//   //     axios.get('https://canny.io/api/v1/users/create_or_update',{
//   //       apiKey: '8f034cb7-f14a-39bd-25fe-a09a3e14b477',
//   //       ...record
//   //     }).then(resp => {
//   //       return {
//   //         identifier: record.userID,
//   //         success: true,
//   //         error_message: null,
//   //       };
//   //     }).catch(error => {
//   //       return {
//   //         identifier: record.userID,
//   //         success: false,
//   //         error_message: error,
//   //       };
//   //     })
//   //   }),
//   // };
// };

// // Run as a AWS Lambda-style handler function

// exports.handler = async function(event, context) {
//   const requestBodyBuffer = event.body;
//   console.log(requestBodyBuffer);
//   const { id, method, params } = JSON.parse(requestBodyBuffer);

//   const result = await server[method](params);

//   const response = {
//     jsonrpc: "2.0",
//     id,
//     result,
//   };

//   return {
//     statusCode: 200,
//     body: JSON.stringify(response)
//   };
// }

// Run as a regular node process

// const port = 6161;

// require("http")
//   .createServer((req, res) => {
//     var requestBodyBuffer = "";
//     req.on("data", (chunk) => (requestBodyBuffer += chunk));
//     req.on("end", () => {
//       //console.log({requestBody})
//       const { id, method, params } = JSON.parse(requestBodyBuffer);

//       const result = server[method](params);

//       const body = {
//         jsonrpc: "2.0",
//         id,
//         result,
//       };

//       res.writeHead(200, { "Content-Type": "application/json" });
//       res.write(JSON.stringify(body));
//       res.end();
//     });
//   })
//   .listen(port);
