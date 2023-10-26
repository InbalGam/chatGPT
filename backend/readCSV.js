const fs =require("fs");
const { parse } = require("csv-parse");

const data = [];

fs.createReadStream("./data.csv")
  .pipe(
    parse({
      delimiter: ",",
      columns: true,
      ltrim: true,
    })
  )
  .on("data", function (row) {
    // This will push the object row into the array
    row.keywords = row.keywords.split(',');
    row.keywords = row.keywords.map(word => word.trim().toLowerCase()); 
    data.push(row);
  })
  .on("error", function (error) {
    console.log(error.message);
  });
//   .on("end", function () {
//     // Here log the result array
//     console.log("parsed csv data:");
//     console.log(data);
//   }
//);

module.exports = data;
