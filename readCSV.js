import fs from "fs";
import { parse } from "csv-parse";

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

export default data;
