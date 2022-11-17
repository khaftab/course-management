CREATE TABLE users(
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

CREATE TABLE classes(
   id int not null auto_increment,
   class_name varchar(100) not null unique,
   class_code varchar(10) not null unique,
   primary key(id) 
);

CREATE TABLE enrollment(
   id int not null auto_increment,
   user_id int,
   class_id int,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (class_id) REFERENCES classes(id),
   primary key(id),
   CONSTRAINT UC_enrollment UNIQUE(user_id, class_id)
)

CREATE TABLE assignment_files(
    id int not null auto_increment,
    file_name varchar(255) not null,
    primary key(id),
    assignment_id int not null,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id)
)

CREATE TABLE material_files(
    id int not null auto_increment,
    file_name varchar(255) not null,
    primary key(id),
    material_id int,
    FOREIGN KEY (material_id) REFERENCES materials(id)
)

CREATE TABLE assignments(
   id int not null AUTO_INCREMENT,
   info text,
   class_code varchar(10) not null, 
   due_date datetime not null,
   posted_on datetime default now(),
   user_id int not null,
   full_marks smallint not null,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (class_code) REFERENCES classes(class_code),
   primary key(id)
)
CREATE TABLE materials(
   id int not null AUTO_INCREMENT,
   info text,
   class_code varchar(10) not null, 
   user_id int not null,
   posted_on datetime default now(),
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN kEY (class_code) REFERENCES classes(class_code),
   primary key(id)
)

CREATE TABLE submissions(
   id int not null AUTO_INCREMENT,
   primary key(id),
   assignment_id int not null,
   user_id int not null,
   file_name varchar(255),
   obtained_marks decimal(10,2),
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (assignment_id) REFERENCES assignments(id),
   CONSTRAINT UC_submission UNIQUE(assignment_id, user_id)
)

SELECT ID, class_code,user_id,posted_on FROM materials;
SELECT ID, class_code,due_date,posted_on,USER_ID,full_marks FROM assignments;

DELETE FROM assignment_files;
DELETE FROM material_files;
DELETE FROM assignments;
DELETE FROM materials;

DROP TABLE users;
DROP TABLE classes;
DROP TABLE enrollment;
DROP TABLE assignment_files;
DROP TABLE material_files;
DROP TABLE submissions;
DROP TABLE assignments;
DROP TABLE materials;












const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
  timezone: "+5:30",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let sql = `
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
  class_name varchar(100) not null,
  class_code varchar(10) not null unique,
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
 );
 CREATE TABLE if not exists assignments(
  id int not null AUTO_INCREMENT,
  info text,
  class_code varchar(10) not null, 
  due_date datetime not null,
  posted_on datetime default now(),
  user_id int not null,
  full_marks smallint not null,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (class_code) REFERENCES classes(class_code),
  primary key(id)
);
CREATE TABLE if not exists materials(
  id int not null AUTO_INCREMENT,
  info text,
  class_code varchar(10) not null, 
  user_id int not null,
  posted_on datetime default now(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN kEY (class_code) REFERENCES classes(class_code),
  primary key(id)
);
CREATE TABLE if not exists submissions(
  id int not null AUTO_INCREMENT,
  primary key(id),
  assignment_id int not null,
  user_id int not null,
  file_name varchar(255),
  obtained_marks decimal(10,2),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  CONSTRAINT UC_submission UNIQUE(assignment_id, user_id)
);
CREATE TABLE if not exists assignment_files(
  id int not null auto_increment,
  file_name varchar(255) not null,
  primary key(id),
  assignment_id int not null,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);
CREATE TABLE if not exists material_files(
  id int not null auto_increment,
  file_name varchar(255) not null,
  primary key(id),
  material_id int,
  FOREIGN KEY (material_id) REFERENCES materials(id)
);`;

try {
  connection.query(sql,
    function(err, results) {
      if(results)
        console.log(`tables are created`)
      if(err) throw err
    }
  );
} catch (error) {
  console.log(`tables are not created`)
}

module.exports = connection.promise()
