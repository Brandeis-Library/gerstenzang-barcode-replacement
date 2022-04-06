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

  // Truncate errorLog.txt before writing logs
  await fs.truncateSync("./errorLog.csv");

  // Write at the top of the page.
  await fs
    .createWriteStream("./errorLog.csv", { flags: "a" })
    .write(`Barcode, Error Message, Error Block, \n`);

  const workbook = await XLSX.readFile("TestData3.csv");
  //console.log("workbook ---------- ", workbook);
  const sheetNames = workbook.SheetNames;
  const sheetIndex = 1;

  var df = await XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[sheetIndex - 1]]);
  //console.log("df--------------- ", df);
  try {
    const dataObjs = await df.forEach(async (item, index, df) => {
      //item retrieve query to Alma backend. API URL, Item Barcode, and APIKEY

      //const barcode = req.body.barcode.text;
      //console.log("barcode: ", item.Barcode);
      try {
        const { data } = await axios.get(
          process.env.DEV_EXLIBRIS_API_ROOT +
            process.env.DEV_EXLIBRIS_API_PATH +
            item.Barcode +
            //item["Scanned Barcode"] +
            "&apikey=" +
            process.env.DEV_EXLIBRIS_API_BIB_GET_KEY +
            "&expand=p_avail",
        );

        return data;
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
      } catch (error) {
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
    });
  } catch (error) {
    await fs
      .createWriteStream("./errorLog.csv", { flags: "a" })
      .write(`Barcode, ${error.message}, Main,  \n`);

    console.error("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++", error);
  }

  console.log("Can you see me now?");
})();
