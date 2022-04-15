const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");

(async function () {
  try {
    // brings in the found objects from indexjs
    const { foundDataObjs } = require("./dataObjsRealTime.js");

    // Ensure creation of dataObjsRealtime2.js before truncating
    await fs.appendFile("./dataObjsRealtime2.js", "", function (err) {
      if (err) throw err;
      console.log("Saved ./dataObjsRealtime2.js");
    });

    // Ensure creation of errorLog2.txt before truncating
    await fs.appendFile("./errorLog2.csv", "", function (err) {
      if (err) throw err;
      console.log("Saved errorLog2.csv");
    });

    // Truncate dataObjsRealtime2.js before writing logs
    await fs.truncateSync("./dataObjsRealtime2.js");

    // Truncate errorLog2.txt before writing logs
    await fs.truncateSync("./errorLog2.csv");

    // Write data at the top of the dataObjsRealtime2.js.
    await fs.createWriteStream("./dataObjsRealtime2.js", { flags: "a" }).write(`module.exports = {
    foundDataObjs: [ \n`);

    // Write erros at the top of errorLog2.csv.
    await fs
      .createWriteStream("./errorLog2.csv", { flags: "a" })
      .write(`Barcode, Error Message, Error Block, \n`);

    for (let x = 0; x < foundDataObjs.length; x++) {
      try {
        const item = foundDataObjs[x];
        console.log("item current ---------  ", item[0], "");
        //console.log("item current obj ---------  ", item[1], "\n ");
        console.log("item next ---------  ", item[2]);
        console.log(
          "url---- ",
          process.env.DEV_EXLIBRIS_API_ROOT +
            "/almaws/v1/bibs/" +
            item[1].bib_data.mms_id +
            "/holdings/" +
            item[1].holding_data.holding_id +
            "/items/" +
            item[1].item_data.pid +
            "?apikey=" +
            process.env.DEV_EXLIBRIS_API_BIB_UPDATE_KEY,
          "\n",
        );

        item[1].item_data.barcode = item[2];

        //console.log("updated item with new barcode -- ", item[1].item_data);

        const info = await axios.put(
          process.env.DEV_EXLIBRIS_API_ROOT +
            "/almaws/v1/bibs/" +
            item[1].bib_data.mms_id +
            "/holdings/" +
            item[1].holding_data.holding_id +
            "/items/" +
            item[1].item_data.pid +
            "?apikey=" +
            process.env.DEV_EXLIBRIS_API_BIB_UPDATE_KEY,
          item[1],
        );
        // Write data at the top of the dataObjsRealtime.js.
        await fs
          .createWriteStream("./dataObjsRealtime2.js", { flags: "a" })
          .write(
            `["${info.data.item_data.barcode}", ${JSON.stringify(info.data)}, ${item[0]}], \n`,
          );
      } catch (error) {
        let barcode = error.config.data;
        barcode = JSON.stringify(barcode);
        const barcodeIndex = barcode.indexOf("barcode");
        barcode = barcode.slice(barcodeIndex + 10, barcodeIndex + 24);

        // console.error(error);
        console.log("barcodeIndex ***********  ", barcodeIndex);

        await fs
          .createWriteStream("./errorLog2.csv", { flags: "a" })
          .write(`${barcode}, ${error.message}, Loop, \n`);
      }
    }
  } catch (error) {
    let barcode = error.config.data;
    barcode = JSON.stringify(barcode);
    const barcodeIndex = barcode.indexOf("barcode");
    barcode = barcode.slice(barcodeIndex + 10, barcodeIndex + 24);

    // console.error(error);
    console.log("barcodeIndex ***********  ", barcodeIndex);

    await fs
      .createWriteStream("./errorLog2.csv", { flags: "a" })
      .write(`${barcode}, ${error.message}, Main, \n`);
  }
  await fs.createWriteStream("./dataObjsRealtime2.js", { flags: "a" }).write(`]} \n`);
})();
