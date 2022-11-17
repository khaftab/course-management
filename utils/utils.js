const db = require("./db.js");
const fs = require("fs");

const uploadFiles = (files, assignment_id = null, material_id = null) => {
  if (Array.isArray(files)) {
    files.forEach((file) => {
      const { id, name, data } = JSON.parse(file);
      let filename = `${id}${name}`;
      base64toFile(`${data}`, `${filename}`);
      insertIntoFileDB(filename, assignment_id, material_id);
    });
  } else {
    const { id, name, data } = JSON.parse(files);
    let filename = `${id}${name}`;
    base64toFile(`${data}`, `${filename}`);
    insertIntoFileDB(filename, assignment_id, material_id);
  }
};

const insertIntoFileDB = async (filename, assignment_id, material_id) => {
  if (assignment_id) {
    const[rows] = await db.execute("INSERT INTO `assignment_files`(`file_name`, `assignment_id`) VALUES( ?, ?)",[filename, assignment_id]);
  } else {
    const[rows] = await db.execute("INSERT INTO `material_files`(`file_name`, `material_id`) VALUES( ?, ?)",[filename, material_id]);
  }
};

const base64toFile = (data, filename) => {
  let buff = Buffer.from(data, "base64");
  let dir = "./public/uploads";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFileSync(`./public/uploads/${filename}`, buff);
};

module.exports = {
    uploadFiles,
    base64toFile,
    insertIntoFileDB
}
