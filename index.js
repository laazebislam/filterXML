import fs from "fs";
import xml from "xml-js";
let readAllFileInFolder = (dirname) => {
  let data = [];
  return new Promise((resolve, rej) => {
    fs.readdir(dirname, function (err, filenames) {
      if (err) {
        rej(err);
        return;
      }
      filenames.map((filename, i) => {
        data.push(filename);
        if (i == filenames.length - 1) {
          resolve(data);
        }
      });
    });
  });
};

let readAndParseXML = (file, otherFIlter = []) => {
  return new Promise((resolve, rej) => {
    fs.readFile(file, function (err, data) {
      if (err) {
        rej(err);
        return;
      }
      let json = xml.xml2js(data, { compact: true, spaces: 4 });

      data = json.Workbook.Worksheet[0].Table.Row.map((x) => x.Cell)
        .map((x) => x[0].Data._text)
        .filter(
          (x) => !["NA", "Disponibilité", "Valeur", ...otherFIlter].includes(x)
        );

      resolve(data);
    });
  });
};

let doTheWork = (imgFolder, xmlFile, nameOfFileToExport) => {
  readAndParseXML(xmlFile).then((files) => {
    // read data
    readAllFileInFolder(imgFolder).then((allData) => {
      // jsut add new lines between data
      allData = allData.map((x) => x.split(".")[0]);
      let noExistingFIles = files
        .filter((x) => !allData.includes(x))
        .join("\n");
      //write data to folder
      fs.writeFile("./" + nameOfFileToExport, noExistingFIles, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  });
};

// ------------------------------- test -------------------------- //
doTheWork("./", "./Bernier_Art_Prix.xml", "reultat.txt");
