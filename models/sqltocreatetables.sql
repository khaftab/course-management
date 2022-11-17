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
   due_date timestamp not null,
   posted_on timestamp not null,
   user_id int not null,
   full_marks smallint not null,
   obtained_marks decimal(4,2) not null,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (class_code) REFERENCES classes(class_code),
   primary key(id)
)
SELECT ID, class_code,due_date,posted_on,USER_ID,full_marks,obtained_marks FROM assignments;
CREATE TABLE materials(
   id int not null AUTO_INCREMENT,
   info text,
   class_code varchar(10) not null, 
   user_id int not null,
   posted_on timestamp not null,
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
   obtained_marks decimal(10,2) default 0.00,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (assignment_id) REFERENCES assignments(id),
   CONSTRAINT UC_submission UNIQUE(assignment_id, user_id)
)

SELECT ID, class_code,user_id,posted_on FROM materials;
4 -> 10
add marks_given column in submission

DELETE FROM assignment_files;
DELETE FROM material_files;
DELETE FROM assignments;
DELETE FROM materials;

DROP TABLE assignment_files;
DROP TABLE material_files;
DROP TABLE assignments;
DROP TABLE materials;

SELECT users.id, first_name, is_teacher, classes.class_code, classes.class_name, a.info, af.file_name 
FROM  users   
JOIN enrollment   
ON users.id = enrollment.user_id   
JOIN classes   
ON classes.id = enrollment.class_id AND classes.class_code = '5c9a355d'
JOIN assignments a
ON a.class_code = classes.class_code
JOIN assignment_files af
ON af.assignment_id = a.id AND a.class_code='5c9a355d';


 


SELECT a.info, a.due_date, a.posted_on, a.full_marks, a.user_id as posted_by,af.file_name
from assignments a 
JOIN assignment_files af 
   ON af.assignment_id = a.id AND a.class_code='5c9a355d';


  // let sql = `
  // SELECT a.info,a.due_date,a.posted_on,a.full_marks,a.user_id as posted_by,af.file_name
  // from assignments a 
  // JOIN assignment_files af 
  //    ON af.assignment_id = a.id AND a.class_code="${app.locals.class_code}";`
