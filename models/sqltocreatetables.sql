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
   CONSTRAINT UC_enrollment UNIQUE(user_id, class_id)
)

CREATE TABLE files(
    id int not null auto_increment,
    file_name varchar(255) not null,
    primary key(id)
)

