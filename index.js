const XLSX = require("xlsx");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");

(async function () {
  const workbook = XLSX.readFile("TestData3.csv");
  //console.log("workbook ---------- ", workbook);
  const sheetNames = workbook.SheetNames;
  const sheetIndex = 1;

  var df = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[sheetIndex - 1]]);
  //console.log("df--------------- ", df);
  try {
    await df.forEach(async (item, index, df) => {
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
        console.log("data -----   ", data);
        //item update query to Alma backend. API URL, Item Barcode, and APIKEY
        // console.log(
        //   "****************************************************",
        //   data,
        //   "******************************************************",
        // );
        // const dataObj = data;
        // //dataObj.item_data.internal_note_3 = " ";
        // dataObj.item_data.barcode = item["Scanned Barcode"];
        // //dataObj.item_data.barcode = item.Barcode;
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
        //console.log("data2 --------", info.data);
      } catch (error) {
        console.log(
          "#######################################################################################################################################################",
          error,
        );
      }
    });
  } catch (error) {
    console.log(error.message);
  }

  console.log("Can you see me now?");
})();
