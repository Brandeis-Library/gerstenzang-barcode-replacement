const fs = require("fs");
const XLSX = require("xlsx");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");

(async function () {
  // Ensure creation of errorLog.txt before truncating
  await fs.appendFile("./errorLog.csv", "", function (err) {
    if (err) throw err;
    console.log("Saved errorLog.csv");
  });

  // // Ensure creation of firstLoopData.js before truncating
  // await fs.appendFile("./firstLoopData.js", "", function (err) {
  //   if (err) throw err;
  //   console.log("Saved ./firstLoopData.js");
  // });

  // Ensure creation of urlsSearch before truncating
  await fs.appendFile("./urlsSearched.txt", "", function (err) {
    if (err) throw err;
    console.log("Saved ./urlsSearched.txt");
  });

  // Ensure creation of dataObjsRealtime.js before truncating
  await fs.appendFile("./dataObjsRealtime.js", "", function (err) {
    if (err) throw err;
    console.log("Saved ./dataObjsRealtime.js");
  });

  // Truncate errorLog.txt before writing logs
  await fs.truncateSync("./errorLog.csv");

  // Truncate firstLoopData.js before writing logs
  //await fs.truncateSync("./firstLoopData.js");

  // Truncate urlsSearched.txt before writing logs
  await fs.truncateSync("./urlsSearched.txt");

  // Truncate dataObjsRealtime.js before writing logs
  await fs.truncateSync("./dataObjsRealtime.js");

  // Write erros at the top of errorLog.csv.
  await fs
    .createWriteStream("./errorLog.csv", { flags: "a" })
    .write(`Barcode, Error Message, Error Block, \n`);

  // Write data at the top of the firstLoopData.js.
  //await fs.createWriteStream("./firstLoopData.js", { flags: "a" }).write(`"Data Objects" \n`);

  // Write data at the top of the dataObjsRealtime.js.
  await fs.createWriteStream("./dataObjsRealtime.js", { flags: "a" }).write(`module.exports = {
    foundDataObjs: [ \n`);

  // Write data at the top of the urlsSearched.txt.
  await fs.createWriteStream("./urlsSearched.txt", { flags: "a" }).write(`"URLs", \n`);

  const workbook = await XLSX.readFile("TestData3.csv");
  //console.log("workbook ---------- ", workbook);
  const sheetNames = workbook.SheetNames;
  const sheetIndex = 1;

  var df = await XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[sheetIndex - 1]]);
  //console.log("df--------------- ", df);
  try {
    //const dataObjs = await df.forEach(async (item, index, df) => {
    //item retrieve query to Alma backend. API URL, Item Barcode, and APIKEY

    //const barcode = req.body.barcode.text;
    //console.log("barcode: ", item.Barcode);
    //const firstLoop = [];
    for (let x = 0; x < df.length; x++) {
      try {
        const item = df[x];
        console.log("item ----", item);
        console.log("item.Barcode ----", item.Barcode);
        console.log('item["Scanned Barcode"] ----', item["Scanned Barcode"]);
        console.log(
          "URL to be searched--- ",
          process.env.DEV_EXLIBRIS_API_ROOT +
            process.env.DEV_EXLIBRIS_API_PATH +
            item.Barcode +
            //item["Scanned Barcode"] +
            "&apikey=" +
            process.env.DEV_EXLIBRIS_API_BIB_GET_KEY +
            "&expand=p_avail",
        );

        const { data } = await axios.get(
          process.env.DEV_EXLIBRIS_API_ROOT +
            process.env.DEV_EXLIBRIS_API_PATH +
            item.Barcode +
            //tem["Scanned Barcode"] +
            "&apikey=" +
            process.env.DEV_EXLIBRIS_API_BIB_GET_KEY +
            "&expand=p_avail",
        );
        console.log("data", data);
        const bCode = data.item_data.barcode;
        // Write data at the top of the urlsSearched.js.
        await fs
          .createWriteStream("./dataObjsRealtime.js", { flags: "a" })
          .write(`["${bCode}", ${JSON.stringify(data)}], \n`);

        //firstLoop.push(data);
      } catch (error) {
        //return data;
        //console.log("data -----   ", data);
        //item update query to Alma backend. API URL, Item Barcode, and APIKEY
        // console.log(
        //   "****************************************************",
        //   data,
        //   "******************************************************",
        // );
        // const dataObj = data;
        // //let resolvedData = await Promise.all(data);
        // // //dataObj.item_data.internal_note_3 = " ";
        // dataObj.item_data.barcode = item["Scanned Barcode"];
        // // //dataObj.item_data.barcode = item.Barcode;
        // const info = await axios.put(
        //   process.env.DEV_EXLIBRIS_API_ROOT +
        //     "/almaws/v1/bibs/" +
        //     dataObj.bib_data.mms_id +
        //     "/holdings/" +
        //     dataObj.holding_data.holding_id +
        //     "/items/" +
        //     dataObj.item_data.pid +
        //     "?apikey=" +
        //     process.env.DEV_EXLIBRIS_API_BIB_UPDATE_KEY,
        //   dataObj,
        // );
        // console.log("data2 --------", info.data);
        let barcode = error.config.url;
        barcode = barcode.substr(69, 30);
        const barcodeIndex = barcode.indexOf("&api");
        barcode = barcode.slice(0, barcodeIndex);

        console.log("barcode -- ", barcode, `\n`);

        await fs
          .createWriteStream("./errorLog.csv", { flags: "a" })
          .write(`${barcode}, ${error.message}, Loop, \n`);

        console.error(
          "#######################################################################################################################################################",
          error.config.url,
          `\n`,
        );
      }
    }
    //await fs.createWriteStream("./firstLoopData.js", { flags: "a" }).write(`${firstLoop}`);
    await fs.createWriteStream("./dataObjsRealtime.js", { flags: "a" }).write(`]} \n`);
  } catch (error) {
    await fs
      .createWriteStream("./errorLog.csv", { flags: "a" })
      .write(`Barcode, ${error.message}, Main,  \n`);

    console.error("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++", error);
  }

  console.log("Can you see me now?");
})();
