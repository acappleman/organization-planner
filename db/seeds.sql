INSERT INTO departments (name)
VALUES ("Sales"),
       ("Engineering"),
       ("HR");

INSERT INTO roles (department_id, title, salary)
VALUES (1, "Sales Person", 50000),
       (1, "Sales Manager", 90000),
       (2, "Engineering Manager", 120000),
       (2, "Software Engineer", 70000),
       (2, "Tester", 60000),
       (3, "HR Manager", 90000),
       (3, "HR Associate", 50000);

INSERT INTO employees (role_id, manager_id, first_name, last_name)
VALUES (2, NULL, "Mike", "Smith"),
       (1, 1, "Danielle", "Jones"),
       (3, NULL, "Tracy", "Adams"),
       (4, 3, "John", "Doe"),
       (5, 3, "Jorge", "Perez"),
       (6, NULL, "Michelle", "Marie"),
       (7, 6, "Daniel", "Craig");
       
