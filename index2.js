const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");

(async function () {
  try {
    // brings in the found objects from indexjs
    const { foundDataObjs } = require("./dataObjsRealTime.js");

    // Ensure creation of errorLog2.txt before truncating
    await fs.appendFile("./errorLog2.csv", "", function (err) {
      if (err) throw err;
      console.log("Saved errorLog2.csv");
    });

    // Truncate errorLog2.txt before writing logs
    await fs.truncateSync("./errorLog2.csv");

    // Write erros at the top of errorLog2.csv.
    await fs
      .createWriteStream("./errorLog2.csv", { flags: "a" })
      .write(`Barcode, Error Message, Error Block, \n`);

    // for await (const property of foundDataObjs) {
    //   console.log("property  ", JSON.stringify(property));
    // }

    for (let x = 0; x < foundDataObjs.length; x++) {
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

      console.log("updated item with new barcode -- ", item[1].item_data);

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
      console.table(info);
    }
  } catch (error) {
    let barcode = error.config;
    // barcode = barcode.substr(69, 30);
    // const barcodeIndex = barcode.indexOf("&api");
    // barcode = barcode.slice(0, barcodeIndex);

    // console.log("barcode -- ", barcode, `\n`);
    console.error(error);

    await fs
      .createWriteStream("./errorLog.csv", { flags: "a" })
      .write(`${barcode}, ${error.message}, Loop, \n`);

    // console.error(
    //   "#######################################################################################################################################################",
    //   error.config.url,
    //   `\n`,
    // );
  }
})();
