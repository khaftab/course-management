CREATE TABLE classes(
   id int not null auto_increment,
   class_name varchar(100) not null unique,
   class_code varchar(10) not null,
   primary key(id) 
);

CREATE TABLE enrollment(
   id int not null auto_increment,
   user_id int,
   class_id int,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (class_id) REFERENCES classes(id),
   primary key(id),
   CONSTRAINT UC_enrollment UNIQUE(user_id, class_id
)

CREATE TABLE users(
  id int not null AUTO_INCREMENT = 1000,
  first_name varchar(50) not null,
  last_name varchar(50) not null,
  email varchar(100) unique not null,
  password varchar(255) not null,
  is_teacher boolean,
  avatar varchar(255) not null,
  primary key(id),
);


 SELECT first_name, last_name, avatar
 FROM  users
 INNER JOIN enrollment
 ON users.id = enrollment.user_id;
 INNER JOIN enrollment
 ON enrollment.class_id = 58;
 
SELECT first_name, last_name, avatar, is_teacher
FROM  users   
JOIN enrollment   
ON users.id = enrollment.user_id   
JOIN classes   
ON classes.id = enrollment.class_id AND classes.id = 54;


 // if (Array.isArray(files)) {
  //   files.forEach(async (file) => {
  //     const { id, name, data } = JSON.parse(file);
  //     let filename = `${id}${name}`;
  //     urltoFile(`${data}`, `${filename}`);

  //     let insertId = insertIntoFileDB(filename, assignment_id, material_id);
  //   });

  // } else {
  //   const { id, name, data } = JSON.parse(files);
  //   let filename = `${id}${name}`;
  //   urltoFile(`${data}`, `${filename}`);

  //   let insertId = insertIntoFileDB(filename, assignment_id, material_id);

  // }
