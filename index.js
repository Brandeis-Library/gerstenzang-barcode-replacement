var XLSX = require("xlsx");

(async function () {
  const workbook = XLSX.readFile("TestData1.xlsx");
  //console.log("workbook ---------- ", workbook);
  const sheetNames = workbook.SheetNames;
  const sheetIndex = 1;

  var df = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[sheetIndex - 1]]);
  console.log("df--------------- ", df);
  console.log("Can you see me now?");
})();
