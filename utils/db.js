var mysql      = require('mysql');
// DB setup
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'thisisMySQL@root66',
    multipleStatements: true
  });
   
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = `
    CREATE DATABASE IF NOT EXISTS course_management;
    USE course_management;
    CREATE TABLE if not exists users(
      id int not null auto_increment,
      first_name varchar(50) not null,
      last_name varchar(50) not null,
      email varchar(100) unique not null,
      password varchar(255) not null,
      is_teacher boolean,
      avatar varchar(255) not null,
      primary key(id)
    );
    ALTER TABLE users AUTO_INCREMENT = 1000;
    CREATE TABLE if not exists classes(
      id int not null auto_increment,
      class_name varchar(100) not null unique,
      class_code varchar(10) not null,
      primary key(id) 
   );
   CREATE TABLE if not exists enrollment(
    id int not null auto_increment,
    user_id int,
    class_id int,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    primary key(id),
    CONSTRAINT UC_enrollment UNIQUE(user_id, class_id)
 )`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Tables created");
    });
  });

  module.exports = connection;



